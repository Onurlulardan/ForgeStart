import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { env } from '@/env';
import { handleRouteError, jsonError } from '@/lib/api/response';
import { resendVerificationEmail } from '@/lib/auth/email-verification';
import { requireRateLimit } from '@/lib/rate-limit/middleware';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return jsonError('Unauthorized', 401);

    const rate = await requireRateLimit({
      preset: 'verifyEmailResend',
      identifier: session.user.id,
      request,
    });
    if (!rate.ok) return rate.response;

    const outcome = await resendVerificationEmail(session.user.id, env.NEXT_PUBLIC_APP_URL);
    if (!outcome.ok) {
      return NextResponse.json(
        { ok: false, reason: outcome.reason, retryAfterSeconds: outcome.retryAfterSeconds },
        { status: outcome.reason === 'cooldown' ? 429 : 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError('[VERIFY_EMAIL_RESEND_POST]', error);
  }
}
