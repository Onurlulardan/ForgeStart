import { describe, expect, it } from 'vitest';
import { hasSessionPermission } from './permissions';
import type { SessionUser } from './types';

const baseUser: SessionUser = {
  id: 'user-1',
  name: 'Jane Admin',
  email: 'jane@example.com',
  emailVerified: null,
  image: null,
  avatar: null,
  firstName: 'Jane',
  lastName: 'Admin',
  phone: null,
  status: 'ACTIVE',
  userRoles: [],
  permissions: [],
  memberships: [],
};

describe('hasSessionPermission', () => {
  it('allows admins regardless of resource permissions', () => {
    expect(
      hasSessionPermission(
        {
          ...baseUser,
          userRoles: [{ role: { id: 'role-1', name: 'ADMIN', description: '' } }],
        },
        'user',
        'delete'
      )
    ).toBe(true);
  });

  it('allows direct wildcard manage permissions', () => {
    expect(
      hasSessionPermission(
        {
          ...baseUser,
          permissions: [
            {
              target: 'USER',
              resource: { slug: '*' },
              actions: [{ slug: 'manage' }],
            },
          ],
        },
        'organization',
        'edit'
      )
    ).toBe(true);
  });

  it('checks organization scoped role permissions when an organization is provided', () => {
    expect(
      hasSessionPermission(
        {
          ...baseUser,
          memberships: [
            {
              id: 'membership-1',
              role: {
                id: 'role-1',
                name: 'ORG EDITOR',
                description: '',
                permissions: [
                  {
                    target: 'ROLE',
                    resource: { slug: 'organization' },
                    actions: [{ slug: 'edit' }],
                  },
                ],
              },
              organization: {
                id: 'org-1',
                name: 'Main',
                slug: 'main',
                permissions: [],
              },
            },
          ],
        },
        'organization',
        'edit',
        'org-1'
      )
    ).toBe(true);
  });

  it('denies access when the user has no matching permission', () => {
    expect(hasSessionPermission(baseUser, 'user', 'delete')).toBe(false);
  });
});
