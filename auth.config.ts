import type { NextAuthConfig } from 'next-auth';

const PROTECTED_PATH_PREFIXES = ['/dashboard', '/administrations'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default {
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.AUTH_SESSION_MAX_AGE) || 7 * 24 * 60 * 60,
    updateAge: Number(process.env.AUTH_SESSION_UPDATE_AGE) || 60 * 60,
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
