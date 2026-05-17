const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

export function formatBytes(value: number | null | undefined, fractionDigits = 1): string {
  if (value == null || Number.isNaN(value) || value < 0) return '';
  if (value === 0) return '0 B';

  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), UNITS.length - 1);
  const scaled = value / Math.pow(1024, exponent);
  return `${scaled.toFixed(fractionDigits)} ${UNITS[exponent]}`;
}
