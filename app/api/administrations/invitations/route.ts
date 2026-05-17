import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { invitations, organizations, roles, users } from '@/db/schema';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { invitationCreateSchema } from '@/lib/validation/admin';
import { generateToken, hashToken } from '@/lib/tokens';
import { writeAuditLog } from '@/lib/audit';

function getAppUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? new URL(request.url).origin;
}

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

    const acceptUrl = `${getAppUrl(request)}/auth/accept-invite?token=${token}`;

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
