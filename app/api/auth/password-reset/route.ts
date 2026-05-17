import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { passwordResetTokens, users } from '@/db/schema';
import { handleRouteError, parseJson } from '@/lib/api/response';
import { passwordResetRequestSchema } from '@/lib/validation/admin';
import { generateToken, hashToken } from '@/lib/tokens';

function getAppUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, passwordResetRequestSchema);
    if (!parsed.ok) return parsed.response;

    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = generateToken();
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    return NextResponse.json({
      ok: true,
      resetUrl: `${getAppUrl(request)}/auth/reset-password?token=${token}`,
    });
  } catch (error) {
    return handleRouteError('[PASSWORD_RESET_POST]', error);
  }
}
