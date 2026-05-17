export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.users.lists(), params ?? {}] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    available: () => [...queryKeys.users.all, 'available'] as const,
  },
  organizations: {
    all: ['organizations'] as const,
    lists: () => [...queryKeys.organizations.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.organizations.lists(), params ?? {}] as const,
    details: () => [...queryKeys.organizations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.organizations.details(), id] as const,
    availableParents: (organizationId?: string) =>
      [...queryKeys.organizations.all, 'available-parents', organizationId ?? null] as const,
  },
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.roles.lists(), params ?? {}] as const,
    detail: (id: string) => [...queryKeys.roles.all, 'detail', id] as const,
  },
  resources: {
    all: ['resources'] as const,
    lists: () => [...queryKeys.resources.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.resources.lists(), params ?? {}] as const,
  },
  actions: {
    all: ['actions'] as const,
    lists: () => [...queryKeys.actions.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.actions.lists(), params ?? {}] as const,
  },
  permissions: {
    all: ['permissions'] as const,
    lists: () => [...queryKeys.permissions.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.permissions.lists(), params ?? {}] as const,
  },
  rbacMatrix: {
    all: ['rbac-matrix'] as const,
  },
  invitations: {
    all: ['invitations'] as const,
    lists: () => [...queryKeys.invitations.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.invitations.lists(), params ?? {}] as const,
  },
  apiKeys: {
    all: ['api-keys'] as const,
    lists: () => [...queryKeys.apiKeys.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.apiKeys.lists(), params ?? {}] as const,
  },
  auditLogs: {
    all: ['audit-logs'] as const,
    lists: () => [...queryKeys.auditLogs.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.auditLogs.lists(), params ?? {}] as const,
  },
  securityLogs: {
    all: ['security-logs'] as const,
    lists: () => [...queryKeys.securityLogs.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.securityLogs.lists(), params ?? {}] as const,
  },
  appSettings: {
    all: ['app-settings'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    health: () => [...queryKeys.dashboard.all, 'health'] as const,
    version: () => [...queryKeys.dashboard.all, 'version'] as const,
  },
};
