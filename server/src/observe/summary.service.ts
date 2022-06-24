import { Injectable } from '@nestjs/common';
import { observations } from '@prisma/client';
import { groupBy, template } from 'lodash';
import * as mjml2html from 'mjml'

import { PrismaService } from '../prisma/prisma.service';
import { Email, MailerService } from '../mailer/mailer.service';
import { ObservableDefintion, ObservablesDefinitions } from './observable.definitions';
import { startOfDay, sub } from 'date-fns';

@Injectable()
export class SummaryService {
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerService
  ) { }
  intro(args: any) {
    return template(`
      <mj-text align="left" font-size="20px" color="#00144D" font-family="helvetica" line-height="30px">
        Seedo - Automated Procedure Logging
      </mj-text>

      <mj-text align="left" font-size="12px" color="#00144D" font-family="helvetica" line-height="30px">
        Hello <%= trainee.firstName %>, <br />
        The below procedures have been logged based on your clinical activity. Do they look accurate? Let me (emeka.anyanwu@pennmedicine.upenn.edu) know what you think! <br />
        Soon we'll begin logging them to MedHub automatically for you.
      </mj-text>
      <br />
    `)(args)
  }

  observationTable(observable: ObservableDefintion, observations: observations[]) {
    let outputTemplate = template(`
      <br />  
      <mj-divider border-width="1px" border-style="dashed" border-color="lightgrey" />
      <br />
      <br />
      <mj-text align="left" font-size="15px" color="#00144D" font-family="helvetica" line-height="30px">
        ${observable.displayName}
      </mj-text>
      <br />
      <mj-table>
        <tr style="border-bottom:1px solid #ecedee;text-align:left;padding:15px 0;">
          <th style="padding: 0 15px 0 0;">Patient Name</th>
          <th style="padding: 0 15px;">UID</th>
          <th style="padding: 0 0 0 15px;">Date</th>
        </tr>
        <% _.forEach(observations, function(obs) { %>
          <tr>
            <td style="padding: 0 15px 0 0;"><%= obs.patientName %></td>
            <td style="padding: 0 15px;"><%= obs.patientId %></td>
            <td style="padding: 0 0 0 15px;"><%= obs.observationDate %></td>
          </tr>
        <% }) %>
      </mj-table>
    `)
    return outputTemplate({ observable, observations })
  }

  /**
   * Build a summary of observations for a trainee
   * @param traineeId 
   */
  async summaryForTrainee({ traineeId, startDate, endDate }: { traineeId: number, startDate: Date, endDate: Date }) {
    const trainee = await this.prismaService.trainees.findUnique({ where: { id: traineeId } })
    const observations = await this.prismaService.observations.findMany({
      where: {
        traineeId,
        observationDate: {
          gt: startDate,
          lt: endDate
        }
      },
      include: {
        task: true
      }
    })

    const groupedObservations = groupBy(observations, 'task.observableType')
    const blocks = Object.entries(groupedObservations).map(([type, observations]) => {
      return this.observationTable(
        ObservablesDefinitions[type],
        observations.sort((a, b) => (b as any).date - (a as any).date))
    })

    let mjml = this.intro({ trainee })
    blocks.forEach(block => {
      mjml += block
    })

    return {
      trainee,
      mjml
    }
  }

  /** Build and send summaries to trainees who have recent observations */
  async sendSummaries() {
    const startDate = startOfDay(sub(new Date(), { days: 1 }))
    const endDate = new Date()

    /** Trainess with observations from yesterday */
    const recentlyActiveTrainees = await this.prismaService.observations.groupBy({
      where: {
        observationDate: {
          gte: startDate,
          lte: endDate
        }
      },
      by: ['traineeId'],
      _count: true
    })

    const summaries = await Promise.all(
      recentlyActiveTrainees.map(async result => {
        return await this.summaryForTrainee({ traineeId: result.traineeId, startDate, endDate })
      })
    )
    console.debug(startDate, endDate, summaries)

    const sendSummaries = await Promise.all(
      summaries.slice(0, 1).map(async summary => {
        const html = this.mailerService.convertMjml(summary.mjml)
        const email: Email = {
          to: 'emeka.anyanwu@pennmedicine.upenn.edu',
          from: 'emeka.anyanwu@pennmedicine.upenn.edu',
          subject: 'Seedo - Procedure Summary',
          text: 'This email can only be viewed in HTML/rich text mode',
          html,
          initiatorType: 'daily_summary'
        }
        return await this.mailerService.sendEmail(email)
      })
    )

    return sendSummaries
  }
}
