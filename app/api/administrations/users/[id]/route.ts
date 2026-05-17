import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { organizationMembers, userRoles, users } from '@/db/schema';
import { getUserById } from '@/lib/api/admin-queries';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { updateUserSchema } from '@/lib/validation/admin';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('user', 'view');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const user = await getUserById(id);
    if (!user) return jsonError('User not found', 404);

    return NextResponse.json(user);
  } catch (error) {
    return handleRouteError('[USERS_ID_GET]', error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('user', 'edit');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const parsed = await parseJson(request, updateUserSchema);
    if (!parsed.ok) return parsed.response;

    const [existingUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!existingUser) return jsonError('User not found', 404);

    const [duplicateEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, parsed.data.email), ne(users.id, id)))
      .limit(1);

    if (duplicateEmail) {
      return jsonError('Email already exists', 409);
    }

    const passwordHash = parsed.data.password
      ? await bcrypt.hash(parsed.data.password, 12)
      : existingUser.passwordHash;

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          email: parsed.data.email,
          passwordHash,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
          status: parsed.data.status,
          name: [parsed.data.firstName, parsed.data.lastName].filter(Boolean).join(' ') || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      await tx.delete(userRoles).where(eq(userRoles.userId, id));
      if (parsed.data.roleIds.length) {
        await tx.insert(userRoles).values(
          parsed.data.roleIds.map((roleId) => ({
            userId: id,
            roleId,
          }))
        );
      }
    });

    return NextResponse.json(await getUserById(id));
  } catch (error) {
    return handleRouteError('[USERS_ID_PUT]', error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('user', 'delete');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const [existingUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!existingUser) return jsonError('User not found', 404);

    await db.transaction(async (tx) => {
      await tx.delete(userRoles).where(eq(userRoles.userId, id));
      await tx.delete(organizationMembers).where(eq(organizationMembers.userId, id));
      await tx.delete(users).where(eq(users.id, id));
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError('[USERS_ID_DELETE]', error);
  }
}
