import { Button, Text } from '@react-email/components';
import { EmailLayout } from './layout';

export interface VerifyEmailProps {
  recipientName?: string;
  verifyUrl: string;
}

export function VerifyEmail({ recipientName, verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Confirm your email address" heading="Verify your email">
      <Text>Hello {recipientName ?? 'there'},</Text>
      <Text>
        Please confirm your email address by clicking the button below. The link is valid for 24
        hours.
      </Text>
      <Button
        href={verifyUrl}
        style={{
          backgroundColor: '#111827',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
          display: 'inline-block',
          fontWeight: 500,
        }}
      >
        Verify email
      </Button>
      <Text style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
        If the button doesn&apos;t work, copy this URL into your browser:
        <br />
        {verifyUrl}
      </Text>
    </EmailLayout>
  );
}
