#!/usr/bin/env node
import 'dotenv/config';

import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function run(command, args, options = {}) {
  const { allowFailure = false, env = process.env, stdio = 'inherit' } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio,
      shell: process.platform === 'win32',
    });

    child.on('error', (error) => {
      if (allowFailure) {
        resolve(1);
        return;
      }
      reject(error);
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        if (allowFailure) {
          resolve(1);
          return;
        }
        reject(new Error(`${command} ${args.join(' ')} exited with signal ${signal}`));
        return;
      }

      const exitCode = code ?? 0;
      if (exitCode !== 0 && !allowFailure) {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${exitCode}`));
        return;
      }
      resolve(exitCode);
    });
  });
}

function buildLocalEnv() {
  const postgresUser = process.env.POSTGRES_USER ?? 'forgestart';
  const postgresPassword = process.env.POSTGRES_PASSWORD ?? 'forgestart';
  const postgresDb = process.env.POSTGRES_DB ?? 'forgestart';
  const postgresPort = process.env.POSTGRES_PORT ?? '5432';

  return {
    ...process.env,
    FORGESTART_SKIP_PREDEV_MIGRATE: '1',
    DATABASE_URL:
      process.env.DATABASE_URL ??
      `postgres://${postgresUser}:${postgresPassword}@localhost:${postgresPort}/${postgresDb}`,
  };
}

async function waitForPostgres(env) {
  const timeoutSeconds = Number(env.DOCKER_DEV_POSTGRES_TIMEOUT_SECONDS ?? 60);
  const deadline = Date.now() + timeoutSeconds * 1000;
  const user = env.POSTGRES_USER ?? 'forgestart';
  const database = env.POSTGRES_DB ?? 'forgestart';

  process.stdout.write('Waiting for PostgreSQL');
  let waited = 0;
  while (Date.now() < deadline) {
    const code = await run(
      'docker',
      ['compose', 'exec', '-T', 'postgres', 'pg_isready', '-U', user, '-d', database],
      { allowFailure: true, env, stdio: 'ignore' }
    );

    if (code === 0) {
      process.stdout.write('\n');
      return;
    }

    process.stdout.write('.');
    waited += 1;
    if (waited > 0 && waited % 10 === 0) {
      process.stdout.write(` (${waited}/${timeoutSeconds}s)`);
    }
    await sleep(1000);
  }

  process.stdout.write('\n');
  throw new Error(`PostgreSQL did not become ready within ${timeoutSeconds}s`);
}

export async function runDockerDev(devArgs = []) {
  const env = buildLocalEnv();

  console.log('Starting PostgreSQL with Docker Compose...');
  await run('docker', ['compose', 'up', '-d', 'postgres'], { env });

  console.log('Stopping Compose app containers so local Next.js can own the dev port...');
  await run('docker', ['compose', 'stop', 'app', 'app-prod'], {
    allowFailure: true,
    env,
  });

  await waitForPostgres(env);

  console.log('Applying Drizzle migrations on the host...');
  await run('yarn', ['db:migrate'], { env });

  console.log('Seeding the local database...');
  await run('yarn', ['db:seed'], { env });

  console.log('Starting local Next.js + Realtime via yarn dev...');
  await run('yarn', ['dev', ...devArgs], { env });
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectRun) {
  runDockerDev(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
