import 'server-only';
import { Resend } from 'resend';
import type { EmailMessage, EmailProvider, EmailSendResult } from '../provider';
import { renderToHtml, renderToText } from '../render';

export class ResendEmailProvider implements EmailProvider {
  readonly id = 'resend';
  private readonly client: Resend;
  private readonly defaultFrom?: string;

  constructor(apiKey: string, defaultFrom?: string) {
    this.client = new Resend(apiKey);
    this.defaultFrom = defaultFrom;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const html = message.html ?? (message.react ? await renderToHtml(message.react) : undefined);
    const text =
      message.text ?? (message.react ? await renderToText(message.react) : undefined);

    const payload = {
      from: message.from ?? this.defaultFrom ?? 'onboarding@resend.dev',
      to: message.to,
      subject: message.subject,
      replyTo: message.replyTo,
      html: html ?? '',
      text,
    } as Parameters<typeof this.client.emails.send>[0];

    const result = await this.client.emails.send(payload);

    if (result.error) {
      throw new Error(`Resend error: ${result.error.message ?? 'Unknown error'}`);
    }

    return { provider: this.id, id: result.data?.id };
  }
}
