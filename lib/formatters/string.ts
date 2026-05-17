export function truncate(value: string | null | undefined, max = 80, suffix = '...'): string {
  if (!value) return '';
  if (value.length <= max) return value;
  return value.slice(0, Math.max(0, max - suffix.length)) + suffix;
}

export function capitalize(value: string | null | undefined): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => capitalize(segment))
    .join(' ');
}

export function initials(value: string | null | undefined, max = 2): string {
  if (!value) return '';
  const segments = value.trim().split(/\s+/).filter(Boolean);
  if (!segments.length) return '';
  return segments
    .slice(0, max)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join('');
}

export function slugToTitle(slug: string | null | undefined): string {
  if (!slug) return '';
  return titleCase(slug.replaceAll(/[-_]/g, ' '));
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}
