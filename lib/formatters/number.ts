function intlLocale(locale?: string): string {
  if (!locale) return 'en-US';
  if (locale === 'tr') return 'tr-TR';
  if (locale === 'en') return 'en-US';
  return locale;
}

export function formatNumber(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string {
  if (value == null || Number.isNaN(value)) return '';
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

export function formatCurrency(
  value: number | null | undefined,
  currency = 'USD',
  locale?: string
): string {
  if (value == null || Number.isNaN(value)) return '';
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatPercent(
  value: number | null | undefined,
  fractionDigits = 0,
  locale?: string
): string {
  if (value == null || Number.isNaN(value)) return '';
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatCompact(
  value: number | null | undefined,
  locale?: string
): string {
  if (value == null || Number.isNaN(value)) return '';
  return new Intl.NumberFormat(intlLocale(locale), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
