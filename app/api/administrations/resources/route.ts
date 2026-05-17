import { NextResponse } from 'next/server';
import { eq, or } from 'drizzle-orm';
import { db } from '@/db';
import { resources } from '@/db/schema';
import { listResources } from '@/lib/api/admin-queries';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { resourceSchema } from '@/lib/validation/admin';

export async function GET() {
  try {
    const authz = await requireApiPermission('resource', 'view');
    if (!authz.ok) return authz.response;

    return NextResponse.json(await listResources());
  } catch (error) {
    return handleRouteError('[RESOURCES_GET]', error);
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireApiPermission('resource', 'create');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, resourceSchema);
    if (!parsed.ok) return parsed.response;

    const [existingResource] = await db
      .select({ id: resources.id })
      .from(resources)
      .where(or(eq(resources.name, parsed.data.name), eq(resources.slug, parsed.data.slug)))
      .limit(1);

    if (existingResource) {
      return jsonError('Resource with this name or slug already exists', 409);
    }

    const [resource] = await db.insert(resources).values(parsed.data).returning();
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    return handleRouteError('[RESOURCES_POST]', error);
  }
}
