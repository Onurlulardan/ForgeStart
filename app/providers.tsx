'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useNotificationSetup } from '@/hooks/useNotificationSetup';
import { ConfirmDialogProvider } from '@/components/layout/confirm-dialog-host';
import { ErrorBoundary } from '@/components/feedback/error-boundary';
import { getQueryClient } from '@/lib/query/client';
import { ThemeCustomizerProvider } from '@/contexts/ThemeCustomizerContext';

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

function NotificationSetup({ children }: { children: ReactNode }) {
  useNotificationSetup();
  return <>{children}</>;
}

function ThemeBridge({ children }: { children: ReactNode }) {
  const { resolvedTheme, setTheme } = useNextTheme();
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ThemeCustomizerProvider>
        <TooltipProvider>
          <NotificationProvider>
            <ConfirmDialogProvider>
              <NotificationSetup>
                <ErrorBoundary>{children}</ErrorBoundary>
              </NotificationSetup>
            </ConfirmDialogProvider>
            <Toaster position="top-right" closeButton richColors />
          </NotificationProvider>
        </TooltipProvider>
      </ThemeCustomizerProvider>
    </ThemeContext.Provider>
  );
}

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeBridge>{children}</ThemeBridge>
          </NextThemesProvider>
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
          )}
        </QueryClientProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
