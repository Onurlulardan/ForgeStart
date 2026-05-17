import { describe, expect, it } from 'vitest';
import { generateSlug } from './slug';

describe('generateSlug', () => {
  it('creates lower-case URL-safe slugs', () => {
    expect(generateSlug('Main Organization 2026')).toBe('main-organization-2026');
  });

  it('trims duplicate separators', () => {
    expect(generateSlug('  Billing & Reports  ')).toBe('billing-reports');
  });
});
