import { Injectable, Logger } from '@nestjs/common';
import { observations } from '@prisma/client';
import { groupBy, template, capitalize } from 'lodash';
import { add, format, startOfDay } from 'date-fns';

import { PrismaService } from '../prisma/prisma.service';
import { Email, MailerService } from '../mailer/mailer.service';
import { ObservableDefintion, ObservablesDefinitions } from './observable.definitions';
import { ObservableService } from './observable.service';

@Injectable()
export class SummaryService {
  private logger = new Logger(SummaryService.name)
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerService,
    private observableService: ObservableService,
  ) { }

  intro(args: any) {
    return template(`
      <mj-text align="left" font-size="20px" color="#00144D" font-family="helvetica">
        Seedo - Weekly Procedure Summary
      </mj-text>
      <mj-spacer height="10px" />

      <mj-text align="left" font-size="12px"font-family="helvetica">
        Hey <%= trainee.firstName %>, <br />
        <p>The below procedures have been logged based on your clinical activity over the last week.</p>
      </mj-text>
      <br />
    `)(args)
  }

  observationTable(observable: ObservableDefintion, observations: observations[]) {
    let outputTemplate = template(`
      <mj-spacer height="30px" />
      <mj-text align="left" font-size="15px" color="#00144D" font-family="helvetica" line-height="30px">
        ${observable.displayName}
      </mj-text>
      <mj-spacer height="10px" />
      <mj-table>
        <tr style="border-bottom:1px solid #ecedee;text-align:left;padding:15px 0;">
          <th style="padding: 0 15px 0 0;">Patient Name</th>
          <th style="padding: 0 15px;">UID</th>
          <th style="padding: 0 15px;"><%= capitalize(observations?.[0]?.ehrObservationIdType) %></th>
          <th style="padding: 0 0 0 15px;">Date</th>
        </tr>
        <% _.forEach(observations, function(obs) { %>
          <tr>
            <td style="padding: 0 15px 0 0;"><%= obs.patientName %></td>
            <td style="padding: 0 15px;"><%= obs.patientId %></td>
            <td style="padding: 0 15px;"><%= obs.ehrObservationId %></td>
            <td style="padding: 0 0 0 15px;"><%= format(obs.observationDate, 'MMM d, HH:mm') %></td>
          </tr>
        <% }) %>
      </mj-table>
    `, { imports: { format, capitalize } })
    return outputTemplate({ observable, observations })
  }

  /**
   * Build a summary of observations for a trainee
   * @param traineeId 
   */
  async summaryForTrainee({ traineeId, startDate, endDate }: { traineeId: number, startDate: Date, endDate: Date }) {
    const trainee = await this.prismaService.trainees.findUnique({ where: { id: traineeId } })
    const observations = await this.observableService.observationsForTrainee({ traineeId, startDate, endDate })

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

  /**
   * Build and send summaries to trainees who have observations that occurred yesterday
   *  */
  async sendSummaries() {
    const startDate = add(startOfDay(new Date()), { days: -6 })
    const endDate = new Date()

    /** Trainess with observations from yesterday */
    const recentlyActiveTrainees = await this.prismaService.observations.groupBy({
      where: {
        observationDate: {
          gte: startDate,
          lte: endDate
        },
        trainee: {
          active: true
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
    this.logger.log(`Generated ${summaries.length} trainee summaries`)

    const sendSummaries = await Promise.all(
      summaries.map(async summary => {
        const html = this.mailerService.convertMjml(summary.mjml)
        const email: Email = {
          to: summary.trainee.email,
          from: 'emeka.anyanwu@pennmedicine.upenn.edu',
          subject: 'Seedo - Weekly Procedure Summary (Beta v2)',
          text: 'This email can only be viewed in HTML/rich text mode',
          html,
          initiatorType: 'summary'
        }
        return await this.mailerService.sendEmail(email)
      })
    )

    return sendSummaries
  }
}
