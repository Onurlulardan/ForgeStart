import 'dotenv/config';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const serverEntry = path.join(projectRoot, 'server', 'index.ts');

const tsxBin =
  process.platform === 'win32'
    ? path.join(projectRoot, 'node_modules', '.bin', 'tsx.cmd')
    : path.join(projectRoot, 'node_modules', '.bin', 'tsx');

const child = spawn(tsxBin, ['watch', serverEntry], {
  stdio: 'inherit',
  cwd: projectRoot,
});

child.on('exit', (code) => process.exit(code ?? 0));
