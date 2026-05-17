import type { ReactElement } from 'react';

export interface EmailMessage {
  to: string | string[];
  subject: string;
  from?: string;
  replyTo?: string;
  html?: string;
  text?: string;
  react?: ReactElement;
}

export interface EmailSendResult {
  id?: string;
  provider: string;
}

export interface EmailProvider {
  readonly id: string;
  send(message: EmailMessage): Promise<EmailSendResult>;
}
