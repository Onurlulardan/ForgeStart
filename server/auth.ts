import type { RealtimeUser } from '../lib/realtime/types';

const SESSION_CACHE_TTL_MS = 5 * 1000;
const cache = new Map<string, { expiresAt: number; user: RealtimeUser | null }>();

interface SessionResponse {
  user?: {
    id?: string;
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export async function authenticateFromCookie(
  cookieHeader: string | undefined,
  appUrl: string
): Promise<RealtimeUser | null> {
  if (!cookieHeader) return null;
  const cached = cache.get(cookieHeader);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.user;
  }

  try {
    const response = await fetch(`${appUrl.replace(/\/+$/, '')}/api/auth/session`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!response.ok) {
      cache.set(cookieHeader, { user: null, expiresAt: now + SESSION_CACHE_TTL_MS });
      return null;
    }
    const session = (await response.json()) as SessionResponse;
    if (!session?.user?.id || !session.user.email) {
      cache.set(cookieHeader, { user: null, expiresAt: now + SESSION_CACHE_TTL_MS });
      return null;
    }
    const user: RealtimeUser = {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName ?? null,
      lastName: session.user.lastName ?? null,
    };
    cache.set(cookieHeader, { user, expiresAt: now + SESSION_CACHE_TTL_MS });
    return user;
  } catch (error) {
    console.error('[realtime.auth]', error);
    return null;
  }
}
