import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { organizations } from '@/db/schema';
import { handleRouteError } from '@/lib/api/response';
import { requireApiPermission } from '@/lib/auth/server-permissions';

export async function GET(request: Request) {
  try {
    const authz = await requireApiPermission('organization', 'view');
    if (!authz.ok) return authz.response;

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const rows = await db.select().from(organizations).orderBy(asc(organizations.name));

    if (!organizationId) {
      return NextResponse.json(rows);
    }

    const getChildIds = (id: string): string[] => {
      const children = rows.filter((organization) => organization.parentId === id);
      return [id, ...children.flatMap((child) => getChildIds(child.id))];
    };

    const excludedIds = new Set(getChildIds(organizationId));
    return NextResponse.json(rows.filter((organization) => !excludedIds.has(organization.id)));
  } catch (error) {
    return handleRouteError('[ORGANIZATIONS_AVAILABLE_PARENTS_GET]', error);
  }
}
