import fs from "node:fs/promises";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";

const ROOT_DIR = process.cwd();
const ENV_PATH = path.join(ROOT_DIR, ".env.cf");
const DEFAULT_ORIGINS = [
  "https://billmfc.vercel.app",
  "https://auth.mondalfishcenter.com",
  "https://auth-admin.mondalfishcenter.com",
  "https://bill.mondalfishcenter.com",
  "https://manager.bill.mondalfishcenter.com",
  "https://user.bill.mondalfishcenter.com",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
];

function readEnvList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
}

async function main() {
  console.log("Syncing R2 CORS policy for releases bucket...");
  await loadEnvFile();

  const accountId = requireEnv("CLOUDFLARE_ACCOUNT_ID", ["CF_ACCOUNT_ID"]);
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET?.trim() || process.env.R2_BUCKET?.trim() || "releases";
  const allowedOrigins = [
    ...new Set([
      ...DEFAULT_ORIGINS,
      ...readEnvList(process.env.R2_ALLOWED_ORIGINS),
      ...readEnvList(process.env.CLOUDFLARE_R2_ALLOWED_ORIGINS),
    ]),
  ];

  const payload = {
    rules: [
      {
        allowed: {
          origins: allowedOrigins,
          methods: ["GET", "HEAD"],
        },
        max_age_seconds: 3600,
      },
    ],
  };

  async function applyWithApiToken() {
    const token = process.env.CLOUDFLARE_API_TOKEN?.trim() || process.env.CF_API_TOKEN?.trim();
    if (!token) {
      return { applied: false, reason: "no-api-token" };
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/cors`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.success === false) {
      return {
        applied: false,
        reason: result?.errors?.[0]?.message || `HTTP ${response.status}`,
      };
    }

    return { applied: true, reason: "api-token" };
  }

  async function applyWithWrangler() {
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), "mfc-r2-cors-"));
    const policyPath = path.join(tmpDir, "cors.json");
    await writeFile(policyPath, `${JSON.stringify(payload, null, 2)}${os.EOL}`);

    const args = ["--dir", path.join(ROOT_DIR, "apps", "auth"), "exec", "wrangler", "r2", "bucket", "cors", "set", bucketName, "--file", policyPath];
    const env = { ...process.env };
    delete env.CLOUDFLARE_API_TOKEN;
    delete env.CF_API_TOKEN;
    const child = spawn("pnpm", args, {
      cwd: ROOT_DIR,
      stdio: "inherit",
      env,
    });

    const code = await new Promise((resolve) => {
      child.on("exit", resolve);
      child.on("error", () => resolve(1));
    });

    await rm(tmpDir, { recursive: true, force: true });
    return { applied: code === 0, reason: code === 0 ? "wrangler" : "wrangler-failed" };
  }

  const apiResult = await applyWithApiToken();
  if (!apiResult.applied) {
    console.log(`API token path unavailable (${apiResult.reason}); falling back to Wrangler login.`);
    const wranglerResult = await applyWithWrangler();
    if (!wranglerResult.applied) {
      throw new Error("Failed to sync R2 CORS policy with both API token and Wrangler login.");
    }
  }

  const verify = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/cors`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN?.trim() || process.env.CF_API_TOKEN?.trim() || ""}`,
      },
    }
  ).catch(() => null);

  console.log(`Updated bucket CORS for ${bucketName}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);

  const snapshotPath = path.join(ROOT_DIR, "scripts", "release-r2-cors.json");
  await fs.writeFile(snapshotPath, `${JSON.stringify(payload, null, 2)}${os.EOL}`);
  console.log(`Wrote policy snapshot to ${snapshotPath}`);
  if (verify) {
    console.log(`Verify endpoint status: ${verify.status}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
