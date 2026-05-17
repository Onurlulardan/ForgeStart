import type {
  Action,
  ApiKey,
  AuditLog,
  AppSetting,
  Invitation,
  Organization,
  OrgStatus,
  Permission,
  PermissionTarget,
  Resource,
  Role,
  SecurityLog,
  User,
  UserStatus,
} from '@/db/types';

export type UserWithoutPassword = Omit<User, 'passwordHash'> & {
  userRoles?: Array<{
    role: {
      id: string;
      name: string;
      description: string | null;
    };
  }>;
};

export type RoleWithCount = Role & {
  _count?: { users: number };
};

export type OrganizationWithCount = Organization & {
  _count?: { members: number };
  children?: OrganizationWithCount[];
  parent?: { id: string; name: string } | null;
};

export type PermissionWithRelations = Permission & {
  resource?: Resource | null;
  user?: { id: string; email: string } | null;
  role?: { id: string; name: string } | null;
  organization?: { id: string; name: string } | null;
  actions?: Array<{ action: Action }>;
};

export type InvitationWithRelations = Invitation & {
  role?: { id: string; name: string } | null;
  organization?: { id: string; name: string } | null;
  invitedBy?: { email: string; firstName: string | null; lastName: string | null } | null;
};

export type ApiKeyListItem = Omit<ApiKey, 'keyHash'> & {
  createdBy?: { email: string; firstName: string | null; lastName: string | null } | null;
};

export type ApiKeyCreateResponse = ApiKey & { key: string };

export type AuditLogListItem = AuditLog;
export type SecurityLogListItem = SecurityLog;
export type AppSettingItem = AppSetting;

export type RbacMatrixResponse = {
  roles: Role[];
  resources: Resource[];
  actions: Action[];
  grants: Array<{
    permissionId: string;
    roleId: string | null;
    resourceId: string;
    actionId: string;
  }>;
};

export type DashboardStats = {
  totalOrganizations: number;
  totalUsers: number;
  activeUsers: number;
};

export type HealthStatus = {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  migrations?: number;
};

export type VersionInfo = {
  version: string;
  commit?: string;
  builtAt?: string;
};

export type ListParams = {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
} & Record<string, string | number | boolean | undefined>;

export type {
  Action,
  ApiKey,
  AuditLog,
  AppSetting,
  Invitation,
  Organization,
  OrgStatus,
  Permission,
  PermissionTarget,
  Resource,
  Role,
  SecurityLog,
  User,
  UserStatus,
};
