import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { organizations } from '@/db/schema';
import { expandOrganization, listOrganizations } from '@/lib/api/admin-queries';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { organizationSchema } from '@/lib/validation/admin';

export async function GET() {
  try {
    const authz = await requireApiPermission('organization', 'view');
    if (!authz.ok) return authz.response;

    return NextResponse.json(await listOrganizations());
  } catch (error) {
    return handleRouteError('[ORGANIZATIONS_GET]', error);
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireApiPermission('organization', 'create');
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, organizationSchema);
    if (!parsed.ok) return parsed.response;

    const [existingOrganization] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, parsed.data.slug))
      .limit(1);

    if (existingOrganization) {
      return jsonError('Organization with this slug already exists', 409);
    }

    const [organization] = await db
      .insert(organizations)
      .values({
        ...parsed.data,
        ownerId: authz.session.user.id,
      })
      .returning();

    return NextResponse.json(await expandOrganization(organization), { status: 201 });
  } catch (error) {
    return handleRouteError('[ORGANIZATIONS_POST]', error);
  }
}
