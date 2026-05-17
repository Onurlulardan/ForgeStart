import { getTranslations } from 'next-intl/server';
import RegisterForm from './register-form';
import { BrandLogo } from '@/components/brand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loadAppBranding } from '@/lib/branding/server';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const [t, branding] = await Promise.all([getTranslations('auth'), loadAppBranding()]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_bottom_left,var(--accent),transparent_32rem),var(--background)] px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border bg-card shadow-sm md:grid-cols-[1fr_460px]">
        <section className="hidden border-r bg-sidebar p-10 text-sidebar-foreground md:flex md:flex-col md:justify-between">
          <div>
            <BrandLogo logoUrl={branding.logoUrl} name={branding.name} className="size-10" />
            <h1 className="mt-8 text-3xl font-semibold tracking-tight">
              {t('registerHeroTitle')}
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-sidebar-foreground/70">
              {t('registerHeroDescription', { appName: branding.name })}
            </p>
          </div>
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-4 text-sm">
            {t('registerHeroCallout')}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <Card className="w-full max-w-sm border-0 bg-transparent shadow-none ring-0">
            <CardHeader className="px-1">
              <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
              <CardDescription>
                {t('registerWorkspaceDescription', { appName: branding.name })}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-1">
              <RegisterForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
