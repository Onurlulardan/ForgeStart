import 'server-only';
import { auth } from '@/auth';
import { hasSessionPermission } from '@/lib/auth/permissions';
import type { SessionUser } from '@/lib/auth/types';
import { failure, type ActionResult } from './result';

export interface WithAuthOptions {
  permission?: { resource: string; action: string; organizationId?: string };
}

type ActionHandler<TArgs extends unknown[], TResult> = (
  session: { user: SessionUser },
  ...args: TArgs
) => Promise<ActionResult<TResult>>;

export function withAuth<TArgs extends unknown[], TResult>(
  handler: ActionHandler<TArgs, TResult>,
  options: WithAuthOptions = {}
) {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    const session = await auth();
    if (!session?.user) {
      return failure('Unauthorized', 'UNAUTHORIZED');
    }
    if (options.permission) {
      const ok = hasSessionPermission(
        session.user,
        options.permission.resource,
        options.permission.action,
        options.permission.organizationId
      );
      if (!ok) return failure('Forbidden', 'FORBIDDEN');
    }
    return handler({ user: session.user }, ...args);
  };
}
