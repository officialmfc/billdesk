#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function extractFallback(filePath, envName) {
  const source = readFileSync(filePath, 'utf8');
  if (process.env[envName]) return process.env[envName];

  const escaped = envName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`process\\.env\\.${escaped}\\s*\\?\\?\\s*["']([^"']+)["']`),
    new RegExp(`const\\s+easProjectId\\s*=\\s*process\\.env\\.${escaped}\\s*;`),
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

const root = resolve(process.cwd());
const files = [
  ['EXPO_EAS_PROJECT_ID_MANAGER', resolve(root, 'apps/mobile/manager/app.config.ts')],
  ['EXPO_EAS_PROJECT_ID_ADMIN', resolve(root, 'apps/mobile/admin/app.config.ts')],
  ['EXPO_EAS_PROJECT_ID_USER', resolve(root, 'apps/mobile/user/app.config.ts')],
];

const values = Object.fromEntries(
  files.map(([envName, filePath]) => [envName, extractFallback(filePath, envName)])
);

const missing = Object.entries(values).filter(([, value]) => !value).map(([name]) => name);

if (missing.length > 0) {
  console.error(`Missing values for: ${missing.join(', ')}`);
  console.error(
    'The script will still print all 3 lines. Fill the blank value(s) after linking the corresponding EAS project(s).'
  );
}

for (const [name, value] of Object.entries(values)) {
  process.stdout.write(`${name}=${value ?? ''}\n`);
}
