import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { passwordResetTokens, users } from '@/db/schema';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { passwordResetConfirmSchema } from '@/lib/validation/admin';
import { hashToken } from '@/lib/tokens';

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, passwordResetConfirmSchema);
    if (!parsed.ok) return parsed.response;

    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, hashToken(parsed.data.token)),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!resetToken || resetToken.expiresAt <= new Date()) {
      return jsonError('Reset token is invalid or expired', 400);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, resetToken.userId));

      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date(), updatedAt: new Date() })
        .where(eq(passwordResetTokens.id, resetToken.id));
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError('[PASSWORD_RESET_CONFIRM_POST]', error);
  }
}
