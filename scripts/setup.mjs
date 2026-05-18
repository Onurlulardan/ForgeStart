#!/usr/bin/env node
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const envPath = resolve(projectRoot, '.env');
const examplePath = resolve(projectRoot, '.env.example');

const force = process.argv.includes('--force');

if (!existsSync(examplePath)) {
  console.error('[setup] .env.example not found at', examplePath);
  process.exit(1);
}

if (existsSync(envPath) && !force) {
  console.log('[setup] .env already exists. Pass --force to regenerate.');
  console.log('[setup] Tip: run `yarn doctor` to verify your configuration.');
  process.exit(0);
}

copyFileSync(examplePath, envPath);

const authSecret = randomBytes(48).toString('base64url');
const adminPassword = randomBytes(12).toString('base64url').slice(0, 16);

let contents = readFileSync(envPath, 'utf8');

contents = contents.replace(
  /^AUTH_SECRET=.*/m,
  `AUTH_SECRET=${authSecret}`
);
contents = contents.replace(
  /^SUPER_ADMIN_PASSWORD=.*/m,
  `SUPER_ADMIN_PASSWORD=${adminPassword}`
);

writeFileSync(envPath, contents, 'utf8');

const banner = '='.repeat(60);
console.log(banner);
console.log('  ForgeStart setup complete');
console.log(banner);
console.log('');
console.log('  .env created at:', envPath);
console.log('');
console.log('  Generated AUTH_SECRET (server-only, do not share).');
console.log('  Generated super admin credentials:');
console.log('');
console.log(`    Email:    superadmin@example.com`);
console.log(`    Password: ${adminPassword}`);
console.log('');
console.log('  Save the password now — it is only shown here.');
console.log('  You can change SUPER_ADMIN_EMAIL/PASSWORD in .env before first run.');
console.log('');
console.log('  Next steps:');
console.log('    1. yarn doctor          # verify environment + DB');
console.log('    2. yarn dev:docker      # Postgres in Docker + local Next.js');
console.log('       or');
console.log('       yarn dev             # if you already run Postgres locally');
console.log('');
console.log(banner);
