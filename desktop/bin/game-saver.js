#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run electron with the app
const electronPath = join(__dirname, '..', 'node_modules', '.bin', 'electron');
const appPath = join(__dirname, '..');

const child = spawn(electronPath, [appPath], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  process.exit(code);
});
