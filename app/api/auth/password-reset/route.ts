import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { passwordResetTokens, users } from '@/db/schema';
import { handleRouteError, parseJson } from '@/lib/api/response';
import { passwordResetRequestSchema } from '@/lib/validation/admin';
import { generateToken, hashToken } from '@/lib/tokens';
import { sendEmail } from '@/lib/email';
import { PasswordResetEmail } from '@/lib/email/templates';
import { requireRateLimit } from '@/lib/rate-limit/middleware';

function getAppUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const rate = await requireRateLimit({ preset: 'authPasswordReset', request });
    if (!rate.ok) return rate.response;

    const parsed = await parseJson(request, passwordResetRequestSchema);
    if (!parsed.ok) return parsed.response;

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        name: users.name,
      })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (!user) {
      // Don't leak whether the email exists.
      return NextResponse.json({ ok: true });
    }

    const token = generateToken();
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const resetUrl = `${getAppUrl(request)}/auth/reset-password?token=${token}`;
    const recipientName =
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      user.name ||
      undefined;

    sendEmail({
      to: user.email,
      subject: 'Reset your password',
      react: PasswordResetEmail({ recipientName, resetUrl }),
    }).catch((err) => {
      console.error('[PASSWORD_RESET_EMAIL]', err);
    });

    const includeResetUrlInResponse = process.env.EMAIL_PROVIDER === 'console';

    return NextResponse.json({
      ok: true,
      ...(includeResetUrlInResponse ? { resetUrl } : {}),
    });
  } catch (error) {
    return handleRouteError('[PASSWORD_RESET_POST]', error);
  }
}
