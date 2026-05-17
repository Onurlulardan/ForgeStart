import { z } from 'zod';
import { deleteRequest, getRequest, postRequest } from '@/lib/apiClient';
import { invitationCreateSchema } from '@/lib/validation/admin';
import type { Invitation, InvitationWithRelations, ListParams } from './types';

export type InvitationCreateInput = z.input<typeof invitationCreateSchema>;
export type InvitationCreateResponse = Invitation & { acceptUrl: string };

const BASE = '/administrations/invitations';

export const invitationsApi = {
  list: (params?: ListParams) => getRequest<InvitationWithRelations[]>(BASE, { params }),
  create: (data: InvitationCreateInput) => postRequest<InvitationCreateResponse>(BASE, data),
  revoke: (id: string) => deleteRequest<void>(`${BASE}/${id}`),
};
