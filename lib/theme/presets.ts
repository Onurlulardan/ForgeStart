import { cloneTheme, DEFAULT_THEME } from './defaults';
import type { ThemeTokens } from './tokens';

export interface ThemePreset {
  id: string;
  name: string;
  tokens: ThemeTokens;
}

function buildPreset(
  id: string,
  name: string,
  overrides: {
    light?: Partial<ThemeTokens['colors']['light']>;
    dark?: Partial<ThemeTokens['colors']['dark']>;
    radius?: string;
  }
): ThemePreset {
  const tokens = cloneTheme();
  Object.assign(tokens.colors.light, overrides.light ?? {});
  Object.assign(tokens.colors.dark, overrides.dark ?? {});
  if (overrides.radius) tokens.radius = overrides.radius;
  return { id, name, tokens };
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'default', name: 'Default', tokens: DEFAULT_THEME },
  buildPreset('slate', 'Slate', {
    light: {
      primary: 'oklch(0.32 0.04 250)',
      primaryForeground: 'oklch(0.98 0.005 250)',
      ring: 'oklch(0.5 0.06 250)',
      accent: 'oklch(0.93 0.02 250)',
      accentForeground: 'oklch(0.25 0.04 250)',
    },
    dark: {
      primary: 'oklch(0.78 0.05 250)',
      primaryForeground: 'oklch(0.15 0.02 250)',
      ring: 'oklch(0.78 0.05 250)',
      accent: 'oklch(0.28 0.03 250)',
      accentForeground: 'oklch(0.96 0.01 250)',
    },
  }),
  buildPreset('rose', 'Rose', {
    light: {
      primary: 'oklch(0.55 0.18 12)',
      primaryForeground: 'oklch(0.99 0.005 12)',
      ring: 'oklch(0.65 0.18 12)',
      accent: 'oklch(0.93 0.05 12)',
      accentForeground: 'oklch(0.3 0.12 12)',
    },
    dark: {
      primary: 'oklch(0.72 0.16 12)',
      primaryForeground: 'oklch(0.15 0.04 12)',
      ring: 'oklch(0.72 0.16 12)',
      accent: 'oklch(0.3 0.08 12)',
      accentForeground: 'oklch(0.92 0.05 12)',
    },
  }),
  buildPreset('emerald', 'Emerald', {
    light: {
      primary: 'oklch(0.45 0.14 165)',
      primaryForeground: 'oklch(0.99 0.005 165)',
      ring: 'oklch(0.6 0.14 165)',
      accent: 'oklch(0.92 0.05 165)',
      accentForeground: 'oklch(0.26 0.08 165)',
    },
    dark: {
      primary: 'oklch(0.72 0.13 165)',
      primaryForeground: 'oklch(0.15 0.04 165)',
      ring: 'oklch(0.72 0.13 165)',
      accent: 'oklch(0.3 0.08 165)',
      accentForeground: 'oklch(0.92 0.06 165)',
    },
  }),
  buildPreset('indigo', 'Indigo', {
    light: {
      primary: 'oklch(0.48 0.18 270)',
      primaryForeground: 'oklch(0.99 0.005 270)',
      ring: 'oklch(0.62 0.18 270)',
      accent: 'oklch(0.93 0.04 270)',
      accentForeground: 'oklch(0.28 0.1 270)',
    },
    dark: {
      primary: 'oklch(0.72 0.16 270)',
      primaryForeground: 'oklch(0.15 0.04 270)',
      ring: 'oklch(0.72 0.16 270)',
      accent: 'oklch(0.3 0.08 270)',
      accentForeground: 'oklch(0.92 0.05 270)',
    },
  }),
];
