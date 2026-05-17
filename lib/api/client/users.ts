import { z } from 'zod';
import { deleteRequest, getRequest, postRequest, putRequest } from '@/lib/apiClient';
import { createUserSchema, updateUserSchema } from '@/lib/validation/admin';
import type { UserWithoutPassword, ListParams } from './types';

export type CreateUserInput = z.input<typeof createUserSchema>;
export type UpdateUserInput = z.input<typeof updateUserSchema>;

const BASE = '/administrations/users';

export const usersApi = {
  list: (params?: ListParams) => getRequest<UserWithoutPassword[]>(BASE, { params }),
  available: () => getRequest<UserWithoutPassword[]>(`${BASE}/available`),
  get: (id: string) => getRequest<UserWithoutPassword>(`${BASE}/${id}`),
  create: (data: CreateUserInput) => postRequest<UserWithoutPassword>(BASE, data),
  update: (id: string, data: UpdateUserInput) =>
    putRequest<UserWithoutPassword>(`${BASE}/${id}`, data),
  remove: (id: string) => deleteRequest<void>(`${BASE}/${id}`),
};
