import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { hasSessionPermission } from './permissions';

export async function checkPermission(
  resourceSlug: string,
  actionSlug: string,
  organizationId?: string
): Promise<boolean> {
  const session = await auth();
  return hasSessionPermission(session?.user, resourceSlug, actionSlug, organizationId);
}

export async function requireApiPermission(
  resourceSlug: string,
  actionSlug: string,
  organizationId?: string
) {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (!hasSessionPermission(session.user, resourceSlug, actionSlug, organizationId)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ok: true as const, session };
}
