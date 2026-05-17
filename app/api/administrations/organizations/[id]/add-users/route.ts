import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { organizationMembers, organizations } from '@/db/schema';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { addUsersToOrganizationSchema } from '@/lib/validation/admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('organization', 'edit');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const parsed = await parseJson(request, addUsersToOrganizationSchema);
    if (!parsed.ok) return parsed.response;

    const [organization] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);
    if (!organization) return jsonError('Organization not found', 404);

    const existingMembers = await db
      .select({ userId: organizationMembers.userId })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, id),
          inArray(organizationMembers.userId, parsed.data.userIds)
        )
      );

    const existingUserIds = new Set(existingMembers.map((member) => member.userId));
    const newUserIds = parsed.data.userIds.filter((userId) => !existingUserIds.has(userId));

    if (!newUserIds.length) {
      return jsonError('Selected users are already members of this organization', 400);
    }

    await db.insert(organizationMembers).values(
      newUserIds.map((userId) => ({
        organizationId: id,
        userId,
        roleId: parsed.data.roleId,
      }))
    );

    return NextResponse.json({ added: newUserIds.length }, { status: 201 });
  } catch (error) {
    return handleRouteError('[ORGANIZATIONS_ADD_USERS_POST]', error);
  }
}
