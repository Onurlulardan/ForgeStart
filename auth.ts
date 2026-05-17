import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import authConfig from './auth.config';
import { db } from '@/db';
import { accounts, sessions, users, verificationTokens } from '@/db/schema';
import { getSessionUserPayload, logSecurityEvent } from '@/lib/auth/session-data';
import type { SessionUser } from '@/lib/auth/types';

const credentialsSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          await logSecurityEvent({
            email: '',
            status: 'FAILED',
            type: 'LOGIN',
            message: 'Invalid credential payload',
            request,
          });
          return null;
        }

        const { email, password } = parsed.data;
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user?.passwordHash) {
          await logSecurityEvent({
            email,
            status: 'FAILED',
            type: 'LOGIN',
            message: 'Invalid credentials',
            request,
          });
          return null;
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
          await logSecurityEvent({
            userId: user.id,
            email,
            status: 'FAILED',
            type: 'LOGIN',
            message: 'Invalid credentials',
            request,
          });
          return null;
        }

        if (user.status !== 'ACTIVE') {
          await logSecurityEvent({
            userId: user.id,
            email,
            status: 'FAILED',
            type: 'LOGIN',
            message: 'Account is not active',
            request,
          });
          return null;
        }

        const sessionUser = await getSessionUserPayload(user.id);
        if (!sessionUser) return null;

        await logSecurityEvent({
          userId: user.id,
          email,
          status: 'SUCCESS',
          type: 'LOGIN',
          message: `Successful login for user ${email}`,
          request,
        });

        return sessionUser;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        Object.assign(token, user);
      }

      if (trigger === 'update' && token.id) {
        const refreshedUser = await getSessionUserPayload(token.id);
        if (refreshedUser) Object.assign(token, refreshedUser);
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        ...token,
        email: token.email ?? session.user.email ?? '',
      } as SessionUser;
      return session;
    },
  },
});
