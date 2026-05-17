import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';

export interface EmailLayoutProps {
  preview: string;
  heading: string;
  children: ReactNode;
}

const styles = {
  body: {
    backgroundColor: '#f4f5f7',
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '32px 0',
  } as const,
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '560px',
    margin: '0 auto',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  } as const,
  heading: {
    fontSize: '22px',
    fontWeight: 600,
    margin: '0 0 16px',
  } as const,
  section: {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#374151',
  } as const,
  footer: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '24px',
  } as const,
};

export function EmailLayout({ preview, heading, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{heading}</Heading>
          <Section style={styles.section}>{children}</Section>
          <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
          <Text style={styles.footer}>
            This message was sent automatically. If you didn&apos;t request it, you can safely
            ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
