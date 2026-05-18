import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { roles, userRoles, users } from '@/db/schema';
import { env } from '@/env';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { logSecurityEvent } from '@/lib/auth/session-data';
import { sendVerificationEmail } from '@/lib/auth/email-verification';
import { requireRateLimit } from '@/lib/rate-limit/middleware';
import { registerSchema } from '@/lib/validation/admin';

export async function POST(request: Request) {
  try {
    const rate = await requireRateLimit({ preset: 'authRegister', request });
    if (!rate.ok) return rate.response;

    const parsed = await parseJson(request, registerSchema);
    if (!parsed.ok) return parsed.response;

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (existingUser) {
      return jsonError('Email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: parsed.data.email,
          passwordHash,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
          status: 'ACTIVE',
          name: [parsed.data.firstName, parsed.data.lastName].filter(Boolean).join(' ') || null,
        })
        .returning();

      const [defaultRole] = await tx.select().from(roles).where(eq(roles.isDefault, true)).limit(1);

      if (defaultRole) {
        await tx.insert(userRoles).values({ userId: user.id, roleId: defaultRole.id });
      }

      return { user, defaultRole };
    });

    await logSecurityEvent({
      userId: result.user.id,
      email: result.user.email,
      status: 'SUCCESS',
      type: 'REGISTER',
      message: `User registered: ${result.user.email}`,
      request,
    });

    sendVerificationEmail(result.user, env.NEXT_PUBLIC_APP_URL).catch((err) => {
      console.error('[REGISTER_VERIFY_EMAIL]', err);
    });

    return NextResponse.json(
      {
        user: {
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        },
        role: result.defaultRole
          ? {
              name: result.defaultRole.name,
              isDefault: result.defaultRole.isDefault,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError('[REGISTER_POST]', error);
  }
}
