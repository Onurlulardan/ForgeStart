'use client';

import {
  ActivityIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  RefreshCwIcon,
  SaveIcon,
  ServerCogIcon,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageShell } from '@/components/layout';
import { Form, FormField, SubmitButton } from '@/components/forms';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppSettings, useAppSettingsMutation } from '@/lib/query';
import { getRequest } from '@/lib/apiClient';
import type { AppSettingItem, SettingsUpdateInput } from '@/lib/api/client';

const FormRichText = dynamic(
  () => import('@/components/forms/form-rich-text').then((mod) => mod.FormRichText),
  {
    ssr: false,
    loading: () => <Skeleton className="h-40 w-full" />,
  }
);

const RICH_TEXT_KEYS = new Set([
  'system.welcomeMessage',
  'system.legal.privacy',
  'system.legal.terms',
]);
const MULTILINE_HINTS = ['description', 'message', 'body', 'content'];

interface HealthStatus {
  ok: boolean;
  checkedAt: string;
  app: {
    name: string;
    version: string;
    node: string;
    environment: string;
    commit: string | null;
  };
  database: {
    connected: boolean;
    serverTime: string | null;
    migrations: {
      tableExists: boolean;
      appliedCount: number;
      latestMigration: string | null;
    };
  };
}

type DoctorGroup = 'core' | 'app' | 'storage' | 'email' | 'rate-limit' | 'realtime';

interface DoctorCheck {
  name: string;
  ok: boolean;
  required: boolean;
  group: DoctorGroup;
}

interface DoctorStatus {
  ok: boolean;
  checks: DoctorCheck[];
  environment: Record<string, string | null>;
}

const settingsFormSchema = z.object({
  values: z.record(z.string(), z.string()),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

function isMultilineKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return MULTILINE_HINTS.some((hint) => normalized.includes(hint));
}

function SettingsForm({ settings }: { settings: AppSettingItem[] }) {
  const t = useTranslations('admin.system');
  const tLabels = useTranslations('admin.system.settingsLabels');
  const mutation = useAppSettingsMutation();

  const labelFor = (setting: AppSettingItem): string => {
    const key = `${setting.key}.label` as never;
    try {
      return tLabels(key);
    } catch {
      return setting.label;
    }
  };

  const descriptionFor = (setting: AppSettingItem): string | undefined => {
    const key = `${setting.key}.description` as never;
    try {
      return tLabels(key);
    } catch {
      return setting.description ?? undefined;
    }
  };

  const defaultValues: SettingsFormValues = {
    values: Object.fromEntries(settings.map((setting) => [setting.key, setting.value])),
  };

  const submit = async (values: SettingsFormValues) => {
    const payload: SettingsUpdateInput = {
      settings: Object.entries(values.values).map(([key, value]) => ({ key, value })),
    };
    await mutation.mutateAsync(payload);
  };

  return (
    <Form<SettingsFormValues>
      schema={settingsFormSchema as unknown as z.ZodType<SettingsFormValues>}
      defaultValues={defaultValues as never}
      values={defaultValues as never}
      onSubmit={submit}
    >
      {settings.map((setting) => {
        const fieldName = `values.${setting.key}` as never;
        const label = labelFor(setting);
        const description = descriptionFor(setting);

        if (RICH_TEXT_KEYS.has(setting.key)) {
          return (
            <FormRichText
              key={setting.key}
              name={fieldName}
              label={label}
              description={description}
              placeholder={description ?? setting.key}
            />
          );
        }

        return (
          <FormField<SettingsFormValues>
            key={setting.key}
            name={fieldName}
            label={label}
            description={description}
          >
            {(field) => {
              const value = (field.value as string | undefined) ?? '';
              if (isMultilineKey(setting.key) && !setting.isSecret) {
                return (
                  <Textarea
                    id={field.name}
                    rows={4}
                    value={value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    placeholder={description ?? setting.key}
                  />
                );
              }
              return (
                <Input
                  id={field.name}
                  value={value}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  type={setting.isSecret ? 'password' : 'text'}
                  placeholder={description ?? setting.key}
                />
              );
            }}
          </FormField>
        );
      })}
      <div className="flex justify-end">
        <SubmitButton>
          <SaveIcon />
          {t('saveButton')}
        </SubmitButton>
      </div>
    </Form>
  );
}

function DoctorPanel({ doctor }: { doctor: DoctorStatus | undefined }) {
  const t = useTranslations('admin.system.doctor');
  const tCommon = useTranslations('common');

  const grouped = useMemo(() => {
    const out: Record<DoctorGroup, DoctorCheck[]> = {
      core: [],
      app: [],
      storage: [],
      email: [],
      'rate-limit': [],
      realtime: [],
    };
    (doctor?.checks ?? []).forEach((check) => {
      out[check.group].push(check);
    });
    return out;
  }, [doctor]);

  const groupOrder: DoctorGroup[] = ['core', 'app', 'storage', 'email', 'rate-limit', 'realtime'];

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {groupOrder.map((group) =>
          grouped[group].length > 0 ? (
            <div key={group} className="space-y-2">
              <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t(`groups.${group}`)}
              </h4>
              <div className="grid gap-2 lg:grid-cols-2">
                {grouped[group].map((check) => (
                  <div
                    key={check.name}
                    className="flex items-center justify-between rounded-lg border bg-background p-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{check.name}</span>
                      {!check.required && (
                        <span className="text-xs text-muted-foreground">{tCommon('settings')}</span>
                      )}
                    </div>
                    <Badge
                      variant={
                        check.ok ? 'secondary' : check.required ? 'destructive' : 'outline'
                      }
                    >
                      {check.ok ? t('statusOk') : check.required ? t('statusMissing') : t('statusOptional')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}

        {doctor && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t('groups.environment')}
            </h4>
            <div className="grid gap-2 lg:grid-cols-2">
              {Object.entries(doctor.environment).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border bg-background p-3"
                >
                  <span className="text-sm font-medium">{key}</span>
                  <span className="ml-4 max-w-64 truncate text-sm text-muted-foreground">
                    {value ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SystemPage() {
  const t = useTranslations('admin.system');
  const tCommon = useTranslations('common');
  const { data: settings, isLoading: loadingSettings } = useAppSettings();
  const {
    data: health,
    isLoading: loadingHealth,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => getRequest<HealthStatus>('/health'),
  });
  const { data: doctor } = useQuery({
    queryKey: ['system', 'doctor'],
    queryFn: () => getRequest<DoctorStatus>('/setup/doctor'),
  });

  return (
    <PageShell
      title={t('title')}
      description={t('description')}
      actions={
        <Button variant="outline" onClick={() => refetchHealth()}>
          <RefreshCwIcon />
          {tCommon('next')}
        </Button>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: t('cards.application'),
            value: health ? `${health.app.name} ${health.app.version}` : null,
            detail: health?.app.environment,
            icon: ServerCogIcon,
          },
          {
            label: t('cards.database'),
            value: health?.database.connected ? t('cards.connected') : t('cards.unavailable'),
            detail: health?.database.serverTime ?? t('cards.noServerTime'),
            icon: DatabaseIcon,
          },
          {
            label: t('cards.migrations'),
            value: health ? t('cards.migrationsApplied', { count: health.database.migrations.appliedCount }) : null,
            detail: health?.database.migrations.tableExists
              ? t('cards.drizzleTableExists')
              : t('cards.noMigrationTable'),
            icon: ActivityIcon,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="rounded-lg">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="mt-2">
                      {loadingHealth ? <Skeleton className="h-7 w-32" /> : item.value}
                    </CardTitle>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="truncate text-sm text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Tabs defaultValue="doctor">
        <TabsList>
          <TabsTrigger value="doctor">{t('tabs.doctor')}</TabsTrigger>
          <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
          <TabsTrigger value="runtime">{t('tabs.runtime')}</TabsTrigger>
        </TabsList>

        <TabsContent value="doctor" className="mt-4">
          <DoctorPanel doctor={doctor} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>{t('tabs.settings')}</CardTitle>
              <CardDescription>{t('settingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSettings ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <SettingsForm settings={settings ?? []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runtime" className="mt-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>{t('tabs.runtime')}</CardTitle>
              <CardDescription>{t('runtimeDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {health &&
                [
                  [t('runtime.node'), health.app.node],
                  [t('runtime.commit'), health.app.commit ?? t('runtime.local')],
                  [t('runtime.checkedAt'), health.checkedAt],
                  [
                    t('runtime.latestMigration'),
                    health.database.migrations.latestMigration ?? t('runtime.none'),
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2Icon />
                      {label}
                    </div>
                    <p className="mt-2 truncate text-sm text-muted-foreground">{value}</p>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
