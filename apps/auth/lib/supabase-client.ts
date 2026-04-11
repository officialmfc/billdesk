"use client";

import {
  createClient as createSupabaseClient,
  type Session,
  type SupabaseClient,
} from "@supabase/supabase-js";

type GlobalSupabase = typeof globalThis & {
  __mfcAuthHubClient?: SupabaseClient;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padding);
  const binary = window.atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
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

    const parsed = JSON.parse(decodeBase64Url(payload)) as { ref?: string };
    return parsed.ref ? `https://${parsed.ref}.supabase.co` : undefined;
  } catch {
    return undefined;
  }
}

export function createBrowserSupabaseClient(): SupabaseClient {
  const globalScope = globalThis as GlobalSupabase;
  if (globalScope.__mfcAuthHubClient) {
    return globalScope.__mfcAuthHubClient;
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || inferSupabaseUrlFromAnonKey(anonKey);

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing browser Supabase configuration for the auth hub.");
  }

  const client = createSupabaseClient(supabaseUrl, anonKey, {
    auth: {
      storage: window.localStorage,
      storageKey: "mfc-auth-hub",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "implicit",
    },
  });

  globalScope.__mfcAuthHubClient = client;
  return client;
}

export function getSessionTokens(session: Session | null): {
  accessToken: string;
  refreshToken: string;
} | null {
  if (!session?.access_token || !session.refresh_token) {
    return null;
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
}

export function getStoredSessionTokens(storageKey = "mfc-auth-hub"): {
  accessToken: string;
  refreshToken: string;
} | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const nestedSession =
      typeof parsed.session === "object" && parsed.session !== null
        ? (parsed.session as Record<string, unknown>)
        : null;

    const accessToken =
      typeof parsed.access_token === "string"
        ? parsed.access_token
        : typeof nestedSession?.access_token === "string"
          ? (nestedSession.access_token as string)
          : undefined;
    const refreshToken =
      typeof parsed.refresh_token === "string"
        ? parsed.refresh_token
        : typeof nestedSession?.refresh_token === "string"
          ? (nestedSession.refresh_token as string)
          : undefined;

    if (!accessToken || !refreshToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
    };
  } catch {
    return null;
  }
}
