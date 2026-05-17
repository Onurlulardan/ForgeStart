import { z } from 'zod';
import { postRequest } from '@/lib/apiClient';
import {
  inviteAcceptSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  registerSchema,
} from '@/lib/validation/admin';

export type RegisterInput = z.input<typeof registerSchema>;
export type InviteAcceptInput = z.input<typeof inviteAcceptSchema>;
export type PasswordResetRequestInput = z.input<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.input<typeof passwordResetConfirmSchema>;

export const authApi = {
  register: (data: RegisterInput) => postRequest<{ id: string }>('/auth/register', data),
  acceptInvite: (data: InviteAcceptInput) =>
    postRequest<{ id: string }>('/auth/accept-invite', data),
  passwordResetRequest: (data: PasswordResetRequestInput) =>
    postRequest<{ ok: true }>('/auth/password-reset', data),
  passwordResetConfirm: (data: PasswordResetConfirmInput) =>
    postRequest<{ ok: true }>('/auth/password-reset/confirm', data),
};
