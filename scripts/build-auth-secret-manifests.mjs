import fs from "node:fs/promises";
import path from "node:path";

const outputDir = process.env.AUTH_SECRET_OUTPUT_DIR || path.join(process.cwd(), ".tmp", "auth-secrets");

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

function getValue(key) {
  const value = process.env[key];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pick(keys) {
  return Object.fromEntries(
    keys
      .map((key) => [key, getValue(key)])
      .filter((entry) => typeof entry[1] === "string" && entry[1].length > 0)
  );
}

async function main() {
  const authCoreSecrets = pick(authCoreKeys);
  const authPolicySecrets = pick(authPolicyKeys);
  const authUiSecrets = pick(authUiKeys);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, "auth-core.secrets.json"),
    `${JSON.stringify(authCoreSecrets, null, 2)}\n`,
    "utf8"
  );
  await fs.writeFile(
    path.join(outputDir, "auth-policy.secrets.json"),
    `${JSON.stringify(authPolicySecrets, null, 2)}\n`,
    "utf8"
  );
  await fs.writeFile(
    path.join(outputDir, "auth-ui.secrets.json"),
    `${JSON.stringify(authUiSecrets, null, 2)}\n`,
    "utf8"
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not build auth secret manifests.");
  process.exitCode = 1;
});
