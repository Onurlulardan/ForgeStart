import { Button, Text } from '@react-email/components';
import { EmailLayout } from './layout';

export interface InvitationEmailProps {
  inviterName?: string;
  organizationName?: string | null;
  roleName?: string | null;
  acceptUrl: string;
}

export function InvitationEmail({
  inviterName,
  organizationName,
  roleName,
  acceptUrl,
}: InvitationEmailProps) {
  const target = organizationName ?? 'a workspace';
  return (
    <EmailLayout
      preview={`You're invited to ${target}`}
      heading={`Join ${target}`}
    >
      <Text>
        {inviterName ?? 'A teammate'} invited you to join {target}
        {roleName ? ` as ${roleName}` : ''}. Click the button below to create your account.
      </Text>
      <Button
        href={acceptUrl}
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
        Accept invitation
      </Button>
    </EmailLayout>
  );
}
