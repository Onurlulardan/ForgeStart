import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const proxy = auth((request) => {
  const isAuthenticated = Boolean(request.auth?.user);
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  if (!isAuthenticated && !isAuthPage) {
    const loginUrl = new URL('/auth/login', request.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/administrations/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
