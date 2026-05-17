import { NextResponse } from 'next/server';
import { and, count, eq, ne, or } from 'drizzle-orm';
import { db } from '@/db';
import { actions, permissionActions } from '@/db/schema';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { actionSchema } from '@/lib/validation/admin';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('action', 'view');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const [action] = await db.select().from(actions).where(eq(actions.id, id)).limit(1);
    if (!action) return jsonError('Action not found', 404);

    return NextResponse.json(action);
  } catch (error) {
    return handleRouteError('[ACTIONS_ID_GET]', error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('action', 'edit');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const parsed = await parseJson(request, actionSchema);
    if (!parsed.ok) return parsed.response;

    const [existingAction] = await db.select().from(actions).where(eq(actions.id, id)).limit(1);
    if (!existingAction) return jsonError('Action not found', 404);

    const [duplicate] = await db
      .select({ id: actions.id })
      .from(actions)
      .where(
        and(
          ne(actions.id, id),
          or(eq(actions.name, parsed.data.name), eq(actions.slug, parsed.data.slug))
        )
      )
      .limit(1);
    if (duplicate) return jsonError('Action with this name or slug already exists', 409);

    const [action] = await db
      .update(actions)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(actions.id, id))
      .returning();

    return NextResponse.json(action);
  } catch (error) {
    return handleRouteError('[ACTIONS_ID_PUT]', error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('action', 'delete');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const [existingAction] = await db.select().from(actions).where(eq(actions.id, id)).limit(1);
    if (!existingAction) return jsonError('Action not found', 404);

    const [usage] = await db
      .select({ count: count() })
      .from(permissionActions)
      .where(eq(permissionActions.actionId, id));

    if (usage.count > 0) {
      return jsonError('Cannot delete action that has associated permissions', 400);
    }

    await db.delete(actions).where(eq(actions.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError('[ACTIONS_ID_DELETE]', error);
  }
}
