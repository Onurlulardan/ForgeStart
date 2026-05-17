'use server';

import { revalidatePath } from 'next/cache';
import { compare, hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { failure, parseJson, success, withAuth } from '@/lib/actions';
import { profileUpdateSchema } from '@/lib/validation/admin';

export const updateProfileAction = withAuth(async (session, input: unknown) => {
  const parsed = parseJson(profileUpdateSchema, input);
  if (!parsed.ok) return parsed;
  const data = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!user) return failure('User not found');

  let newPasswordHash: string | undefined;
  if (data.newPassword && data.newPassword.length > 0) {
    if (!data.currentPassword || !user.passwordHash) {
      return failure('Current password is required', 'PASSWORD_REQUIRED', {
        currentPassword: ['Current password is required'],
      });
    }
    const matches = await compare(data.currentPassword, user.passwordHash);
    if (!matches) {
      return failure('Current password is incorrect', 'PASSWORD_INVALID', {
        currentPassword: ['Current password is incorrect'],
      });
    }
    newPasswordHash = await hash(data.newPassword, 12);
  }

  await db
    .update(users)
    .set({
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      phone: data.phone ?? user.phone,
      avatar: data.avatar ?? user.avatar,
      ...(newPasswordHash ? { passwordHash: newPasswordHash } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  revalidatePath('/administrations/users/profile/edit');
  return success({ updated: true });
});

const avatarUpdateSchema = z.object({ uploadId: z.string().uuid().nullable() });

export const setAvatarAction = withAuth(async (session, input: unknown) => {
  const parsed = parseJson(avatarUpdateSchema, input);
  if (!parsed.ok) return parsed;
  await db
    .update(users)
    .set({ avatar: parsed.data.uploadId, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));
  revalidatePath('/administrations/users/profile/edit');
  return success({ updated: true });
});
