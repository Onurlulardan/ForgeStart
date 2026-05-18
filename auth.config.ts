import type { NextAuthConfig } from 'next-auth';
import { env } from './env';

const PROTECTED_PATH_PREFIXES = ['/dashboard', '/administrations'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default {
  session: {
    strategy: 'jwt',
    maxAge: env.AUTH_SESSION_MAX_AGE,
    updateAge: env.AUTH_SESSION_UPDATE_AGE,
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
    error: '/auth/error',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname, search } = request.nextUrl;

      if (!isProtectedPath(pathname)) {
        return true;
      }

      if (isLoggedIn) {
        return true;
      }

      const loginUrl = new URL('/auth/login', request.nextUrl);
      loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
      return Response.redirect(loginUrl);
    },
  },
} satisfies NextAuthConfig;
