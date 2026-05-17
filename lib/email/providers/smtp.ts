import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import type { EmailMessage, EmailProvider, EmailSendResult } from '../provider';
import { renderToHtml, renderToText } from '../render';

export interface SmtpOptions {
  host: string;
  port: number;
  secure: boolean;
  auth?: { user: string; pass: string };
  defaultFrom?: string;
}

export class SmtpEmailProvider implements EmailProvider {
  readonly id = 'smtp';
  private readonly transporter: Transporter;
  private readonly defaultFrom?: string;

  constructor(options: SmtpOptions) {
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: options.auth,
    });
    this.defaultFrom = options.defaultFrom;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const html = message.html ?? (message.react ? await renderToHtml(message.react) : undefined);
    const text =
      message.text ?? (message.react ? await renderToText(message.react) : undefined);

    const result = await this.transporter.sendMail({
      from: message.from ?? this.defaultFrom,
      to: message.to,
      subject: message.subject,
      replyTo: message.replyTo,
      html,
      text,
    });
    return { provider: this.id, id: result.messageId };
  }
}
