import type { DefaultSession } from 'next-auth';
import 'next-auth';
import 'next-auth/jwt';

export type PermissionActionPayload = {
  slug: string;
};

export type PermissionPayload = {
  target: 'USER' | 'ROLE' | 'ORGANIZATION';
  resource: {
    slug: string;
  };
  actions: PermissionActionPayload[];
};

export type UserRoleWithDetails = {
  role: {
    id: string;
    name: string;
    description: string;
  };
};

export type OrganizationRole = {
  id: string;
  name: string;
  description: string;
  permissions: PermissionPayload[];
};

export type OrganizationMembership = {
  id: string;
  role: OrganizationRole | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    permissions: PermissionPayload[];
  };
};

export type SessionUser = DefaultSession['user'] & {
  id: string;
  email: string;
  avatar: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  emailVerified: Date | null;
  userRoles: UserRoleWithDetails[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  permissions: PermissionPayload[];
  memberships: OrganizationMembership[];
};

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }

  interface User extends SessionUser {}
}

declare module 'next-auth/jwt' {
  interface JWT extends SessionUser {}
}
