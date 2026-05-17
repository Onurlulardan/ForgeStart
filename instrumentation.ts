export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const serviceName =
    process.env.OTEL_SERVICE_NAME ?? process.env.npm_package_name ?? 'forgestart';
  const environment = process.env.NODE_ENV ?? 'development';

  console.info(
    JSON.stringify({
      level: 'info',
      event: 'runtime.register',
      service: serviceName,
      environment,
      timestamp: new Date().toISOString(),
    })
  );
}
