import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { template } from 'lodash';
import * as mjml2html from 'mjml'
import * as nodemailer from 'nodemailer'
import { PrismaService } from '../prisma/prisma.service';

import { sentEmails } from '@prisma/client';

const LAYOUT_TEMPLATE = template(`
<mjml>
<mj-head>
<mj-attributes>
  <mj-accordion border="none" padding="1px" />
  <mj-accordion-element icon-wrapped-url="https://i.imgur.com/Xvw0vjq.png" icon-unwrapped-url="https://i.imgur.com/KKHenWa.png" icon-height="24px" icon-width="24px" />
  <mj-accordion-title font-family="Roboto, Open Sans, Helvetica, Arial, sans-serif" background-color="#fff" color="#031017" padding="15px" font-size="16px" />
  <mj-accordion-text font-family="Open Sans, Helvetica, Arial, sans-serif" background-color="#fafafa" padding="15px" color="#505050" font-size="12px" />
</mj-attributes>
</mj-head>
<mj-body>
  <%= body %>>
</mj-body>
</mjml>`)

type sendEmailMetaData = Partial<Pick<sentEmails, 'initiatorType' | 'initiatorId'>>

export type Email = {
  to: string
  from: 'seedo-team@pennmedicine.upenn.edu' | 'emeka.anyanwu@pennmedicine.upenn.edu'
  text: string
  html: string
  subject: string
} & sendEmailMetaData


@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)
  transporter!: nodemailer.Transporter
  skipEmails!: boolean

  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService
  ) {
    if (this.configService.get<boolean>('SKIP_EMAIL_SEND') === true) {
      this.skipEmails = true
    } else {
      this.skipEmails = false
      this.transporter = nodemailer.createTransport({
        host: this.configService.getOrThrow<string>('SMTP_IP'),
        secure: false,
        auth: {
          user: this.configService.getOrThrow<string>('SMTP_USER'),
          pass: this.configService.getOrThrow<string>('SMTP_PASS')
        }
      })
    }
  }

  /** Convert MJML to HTML and wrap in layout template */
  convertMjml(body: string) {
    const layout = LAYOUT_TEMPLATE({ body })
    const html = mjml2html(layout).html
    return html
  }

  async sendEmail(email: Email) {
    if (this.skipEmails === false) {
      await this.transporter.sendMail(email)
    }

    const record = await this.prismaService.sentEmails.create({
      data: {
        to: email.to,
        subject: email.subject,
        email: email,

        initiatorType: email?.initiatorType,
        initiatorId: email?.initiatorId
      }
    })

    this.logger.debug(`${this.skipEmails ? 'SKIPPED' : 'SENT'} EMAIL - ${email.to} | ${email.subject}`)
    return record
  }
}
