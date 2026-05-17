import { z } from 'zod';

const uuid = z.string().uuid();
const nullableUuid = uuid.nullish().transform((value) => value ?? null);

export const actionSchema = z.object({
  name: z.string().trim().min(3),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-_]+$/),
  description: z
    .string()
    .trim()
    .max(500)
    .nullish()
    .transform((value) => value || null),
});

export const resourceSchema = actionSchema;

export const roleSchema = z.object({
  name: z.string().trim().min(3),
  description: z
    .string()
    .trim()
    .max(500)
    .nullish()
    .transform((value) => value || null),
  isDefault: z.boolean().default(false),
  organizationId: nullableUuid,
});

export const organizationSchema = z.object({
  name: z.string().trim().min(2),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  parentId: nullableUuid,
});

export const permissionSchema = z
  .object({
    resourceId: uuid,
    target: z.enum(['USER', 'ROLE', 'ORGANIZATION']),
    userId: nullableUuid,
    roleId: nullableUuid,
    organizationId: nullableUuid,
    actionIds: z.array(uuid).min(1),
  })
  .superRefine((value, context) => {
    const targetIds = [value.userId, value.roleId, value.organizationId].filter(Boolean);
    if (targetIds.length !== 1) {
      context.addIssue({
        code: 'custom',
        message: 'Exactly one target id must be provided',
        path: ['target'],
      });
    }

    if (value.target === 'USER' && !value.userId) {
      context.addIssue({ code: 'custom', message: 'userId is required', path: ['userId'] });
    }
    if (value.target === 'ROLE' && !value.roleId) {
      context.addIssue({ code: 'custom', message: 'roleId is required', path: ['roleId'] });
    }
    if (value.target === 'ORGANIZATION' && !value.organizationId) {
      context.addIssue({
        code: 'custom',
        message: 'organizationId is required',
        path: ['organizationId'],
      });
    }
  });

export const createUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8),
  firstName: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value || null),
  lastName: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value || null),
  phone: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value || null),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  roleIds: z.array(uuid).default([]),
});

export const updateUserSchema = createUserSchema.omit({ password: true }).extend({
  password: z.string().min(8).optional().or(z.literal('')),
});

export const registerSchema = createUserSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
});

export const profileUpdateSchema = z.object({
  email: z.string().trim().email().optional(),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  avatar: z.string().trim().url().optional().or(z.literal('')),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional().or(z.literal('')),
});

export const addUsersToOrganizationSchema = z.object({
  userIds: z.array(uuid).min(1),
  roleId: nullableUuid,
});

export const settingUpdateSchema = z.object({
  settings: z
    .array(
      z.object({
        key: z.string().trim().min(2),
        value: z.string().trim().max(2000),
      })
    )
    .min(1),
});

export const apiKeyCreateSchema = z.object({
  name: z.string().trim().min(3).max(120),
  scopes: z.array(z.string().trim().min(1)).default([]),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .transform((value) => (value ? new Date(value) : null)),
});

export const invitationCreateSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  roleId: nullableUuid,
  organizationId: nullableUuid,
  expiresInDays: z.number().int().min(1).max(90).default(7),
});

export const inviteAcceptSchema = z.object({
  token: z.string().trim().min(20),
  password: z.string().min(8),
  firstName: z.string().trim().optional().default(''),
  lastName: z.string().trim().optional().default(''),
});

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().trim().min(20),
  password: z.string().min(8),
});

export const rbacMatrixUpdateSchema = z.object({
  roleId: uuid,
  resourceId: uuid,
  actionId: uuid,
  enabled: z.boolean(),
});
