'use client';

import {
  ArrowRightIcon,
  Building2Icon,
  DatabaseIcon,
  GitCommitIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout';
import { Link } from '@/i18n/navigation';
import { useDashboardStats, useHealthStatus } from '@/lib/query';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const { data: session } = useSession();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: health } = useHealthStatus();

  const name = [session?.user?.firstName, session?.user?.lastName].filter(Boolean).join(' ');

  const statMeta = [
    {
      key: 'totalOrganizations',
      label: t('totalOrganizations'),
      icon: Building2Icon,
      value: stats?.totalOrganizations ?? 0,
    },
    {
      key: 'totalUsers',
      label: t('totalUsers'),
      icon: UsersIcon,
      value: stats?.totalUsers ?? 0,
    },
    {
      key: 'activeUsers',
      label: t('activeUsers'),
      icon: ShieldCheckIcon,
      value: stats?.activeUsers ?? 0,
    },
  ];

  return (
    <PageShell
      title={`${t('title')}${name ? `, ${name}` : ''}`}
      description={t('description')}
      actions={
        <Button render={<Link href="/administrations" />}>
          {tNav('administration')}
          <ArrowRightIcon />
        </Button>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        {statMeta.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className="rounded-lg">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="mt-2 text-3xl">
                      {isLoading ? <Skeleton className="h-8 w-16" /> : item.value}
                    </CardTitle>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>{t('runtimeHealth')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            {
              label: t('database'),
              value: health?.database.connected ? t('healthy') : t('unhealthy'),
              icon: DatabaseIcon,
            },
            {
              label: t('migrations'),
              value: `${health?.database.migrations.appliedCount ?? 0}`,
              icon: ShieldCheckIcon,
            },
            {
              label: t('appVersion'),
              value: health?.app.version ?? '-',
              icon: GitCommitIcon,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border bg-background p-4 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Icon />
                  {item.label}
                </div>
                <p className="mt-2 truncate text-muted-foreground">{item.value}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </PageShell>
  );
}
