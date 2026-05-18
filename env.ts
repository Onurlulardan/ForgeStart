import { z } from 'zod';

const stringBool = z
  .union([z.literal('true'), z.literal('false'), z.literal('1'), z.literal('0'), z.literal('')])
  .transform((v) => v === 'true' || v === '1')
  .optional();

const serverSchema = z
  .object({
    AUTH_SECRET: z
      .string()
      .min(32, 'AUTH_SECRET must be at least 32 characters. Run `yarn setup` to generate one.'),
    AUTH_URL: z.string().url().default('http://localhost:3000'),
    DATABASE_URL: z
      .string()
      .regex(/^postgres(ql)?:\/\//, 'DATABASE_URL must be a postgres:// connection string'),
    SUPER_ADMIN_EMAIL: z.string().email(),
    SUPER_ADMIN_PASSWORD: z.string().min(8),

    AUTH_SESSION_MAX_AGE: z.coerce.number().int().positive().default(7 * 24 * 60 * 60),
    AUTH_SESSION_UPDATE_AGE: z.coerce.number().int().positive().default(60 * 60),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
    APP_TIMEZONE: z.string().default('Europe/Istanbul'),
    OTEL_SERVICE_NAME: z.string().default('forgestart'),
    GIT_COMMIT_SHA: z.string().default('local'),
    SUPER_ADMIN_FIRST_NAME: z.string().default('Super'),
    SUPER_ADMIN_LAST_NAME: z.string().default('Admin'),

    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    STORAGE_LOCAL_PATH: z.string().default('./public/uploads'),
    STORAGE_LOCAL_URL: z.string().default('/uploads'),
    STORAGE_MAX_FILE_SIZE: z.coerce.number().int().positive().default(10 * 1024 * 1024),
    STORAGE_S3_BUCKET: z.string().optional(),
    STORAGE_S3_REGION: z.string().default('us-east-1'),
    STORAGE_S3_ENDPOINT: z.string().optional(),
    STORAGE_S3_ACCESS_KEY: z.string().optional(),
    STORAGE_S3_SECRET_KEY: z.string().optional(),
    STORAGE_S3_PUBLIC_URL: z.string().optional(),

    EMAIL_PROVIDER: z.enum(['console', 'resend', 'smtp']).default('console'),
    EMAIL_FROM: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_SECURE: stringBool,

    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    REALTIME_PORT: z.coerce.number().int().positive().default(4000),
    REALTIME_URL: z.string().optional(),

    PLAYWRIGHT_BASE_URL: z.string().optional(),
    PLAYWRIGHT_USER_EMAIL: z.string().optional(),
    PLAYWRIGHT_USER_PASSWORD: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.STORAGE_DRIVER === 's3') {
      for (const key of ['STORAGE_S3_BUCKET', 'STORAGE_S3_ACCESS_KEY', 'STORAGE_S3_SECRET_KEY'] as const) {
        if (!data[key]) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} is required when STORAGE_DRIVER=s3`,
          });
        }
      }
    }
    if (data.EMAIL_PROVIDER === 'resend' && !data.RESEND_API_KEY) {
      ctx.addIssue({
        code: 'custom',
        path: ['RESEND_API_KEY'],
        message: 'RESEND_API_KEY is required when EMAIL_PROVIDER=resend',
      });
    }
    if (data.EMAIL_PROVIDER === 'smtp' && !data.SMTP_HOST) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_HOST'],
        message: 'SMTP_HOST is required when EMAIL_PROVIDER=smtp',
      });
    }
  });

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_REALTIME_URL: z.string().url().default('http://localhost:4000'),
});

const processEnv = {
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
  AUTH_SESSION_MAX_AGE: process.env.AUTH_SESSION_MAX_AGE,
  AUTH_SESSION_UPDATE_AGE: process.env.AUTH_SESSION_UPDATE_AGE,
  DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX,
  APP_TIMEZONE: process.env.APP_TIMEZONE,
  OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
  GIT_COMMIT_SHA: process.env.GIT_COMMIT_SHA,
  SUPER_ADMIN_FIRST_NAME: process.env.SUPER_ADMIN_FIRST_NAME,
  SUPER_ADMIN_LAST_NAME: process.env.SUPER_ADMIN_LAST_NAME,
  STORAGE_DRIVER: process.env.STORAGE_DRIVER,
  STORAGE_LOCAL_PATH: process.env.STORAGE_LOCAL_PATH,
  STORAGE_LOCAL_URL: process.env.STORAGE_LOCAL_URL,
  STORAGE_MAX_FILE_SIZE: process.env.STORAGE_MAX_FILE_SIZE,
  STORAGE_S3_BUCKET: process.env.STORAGE_S3_BUCKET,
  STORAGE_S3_REGION: process.env.STORAGE_S3_REGION,
  STORAGE_S3_ENDPOINT: process.env.STORAGE_S3_ENDPOINT,
  STORAGE_S3_ACCESS_KEY: process.env.STORAGE_S3_ACCESS_KEY,
  STORAGE_S3_SECRET_KEY: process.env.STORAGE_S3_SECRET_KEY,
  STORAGE_S3_PUBLIC_URL: process.env.STORAGE_S3_PUBLIC_URL,
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  EMAIL_FROM: process.env.EMAIL_FROM,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_SECURE: process.env.SMTP_SECURE,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  REALTIME_PORT: process.env.REALTIME_PORT,
  REALTIME_URL: process.env.REALTIME_URL,
  PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL,
  PLAYWRIGHT_USER_EMAIL: process.env.PLAYWRIGHT_USER_EMAIL,
  PLAYWRIGHT_USER_PASSWORD: process.env.PLAYWRIGHT_USER_PASSWORD,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_REALTIME_URL: process.env.NEXT_PUBLIC_REALTIME_URL,
};

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;
type Env = ServerEnv & ClientEnv;

const isServer = typeof window === 'undefined';
const skipValidation =
  process.env.SKIP_ENV_VALIDATION === '1' ||
  process.env.NEXT_PHASE === 'phase-production-build';

function formatErrors(error: z.ZodError): string {
  return Object.entries(error.flatten().fieldErrors)
    .map(([key, messages]) => `  - ${key}: ${(messages as string[]).join(', ')}`)
    .join('\n');
}

let parsedServer: ServerEnv;
let parsedClient: ClientEnv;

if (skipValidation) {
  parsedServer = processEnv as unknown as ServerEnv;
  parsedClient = processEnv as unknown as ClientEnv;
} else {
  const clientResult = clientSchema.safeParse(processEnv);
  if (!clientResult.success) {
    console.error('\n[env] Invalid client environment variables:');
    console.error(formatErrors(clientResult.error));
    throw new Error('Invalid environment variables (client)');
  }
  parsedClient = clientResult.data;

  if (isServer) {
    const serverResult = serverSchema.safeParse(processEnv);
    if (!serverResult.success) {
      console.error('\n[env] Invalid environment variables:');
      console.error(formatErrors(serverResult.error));
      console.error('\nFix your .env file. Run `yarn setup` to generate required secrets.\n');
      throw new Error('Invalid environment variables (server)');
    }
    parsedServer = serverResult.data;
  } else {
    parsedServer = {} as ServerEnv;
  }
}

export const env = new Proxy({} as Env, {
  get(_target, prop) {
    if (typeof prop !== 'string') return undefined;
    if (prop.startsWith('NEXT_PUBLIC_')) {
      return parsedClient[prop as keyof ClientEnv];
    }
    if (!isServer) {
      throw new Error(
        `[env] Cannot access server-only env "${prop}" from the client. Use a NEXT_PUBLIC_* variable instead.`
      );
    }
    return parsedServer[prop as keyof ServerEnv];
  },
}) as Env;

export type { Env };
