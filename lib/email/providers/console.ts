import 'server-only';
import type { EmailMessage, EmailProvider, EmailSendResult } from '../provider';
import { renderToHtml, renderToText } from '../render';

export class ConsoleEmailProvider implements EmailProvider {
  readonly id = 'console';

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const html = message.html ?? (message.react ? await renderToHtml(message.react) : undefined);
    const text =
      message.text ?? (message.react ? await renderToText(message.react) : undefined);

    console.log('\n┌─── EMAIL ──────────────────────────────────────────────');
    console.log('│ To:      ', Array.isArray(message.to) ? message.to.join(', ') : message.to);
    console.log('│ From:    ', message.from ?? process.env.EMAIL_FROM ?? '(unset)');
    console.log('│ Subject: ', message.subject);
    if (text) {
      console.log('│');
      console.log('│ Plain text:');
      console.log(text.split('\n').map((line) => `│   ${line}`).join('\n'));
    }
    if (html && !text) {
      console.log('│');
      console.log('│ HTML preview (truncated):');
      console.log(`│   ${html.slice(0, 400)}${html.length > 400 ? '...' : ''}`);
    }
    console.log('└────────────────────────────────────────────────────────\n');

    return { provider: this.id };
  }
}
