import { Text } from '@react-email/components';
import { EmailLayout } from './layout';

export interface WelcomeEmailProps {
  recipientName?: string;
  appUrl: string;
  appName?: string;
}

export function WelcomeEmail({
  recipientName,
  appUrl,
  appName = 'Next Starter',
}: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview={`Welcome to ${appName}`}
      heading={`Welcome to ${appName}`}
    >
      <Text>Hello {recipientName ?? 'there'},</Text>
      <Text>
        Thanks for joining {appName}. Your workspace is ready and you can sign in any time at:
      </Text>
      <Text>{appUrl}</Text>
    </EmailLayout>
  );
}
