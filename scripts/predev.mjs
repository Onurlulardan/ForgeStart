#!/usr/bin/env node
import 'dotenv/config';

import { spawn } from 'node:child_process';

if (process.env.FORGESTART_SKIP_PREDEV_MIGRATE === '1') {
  process.exit(0);
}

const child = spawn('yarn', ['db:migrate'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('error', (error) => {
  console.warn(`Predev migration skipped: ${error.message}`);
  process.exit(0);
});

child.on('exit', (code) => {
  if (code && code !== 0) {
    console.warn(`Predev migration exited with code ${code}; continuing dev startup.`);
  }
  process.exit(0);
});
