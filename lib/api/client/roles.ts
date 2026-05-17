import { z } from 'zod';
import { deleteRequest, getRequest, postRequest, putRequest } from '@/lib/apiClient';
import { roleSchema } from '@/lib/validation/admin';
import type { Role, RoleWithCount, ListParams } from './types';

export type RoleInput = z.input<typeof roleSchema>;

const BASE = '/administrations/roles';

export const rolesApi = {
  list: (params?: ListParams) => getRequest<RoleWithCount[]>(BASE, { params }),
  get: (id: string) => getRequest<Role>(`${BASE}/${id}`),
  create: (data: RoleInput) => postRequest<Role>(BASE, data),
  update: (id: string, data: RoleInput) => putRequest<Role>(`${BASE}/${id}`, data),
  remove: (id: string) => deleteRequest<void>(`${BASE}/${id}`),
};
