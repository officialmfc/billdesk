import { createClient as createSupabaseClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

type GlobalScope = typeof globalThis & {
  __mfcUserWebSupabaseClient?: SupabaseClient;
};

const memoryStore = new Map<string, string>();
const SUPABASE_STORAGE_KEY = "mfc-user-web-auth";
const USER_LAST_OAUTH_REDIRECT_STORAGE_KEY = "mfc-user-web-last-oauth-redirect";
export const USER_WEB_OAUTH_CALLBACK_PATH = "/auth/callback";

function firstDefined(...values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

function normalizeSupabaseUrl(value: string | undefined) {
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

  if (/^[a-z0-9.-]+\.supabase\.co$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return undefined;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padding);

  if (typeof window !== "undefined" && typeof window.atob === "function") {
    const binary = window.atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  return Buffer.from(padded, "base64").toString("utf8");
}

function inferSupabaseUrlFromAnonKey(anonKey: string | undefined) {
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

function getStorage(): StorageAdapter {
  if (typeof window !== "undefined" && window.localStorage) {
    return {
      getItem: async (key) => window.localStorage.getItem(key),
      setItem: async (key, value) => {
        window.localStorage.setItem(key, value);
      },
      removeItem: async (key) => {
        window.localStorage.removeItem(key);
      },
    };
  }

  return {
    getItem: async (key) => memoryStore.get(key) ?? null,
    setItem: async (key, value) => {
      memoryStore.set(key, value);
    },
    removeItem: async (key) => {
      memoryStore.delete(key);
    },
  };
}

function getConfig() {
  const anonKey = firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY
  );

  const url =
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    normalizeSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL) ??
    normalizeSupabaseUrl(process.env.SUPABASE_URL) ??
    inferSupabaseUrlFromAnonKey(anonKey);

  if (typeof window === "undefined") {
    if (!url || !anonKey) {
      return {
        url: "http://127.0.0.1:54321",
        anonKey: "example-anon-key",
      };
    }

    return { url, anonKey };
  }

  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error(
      "Missing Supabase config in browser: NEXT_PUBLIC_SUPABASE_URL must be defined at build time."
    );
  }

  if (!anonKey) {
    throw new Error(
      "Missing Supabase anon key in browser: NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined at build time."
    );
  }

  return { url, anonKey };
}

function getAuthBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://auth.mondalfishcenter.com"
  );
}

function getBrowserDeviceContext(): { deviceId: string; deviceLabel: string } {
  if (typeof window === "undefined") {
    return {
      deviceId: `user_web_${Date.now().toString(36)}`,
      deviceLabel: "browser web",
    };
  }

  const deviceIdKey = "mfc-user-web-device-id";
  const deviceLabelKey = "mfc-user-web-device-label";

  let deviceId = window.localStorage.getItem(deviceIdKey);
  if (!deviceId) {
    deviceId =
      globalThis.crypto?.randomUUID?.() ||
      `user_web_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(deviceIdKey, deviceId);
  }

  let deviceLabel = window.localStorage.getItem(deviceLabelKey);
  if (!deviceLabel) {
    const browserNavigator = navigator as Navigator & {
      userAgentData?: { platform?: string };
    };
    const platform =
      browserNavigator.userAgentData?.platform ||
      browserNavigator.platform ||
      "Browser";
    deviceLabel = `${platform} web`;
    window.localStorage.setItem(deviceLabelKey, deviceLabel);
  }

  return { deviceId, deviceLabel };
}

function parseOAuthParams(url: string): Record<string, string> {
  const result: Record<string, string> = {};
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  const query =
    queryIndex >= 0 ? url.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined) : "";
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";

  for (const chunk of [query, hash]) {
    if (!chunk) {
      continue;
    }

    const searchParams = new URLSearchParams(chunk);
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
  }

  return result;
}

async function exchangeHandoff(handoffId: string, supabase: SupabaseClient): Promise<void> {
  const response = await fetch(`${getAuthBaseUrl()}/api/auth/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ handoffId }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    accessToken?: string;
    access_token?: string;
    error?: string;
    refreshToken?: string;
    refresh_token?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "Could not exchange the login handoff.");
  }

  const accessToken = payload.access_token ?? payload.accessToken;
  const refreshToken = payload.refresh_token ?? payload.refreshToken;

  if (!accessToken || !refreshToken) {
    throw new Error("The login handoff response was incomplete.");
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }
}

export function createClient() {
  const globalScope = globalThis as GlobalScope;

  if (typeof window !== "undefined" && globalScope.__mfcUserWebSupabaseClient) {
    return globalScope.__mfcUserWebSupabaseClient;
  }

  const { url, anonKey } = getConfig();
  const storage = getStorage();

  const client = createSupabaseClient(url, anonKey, {
    auth: {
      storage,
      storageKey: SUPABASE_STORAGE_KEY,
      autoRefreshToken: typeof window !== "undefined",
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
    global: {
      fetch: (input, init) => {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          return Promise.reject(new TypeError("Network request failed (Offline)"));
        }

        return fetch(input, init);
      },
    },
  });

  if (typeof window !== "undefined") {
    globalScope.__mfcUserWebSupabaseClient = client;
  }

  return client;
}

export const supabase = createClient();

export async function clearPersistedSupabaseSession(): Promise<void> {
  const storage = getStorage();
  const keys = [
    SUPABASE_STORAGE_KEY,
    USER_LAST_OAUTH_REDIRECT_STORAGE_KEY,
    "sb-user-web-auth-token",
    "supabase.auth.token",
  ];

  for (const key of keys) {
    await storage.removeItem(key);
  }
}

export async function openHostedUserLogin(email?: string, next = "/bills"): Promise<void> {
  const { deviceId, deviceLabel } = getBrowserDeviceContext();
  const authUrl = new URL("/login", getAuthBaseUrl());
  authUrl.searchParams.set("app", "user");
  authUrl.searchParams.set("platform", "web");
  authUrl.searchParams.set("next", next);
  authUrl.searchParams.set("device_id", deviceId);
  authUrl.searchParams.set("device_label", deviceLabel);
  if (email) {
    authUrl.searchParams.set("email", email);
  }

  window.location.assign(authUrl.toString());
}

export async function openHostedUserPasswordReset(email?: string, next = "/bills"): Promise<void> {
  const { deviceId, deviceLabel } = getBrowserDeviceContext();
  const authUrl = new URL("/forgot-password", getAuthBaseUrl());
  authUrl.searchParams.set("app", "user");
  authUrl.searchParams.set("platform", "web");
  authUrl.searchParams.set("next", next);
  authUrl.searchParams.set("device_id", deviceId);
  authUrl.searchParams.set("device_label", deviceLabel);
  if (email) {
    authUrl.searchParams.set("email", email);
  }

  window.location.assign(authUrl.toString());
}

export async function touchHostedUserWebDeviceLease(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authenticated session is available.");
  }

  const { deviceId, deviceLabel } = getBrowserDeviceContext();
  const response = await fetch(`${getAuthBaseUrl()}/api/devices/lease`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app: "user",
      platform: "web",
      deviceId,
      deviceLabel,
      mode: "touch",
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error((payload as { error?: string }).error || "This device is no longer active.");
    (error as Error & { deviceLease?: unknown }).deviceLease = payload;
    throw error;
  }
}

export async function completeOAuthRedirect(url: string): Promise<boolean> {
  const normalizedUrl = url;
  if (!/\/auth\/callback\/?(\?|#|$)/i.test(normalizedUrl)) {
    return false;
  }

  const storage = getStorage();
  const lastHandledRedirect = await storage.getItem(USER_LAST_OAUTH_REDIRECT_STORAGE_KEY);
  if (lastHandledRedirect === normalizedUrl) {
    return false;
  }

  const params = parseOAuthParams(normalizedUrl);
  const handoffId = params.handoffId ?? params.handoff;
  const oauthError = params.error_description || params.error;

  if (oauthError) {
    throw new Error(decodeURIComponent(oauthError));
  }

  if (handoffId) {
    await exchangeHandoff(handoffId, supabase);
    await storage.setItem(USER_LAST_OAUTH_REDIRECT_STORAGE_KEY, normalizedUrl);
    return true;
  }

  const code = params.code;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }
    await storage.setItem(USER_LAST_OAUTH_REDIRECT_STORAGE_KEY, normalizedUrl);
    return true;
  }

  const accessToken = params.access_token ?? params.accessToken;
  const refreshToken = params.refresh_token ?? params.refreshToken;
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      throw error;
    }
    await storage.setItem(USER_LAST_OAUTH_REDIRECT_STORAGE_KEY, normalizedUrl);
    return true;
  }

  return false;
}
