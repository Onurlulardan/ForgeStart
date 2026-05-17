import { z } from 'zod';
import { getRequest, putRequest } from '@/lib/apiClient';
import { settingUpdateSchema } from '@/lib/validation/admin';
import type { AppSettingItem } from './types';

export type SettingsUpdateInput = z.input<typeof settingUpdateSchema>;

const BASE = '/administrations/settings';

export const appSettingsApi = {
  list: () => getRequest<AppSettingItem[]>(BASE),
  update: (data: SettingsUpdateInput) => putRequest<AppSettingItem[]>(BASE, data),
};
