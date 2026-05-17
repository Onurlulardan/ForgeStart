import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userRoles, users } from '@/db/schema';
import { listUsers } from '@/lib/api/admin-queries';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { createUserSchema } from '@/lib/validation/admin';

export async function GET() {
  try {
    const authz = await requireApiPermission('user', 'view');
    if (!authz.ok) return authz.response;

    return NextResponse.json(await listUsers());
  } catch (error) {
    return handleRouteError('[USERS_GET]', error);
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireApiPermission('user', 'create');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, createUserSchema);
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

    const createdUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: parsed.data.email,
          passwordHash,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
          status: parsed.data.status,
          name: [parsed.data.firstName, parsed.data.lastName].filter(Boolean).join(' ') || null,
        })
        .returning();

      if (parsed.data.roleIds.length) {
        await tx.insert(userRoles).values(
          parsed.data.roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
          }))
        );
      }

      return user;
    });

    const { passwordHash: _password, ...safeUser } = createdUser;
    void _password;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    return handleRouteError('[USERS_POST]', error);
  }
}
