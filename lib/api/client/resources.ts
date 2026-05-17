import { z } from 'zod';
import { deleteRequest, getRequest, postRequest, putRequest } from '@/lib/apiClient';
import { resourceSchema } from '@/lib/validation/admin';
import type { Resource, ListParams } from './types';

export type ResourceInput = z.input<typeof resourceSchema>;

const BASE = '/administrations/resources';

export const resourcesApi = {
  list: (params?: ListParams) => getRequest<Resource[]>(BASE, { params }),
  get: (id: string) => getRequest<Resource>(`${BASE}/${id}`),
  create: (data: ResourceInput) => postRequest<Resource>(BASE, data),
  update: (id: string, data: ResourceInput) => putRequest<Resource>(`${BASE}/${id}`, data),
  remove: (id: string) => deleteRequest<void>(`${BASE}/${id}`),
};
