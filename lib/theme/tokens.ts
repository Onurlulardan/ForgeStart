export type ThemeMode = 'light' | 'dark';

export const COLOR_TOKEN_KEYS = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'popover',
  'popoverForeground',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'muted',
  'mutedForeground',
  'accent',
  'accentForeground',
  'destructive',
  'border',
  'input',
  'ring',
  'sidebar',
  'sidebarForeground',
  'sidebarPrimary',
  'sidebarPrimaryForeground',
  'sidebarAccent',
  'sidebarAccentForeground',
  'sidebarBorder',
  'sidebarRing',
] as const;

export type ColorTokenKey = (typeof COLOR_TOKEN_KEYS)[number];

const KEY_TO_CSS: Record<ColorTokenKey, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  border: '--border',
  input: '--input',
  ring: '--ring',
  sidebar: '--sidebar',
  sidebarForeground: '--sidebar-foreground',
  sidebarPrimary: '--sidebar-primary',
  sidebarPrimaryForeground: '--sidebar-primary-foreground',
  sidebarAccent: '--sidebar-accent',
  sidebarAccentForeground: '--sidebar-accent-foreground',
  sidebarBorder: '--sidebar-border',
  sidebarRing: '--sidebar-ring',
};

export function cssVarName(key: ColorTokenKey): string {
  return KEY_TO_CSS[key];
}

export type ColorTokens = Record<ColorTokenKey, string>;

export interface ThemeTokens {
  colors: {
    light: ColorTokens;
    dark: ColorTokens;
  };
  radius: string;
  fontFamily: string;
}

export const TOKEN_GROUPS: Array<{ label: string; keys: ColorTokenKey[] }> = [
  {
    label: 'Surface',
    keys: ['background', 'foreground', 'card', 'cardForeground', 'popover', 'popoverForeground'],
  },
  {
    label: 'Primary',
    keys: ['primary', 'primaryForeground', 'ring'],
  },
  {
    label: 'Secondary & Accent',
    keys: [
      'secondary',
      'secondaryForeground',
      'accent',
      'accentForeground',
      'muted',
      'mutedForeground',
    ],
  },
  {
    label: 'Status',
    keys: ['destructive', 'border', 'input'],
  },
  {
    label: 'Sidebar',
    keys: [
      'sidebar',
      'sidebarForeground',
      'sidebarPrimary',
      'sidebarPrimaryForeground',
      'sidebarAccent',
      'sidebarAccentForeground',
      'sidebarBorder',
      'sidebarRing',
    ],
  },
];
