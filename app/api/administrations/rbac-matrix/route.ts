import { NextResponse } from 'next/server';
import { and, asc, count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { actions, permissionActions, permissions, resources, roles } from '@/db/schema';
import { handleRouteError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { rbacMatrixUpdateSchema } from '@/lib/validation/admin';
import { writeAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const authz = await requireApiPermission('permission', 'view');
    if (!authz.ok) return authz.response;

    const [roleRows, resourceRows, actionRows, permissionRows] = await Promise.all([
      db.select().from(roles).orderBy(asc(roles.name)),
      db.select().from(resources).orderBy(asc(resources.name)),
      db.select().from(actions).orderBy(asc(actions.name)),
      db
        .select({
          permissionId: permissions.id,
          roleId: permissions.roleId,
          resourceId: permissions.resourceId,
          actionId: permissionActions.actionId,
        })
        .from(permissions)
        .innerJoin(permissionActions, eq(permissionActions.permissionId, permissions.id))
        .where(eq(permissions.target, 'ROLE')),
    ]);

    return NextResponse.json({
      roles: roleRows,
      resources: resourceRows,
      actions: actionRows,
      grants: permissionRows,
    });
  } catch (error) {
    return handleRouteError('[RBAC_MATRIX_GET]', error);
  }
}

export async function PUT(request: Request) {
  try {
    const authz = await requireApiPermission('permission', 'edit');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, rbacMatrixUpdateSchema);
    if (!parsed.ok) return parsed.response;

    const { roleId, resourceId, actionId, enabled } = parsed.data;

    await db.transaction(async (tx) => {
      const [permission] = await tx
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.target, 'ROLE'),
            eq(permissions.roleId, roleId),
            eq(permissions.resourceId, resourceId)
          )
        )
        .limit(1);

      if (enabled) {
        const permissionId =
          permission?.id ??
          (
            await tx
              .insert(permissions)
              .values({ target: 'ROLE', roleId, resourceId })
              .returning({ id: permissions.id })
          )[0].id;

        await tx
          .insert(permissionActions)
          .values({ permissionId, actionId })
          .onConflictDoNothing({
            target: [permissionActions.permissionId, permissionActions.actionId],
          });
        return;
      }

      if (!permission) return;

      await tx
        .delete(permissionActions)
        .where(
          and(
            eq(permissionActions.permissionId, permission.id),
            eq(permissionActions.actionId, actionId)
          )
        );

      const [remaining] = await tx
        .select({ count: count() })
        .from(permissionActions)
        .where(eq(permissionActions.permissionId, permission.id));

      if (remaining.count === 0) {
        await tx.delete(permissions).where(eq(permissions.id, permission.id));
      }
    });

    await writeAuditLog({
      sessionUser: authz.session.user,
      request,
      action: enabled ? 'rbac.grant' : 'rbac.revoke',
      resource: 'permission',
      message: enabled ? 'Permission granted in RBAC matrix' : 'Permission revoked in RBAC matrix',
      metadata: { roleId, resourceId, actionId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError('[RBAC_MATRIX_PUT]', error);
  }
}
