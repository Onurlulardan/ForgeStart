import { z } from 'zod';
import { getRequest, putRequest } from '@/lib/apiClient';
import { profileUpdateSchema } from '@/lib/validation/admin';
import type { UserWithoutPassword } from './types';

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;

const BASE = '/administrations/profile';

export const profileApi = {
  get: () => getRequest<UserWithoutPassword>(BASE),
  update: (data: ProfileUpdateInput) => putRequest<UserWithoutPassword>(BASE, data),
};
