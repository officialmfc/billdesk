import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";

const ROOT_DIR = process.cwd();
const ENV_PATH = path.join(ROOT_DIR, ".env.cf");
const AUTH_CORE_CONFIG = path.join(ROOT_DIR, "apps", "auth", "wrangler.jsonc");
const AUTH_POLICY_CONFIG = path.join(ROOT_DIR, "apps", "auth-policy", "wrangler.jsonc");
const AUTH_UI_CONFIG = path.join(ROOT_DIR, "apps", "auth-ui", "wrangler.jsonc");

const colors = {
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
  yellow: "\x1b[33m",
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printSection(title) {
  console.log(`\n${colorize("cyan", title)}`);
}

function printSuccess(message) {
  console.log(`${colorize("green", "✔")} ${message}`);
}

function printWarn(message) {
  console.log(`${colorize("yellow", "!")} ${message}`);
}

function printError(message) {
  console.log(`${colorize("red", "✘")} ${message}`);
}

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function loadCloudflareTargets() {
  const [authCore, authPolicy, authUi] = await Promise.all([
    readJsonFile(AUTH_CORE_CONFIG),
    readJsonFile(AUTH_POLICY_CONFIG),
    readJsonFile(AUTH_UI_CONFIG),
  ]);

  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || "",
    authCoreName: authCore.name,
    authPolicyName: authPolicy.name,
    authUiName: authUi.name,
    d1DatabaseId: authCore.d1_databases?.[0]?.database_id || "",
  };
}

async function loadEnvFile() {
  const envRaw = await fs.readFile(ENV_PATH, "utf8");
  dotenv.config({ path: ENV_PATH, override: true });
  for (const line of envRaw.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  return envRaw;
}

async function cfApi(token, pathname) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  return {
    ok: response.ok && payload?.success !== false,
    payload,
    status: response.status,
  };
}

function requireEnv(name, aliases = []) {
  const candidates = [name, ...aliases];
  const value = candidates
    .map((key) => process.env[key]?.trim())
    .find((candidate) => typeof candidate === "string" && candidate.length > 0);
  if (!value) {
    throw new Error(`Missing ${[name, ...aliases].join(" or ")} in .env.cf`);
  }
  return value;
}

async function main() {
  console.log(colorize("cyan", "Cloudflare Auth Stack Check"));
  console.log(`Using ${ENV_PATH}`);

  try {
    await loadEnvFile();
  } catch (error) {
    printError(`Could not read .env.cf: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
    return;
  }

  let token;
  let targets;

  try {
    token = requireEnv("CLOUDFLARE_API_TOKEN", ["CF_API_TOKEN"]);
    targets = await loadCloudflareTargets();
    targets.accountId =
      requireEnv("CLOUDFLARE_ACCOUNT_ID", ["CF_ACCOUNT_ID"]) || targets.accountId;
    if (!targets.accountId?.trim()) {
      throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CF_ACCOUNT_ID in .env.cf");
    }
  } catch (error) {
    printError(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  printSection("Credential Check");

  const verify = await cfApi(token, "/user/tokens/verify");
  if (!verify.ok) {
    printError(
      `Cloudflare token verification failed (${verify.status}): ${
        verify.payload?.errors?.[0]?.message || "Unknown error"
      }`
    );
    process.exitCode = 1;
    return;
  }
  printSuccess("API token is valid");

  const account = await cfApi(token, `/accounts/${targets.accountId}`);
  if (!account.ok) {
    printError(
      `Account lookup failed (${account.status}): ${
        account.payload?.errors?.[0]?.message || "Unknown error"
      }`
    );
    process.exitCode = 1;
    return;
  }
  printSuccess(`Account is accessible: ${account.payload?.result?.name || targets.accountId}`);

  printSection("D1 Check");
  if (!targets.d1DatabaseId) {
    printError("Could not resolve the auth D1 database id from apps/auth/wrangler.jsonc");
    process.exitCode = 1;
    return;
  }

  const d1 = await cfApi(token, `/accounts/${targets.accountId}/d1/database/${targets.d1DatabaseId}`);
  if (!d1.ok) {
    printError(
      `D1 database lookup failed (${d1.status}): ${
        d1.payload?.errors?.[0]?.message || "Unknown error"
      }`
    );
    process.exitCode = 1;
    return;
  }
  printSuccess(`D1 database is accessible: ${d1.payload?.result?.name || targets.d1DatabaseId}`);

  printSection("Worker Check");

  const workerChecks = [
    { label: "auth-core worker", name: targets.authCoreName },
    { label: "auth-policy worker", name: targets.authPolicyName },
  ];

  for (const worker of workerChecks) {
    const result = await cfApi(token, `/accounts/${targets.accountId}/workers/scripts/${worker.name}`);
    if (!result.ok) {
      printError(
        `${worker.label} lookup failed (${result.status}): ${
          result.payload?.errors?.[0]?.message || "Unknown error"
        }`
      );
      process.exitCode = 1;
      return;
    }
    printSuccess(`${worker.label} exists: ${worker.name}`);
  }

  printSection("Pages Check");
  const pages = await cfApi(token, `/accounts/${targets.accountId}/pages/projects/${targets.authUiName}`);
  if (!pages.ok) {
    printError(
      `Pages project lookup failed (${pages.status}): ${
        pages.payload?.errors?.[0]?.message || "Unknown error"
      }`
    );
    process.exitCode = 1;
    return;
  }
  printSuccess(`Pages project exists: ${targets.authUiName}`);

  const customDomains = pages.payload?.result?.domains;
  if (Array.isArray(customDomains) && customDomains.length > 0) {
    printSuccess(`Pages domains: ${customDomains.join(", ")}`);
  } else {
    printWarn("Pages project has no custom domains attached yet");
  }

  printSection("Summary");
  printSuccess("Cloudflare deploy credentials and auth targets look healthy");
}

main().catch((error) => {
  printError(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
