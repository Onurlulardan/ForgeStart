import { z } from 'zod';
import { deleteRequest, getRequest, postRequest, putRequest } from '@/lib/apiClient';
import { permissionSchema, rbacMatrixUpdateSchema } from '@/lib/validation/admin';
import type {
  Permission,
  PermissionWithRelations,
  RbacMatrixResponse,
  ListParams,
} from './types';

export type PermissionInput = z.input<typeof permissionSchema>;
export type RbacMatrixUpdateInput = z.input<typeof rbacMatrixUpdateSchema>;

const BASE = '/administrations/permissions';

export const permissionsApi = {
  list: (params?: ListParams) => getRequest<PermissionWithRelations[]>(BASE, { params }),
  get: (id: string) => getRequest<PermissionWithRelations>(`${BASE}/${id}`),
  create: (data: PermissionInput) => postRequest<Permission>(BASE, data),
  update: (id: string, data: PermissionInput) => putRequest<Permission>(`${BASE}/${id}`, data),
  remove: (id: string) => deleteRequest<void>(`${BASE}/${id}`),
};

export const rbacMatrixApi = {
  get: () => getRequest<RbacMatrixResponse>('/administrations/rbac-matrix'),
  update: (data: RbacMatrixUpdateInput) =>
    putRequest<{ ok: true }>('/administrations/rbac-matrix', data),
};
