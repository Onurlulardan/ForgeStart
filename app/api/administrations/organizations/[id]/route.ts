import { NextResponse } from 'next/server';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { organizationMembers, organizations, roles, users } from '@/db/schema';
import { expandOrganization, getOrganizationById } from '@/lib/api/admin-queries';
import { handleRouteError, jsonError, parseJson } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { organizationSchema } from '@/lib/validation/admin';

async function getOrganizationDetails(id: string) {
  const organization = await getOrganizationById(id);
  if (!organization) return null;

  const [members, organizationRoles, parent] = await Promise.all([
    db
      .select({
        id: organizationMembers.id,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        role: {
          id: roles.id,
          name: roles.name,
          description: roles.description,
        },
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .leftJoin(roles, eq(organizationMembers.roleId, roles.id))
      .where(eq(organizationMembers.organizationId, id)),
    db.select().from(roles).where(eq(roles.organizationId, id)),
    organization.parentId
      ? db.select().from(organizations).where(eq(organizations.id, organization.parentId)).limit(1)
      : Promise.resolve([]),
  ]);

  return {
    ...organization,
    members,
    roles: organizationRoles,
    parent: parent[0] ?? null,
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('organization', 'view');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const organization = await getOrganizationDetails(id);
    if (!organization) return jsonError('Organization not found', 404);

    return NextResponse.json(organization);
  } catch (error) {
    return handleRouteError('[ORGANIZATIONS_ID_GET]', error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('organization', 'edit');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const parsed = await parseJson(request, organizationSchema);
    if (!parsed.ok) return parsed.response;

    if (parsed.data.parentId === id) {
      return jsonError('Organization cannot be its own parent', 400);
    }

    const [existingOrganization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);
    if (!existingOrganization) return jsonError('Organization not found', 404);

    const [duplicateSlug] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(and(eq(organizations.slug, parsed.data.slug), ne(organizations.id, id)))
      .limit(1);
    if (duplicateSlug) return jsonError('Organization with this slug already exists', 409);

    const [organization] = await db
      .update(organizations)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();

    return NextResponse.json(await expandOrganization(organization));
  } catch (error) {
    return handleRouteError('[ORGANIZATIONS_ID_PUT]', error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireApiPermission('organization', 'delete');
    if (!authz.ok) return authz.response;

    const { id } = await params;
    const [existingOrganization] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);
    if (!existingOrganization) return jsonError('Organization not found', 404);

    await db.delete(organizations).where(eq(organizations.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError('[ORGANIZATIONS_ID_DELETE]', error);
  }
}
