'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import {
  applyTheme,
  cloneTheme,
  DEFAULT_THEME,
  type ColorTokenKey,
  type ThemeMode,
  type ThemeTokens,
} from '@/lib/theme';

const STORAGE_KEY = 'app.theme.tokens.v1';

interface ThemeCustomizerContextValue {
  tokens: ThemeTokens;
  mode: ThemeMode;
  setColorToken: (mode: ThemeMode, key: ColorTokenKey, value: string) => void;
  setRadius: (value: string) => void;
  setFontFamily: (value: string) => void;
  applyTokens: (next: ThemeTokens) => void;
  reset: () => void;
  exportJson: () => string;
  importJson: (json: string) => void;
}

const ThemeCustomizerContext = createContext<ThemeCustomizerContextValue | null>(null);

function readPersisted(): ThemeTokens | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ThemeTokens;
  } catch {
    return null;
  }
}

function persist(tokens: ThemeTokens) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export interface ThemeCustomizerProviderProps {
  initialTokens?: ThemeTokens;
  children: ReactNode;
}

export function ThemeCustomizerProvider({
  initialTokens,
  children,
}: ThemeCustomizerProviderProps) {
  const { resolvedTheme } = useNextTheme();
  const mode: ThemeMode = resolvedTheme === 'dark' ? 'dark' : 'light';
  const [tokens, setTokens] = useState<ThemeTokens>(() => initialTokens ?? cloneTheme());

  useEffect(() => {
    const persisted = readPersisted();
    if (persisted) setTokens(persisted);
  }, []);

  useEffect(() => {
    applyTheme(tokens, mode);
  }, [tokens, mode]);

  const updateAndPersist = useCallback((next: ThemeTokens) => {
    setTokens(next);
    persist(next);
  }, []);

  const setColorToken = useCallback(
    (target: ThemeMode, key: ColorTokenKey, value: string) => {
      updateAndPersist({
        ...tokens,
        colors: {
          ...tokens.colors,
          [target]: { ...tokens.colors[target], [key]: value },
        },
      });
    },
    [tokens, updateAndPersist]
  );

  const setRadius = useCallback(
    (value: string) => updateAndPersist({ ...tokens, radius: value }),
    [tokens, updateAndPersist]
  );

  const setFontFamily = useCallback(
    (value: string) => updateAndPersist({ ...tokens, fontFamily: value }),
    [tokens, updateAndPersist]
  );

  const applyTokens = useCallback(
    (next: ThemeTokens) => updateAndPersist(next),
    [updateAndPersist]
  );

  const reset = useCallback(() => {
    updateAndPersist(DEFAULT_THEME);
  }, [updateAndPersist]);

  const exportJson = useCallback(() => JSON.stringify(tokens, null, 2), [tokens]);

  const importJson = useCallback(
    (json: string) => {
      try {
        const parsed = JSON.parse(json) as ThemeTokens;
        updateAndPersist(parsed);
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Invalid JSON');
      }
    },
    [updateAndPersist]
  );

  const value = useMemo<ThemeCustomizerContextValue>(
    () => ({
      tokens,
      mode,
      setColorToken,
      setRadius,
      setFontFamily,
      applyTokens,
      reset,
      exportJson,
      importJson,
    }),
    [
      tokens,
      mode,
      setColorToken,
      setRadius,
      setFontFamily,
      applyTokens,
      reset,
      exportJson,
      importJson,
    ]
  );

  return (
    <ThemeCustomizerContext.Provider value={value}>{children}</ThemeCustomizerContext.Provider>
  );
}

export function useThemeCustomizer(): ThemeCustomizerContextValue {
  const context = useContext(ThemeCustomizerContext);
  if (!context) {
    throw new Error('useThemeCustomizer must be used within ThemeCustomizerProvider');
  }
  return context;
}
