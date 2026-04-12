import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import * as ExpoLinking from "expo-linking";
import Constants from "expo-constants";
import { Linking, Platform } from "react-native";

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStore = new Map<string, string>();

const memoryStorage: StorageAdapter = {
  getItem: async (key) => memoryStore.get(key) ?? null,
  setItem: async (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: async (key) => {
    memoryStore.delete(key);
  },
};

const secureStoreAdapter: StorageAdapter = {
  getItem: async (key) => SecureStore.getItemAsync(key),
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

const webStorageAdapter: StorageAdapter = {
  getItem: async (key) =>
    typeof window !== "undefined" && window.localStorage
      ? window.localStorage.getItem(key)
      : memoryStorage.getItem(key),
  setItem: async (key, value) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    await memoryStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    await memoryStorage.removeItem(key);
  },
};

function getStorage(): StorageAdapter {
  if (
    Platform.OS !== "web" &&
    typeof SecureStore.getItemAsync === "function" &&
    typeof SecureStore.setItemAsync === "function" &&
    typeof SecureStore.deleteItemAsync === "function"
  ) {
    return secureStoreAdapter;
  }

  return Platform.OS === "web" ? webStorageAdapter : memoryStorage;
}

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

function normalizeHttpUrl(value: string | undefined) {
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

function decodeBase64Url(value: string): string | undefined {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padding);

  if (typeof globalThis.atob !== "function") {
    return undefined;
  }

  const binary = globalThis.atob(padded);
  const percentEncoded = Array.from(binary, (char) =>
    `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`
  ).join("");

  return decodeURIComponent(percentEncoded);
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

    const decoded = decodeBase64Url(payload);
    if (!decoded) {
      return undefined;
    }

    const parsed = JSON.parse(decoded) as { ref?: string };
    return parsed.ref ? `https://${parsed.ref}.supabase.co` : undefined;
  } catch {
    return undefined;
  }
}

const supabaseAnonKey = firstDefined(
  Constants.expoConfig?.extra?.supabaseAnonKey,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const supabaseUrl =
  normalizeSupabaseUrl(
    firstDefined(
      Constants.expoConfig?.extra?.supabaseUrl,
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_URL
    )
  ) ?? inferSupabaseUrlFromAnonKey(supabaseAnonKey);
const authBaseUrl =
  normalizeHttpUrl(
    firstDefined(
      Constants.expoConfig?.extra?.authBaseUrl,
      process.env.EXPO_PUBLIC_AUTH_BASE_URL,
      process.env.NEXT_PUBLIC_AUTH_BASE_URL
    )
  ) ?? "https://auth.mondalfishcenter.com";
const ADMIN_MOBILE_DEVICE_ID_KEY = "admin_mobile_device_id";
const ADMIN_MOBILE_DEVICE_LABEL_KEY = "admin_mobile_device_label";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables for admin app.");
}

const resolvedSupabaseUrl = supabaseUrl;
const resolvedSupabaseAnonKey = supabaseAnonKey;

export const ADMIN_SUPABASE_SESSION_STORAGE_KEY = "admin_mobile_auth_session";
const ADMIN_LAST_OAUTH_REDIRECT_STORAGE_KEY = "admin_mobile_last_oauth_redirect";
export const ADMIN_MOBILE_OAUTH_CALLBACK_URL = "mfcadmin://oauth-callback";

function buildHostedReturnToUrl() {
  return ExpoLinking.createURL("/oauth-callback");
}

function createDeviceId(): string {
  const randomUUID = (
    globalThis as { crypto?: { randomUUID?: () => string } }
  ).crypto?.randomUUID;

  if (typeof randomUUID === "function") {
    return randomUUID();
  }

  return `admin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function getHostedDeviceContext(): Promise<{ deviceId: string; deviceLabel: string }> {
  const storage = getStorage();
  let deviceId = await storage.getItem(ADMIN_MOBILE_DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = createDeviceId();
    await storage.setItem(ADMIN_MOBILE_DEVICE_ID_KEY, deviceId);
  }

  let deviceLabel = await storage.getItem(ADMIN_MOBILE_DEVICE_LABEL_KEY);
  if (!deviceLabel) {
    const browserNavigator = typeof window !== "undefined"
      ? (navigator as Navigator & { userAgentData?: { platform?: string } })
      : null;
    const platform =
      Platform.OS === "web" && browserNavigator
        ? browserNavigator.userAgentData?.platform || browserNavigator.platform || "Browser"
        : Platform.OS;
    deviceLabel = `${platform} mobile`;
    await storage.setItem(ADMIN_MOBILE_DEVICE_LABEL_KEY, deviceLabel);
  }

  return { deviceId, deviceLabel };
}

export async function touchHostedAdminDeviceLease(accessToken?: string): Promise<void> {
  let token = accessToken;
  if (!token) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("No authenticated session is available.");
    }
    token = session.access_token;
  }

  const { deviceId, deviceLabel } = await getHostedDeviceContext();
  const response = await fetch(`${authBaseUrl}/api/devices/lease`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app: "admin",
      platform: "mobile",
      deviceId,
      deviceLabel,
      mode: "touch",
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "This device is no longer active.");
    (error as Error & { deviceLease?: unknown }).deviceLease = payload;
    throw error;
  }
}

function getLegacySessionKeys(): string[] {
  try {
    const hostname = new URL(resolvedSupabaseUrl).hostname;
    const projectRef = hostname.split(".")[0];

    return [`sb-${projectRef}-auth-token`, "supabase.auth.token"];
  } catch {
    return ["supabase.auth.token"];
  }
}

export async function clearPersistedSupabaseSession(): Promise<void> {
  const storage = getStorage();
  const keys = [
    ADMIN_SUPABASE_SESSION_STORAGE_KEY,
    ADMIN_LAST_OAUTH_REDIRECT_STORAGE_KEY,
    ...getLegacySessionKeys(),
  ];

  for (const key of keys) {
    await storage.removeItem(key);
  }
}

export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: ADMIN_SUPABASE_SESSION_STORAGE_KEY,
  },
});

function parseOAuthParams(url: string): Record<string, string> {
  const result: Record<string, string> = {};
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  const query = queryIndex >= 0 ? url.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined) : "";
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

type HandoffExchangePayload = {
  accessToken?: string;
  access_token?: string;
  error?: string;
  refreshToken?: string;
  refresh_token?: string;
};

function readHandoffTokens(payload: HandoffExchangePayload): {
  accessToken?: string;
  refreshToken?: string;
} {
  return {
    accessToken: payload.access_token ?? payload.accessToken,
    refreshToken: payload.refresh_token ?? payload.refreshToken,
  };
}

async function exchangeHandoff(handoffId: string): Promise<void> {
  const response = await fetch(`${authBaseUrl}/api/auth/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ handoffId }),
  });

  const payload = (await response.json()) as HandoffExchangePayload;

  if (!response.ok) {
    throw new Error(payload.error || "Could not exchange the login handoff.");
  }

  const { accessToken, refreshToken } = readHandoffTokens(payload);

  if (!accessToken || !refreshToken) {
    throw new Error("The login handoff response was incomplete.");
  }

  await mutateSessionWithRetry("handoff exchange", () =>
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function unwrapExpoDevClientUrl(url: string): string {
  let current = url;

  for (let iteration = 0; iteration < 3; iteration += 1) {
    try {
      const parsed = new URL(current);
      const nested = parsed.searchParams.get("url");
      if (!nested) {
        return current;
      }

      current = nested;
    } catch {
      return current;
    }
  }

  return current;
}

function isRetryableNetworkError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : String(error);
  const name =
    error instanceof Error
      ? error.name
      : typeof error === "object" && error !== null && "name" in error
        ? String((error as { name?: unknown }).name ?? "")
        : "";

  return (
    name.includes("AuthRetryableFetchError") ||
    message.includes("Network request failed") ||
    message.includes("fetch failed") ||
    message.includes("NetworkError")
  );
}

async function mutateSessionWithRetry(
  label: string,
  mutation: () => Promise<{ error: unknown | null }>
): Promise<void> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const { error } = await mutation();
    if (!error) {
      return;
    }

    lastError = error;
    if (!isRetryableNetworkError(error)) {
      break;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token && session.refresh_token) {
      console.info(`[AdminAuth] ${label} stored session after retryable network error`);
      return;
    }

    if (attempt < 2) {
      console.info(`[AdminAuth] ${label} retrying after transient network error`);
      await delay(400 * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError ?? `${label} failed`));
}

export async function signInWithGoogleOnAdminMobile(): Promise<void> {
  await openHostedAdminLogin();
}

export async function openHostedAdminLogin(email?: string): Promise<void> {
  const device = await getHostedDeviceContext();
  const authUrl = new URL("/login", authBaseUrl);
  authUrl.searchParams.set("app", "admin");
  authUrl.searchParams.set("platform", "mobile");
  authUrl.searchParams.set("return_to", buildHostedReturnToUrl());
  authUrl.searchParams.set("device_id", device.deviceId);
  authUrl.searchParams.set("device_label", device.deviceLabel);
  if (email) {
    authUrl.searchParams.set("email", email);
  }
  await Linking.openURL(authUrl.toString());
}

export async function openHostedAdminPasswordReset(email?: string): Promise<void> {
  const device = await getHostedDeviceContext();
  const authUrl = new URL("/forgot-password", authBaseUrl);
  authUrl.searchParams.set("app", "admin");
  authUrl.searchParams.set("platform", "mobile");
  authUrl.searchParams.set("return_to", buildHostedReturnToUrl());
  authUrl.searchParams.set("device_id", device.deviceId);
  authUrl.searchParams.set("device_label", device.deviceLabel);
  if (email) {
    authUrl.searchParams.set("email", email);
  }
  await Linking.openURL(authUrl.toString());
}

export function buildHostedAdminAuthUrl(path: string): string {
  return new URL(path, authBaseUrl).toString();
}

export async function completeOAuthRedirect(url: string): Promise<boolean> {
  console.info("[AdminAuth] received oauth redirect", { url });
  const normalizedUrl = unwrapExpoDevClientUrl(url);
  if (normalizedUrl !== url) {
    console.info("[AdminAuth] normalized expo dev client url", { normalizedUrl });
  }

  const isCustomSchemeCallback = normalizedUrl.startsWith(ADMIN_MOBILE_OAUTH_CALLBACK_URL);
  const isExpoRouteCallback = (() => {
    try {
      const parsed = new URL(normalizedUrl, "https://admin.local");
      return /\/(?:--\/)?oauth-callback\/?$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  })();

  if (!isCustomSchemeCallback && !isExpoRouteCallback) {
    return false;
  }

  const storage = getStorage();
  const lastHandledRedirect = await storage.getItem(ADMIN_LAST_OAUTH_REDIRECT_STORAGE_KEY);
  if (lastHandledRedirect === normalizedUrl) {
    return false;
  }

  const params = parseOAuthParams(normalizedUrl);
  const handoffId = params.handoffId ?? params.handoff;
  console.info("[AdminAuth] parsed oauth params", {
    hasCode: Boolean(params.code),
    hasHandoff: Boolean(handoffId),
    hasAccessToken: Boolean(params.access_token ?? params.accessToken),
    hasRefreshToken: Boolean(params.refresh_token ?? params.refreshToken),
    keys: Object.keys(params),
  });
  const oauthError = params.error_description || params.error;
  if (oauthError) {
    throw new Error(decodeURIComponent(oauthError));
  }

  if (handoffId) {
    console.info("[AdminAuth] exchanging login handoff");
    try {
      await exchangeHandoff(handoffId);
    } catch (error) {
      console.error("[AdminAuth] handoff exchange failed", error);
      throw new Error(error instanceof Error ? error.message : "Could not complete sign-in.");
    }
    await storage.setItem(ADMIN_LAST_OAUTH_REDIRECT_STORAGE_KEY, normalizedUrl);
    return true;
  }

  const code = params.code;
  if (code) {
    console.info("[AdminAuth] exchanging oauth code");
    try {
      await mutateSessionWithRetry("oauth code exchange", () =>
        supabase.auth.exchangeCodeForSession(code)
      );
    } catch (error) {
      console.error("[AdminAuth] oauth code exchange failed", error);
      throw new Error(error instanceof Error ? error.message : "Could not complete sign-in.");
    }
    await storage.setItem(ADMIN_LAST_OAUTH_REDIRECT_STORAGE_KEY, normalizedUrl);
    return true;
  }

  const accessToken = params.access_token ?? params.accessToken;
  const refreshToken = params.refresh_token ?? params.refreshToken;
  if (accessToken && refreshToken) {
    console.info("[AdminAuth] restoring session from tokens");
    try {
      await mutateSessionWithRetry("token restore", () =>
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      );
    } catch (error) {
      console.error("[AdminAuth] token restore failed", error);
      throw new Error(error instanceof Error ? error.message : "Could not restore session.");
    }
    await storage.setItem(ADMIN_LAST_OAUTH_REDIRECT_STORAGE_KEY, normalizedUrl);
    return true;
  }

  return false;
}
