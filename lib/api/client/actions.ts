import { z } from 'zod';
import { deleteRequest, getRequest, postRequest, putRequest } from '@/lib/apiClient';
import { actionSchema } from '@/lib/validation/admin';
import type { Action, ListParams } from './types';

export type ActionInput = z.input<typeof actionSchema>;

const BASE = '/administrations/actions';

export const actionsApi = {
  list: (params?: ListParams) => getRequest<Action[]>(BASE, { params }),
  get: (id: string) => getRequest<Action>(`${BASE}/${id}`),
  create: (data: ActionInput) => postRequest<Action>(BASE, data),
  update: (id: string, data: ActionInput) => putRequest<Action>(`${BASE}/${id}`, data),
  remove: (id: string) => deleteRequest<void>(`${BASE}/${id}`),
};
