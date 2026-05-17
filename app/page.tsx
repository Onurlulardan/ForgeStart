import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowRightIcon, DatabaseIcon, ShieldCheckIcon, TerminalIcon } from 'lucide-react';
import { BrandLogo } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { loadAppBranding } from '@/lib/branding/server';

export const dynamic = 'force-dynamic';

const featureItems = [
  { key: 'drizzleMigrations', icon: DatabaseIcon },
  { key: 'authSessions', icon: ShieldCheckIcon },
  { key: 'dockerWorkflow', icon: TerminalIcon },
];

export default async function Home() {
  const [t, branding] = await Promise.all([getTranslations('home'), loadAppBranding()]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--accent),transparent_34rem),var(--background)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center gap-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <BrandLogo logoUrl={branding.logoUrl} name={branding.name} className="size-11" />
              <span className="text-sm font-semibold text-muted-foreground">{branding.name}</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t('headline', { appName: branding.name })}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {t('description')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button render={<Link href="/dashboard" />} size="lg">
                {t('openDashboard')}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button render={<Link href="/auth/login" />} variant="outline" size="lg">
                {t('signIn')}
              </Button>
            </div>
          </div>

          <Card className="rounded-lg border bg-card/90 shadow-sm">
            <CardContent className="grid gap-3 p-4">
              {featureItems.map((feature) => {
                const Icon = feature.icon;
                const label = t(`features.${feature.key}`);
                return (
                  <div
                    key={feature.key}
                    className="flex items-center gap-3 rounded-lg border bg-background p-4"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
