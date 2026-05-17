#!/usr/bin/env node
import { runDockerDev } from './docker-dev.mjs';

const [command, ...args] = process.argv.slice(2);

if (command === 'dev') {
  runDockerDev(args).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
} else {
  console.error('Usage: yarn docker dev [...next-dev-args]');
  process.exit(1);
}
