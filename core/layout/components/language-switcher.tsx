'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { LanguagesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type AppLocale } from '@/i18n/routing';

const labels: Record<AppLocale, string> = {
  tr: 'Türkçe',
  en: 'English',
};

export function LanguageSwitcher() {
  const t = useTranslations('userMenu');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: AppLocale) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
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
        <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
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
