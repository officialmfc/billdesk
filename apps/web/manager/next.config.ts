import type { NextConfig } from "next";

function firstDefined(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
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
  /* config options here */

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
  },

  // Static Site Generation for optimal offline caching
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slash for better offline routing
  trailingSlash: true,

  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Note: Security headers configured in vercel.json and public/_headers
  // headers() doesn't work with output: 'export'

  // Disable Turbopack due to HMR issues
  // experimental: {
  //   turbo: undefined,
  // },
};

export default nextConfig;
