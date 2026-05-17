'use client';

import { createContext, useContext } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useNotificationSetup } from '@/hooks/useNotificationSetup';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function NotificationSetup({ children }: { children: React.ReactNode }) {
  useNotificationSetup();
  return <>{children}</>;
}

function ThemeBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useNextTheme();
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <TooltipProvider>
        <NotificationProvider>
          <NotificationSetup>{children}</NotificationSetup>
          <Toaster position="top-right" closeButton richColors />
        </NotificationProvider>
      </TooltipProvider>
    </ThemeContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeBridge>{children}</ThemeBridge>
      </NextThemesProvider>
    </SessionProvider>
  );
}
