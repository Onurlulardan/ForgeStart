import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { permissionActions, permissions } from '@/db/schema';
import { expandPermission, getPermissionById } from '@/lib/api/admin-queries';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { permissionSchema } from '@/lib/validation/admin';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('permission', 'view');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const permission = await getPermissionById(id);
    if (!permission) return jsonError('Permission not found', 404);

    return NextResponse.json(permission);
  } catch (error) {
    return handleRouteError('[PERMISSIONS_ID_GET]', error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('permission', 'edit');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const parsed = await parseJson(request, permissionSchema);
    if (!parsed.ok) return parsed.response;

    const [existingPermission] = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1);

    if (!existingPermission) return jsonError('Permission not found', 404);

    const updatedPermission = await db.transaction(async (tx) => {
      await tx.delete(permissionActions).where(eq(permissionActions.permissionId, id));

      const [permission] = await tx
        .update(permissions)
        .set({
          resourceId: parsed.data.resourceId,
          target: parsed.data.target,
          userId: parsed.data.target === 'USER' ? parsed.data.userId : null,
          roleId: parsed.data.target === 'ROLE' ? parsed.data.roleId : null,
          organizationId: parsed.data.target === 'ORGANIZATION' ? parsed.data.organizationId : null,
          updatedAt: new Date(),
        })
        .where(eq(permissions.id, id))
        .returning();

      await tx.insert(permissionActions).values(
        parsed.data.actionIds.map((actionId) => ({
          permissionId: permission.id,
          actionId,
        }))
      );

      return permission;
    });

    return NextResponse.json(await expandPermission(updatedPermission));
  } catch (error) {
    return handleRouteError('[PERMISSIONS_ID_PUT]', error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('permission', 'delete');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const [existingPermission] = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1);

    if (!existingPermission) return jsonError('Permission not found', 404);

    await db.delete(permissions).where(eq(permissions.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError('[PERMISSIONS_ID_DELETE]', error);
  }
}
