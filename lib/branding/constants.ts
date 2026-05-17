export const DEFAULT_APP_NAME = 'ForgeStart';
export const DEFAULT_APP_LOGO_URL = '/brand/forgestart-mark.svg';

export const APP_BRAND_SETTING_KEYS = {
  name: 'app.name',
  logoUrl: 'app.logo_url',
} as const;

export interface AppBranding {
  name: string;
  logoUrl: string;
}

export interface AppBrandSetting {
  key: string;
  value: string | null;
}

export function resolveAppBranding(settings?: AppBrandSetting[] | null): AppBranding {
  const values = new Map((settings ?? []).map((setting) => [setting.key, setting.value ?? '']));
  const name = values.get(APP_BRAND_SETTING_KEYS.name)?.trim() || DEFAULT_APP_NAME;
  const logoUrl = values.get(APP_BRAND_SETTING_KEYS.logoUrl)?.trim() || DEFAULT_APP_LOGO_URL;

  return { name, logoUrl };
}
