import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_PROJECT_ID = "59ff9ba9-1d2c-47a8-b76c-f06dbd33de8b";
const DEFAULT_ENV_SLUG = "prod";
const ROOT_DIR = process.cwd();

const authCoreKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_AUTH_BASE_URL",
  "NEXT_PUBLIC_MANAGER_WEB_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SEND_EMAIL_HOOK_SECRET",
  "ZEPTOMAIL_API_KEY",
  "ZEPTOMAIL_FROM_EMAIL",
  "ZEPTOMAIL_FROM_NAME",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "NEXT_PUBLIC_SENTRY_DSN",
  "TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "ZEPTOMAIL_API_URL",
  "SENTRY_DSN",
];

const authPolicyKeys = [
  "SUPABASE_SEND_EMAIL_HOOK_SECRET",
  "ZEPTOMAIL_API_KEY",
  "ZEPTOMAIL_FROM_EMAIL",
  "ZEPTOMAIL_FROM_NAME",
  "ZEPTOMAIL_API_URL",
  "SENTRY_DSN",
];

const authUiKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_AUTH_BASE_URL",
  "NEXT_PUBLIC_MANAGER_WEB_URL",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_DSN",
];

function getProjectId() {
  return process.env.INFISICAL_PROJECT_ID || DEFAULT_PROJECT_ID;
}

function getEnvironmentSlug() {
  return process.env.INFISICAL_ENV_SLUG || DEFAULT_ENV_SLUG;
}

async function exportInfisicalSecrets() {
  const { stdout } = await execFileAsync(
    "infisical",
    [
      "export",
      "--projectId",
      getProjectId(),
      "--env",
      getEnvironmentSlug(),
      "--format=json",
      "--silent",
    ],
    {
      cwd: ROOT_DIR,
      maxBuffer: 8 * 1024 * 1024,
    }
  );

  const payload = JSON.parse(stdout);
  if (!Array.isArray(payload)) {
    throw new Error("Infisical export did not return an array.");
  }

  return payload;
}

function buildMap(entries, keys) {
  const exportMap = new Map(
    entries
      .filter((entry) => entry && typeof entry.key === "string")
      .map((entry) => [entry.key, typeof entry.value === "string" ? entry.value.trim() : ""])
  );

  return Object.fromEntries(
    keys
      .map((key) => [key, exportMap.get(key) || ""])
      .filter((entry) => typeof entry[1] === "string" && entry[1].length > 0)
  );
}

async function writeTempJson(filename, payload) {
  const tempFile = path.join(os.tmpdir(), `${filename}-${Date.now()}.json`);
  await fs.writeFile(tempFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return tempFile;
}

async function main() {
  const exported = await exportInfisicalSecrets();

  const authCoreSecrets = buildMap(exported, authCoreKeys);
  const authPolicySecrets = buildMap(exported, authPolicyKeys);
  const authUiSecrets = buildMap(exported, authUiKeys);

  const tempFiles = [];

  try {
    const coreFile = await writeTempJson("auth-core-secrets", authCoreSecrets);
    tempFiles.push(coreFile);
    await execFileAsync(
      "pnpm",
      ["--dir", "apps/auth", "exec", "wrangler", "secret", "bulk", coreFile, "--config", "wrangler.jsonc"],
      {
        cwd: ROOT_DIR,
        maxBuffer: 8 * 1024 * 1024,
      }
    );

    const policyFile = await writeTempJson("auth-policy-secrets", authPolicySecrets);
    tempFiles.push(policyFile);
    await execFileAsync(
      "pnpm",
      ["--dir", "apps/auth-policy", "exec", "wrangler", "secret", "bulk", policyFile, "--config", "wrangler.jsonc"],
      {
        cwd: ROOT_DIR,
        maxBuffer: 8 * 1024 * 1024,
      }
    );

    const uiFile = await writeTempJson("auth-ui-secrets", authUiSecrets);
    tempFiles.push(uiFile);
    await execFileAsync(
      "pnpm",
      ["--dir", "apps/auth-ui", "exec", "wrangler", "pages", "secret", "bulk", uiFile, "--project-name", "auth"],
      {
        cwd: ROOT_DIR,
        maxBuffer: 8 * 1024 * 1024,
      }
    );
  } finally {
    await Promise.all(tempFiles.map((file) => fs.rm(file, { force: true })));
  }

  const foundKeys = new Set([
    ...Object.keys(authCoreSecrets),
    ...Object.keys(authPolicySecrets),
    ...Object.keys(authUiSecrets),
  ]);
  const allRequested = new Set([...authCoreKeys, ...authPolicyKeys, ...authUiKeys]);
  const missing = [...allRequested].filter((key) => !foundKeys.has(key)).sort();

  console.log("Uploaded Infisical auth secrets to auth-core, auth-policy, and auth-ui.");
  if (missing.length > 0) {
    console.log("");
    console.log("Still missing in Infisical:");
    for (const key of missing) {
      console.log(`- ${key}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not sync auth secrets.");
  process.exitCode = 1;
});
