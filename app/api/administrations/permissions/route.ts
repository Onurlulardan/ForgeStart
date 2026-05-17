import { NextResponse } from 'next/server';
import { db } from '@/db';
import { permissionActions, permissions } from '@/db/schema';
import { expandPermission, listPermissions } from '@/lib/api/admin-queries';
import { handleRouteError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { permissionSchema } from '@/lib/validation/admin';

export async function GET() {
  try {
    const authz = await requireApiPermission('permission', 'view');
    if (!authz.ok) return authz.response;

    return NextResponse.json(await listPermissions());
  } catch (error) {
    return handleRouteError('[PERMISSIONS_GET]', error);
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireApiPermission('permission', 'create');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, permissionSchema);
    if (!parsed.ok) return parsed.response;

    const createdPermission = await db.transaction(async (tx) => {
      const [permission] = await tx
        .insert(permissions)
        .values({
          resourceId: parsed.data.resourceId,
          target: parsed.data.target,
          userId: parsed.data.target === 'USER' ? parsed.data.userId : null,
          roleId: parsed.data.target === 'ROLE' ? parsed.data.roleId : null,
          organizationId: parsed.data.target === 'ORGANIZATION' ? parsed.data.organizationId : null,
        })
        .returning();

      await tx.insert(permissionActions).values(
        parsed.data.actionIds.map((actionId) => ({
          permissionId: permission.id,
          actionId,
        }))
      );

      return permission;
    });

    return NextResponse.json(await expandPermission(createdPermission), { status: 201 });
  } catch (error) {
    return handleRouteError('[PERMISSIONS_POST]', error);
  }
}
