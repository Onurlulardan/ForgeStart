import { describe, expect, it } from 'vitest';
import { createUserSchema, permissionSchema } from './admin';

describe('admin validation schemas', () => {
  it('normalizes create user email and defaults roleIds', () => {
    const parsed = createUserSchema.parse({
      email: 'ADMIN@EXAMPLE.COM',
      password: 'password123',
    });

    expect(parsed.email).toBe('admin@example.com');
    expect(parsed.roleIds).toEqual([]);
    expect(parsed.status).toBe('ACTIVE');
  });

  it('rejects permissions without exactly one target id', () => {
    const result = permissionSchema.safeParse({
      resourceId: '5f08b295-dca3-4f60-a62f-3ba790a9b25c',
      target: 'USER',
      actionIds: ['905ec4b1-32ad-4712-b887-5dd122fc78e6'],
    });

    expect(result.success).toBe(false);
  });
});
