import 'server-only';
import { env } from '../../env';
import { ConsoleEmailProvider } from './providers/console';
import { ResendEmailProvider } from './providers/resend';
import { SmtpEmailProvider } from './providers/smtp';
import type { EmailMessage, EmailProvider, EmailSendResult } from './provider';

let cached: EmailProvider | null = null;

function buildProvider(): EmailProvider {
  if (env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY) {
    return new ResendEmailProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
  }

  if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) {
    return new SmtpEmailProvider({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE ?? false,
      auth:
        env.SMTP_USER && env.SMTP_PASSWORD
          ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
          : undefined,
      defaultFrom: env.EMAIL_FROM,
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
