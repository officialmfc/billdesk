import type { NextConfig } from "next";

function firstDefined(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function normalizeSupabaseUrl(value: string | undefined): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//.test(trimmed)) {
    return trimmed;
  }

  if (/^[a-z0-9.-]+\.supabase\.co$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return "";
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padding);
  return Buffer.from(padded, "base64").toString("utf8");
}

function inferSupabaseUrlFromAnonKey(anonKey: string): string {
  try {
    const [, payload] = anonKey.split(".");
    if (!payload) {
      return "";
    }

    const parsed = JSON.parse(decodeBase64Url(payload)) as { ref?: string };
    return parsed.ref ? `https://${parsed.ref}.supabase.co` : "";
  } catch {
    return "";
  }
}

const publicAnonKey = firstDefined(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  process.env.SUPABASE_ANON_KEY
);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      normalizeSupabaseUrl(
        firstDefined(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.EXPO_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_URL
        )
      ) || inferSupabaseUrlFromAnonKey(publicAnonKey),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: publicAnonKey,
    NEXT_PUBLIC_MANAGER_WEB_URL:
      firstDefined(process.env.NEXT_PUBLIC_MANAGER_WEB_URL) ||
      "https://manager.bill.mondalfishcenter.com",
    NEXT_PUBLIC_AUTH_BASE_URL:
      firstDefined(process.env.NEXT_PUBLIC_AUTH_BASE_URL) ||
      "https://auth.mondalfishcenter.com"
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
