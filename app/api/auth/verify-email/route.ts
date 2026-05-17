import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleRouteError, parseJson } from '@/lib/api/response';
import { verifyEmailToken } from '@/lib/auth/email-verification';

const verifyEmailSchema = z.object({ token: z.string().min(20) });

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, verifyEmailSchema);
    if (!parsed.ok) return parsed.response;
    const outcome = await verifyEmailToken(parsed.data.token);
    if (!outcome.ok) {
      return NextResponse.json(
        { ok: false, reason: outcome.reason ?? 'invalid' },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, userId: outcome.userId });
  } catch (error) {
    return handleRouteError('[VERIFY_EMAIL_POST]', error);
  }
}
