import { NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { roles } from '@/db/schema';
import { expandRole, listRoles } from '@/lib/api/admin-queries';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { roleSchema } from '@/lib/validation/admin';

function roleScopeWhere(name: string, organizationId: string | null) {
  return organizationId
    ? and(eq(roles.name, name), eq(roles.organizationId, organizationId))
    : and(eq(roles.name, name), isNull(roles.organizationId));
}

export async function GET() {
  try {
    const authz = await requireApiPermission('role', 'view');
    if (!authz.ok) return authz.response;

    return NextResponse.json(await listRoles());
  } catch (error) {
    return handleRouteError('[ROLES_GET]', error);
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireApiPermission('role', 'create');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, roleSchema);
    if (!parsed.ok) return parsed.response;

    const [existingRole] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(roleScopeWhere(parsed.data.name, parsed.data.organizationId))
      .limit(1);

    if (existingRole) {
      return jsonError('Role with this name already exists in this scope', 409);
    }

    const role = await db.transaction(async (tx) => {
      if (parsed.data.isDefault) {
        const defaultScope = parsed.data.organizationId
          ? eq(roles.organizationId, parsed.data.organizationId)
          : isNull(roles.organizationId);

        await tx.update(roles).set({ isDefault: false, updatedAt: new Date() }).where(defaultScope);
      }

      const [createdRole] = await tx.insert(roles).values(parsed.data).returning();
      return createdRole;
    });

    return NextResponse.json(await expandRole(role), { status: 201 });
  } catch (error) {
    return handleRouteError('[ROLES_POST]', error);
  }
}
