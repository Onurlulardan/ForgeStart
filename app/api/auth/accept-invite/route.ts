import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { invitations, organizationMembers, userRoles, users } from '@/db/schema';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { inviteAcceptSchema } from '@/lib/validation/admin';
import { hashToken } from '@/lib/tokens';

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, inviteAcceptSchema);
    if (!parsed.ok) return parsed.response;

    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.tokenHash, hashToken(parsed.data.token)),
          eq(invitations.status, 'PENDING'),
          isNull(invitations.acceptedAt),
          isNull(invitations.revokedAt)
        )
      )
      .limit(1);

    if (!invitation || invitation.expiresAt <= new Date()) {
      return jsonError('Invitation is invalid or expired', 400);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const createdUser = await db.transaction(async (tx) => {
      const [existingUser] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, invitation.email))
        .limit(1);

      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      const [user] = await tx
        .insert(users)
        .values({
          email: invitation.email,
          firstName: parsed.data.firstName || null,
          lastName: parsed.data.lastName || null,
          name: [parsed.data.firstName, parsed.data.lastName].filter(Boolean).join(' ') || null,
          passwordHash,
          status: 'ACTIVE',
          emailVerified: new Date(),
        })
        .returning();

      if (invitation.roleId) {
        await tx.insert(userRoles).values({ userId: user.id, roleId: invitation.roleId });
      }

      if (invitation.organizationId) {
        await tx.insert(organizationMembers).values({
          userId: user.id,
          organizationId: invitation.organizationId,
          roleId: invitation.roleId,
        });
      }

      await tx
        .update(invitations)
        .set({
          status: 'ACCEPTED',
          acceptedById: user.id,
          acceptedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invitations.id, invitation.id));

      return user;
    });

    return NextResponse.json({ id: createdUser.id, email: createdUser.email });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      return jsonError(error.message, 409);
    }
    return handleRouteError('[ACCEPT_INVITE_POST]', error);
  }
}
