import { NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/system/health';

function mask(value?: string | null): string | null {
  if (!value) return null;
  if (value.length <= 8) return 'set';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function flag(value: string | undefined | null): string | null {
  return value ? 'set' : null;
}

interface DoctorCheck {
  name: string;
  ok: boolean;
  required: boolean;
  group: 'core' | 'storage' | 'email' | 'rate-limit' | 'realtime' | 'app';
}

export async function GET() {
  let health: Awaited<ReturnType<typeof getHealthStatus>> | null = null;
  let databaseError: string | null = null;

  try {
    health = await getHealthStatus();
  } catch (error) {
    databaseError = error instanceof Error ? error.message : 'Database check failed';
  }

  const storageDriver = (process.env.STORAGE_DRIVER ?? 'local').toLowerCase();
  const emailProvider = (process.env.EMAIL_PROVIDER ?? 'console').toLowerCase();
  const hasUpstash = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );

  const checks: DoctorCheck[] = [
    // core
    { name: 'DATABASE_URL', ok: Boolean(process.env.DATABASE_URL), required: true, group: 'core' },
    { name: 'AUTH_URL', ok: Boolean(process.env.AUTH_URL), required: true, group: 'core' },
    {
      name: 'AUTH_SECRET',
      ok: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32),
      required: true,
      group: 'core',
    },
    {
      name: 'NEXT_PUBLIC_APP_URL',
      ok: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      required: true,
      group: 'core',
    },
    // app
    {
      name: 'APP_TIMEZONE',
      ok: Boolean(process.env.APP_TIMEZONE),
      required: false,
      group: 'app',
    },
    // storage
    { name: 'STORAGE_DRIVER', ok: Boolean(storageDriver), required: true, group: 'storage' },
    ...(storageDriver === 'local'
      ? [
          {
            name: 'STORAGE_LOCAL_PATH',
            ok: Boolean(process.env.STORAGE_LOCAL_PATH),
            required: false,
            group: 'storage' as const,
          },
          {
            name: 'STORAGE_LOCAL_URL',
            ok: Boolean(process.env.STORAGE_LOCAL_URL),
            required: false,
            group: 'storage' as const,
          },
        ]
      : [
          {
            name: 'STORAGE_S3_BUCKET',
            ok: Boolean(process.env.STORAGE_S3_BUCKET),
            required: true,
            group: 'storage' as const,
          },
          {
            name: 'STORAGE_S3_REGION',
            ok: Boolean(process.env.STORAGE_S3_REGION),
            required: true,
            group: 'storage' as const,
          },
          {
            name: 'STORAGE_S3_ACCESS_KEY',
            ok: Boolean(process.env.STORAGE_S3_ACCESS_KEY),
            required: true,
            group: 'storage' as const,
          },
          {
            name: 'STORAGE_S3_SECRET_KEY',
            ok: Boolean(process.env.STORAGE_S3_SECRET_KEY),
            required: true,
            group: 'storage' as const,
          },
        ]),
    // email
    { name: 'EMAIL_PROVIDER', ok: Boolean(emailProvider), required: true, group: 'email' },
    {
      name: 'EMAIL_FROM',
      ok: Boolean(process.env.EMAIL_FROM),
      required: emailProvider !== 'console',
      group: 'email',
    },
    ...(emailProvider === 'resend'
      ? [
          {
            name: 'RESEND_API_KEY',
            ok: Boolean(process.env.RESEND_API_KEY),
            required: true,
            group: 'email' as const,
          },
        ]
      : []),
    ...(emailProvider === 'smtp'
      ? [
          {
            name: 'SMTP_HOST',
            ok: Boolean(process.env.SMTP_HOST),
            required: true,
            group: 'email' as const,
          },
          {
            name: 'SMTP_PORT',
            ok: Boolean(process.env.SMTP_PORT),
            required: true,
            group: 'email' as const,
          },
          {
            name: 'SMTP_USER',
            ok: Boolean(process.env.SMTP_USER),
            required: false,
            group: 'email' as const,
          },
          {
            name: 'SMTP_PASSWORD',
            ok: Boolean(process.env.SMTP_PASSWORD),
            required: false,
            group: 'email' as const,
          },
        ]
      : []),
    // rate-limit
    {
      name: 'UPSTASH_REDIS_REST_URL',
      ok: hasUpstash,
      required: false,
      group: 'rate-limit',
    },
    {
      name: 'UPSTASH_REDIS_REST_TOKEN',
      ok: hasUpstash,
      required: false,
      group: 'rate-limit',
    },
    // realtime
    {
      name: 'REALTIME_URL',
      ok: Boolean(process.env.REALTIME_URL),
      required: false,
      group: 'realtime',
    },
    {
      name: 'NEXT_PUBLIC_REALTIME_URL',
      ok: Boolean(process.env.NEXT_PUBLIC_REALTIME_URL),
      required: false,
      group: 'realtime',
    },
  ];

  const requiredOk = checks.filter((c) => c.required).every((c) => c.ok);

  return NextResponse.json({
    ok: Boolean(health?.ok) && requiredOk,
    checkedAt: new Date().toISOString(),
    checks,
    environment: {
      DATABASE_URL: mask(process.env.DATABASE_URL),
      AUTH_URL: process.env.AUTH_URL ?? null,
      AUTH_SECRET: flag(process.env.AUTH_SECRET),
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? null,
      APP_PORT: process.env.APP_PORT ?? process.env.PORT ?? null,
      APP_TIMEZONE: process.env.APP_TIMEZONE ?? null,
      STORAGE_DRIVER: storageDriver,
      STORAGE_LOCAL_PATH: process.env.STORAGE_LOCAL_PATH ?? null,
      STORAGE_LOCAL_URL: process.env.STORAGE_LOCAL_URL ?? null,
      STORAGE_S3_BUCKET: process.env.STORAGE_S3_BUCKET ?? null,
      STORAGE_S3_REGION: process.env.STORAGE_S3_REGION ?? null,
      STORAGE_S3_ENDPOINT: process.env.STORAGE_S3_ENDPOINT ?? null,
      STORAGE_S3_ACCESS_KEY: flag(process.env.STORAGE_S3_ACCESS_KEY),
      STORAGE_S3_SECRET_KEY: flag(process.env.STORAGE_S3_SECRET_KEY),
      EMAIL_PROVIDER: emailProvider,
      EMAIL_FROM: process.env.EMAIL_FROM ?? null,
      RESEND_API_KEY: flag(process.env.RESEND_API_KEY),
      SMTP_HOST: process.env.SMTP_HOST ?? null,
      SMTP_PORT: process.env.SMTP_PORT ?? null,
      SMTP_USER: process.env.SMTP_USER ?? null,
      SMTP_PASSWORD: flag(process.env.SMTP_PASSWORD),
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? null,
      UPSTASH_REDIS_REST_TOKEN: flag(process.env.UPSTASH_REDIS_REST_TOKEN),
      REALTIME_URL: process.env.REALTIME_URL ?? null,
      NEXT_PUBLIC_REALTIME_URL: process.env.NEXT_PUBLIC_REALTIME_URL ?? null,
    },
    database: health?.database ?? { connected: false, error: databaseError },
  });
}
