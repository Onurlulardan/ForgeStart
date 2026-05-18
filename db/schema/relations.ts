import { relations } from 'drizzle-orm';
import { accounts } from './accounts';
import { auditLogs } from './audit-logs';
import { organizationMembers } from './organization-members';
import { organizations } from './organizations';
import { permissionActions } from './permission-actions';
import { permissions } from './permissions';
import { resources } from './resources';
import { roles } from './roles';
import { securityLogs } from './security-logs';
import { sessions } from './sessions';
import { userRoles } from './user-roles';
import { users } from './users';

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  userRoles: many(userRoles),
  organizationMemberships: many(organizationMembers),
  permissions: many(permissions),
  securityLogs: many(securityLogs),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  userRoles: many(userRoles),
  organizationMembers: many(organizationMembers),
  permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  resource: one(resources, {
    fields: [permissions.resourceId],
    references: [resources.id],
  }),
  user: one(users, {
    fields: [permissions.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [permissions.roleId],
    references: [roles.id],
  }),
  organization: one(organizations, {
    fields: [permissions.organizationId],
    references: [organizations.id],
  }),
  actions: many(permissionActions),
}));
