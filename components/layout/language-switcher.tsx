'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LanguagesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { routing, type AppLocale } from '@/i18n/routing';

const labels: Record<AppLocale, string> = {
  tr: 'Türkçe',
  en: 'English',
};

const COOKIE_NAME =
  typeof routing.localeCookie === 'object' && routing.localeCookie && 'name' in routing.localeCookie
    ? ((routing.localeCookie as { name?: string }).name ?? 'NEXT_LOCALE')
    : 'NEXT_LOCALE';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function LanguageSwitcher() {
  const t = useTranslations('userMenu');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: AppLocale) => {
    if (next === locale) return;
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={t('language')} />}
      >
        <LanguagesIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
          {t('language')}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {routing.locales.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={option === locale}
              disabled={isPending}
              onCheckedChange={(checked) => {
                if (checked) switchTo(option);
              }}
            >
              {labels[option]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
