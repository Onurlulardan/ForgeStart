'use client';

import { useTranslations } from 'next-intl';
import { PageShell } from '@/components/layout';
import { ThemeCustomizerPanel } from '@/components/theme';

export default function ThemeCustomizerPage() {
  const t = useTranslations('admin.theme');
  return (
    <PageShell title={t('title')} description={t('description')}>
      <ThemeCustomizerPanel />
    </PageShell>
  );
}
