export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { env } = await import('./env');
  const environment = process.env.NODE_ENV ?? 'development';

  console.info(
    JSON.stringify({
      level: 'info',
      event: 'runtime.register',
      service: env.OTEL_SERVICE_NAME,
      environment,
      timestamp: new Date().toISOString(),
    })
  );
}
