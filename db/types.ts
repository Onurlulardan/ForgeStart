import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type {
  actions,
  organizationMembers,
  organizations,
  permissionActions,
  permissions,
  resources,
  roles,
  securityLogs,
  userRoles,
  users,
} from './schema';

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const OrgStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const PermissionTarget = {
  USER: 'USER',
  ROLE: 'ROLE',
  ORGANIZATION: 'ORGANIZATION',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export type OrgStatus = (typeof OrgStatus)[keyof typeof OrgStatus];
export type PermissionTarget = (typeof PermissionTarget)[keyof typeof PermissionTarget];

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UserRole = InferSelectModel<typeof userRoles>;
export type Role = InferSelectModel<typeof roles>;
export type Resource = InferSelectModel<typeof resources>;
export type Action = InferSelectModel<typeof actions>;
export type Permission = InferSelectModel<typeof permissions>;
export type PermissionAction = InferSelectModel<typeof permissionActions>;
export type Organization = InferSelectModel<typeof organizations>;
export type OrganizationMember = InferSelectModel<typeof organizationMembers>;
export type SecurityLog = InferSelectModel<typeof securityLogs>;
