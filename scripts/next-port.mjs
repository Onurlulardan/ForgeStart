import 'dotenv/config';

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const [command, ...rawArgs] = process.argv.slice(2);

if (!['dev', 'start'].includes(command)) {
  console.error('Usage: node scripts/next-port.mjs <dev|start> [...next args]');
  process.exit(1);
}

const hasPortArg = rawArgs.some(
  (arg, index) =>
    arg === '-p' ||
    arg === '--port' ||
    arg.startsWith('-p=') ||
    arg.startsWith('--port=') ||
    rawArgs[index - 1] === '-p' ||
    rawArgs[index - 1] === '--port'
);

const args = [command, ...rawArgs];

if (!hasPortArg) {
  args.push('--port', process.env.PORT ?? process.env.APP_PORT ?? '3000');
}

const nextBin = require.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
