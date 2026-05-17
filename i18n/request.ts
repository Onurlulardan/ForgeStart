import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { routing, type AppLocale } from './routing';

function isAppLocale(value: string | undefined): value is AppLocale {
  return Boolean(value && routing.locales.includes(value as AppLocale));
}

function resolveCookieName(): string {
  const localeCookie = routing.localeCookie;
  if (typeof localeCookie === 'object' && localeCookie && 'name' in localeCookie) {
    return (localeCookie as { name?: string }).name ?? 'NEXT_LOCALE';
  }
  return 'NEXT_LOCALE';
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(resolveCookieName())?.value;

  const locale: AppLocale = isAppLocale(cookieLocale) ? cookieLocale : routing.defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    timeZone: process.env.APP_TIMEZONE ?? 'Europe/Istanbul',
    now: new Date(),
    messages,
  };
});
