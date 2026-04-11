#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const command = isVercel
  ? ['pnpm', ['build:web:manager']]
  : ['turbo', ['run', 'build']];

const result = spawnSync(command[0], command[1], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
