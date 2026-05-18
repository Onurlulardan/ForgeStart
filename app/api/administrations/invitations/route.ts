import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { invitations, organizations, roles, users } from '@/db/schema';
import { env } from '@/env';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { invitationCreateSchema } from '@/lib/validation/admin';
import { generateToken, hashToken } from '@/lib/tokens';
import { writeAuditLog } from '@/lib/audit';
import { sendEmail } from '@/lib/email';
import { InvitationEmail } from '@/lib/email/templates';

export async function GET() {
  try {
    const authz = await requireApiPermission('invitation', 'view');
    if (!authz.ok) return authz.response;

    const rows = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        status: invitations.status,
        roleId: invitations.roleId,
        organizationId: invitations.organizationId,
        invitedById: invitations.invitedById,
        acceptedById: invitations.acceptedById,
        expiresAt: invitations.expiresAt,
        acceptedAt: invitations.acceptedAt,
        revokedAt: invitations.revokedAt,
        createdAt: invitations.createdAt,
        updatedAt: invitations.updatedAt,
        role: {
          id: roles.id,
          name: roles.name,
        },
        organization: {
          id: organizations.id,
          name: organizations.name,
        },
        invitedBy: {
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(invitations)
      .leftJoin(roles, eq(invitations.roleId, roles.id))
      .leftJoin(organizations, eq(invitations.organizationId, organizations.id))
      .leftJoin(users, eq(invitations.invitedById, users.id))
      .orderBy(desc(invitations.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    return handleRouteError('[INVITATIONS_GET]', error);
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireApiPermission('invitation', 'create');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, invitationCreateSchema);
    if (!parsed.ok) return parsed.response;

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (existingUser) return jsonError('A user with this email already exists', 409);

    const token = generateToken();
    const expiresAt = new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000);
    const [created] = await db
      .insert(invitations)
      .values({
        email: parsed.data.email,
        tokenHash: hashToken(token),
        roleId: parsed.data.roleId,
        organizationId: parsed.data.organizationId,
        invitedById: authz.session.user.id,
        expiresAt,
      })
      .returning();

    const acceptUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/accept-invite?token=${token}`;

    const inviter = authz.session.user;
    const inviterName =
      [inviter.firstName, inviter.lastName].filter(Boolean).join(' ').trim() || inviter.email;

    let roleName: string | null = null;
    let organizationName: string | null = null;
    if (created.roleId) {
      const [role] = await db
        .select({ name: roles.name })
        .from(roles)
        .where(eq(roles.id, created.roleId))
        .limit(1);
      roleName = role?.name ?? null;
    }
    if (created.organizationId) {
      const [organization] = await db
        .select({ name: organizations.name })
        .from(organizations)
        .where(eq(organizations.id, created.organizationId))
        .limit(1);
      organizationName = organization?.name ?? null;
    }

    sendEmail({
      to: created.email,
      subject: organizationName ? `Join ${organizationName}` : 'You have been invited',
      react: InvitationEmail({ inviterName, organizationName, roleName, acceptUrl }),
    }).catch((err) => {
      console.error('[INVITATION_EMAIL]', err);
    });

    await writeAuditLog({
      sessionUser: authz.session.user,
      request,
      action: 'invitation.create',
      resource: 'invitation',
      resourceId: created.id,
      message: `Invitation created for ${created.email}`,
      metadata: {
        roleId: created.roleId,
        organizationId: created.organizationId,
        expiresAt: created.expiresAt.toISOString(),
      },
    });

    return NextResponse.json({ ...created, acceptUrl }, { status: 201 });
  } catch (error) {
    return handleRouteError('[INVITATIONS_POST]', error);
  }
}
