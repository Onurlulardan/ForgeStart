import { NextResponse } from 'next/server';
import { eq, or } from 'drizzle-orm';
import { db } from '@/db';
import { actions } from '@/db/schema';
import { listActions } from '@/lib/api/admin-queries';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { actionSchema } from '@/lib/validation/admin';

export async function GET() {
  try {
    const authz = await requireApiPermission('action', 'view');
    if (!authz.ok) return authz.response;

    return NextResponse.json(await listActions());
  } catch (error) {
    return handleRouteError('[ACTIONS_GET]', error);
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireApiPermission('action', 'create');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, actionSchema);
    if (!parsed.ok) return parsed.response;

    const [existingAction] = await db
      .select({ id: actions.id })
      .from(actions)
      .where(or(eq(actions.name, parsed.data.name), eq(actions.slug, parsed.data.slug)))
      .limit(1);

    if (existingAction) {
      return jsonError('Action with this name or slug already exists', 409);
    }

    const [action] = await db.insert(actions).values(parsed.data).returning();
    return NextResponse.json(action, { status: 201 });
  } catch (error) {
    return handleRouteError('[ACTIONS_POST]', error);
  }
}
