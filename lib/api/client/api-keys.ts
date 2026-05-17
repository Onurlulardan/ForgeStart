import { z } from 'zod';
import { deleteRequest, getRequest, postRequest } from '@/lib/apiClient';
import { apiKeyCreateSchema } from '@/lib/validation/admin';
import type { ApiKeyCreateResponse, ApiKeyListItem, ListParams } from './types';

export type ApiKeyCreateInput = z.input<typeof apiKeyCreateSchema>;

const BASE = '/administrations/api-keys';

export const apiKeysApi = {
  list: (params?: ListParams) => getRequest<ApiKeyListItem[]>(BASE, { params }),
  create: (data: ApiKeyCreateInput) => postRequest<ApiKeyCreateResponse>(BASE, data),
  revoke: (id: string) => deleteRequest<void>(`${BASE}/${id}`),
};
