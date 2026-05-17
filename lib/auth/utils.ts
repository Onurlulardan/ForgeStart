import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export async function getSession() {
  return auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.userRoles.find((role) => role.role.name === 'ADMIN')) {
    redirect('/auth/unauthorized');
  }
  return user;
}
