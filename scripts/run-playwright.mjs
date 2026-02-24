#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const runner = path.join(ROOT, 'node_modules', '.bin', 'playwright');

if (!existsSync(runner)) {
  console.error('Playwright is not installed locally. Install with: npm i -D @playwright/test && npx playwright install');
  process.exit(1);
}

const rawArgs = process.argv.slice(2);
const passthrough = rawArgs[0] === '--card' ? rawArgs.slice(1) : rawArgs;

const args = ['test', ...passthrough];

const result = spawnSync(runner, args, {
  cwd: ROOT,
  stdio: 'inherit'
});

process.exit(result.status ?? 1);
