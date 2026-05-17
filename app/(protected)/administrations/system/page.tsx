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

const RICH_TEXT_KEYS = new Set(['system.welcomeMessage', 'system.legal.privacy', 'system.legal.terms']);
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

interface DoctorStatus {
  ok: boolean;
  checks: { name: string; ok: boolean }[];
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
  const mutation = useAppSettingsMutation();

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

        if (RICH_TEXT_KEYS.has(setting.key)) {
          return (
            <FormRichText
              key={setting.key}
              name={fieldName}
              label={setting.label}
              description={setting.description ?? undefined}
              placeholder={setting.description ?? setting.key}
            />
          );
        }

        return (
          <FormField<SettingsFormValues>
            key={setting.key}
            name={fieldName}
            label={setting.label}
            description={setting.description ?? undefined}
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
                    placeholder={setting.description ?? setting.key}
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
                  placeholder={setting.description ?? setting.key}
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
            label: tCommon('settings'),
            value: health ? `${health.app.name} ${health.app.version}` : null,
            detail: health?.app.environment,
            icon: ServerCogIcon,
          },
          {
            label: 'Database',
            value: health?.database.connected ? 'Connected' : 'Unavailable',
            detail: health?.database.serverTime ?? 'No server time',
            icon: DatabaseIcon,
          },
          {
            label: 'Migrations',
            value: health ? `${health.database.migrations.appliedCount} applied` : null,
            detail: health?.database.migrations.tableExists
              ? 'Drizzle table exists'
              : 'No migration table',
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
          <TabsTrigger value="doctor">Doctor</TabsTrigger>
          <TabsTrigger value="settings">{tCommon('settings')}</TabsTrigger>
          <TabsTrigger value="runtime">Runtime</TabsTrigger>
        </TabsList>

        <TabsContent value="doctor" className="mt-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Setup doctor</CardTitle>
              <CardDescription>
                Local project prerequisites and environment readiness.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              {(doctor?.checks ?? []).map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between rounded-lg border bg-background p-3"
                >
                  <span className="text-sm font-medium">{file.name}</span>
                  <Badge variant={file.ok ? 'secondary' : 'destructive'}>
                    {file.ok ? 'OK' : 'Missing'}
                  </Badge>
                </div>
              ))}
              {doctor &&
                Object.entries(doctor.environment).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border bg-background p-3"
                  >
                    <span className="text-sm font-medium">{key}</span>
                    <span className="max-w-64 truncate text-sm text-muted-foreground">
                      {value ?? '—'}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>{tCommon('settings')}</CardTitle>
              <CardDescription>
                Project defaults that commonly change after cloning.
              </CardDescription>
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
              <CardTitle>Runtime</CardTitle>
              <CardDescription>Live app and database metadata.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {health &&
                [
                  ['Node', health.app.node],
                  ['Commit', health.app.commit ?? 'local'],
                  ['Checked at', health.checkedAt],
                  ['Latest migration hash', health.database.migrations.latestMigration ?? 'none'],
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
