import 'server-only';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { emailVerificationTokens, users } from '@/db/schema';
import type { User } from '@/db/types';
import { env } from '@/env';
import { sendEmail } from '@/lib/email';
import { VerifyEmail, WelcomeEmail } from '@/lib/email/templates';
import { generateToken, hashToken } from '@/lib/tokens';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function buildVerifyUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/auth/verify-email?token=${encodeURIComponent(token)}`;
}

export async function createEmailVerificationToken(user: Pick<User, 'id' | 'email'>) {
  const token = generateToken();
  await db.insert(emailVerificationTokens).values({
    userId: user.id,
    email: user.email,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });
  return token;
}

export async function sendVerificationEmail(
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'name'>,
  baseUrl: string
): Promise<void> {
  const token = await createEmailVerificationToken(user);
  const verifyUrl = buildVerifyUrl(baseUrl, token);
  const recipientName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.name || undefined;

  await sendEmail({
    to: user.email,
    subject: 'Verify your email address',
    react: VerifyEmail({ recipientName, verifyUrl }),
  });
}

export interface ResendOutcome {
  ok: boolean;
  reason?: 'cooldown' | 'already-verified' | 'user-not-found';
  retryAfterSeconds?: number;
}

export async function resendVerificationEmail(
  userId: string,
  baseUrl: string
): Promise<ResendOutcome> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return { ok: false, reason: 'user-not-found' };
  if (user.emailVerified) return { ok: false, reason: 'already-verified' };

  const cooldownDate = new Date(Date.now() - RESEND_COOLDOWN_MS);
  const [latest] = await db
    .select({ sentAt: emailVerificationTokens.sentAt })
    .from(emailVerificationTokens)
    .where(
      and(eq(emailVerificationTokens.userId, userId), gt(emailVerificationTokens.sentAt, cooldownDate))
    )
    .limit(1);
  if (latest) {
    const elapsed = Date.now() - latest.sentAt.getTime();
    return {
      ok: false,
      reason: 'cooldown',
      retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000),
    };
  }

  await sendVerificationEmail(user, baseUrl);
  return { ok: true };
}

export interface VerifyOutcome {
  ok: boolean;
  reason?: 'invalid' | 'expired' | 'used' | 'mismatch';
  userId?: string;
}

interface VerifiedRecipient {
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
}

export async function verifyEmailToken(token: string): Promise<VerifyOutcome> {
  if (!token || token.length < 20) return { ok: false, reason: 'invalid' };

  const tokenHash = hashToken(token);
  const [record] = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.tokenHash, tokenHash))
    .limit(1);

  if (!record) return { ok: false, reason: 'invalid' };
  if (record.usedAt) return { ok: false, reason: 'used' };
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: 'expired' };
  }

  let recipient: VerifiedRecipient | null = null;

  await db.transaction(async (tx) => {
    await tx
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, record.id));

    const [previous] = await tx
      .select({
        verified: users.emailVerified,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, record.userId))
      .limit(1);

    await tx
      .update(users)
      .set({ emailVerified: new Date() })
      .where(and(eq(users.id, record.userId), isNull(users.emailVerified)));

    if (previous && !previous.verified) {
      recipient = {
        email: previous.email,
        firstName: previous.firstName,
        lastName: previous.lastName,
        name: previous.name,
      };
    }
  });

  if (recipient) {
    const verifiedRecipient: VerifiedRecipient = recipient;
    const appUrl = env.NEXT_PUBLIC_APP_URL;
    const recipientName =
      [verifiedRecipient.firstName, verifiedRecipient.lastName].filter(Boolean).join(' ').trim() ||
      verifiedRecipient.name ||
      undefined;
    sendEmail({
      to: verifiedRecipient.email,
      subject: 'Welcome aboard',
      react: WelcomeEmail({ recipientName, appUrl }),
    }).catch((err) => {
      console.error('[WELCOME_EMAIL]', err);
    });
  }

  return { ok: true, userId: record.userId };
}
