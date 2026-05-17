import { Button, Text } from '@react-email/components';
import { EmailLayout } from './layout';

export interface PasswordResetEmailProps {
  recipientName?: string;
  resetUrl: string;
}

export function PasswordResetEmail({ recipientName, resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your password" heading="Password reset request">
      <Text>Hello {recipientName ?? 'there'},</Text>
      <Text>
        We received a request to reset your password. Click the button below to choose a new
        password. The link is valid for 1 hour.
      </Text>
      <Button
        href={resetUrl}
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
        Reset password
      </Button>
      <Text style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
        If you didn&apos;t request this, you can ignore this email — your password remains
        unchanged.
      </Text>
    </EmailLayout>
  );
}
