import { cssVarName, type ColorTokenKey, type ThemeMode, type ThemeTokens } from './tokens';

export function applyTheme(tokens: ThemeTokens, mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const palette = tokens.colors[mode];
  for (const key of Object.keys(palette) as ColorTokenKey[]) {
    root.style.setProperty(cssVarName(key), palette[key]);
  }
  root.style.setProperty('--radius', tokens.radius);
  document.body?.style.setProperty('font-family', tokens.fontFamily);
}

export function clearTheme(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const key of Object.values(getCssKeyMap())) {
    root.style.removeProperty(key);
  }
  root.style.removeProperty('--radius');
  document.body?.style.removeProperty('font-family');
}

function getCssKeyMap(): Record<ColorTokenKey, string> {
  return {
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
}
