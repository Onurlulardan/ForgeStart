#!/usr/bin/env node
import 'dotenv/config';

import { spawn } from 'node:child_process';
import net from 'node:net';

if (process.env.FORGESTART_SKIP_PREDEV_MIGRATE === '1') {
  process.exit(0);
}

function probeTcp(host, port, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

function parseDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || '127.0.0.1',
      port: Number(parsed.port || 5432),
    };
  } catch {
    return null;
  }
}

const databaseUrl = process.env.DATABASE_URL;
const target = databaseUrl ? parseDatabaseUrl(databaseUrl) : null;

if (target) {
  const reachable = await probeTcp(target.host, target.port);
  if (!reachable) {
    console.warn(
      `[predev] Postgres at ${target.host}:${target.port} is not reachable. ` +
        'Skipping migration. Did you mean `yarn dev:docker` or `yarn setup`?'
    );
    process.exit(0);
  }
}

const child = spawn('yarn', ['db:migrate'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('error', (error) => {
  console.warn(`[predev] Migration skipped: ${error.message}`);
  process.exit(0);
});

child.on('exit', (code) => {
  if (code && code !== 0) {
    console.warn(`[predev] Migration exited with code ${code}; continuing dev startup.`);
  }
  process.exit(0);
});
