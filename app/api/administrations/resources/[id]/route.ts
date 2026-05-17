import { NextResponse } from 'next/server';
import { and, count, eq, ne, or } from 'drizzle-orm';
import { db } from '@/db';
import { permissions, resources } from '@/db/schema';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { resourceSchema } from '@/lib/validation/admin';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('resource', 'view');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const [resource] = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
    if (!resource) return jsonError('Resource not found', 404);

    return NextResponse.json(resource);
  } catch (error) {
    return handleRouteError('[RESOURCES_ID_GET]', error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('resource', 'edit');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const parsed = await parseJson(request, resourceSchema);
    if (!parsed.ok) return parsed.response;

    const [existingResource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1);
    if (!existingResource) return jsonError('Resource not found', 404);

    const [duplicate] = await db
      .select({ id: resources.id })
      .from(resources)
      .where(
        and(
          ne(resources.id, id),
          or(eq(resources.name, parsed.data.name), eq(resources.slug, parsed.data.slug))
        )
      )
      .limit(1);
    if (duplicate) return jsonError('Resource with this name or slug already exists', 409);

    const [resource] = await db
      .update(resources)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();

    return NextResponse.json(resource);
  } catch (error) {
    return handleRouteError('[RESOURCES_ID_PUT]', error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('resource', 'delete');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const [existingResource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1);
    if (!existingResource) return jsonError('Resource not found', 404);

    const [usage] = await db
      .select({ count: count() })
      .from(permissions)
      .where(eq(permissions.resourceId, id));

    if (usage.count > 0) {
      return jsonError('Cannot delete resource that has associated permissions', 400);
    }

    await db.delete(resources).where(eq(resources.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError('[RESOURCES_ID_DELETE]', error);
  }
}
