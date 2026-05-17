import 'server-only';
import { ConsoleEmailProvider } from './providers/console';
import { ResendEmailProvider } from './providers/resend';
import { SmtpEmailProvider } from './providers/smtp';
import type { EmailMessage, EmailProvider, EmailSendResult } from './provider';

let cached: EmailProvider | null = null;

function buildProvider(): EmailProvider {
  const driver = (process.env.EMAIL_PROVIDER ?? 'console').toLowerCase();
  const defaultFrom = process.env.EMAIL_FROM;

  if (driver === 'resend' && process.env.RESEND_API_KEY) {
    return new ResendEmailProvider(process.env.RESEND_API_KEY, defaultFrom);
  }

  if (driver === 'smtp' && process.env.SMTP_HOST) {
    return new SmtpEmailProvider({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASSWORD
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
      defaultFrom,
    });
  }

  return new ConsoleEmailProvider();
}

export function getEmailProvider(): EmailProvider {
  if (!cached) cached = buildProvider();
  return cached;
}

export async function sendEmail(message: EmailMessage): Promise<EmailSendResult> {
  const provider = getEmailProvider();
  return provider.send(message);
}

export type { EmailMessage, EmailProvider, EmailSendResult } from './provider';
