'use server';

import { env } from '@/env';
import { failure, success, withAuth, withRateLimit } from '@/lib/actions';
import { resendVerificationEmail } from '@/lib/auth/email-verification';

async function getAppUrl(): Promise<string> {
  return env.NEXT_PUBLIC_APP_URL;
}

export const resendVerificationEmailAction = withAuth(async (session) => {
  const limited = await withRateLimit(
    async () => {
      const outcome = await resendVerificationEmail(session.user.id, await getAppUrl());
      if (!outcome.ok) {
        if (outcome.reason === 'cooldown') {
          return failure(
            `Please wait ${outcome.retryAfterSeconds ?? 60}s before retrying.`,
            'COOLDOWN'
          );
        }
        return failure(outcome.reason ?? 'Failed to send', 'SEND_FAILED');
      }
      return success({ sent: true });
    },
    {
      preset: 'verifyEmailResend',
      identifier: () => session.user.id,
    }
  )();
  return limited;
});
