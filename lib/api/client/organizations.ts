import { z } from 'zod';
import { deleteRequest, getRequest, postRequest, putRequest } from '@/lib/apiClient';
import { addUsersToOrganizationSchema, organizationSchema } from '@/lib/validation/admin';
import type { Organization, OrganizationWithCount, ListParams } from './types';

export type OrganizationInput = z.input<typeof organizationSchema>;
export type AddUsersToOrganizationInput = z.input<typeof addUsersToOrganizationSchema>;

const BASE = '/administrations/organizations';

export const organizationsApi = {
  list: (params?: ListParams) => getRequest<OrganizationWithCount[]>(BASE, { params }),
  availableParents: (organizationId?: string) =>
    getRequest<Organization[]>(
      `${BASE}/available-parents${organizationId ? `?organizationId=${organizationId}` : ''}`
    ),
  get: (id: string) => getRequest<OrganizationWithCount>(`${BASE}/${id}`),
  create: (data: OrganizationInput) => postRequest<Organization>(BASE, data),
  update: (id: string, data: OrganizationInput) =>
    putRequest<Organization>(`${BASE}/${id}`, data),
  remove: (id: string) => deleteRequest<void>(`${BASE}/${id}`),
  addUsers: (id: string, data: AddUsersToOrganizationInput) =>
    postRequest<{ added: number }>(`${BASE}/${id}/add-users`, data),
};
