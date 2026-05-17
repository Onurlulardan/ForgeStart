import { format, formatDistanceToNow, formatRelative as fnsFormatRelative } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';

const localeMap = {
  tr,
  en: enUS,
} as const;

export type FormatterLocale = keyof typeof localeMap;

function resolveLocale(locale?: string) {
  if (!locale) return enUS;
  if (locale in localeMap) return localeMap[locale as FormatterLocale];
  return enUS;
}

export function formatDate(
  value: Date | string | number | null | undefined,
  pattern = 'PP',
  locale?: string
): string {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, pattern, { locale: resolveLocale(locale) });
}

export function formatDateTime(
  value: Date | string | number | null | undefined,
  locale?: string
): string {
  return formatDate(value, 'PPpp', locale);
}

export function formatRelative(
  value: Date | string | number | null | undefined,
  locale?: string
): string {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return formatDistanceToNow(date, { addSuffix: true, locale: resolveLocale(locale) });
}

export function formatRelativeFull(
  value: Date | string | number | null | undefined,
  base: Date = new Date(),
  locale?: string
): string {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return fnsFormatRelative(date, base, { locale: resolveLocale(locale) });
}
