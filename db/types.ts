import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type {
  actions,
  apiKeys,
  appSettings,
  auditLogs,
  invitations,
  organizationMembers,
  organizations,
  permissionActions,
  permissions,
  passwordResetTokens,
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

export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export type OrgStatus = (typeof OrgStatus)[keyof typeof OrgStatus];
export type PermissionTarget = (typeof PermissionTarget)[keyof typeof PermissionTarget];
export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];

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
export type AppSetting = InferSelectModel<typeof appSettings>;
export type ApiKey = InferSelectModel<typeof apiKeys>;
export type Invitation = InferSelectModel<typeof invitations>;
export type PasswordResetToken = InferSelectModel<typeof passwordResetTokens>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
