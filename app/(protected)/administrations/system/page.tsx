'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  ActivityIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  RefreshCwIcon,
  SaveIcon,
  ServerCogIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/app/page-header';
import { getRequest, putRequest } from '@/lib/apiClient';
import type { AppSetting } from '@/db/types';

type HealthStatus = {
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
};

type DoctorStatus = {
  ok: boolean;
  checkedAt: string;
  checks: { name: string; ok: boolean }[];
  environment: Record<string, string | null>;
  database: unknown;
};

export default function SystemPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [doctor, setDoctor] = useState<DoctorStatus | null>(null);
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthData, doctorData, settingsData] = await Promise.all([
        getRequest<HealthStatus>('/health'),
        getRequest<DoctorStatus>('/setup/doctor'),
        getRequest<AppSetting[]>('/administrations/settings'),
      ]);
      setHealth(healthData);
      setDoctor(doctorData);
      setSettings(settingsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings((current) =>
      current.map((setting) => (setting.key === key ? { ...setting, value } : setting))
    );
  };

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await putRequest<AppSetting[]>('/administrations/settings', {
        settings: settings.map((setting) => ({ key: setting.key, value: setting.value })),
      });
      setSettings(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="System center"
        description="Check local readiness, runtime health, migration status and starter settings."
        actions={
          <Button variant="outline" onClick={() => loadData()}>
            <RefreshCwIcon data-icon="inline-start" />
            Refresh
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: 'Application',
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
                      {loading ? <Skeleton className="h-7 w-32" /> : item.value}
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
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                      {value ?? 'missing'}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Application settings</CardTitle>
              <CardDescription>
                Project defaults that commonly change after cloning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveSettings}>
                <FieldGroup>
                  {settings.map((setting) => (
                    <Field key={setting.key}>
                      <FieldLabel htmlFor={setting.key}>{setting.label}</FieldLabel>
                      <Input
                        id={setting.key}
                        value={setting.value}
                        onChange={(event) => updateSetting(setting.key, event.target.value)}
                        placeholder={setting.description ?? setting.key}
                      />
                    </Field>
                  ))}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      <SaveIcon data-icon="inline-start" />
                      {saving ? 'Saving...' : 'Save settings'}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
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
    </>
  );
}
