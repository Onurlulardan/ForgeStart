import 'server-only';

import { inArray } from 'drizzle-orm';
import { appSettings } from '@/db/schema';
import {
  APP_BRAND_SETTING_KEYS,
  type AppBranding,
  resolveAppBranding,
} from './constants';

const BRAND_SETTING_KEYS = Object.values(APP_BRAND_SETTING_KEYS);

export async function loadAppBranding(): Promise<AppBranding> {
  try {
    const { db } = await import('@/db');
    const rows = await db
      .select({
        key: appSettings.key,
        value: appSettings.value,
      })
      .from(appSettings)
      .where(inArray(appSettings.key, BRAND_SETTING_KEYS));

    return resolveAppBranding(rows);
  } catch {
    return resolveAppBranding();
  }
}
