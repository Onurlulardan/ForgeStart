import { NextResponse } from 'next/server';
import { and, count, eq, isNull, ne } from 'drizzle-orm';
import { db } from '@/db';
import { organizationMembers, roles, userRoles } from '@/db/schema';
import { expandRole, getRoleById } from '@/lib/api/admin-queries';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { roleSchema } from '@/lib/validation/admin';

function duplicateRoleWhere(id: string, name: string, organizationId: string | null) {
  return organizationId
    ? and(ne(roles.id, id), eq(roles.name, name), eq(roles.organizationId, organizationId))
    : and(ne(roles.id, id), eq(roles.name, name), isNull(roles.organizationId));
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('role', 'view');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const role = await getRoleById(id);
    if (!role) return jsonError('Role not found', 404);

    return NextResponse.json(role);
  } catch (error) {
    return handleRouteError('[ROLES_ID_GET]', error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('role', 'edit');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const parsed = await parseJson(request, roleSchema);
    if (!parsed.ok) return parsed.response;

    const [existingRole] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!existingRole) return jsonError('Role not found', 404);

    const [duplicate] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(duplicateRoleWhere(id, parsed.data.name, parsed.data.organizationId))
      .limit(1);

    if (duplicate) {
      return jsonError('Role with this name already exists in this scope', 409);
    }

    const updatedRole = await db.transaction(async (tx) => {
      if (parsed.data.isDefault) {
        const defaultScope = parsed.data.organizationId
          ? eq(roles.organizationId, parsed.data.organizationId)
          : isNull(roles.organizationId);

        await tx
          .update(roles)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(and(defaultScope, ne(roles.id, id)));
      }

      const [role] = await tx
        .update(roles)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(roles.id, id))
        .returning();

      return role;
    });

    return NextResponse.json(await expandRole(updatedRole));
  } catch (error) {
    return handleRouteError('[ROLES_ID_PUT]', error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('role', 'delete');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const [existingRole] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!existingRole) return jsonError('Role not found', 404);

    const [[assignedUsers], [assignedMembers]] = await Promise.all([
      db.select({ count: count() }).from(userRoles).where(eq(userRoles.roleId, id)),
      db
        .select({ count: count() })
        .from(organizationMembers)
        .where(eq(organizationMembers.roleId, id)),
    ]);

    if (assignedUsers.count > 0 || assignedMembers.count > 0) {
      return jsonError('Cannot delete role while it is assigned to users or members', 400);
    }

    await db.delete(roles).where(eq(roles.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError('[ROLES_ID_DELETE]', error);
  }
}
