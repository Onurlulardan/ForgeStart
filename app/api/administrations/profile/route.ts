import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getUserById } from '@/lib/api/admin-queries';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { profileUpdateSchema } from '@/lib/validation/admin';

export async function GET() {
  try {
    const authz = await requireApiPermission('profile', 'view');
    if (!authz.ok) return authz.response;

    const user = await getUserById(authz.session.user.id);
    if (!user) return jsonError('User not found', 404);

    return NextResponse.json(user);
  } catch (error) {
    return handleRouteError('[PROFILE_GET]', error);
  }
}

export async function PUT(request: Request) {
  try {
    const authz = await requireApiPermission('profile', 'edit');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, profileUpdateSchema);
    if (!parsed.ok) return parsed.response;

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, authz.session.user.id))
      .limit(1);
    if (!currentUser) return jsonError('User not found', 404);

    if (parsed.data.email && parsed.data.email !== currentUser.email) {
      const [duplicateEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, parsed.data.email), ne(users.id, currentUser.id)))
        .limit(1);
      if (duplicateEmail) return jsonError('Email already exists', 409);
    }

    let passwordHash = currentUser.passwordHash;
    if (parsed.data.newPassword) {
      if (!parsed.data.currentPassword) {
        return jsonError('Current password is required', 400);
      }

      const isPasswordValid = currentUser.passwordHash
        ? await bcrypt.compare(parsed.data.currentPassword, currentUser.passwordHash)
        : false;

      if (!isPasswordValid) {
        return jsonError('Current password is incorrect', 400);
      }

      passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    }

    await db
      .update(users)
      .set({
        email: parsed.data.email ?? currentUser.email,
        firstName: parsed.data.firstName ?? currentUser.firstName,
        lastName: parsed.data.lastName ?? currentUser.lastName,
        phone: parsed.data.phone ?? currentUser.phone,
        avatar: parsed.data.avatar || currentUser.avatar,
        name:
          [
            parsed.data.firstName ?? currentUser.firstName,
            parsed.data.lastName ?? currentUser.lastName,
          ]
            .filter(Boolean)
            .join(' ') || null,
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id));

    return NextResponse.json(await getUserById(currentUser.id));
  } catch (error) {
    return handleRouteError('[PROFILE_PUT]', error);
  }
}
