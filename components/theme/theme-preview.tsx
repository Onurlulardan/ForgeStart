'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ThemePreview() {
  const t = useTranslations('admin.theme.preview');

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button>{t('buttons.primary')}</Button>
          <Button variant="secondary">{t('buttons.secondary')}</Button>
          <Button variant="outline">{t('buttons.outline')}</Button>
          <Button variant="ghost">{t('buttons.ghost')}</Button>
          <Button variant="destructive">{t('buttons.destructive')}</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{t('badges.default')}</Badge>
          <Badge variant="secondary">{t('badges.secondary')}</Badge>
          <Badge variant="outline">{t('badges.outline')}</Badge>
          <Badge variant="destructive">{t('badges.destructive')}</Badge>
        </div>
        <Input placeholder={t('inputPlaceholder')} />
      </CardContent>
    </Card>
  );
}
