import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const envCandidates = [
  path.resolve(process.resourcesPath || "", ".env.runtime"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../../.env"),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

function requireEnv(...names: string[]): string {
  const value = names.map((name) => process.env[name]).find(Boolean);

  if (!value) {
    throw new Error(`Missing environment variable: ${names.join(" or ")}`);
  }

  return value;
}

function firstDefined(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function normalizeHttpUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\//.test(trimmed)) {
    return trimmed;
  }

  if (/^[a-z0-9.-]+(?::\d+)?(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return undefined;
}

function inferSupabaseUrlFromAnonKey(anonKey: string | undefined): string | undefined {
  if (!anonKey) {
    return undefined;
  }

  try {
    const [, payload] = anonKey.split(".");
    if (!payload) {
      return undefined;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(padding);
    const parsed = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as { ref?: string };

    return parsed.ref ? `https://${parsed.ref}.supabase.co` : undefined;
  } catch {
    return undefined;
  }
}

const supabaseAnonKey = requireEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseUrl =
  normalizeHttpUrl(process.env.EXPO_PUBLIC_SUPABASE_URL) ??
  normalizeHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
  inferSupabaseUrlFromAnonKey(supabaseAnonKey);
const powersyncUrl =
  normalizeHttpUrl(process.env.EXPO_PUBLIC_POWERSYNC_URL) ??
  normalizeHttpUrl(process.env.NEXT_PUBLIC_POWERSYNC_URL);
const desktopAppOauthRedirectUrl =
  firstDefined(
    process.env.MANAGER_APP_OAUTH_REDIRECT_URL,
    process.env.NEXT_PUBLIC_MANAGER_APP_OAUTH_REDIRECT_URL
  ) ?? "mfcmanager://oauth-callback";
const configuredOauthRedirectUrl = firstDefined(
  process.env.MANAGER_OAUTH_REDIRECT_URL,
  process.env.NEXT_PUBLIC_MANAGER_OAUTH_REDIRECT_URL
);
const browserOauthRedirectUrl =
  normalizeHttpUrl(configuredOauthRedirectUrl) ?? desktopAppOauthRedirectUrl;
const authBaseUrl =
  normalizeHttpUrl(
    firstDefined(process.env.EXPO_PUBLIC_AUTH_BASE_URL, process.env.NEXT_PUBLIC_AUTH_BASE_URL)
  ) ?? "https://auth.mondalfishcenter.com";

export const desktopEnv = {
  supabaseUrl: supabaseUrl ?? requireEnv("EXPO_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey,
  powersyncUrl: powersyncUrl ?? requireEnv("EXPO_PUBLIC_POWERSYNC_URL", "NEXT_PUBLIC_POWERSYNC_URL"),
  oauthRedirectUrl: desktopAppOauthRedirectUrl,
  browserOauthRedirectUrl,
  authBaseUrl,
  businessName:
    process.env.EXPO_PUBLIC_BUSINESS_NAME ||
    process.env.NEXT_PUBLIC_BUSINESS_NAME ||
    "Mondal Fish Center",
  businessAddress:
    process.env.EXPO_PUBLIC_BUSINESS_ADDRESS ||
    process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ||
    "",
  businessEmail:
    process.env.EXPO_PUBLIC_BUSINESS_EMAIL ||
    process.env.NEXT_PUBLIC_BUSINESS_EMAIL ||
    "",
  businessGst:
    process.env.EXPO_PUBLIC_BUSINESS_GST ||
    process.env.NEXT_PUBLIC_BUSINESS_GST ||
    "",
  businessPhone:
    process.env.EXPO_PUBLIC_BUSINESS_PHONE ||
    process.env.NEXT_PUBLIC_BUSINESS_PHONE ||
    "",
};
