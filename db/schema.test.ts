import { describe, expect, it } from 'vitest';
import { getTableName } from 'drizzle-orm';
import { actions, organizations, users } from './schema';

describe('drizzle schema', () => {
  it('uses snake_case PostgreSQL table names for v2', () => {
    expect(getTableName(users)).toBe('users');
    expect(getTableName(organizations)).toBe('organizations');
    expect(getTableName(actions)).toBe('actions');
  });
});
