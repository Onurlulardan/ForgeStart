import type { Metadata } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { Providers } from './providers';
import { loadSystemTheme } from './actions/theme';
import type { ThemeTokens } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'NextJS Starter',
  description: 'Modern Next.js, Auth.js, Drizzle, PostgreSQL starter template',
};

function isThemeTokens(value: unknown): value is ThemeTokens {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.radius === 'string' &&
    typeof candidate.fontFamily === 'string' &&
    typeof candidate.colors === 'object' &&
    candidate.colors !== null
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, messages, rawSystemTheme] = await Promise.all([
    getLocale(),
    getMessages(),
    loadSystemTheme().catch(() => null),
  ]);

  const systemTheme = isThemeTokens(rawSystemTheme) ? rawSystemTheme : null;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers locale={locale} messages={messages} systemTheme={systemTheme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
