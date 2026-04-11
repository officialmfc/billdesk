import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import * as ExpoLinking from 'expo-linking';
import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

type SupabaseStorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStore = new Map<string, string>();

const memoryStorageAdapter: SupabaseStorageAdapter = {
  getItem: async (key: string) => memoryStore.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    memoryStore.set(key, value);
  },
  removeItem: async (key: string) => {
    memoryStore.delete(key);
  },
};

const webStorageAdapter: SupabaseStorageAdapter = {
  getItem: async (key: string) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return memoryStorageAdapter.getItem(key);
    }

    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return memoryStorageAdapter.setItem(key, value);
    }

    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return memoryStorageAdapter.removeItem(key);
    }

    window.localStorage.removeItem(key);
  },
};

const secureStoreAdapter: SupabaseStorageAdapter = {
  getItem: async (key: string) => SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

function getStorageAdapter(): SupabaseStorageAdapter {
  const secureStoreAvailable =
    Platform.OS !== 'web' &&
    typeof SecureStore.getItemAsync === 'function' &&
    typeof SecureStore.setItemAsync === 'function' &&
    typeof SecureStore.deleteItemAsync === 'function';

  if (secureStoreAvailable) {
    return secureStoreAdapter;
  }

  if (Platform.OS === 'web') {
    return webStorageAdapter;
  }

  return memoryStorageAdapter;
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
export const SUPABASE_SESSION_STORAGE_KEY = "manager_mobile_auth_session";
const MANAGER_LAST_OAUTH_REDIRECT_STORAGE_KEY = "manager_mobile_last_oauth_redirect";
export const MANAGER_MOBILE_OAUTH_CALLBACK_URL = "mfcmanager://oauth-callback";
const MANAGER_MOBILE_DEVICE_ID_KEY = "manager_mobile_device_id";
const MANAGER_MOBILE_DEVICE_LABEL_KEY = "manager_mobile_device_label";

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

  return `manager_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function getHostedDeviceContext(): Promise<{ deviceId: string; deviceLabel: string }> {
  const storage = getStorageAdapter();
  let deviceId = await storage.getItem(MANAGER_MOBILE_DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = createDeviceId();
    await storage.setItem(MANAGER_MOBILE_DEVICE_ID_KEY, deviceId);
  }

  let deviceLabel = await storage.getItem(MANAGER_MOBILE_DEVICE_LABEL_KEY);
  if (!deviceLabel) {
    const browserNavigator = typeof window !== "undefined"
      ? (navigator as Navigator & { userAgentData?: { platform?: string } })
      : null;
    const platform =
      Platform.OS === "web" && browserNavigator
        ? browserNavigator.userAgentData?.platform || browserNavigator.platform || "Browser"
        : Platform.OS;
    deviceLabel = `${platform} mobile`;
    await storage.setItem(MANAGER_MOBILE_DEVICE_LABEL_KEY, deviceLabel);
  }

  return { deviceId, deviceLabel };
}

export async function touchHostedManagerDeviceLease(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authenticated session is available.");
  }

  const { deviceId, deviceLabel } = await getHostedDeviceContext();
  const response = await fetch(`${authBaseUrl}/api/devices/lease`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app: "manager",
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

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const resolvedSupabaseUrl = supabaseUrl;
const resolvedSupabaseAnonKey = supabaseAnonKey;

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
  const storage = getStorageAdapter();
  const keys = [
    SUPABASE_SESSION_STORAGE_KEY,
    MANAGER_LAST_OAUTH_REDIRECT_STORAGE_KEY,
    ...getLegacySessionKeys(),
  ];

  for (const key of keys) {
    await storage.removeItem(key);
  }
}

export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
  auth: {
    storage: getStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: SUPABASE_SESSION_STORAGE_KEY,
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

    for (const [key, value] of new URLSearchParams(chunk).entries()) {
      result[key] = value;
    }
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
      console.info(`[ManagerAuth] ${label} stored session after retryable network error`);
      return;
    }

    if (attempt < 2) {
      console.info(`[ManagerAuth] ${label} retrying after transient network error`);
      await delay(400 * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError ?? `${label} failed`));
}

export async function signInWithGoogleOnMobile(): Promise<void> {
  await openHostedManagerLogin();
}

export async function openHostedManagerLogin(email?: string): Promise<void> {
  const device = await getHostedDeviceContext();
  const authUrl = new URL("/login", authBaseUrl);
  authUrl.searchParams.set("app", "manager");
  authUrl.searchParams.set("platform", "mobile");
  authUrl.searchParams.set("return_to", buildHostedReturnToUrl());
  authUrl.searchParams.set("device_id", device.deviceId);
  authUrl.searchParams.set("device_label", device.deviceLabel);
  if (email) {
    authUrl.searchParams.set("email", email);
  }
  await Linking.openURL(authUrl.toString());
}

export async function openHostedManagerPasswordReset(email?: string): Promise<void> {
  const device = await getHostedDeviceContext();
  const authUrl = new URL("/forgot-password", authBaseUrl);
  authUrl.searchParams.set("app", "manager");
  authUrl.searchParams.set("platform", "mobile");
  authUrl.searchParams.set("return_to", buildHostedReturnToUrl());
  authUrl.searchParams.set("device_id", device.deviceId);
  authUrl.searchParams.set("device_label", device.deviceLabel);
  if (email) {
    authUrl.searchParams.set("email", email);
  }
  await Linking.openURL(authUrl.toString());
}

export function buildHostedManagerAuthUrl(path: string): string {
  return new URL(path, authBaseUrl).toString();
}

export async function completeOAuthRedirect(url: string): Promise<boolean> {
  console.info("[ManagerAuth] received oauth redirect", { url });
  const normalizedUrl = unwrapExpoDevClientUrl(url);
  if (normalizedUrl !== url) {
    console.info("[ManagerAuth] normalized expo dev client url", { normalizedUrl });
  }

  const isCustomSchemeCallback = normalizedUrl.startsWith(MANAGER_MOBILE_OAUTH_CALLBACK_URL);
  const isExpoRouteCallback = (() => {
    try {
      const parsed = new URL(normalizedUrl, "https://manager.local");
      return /\/(?:--\/)?oauth-callback\/?$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  })();

  if (!isCustomSchemeCallback && !isExpoRouteCallback) {
    return false;
  }

  const storage = getStorageAdapter();
  const lastHandledRedirect = await storage.getItem(MANAGER_LAST_OAUTH_REDIRECT_STORAGE_KEY);
  if (lastHandledRedirect === normalizedUrl) {
    return false;
  }

  const params = parseOAuthParams(normalizedUrl);
  const handoffId = params.handoffId ?? params.handoff;
  console.info("[ManagerAuth] parsed oauth params", {
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
    console.info("[ManagerAuth] exchanging login handoff");
    try {
      await exchangeHandoff(handoffId);
    } catch (error) {
      console.error("[ManagerAuth] handoff exchange failed", error);
      throw new Error(error instanceof Error ? error.message : "Could not complete sign-in.");
    }
    await storage.setItem(MANAGER_LAST_OAUTH_REDIRECT_STORAGE_KEY, normalizedUrl);
    return true;
  }

  const code = params.code;
  if (code) {
    console.info("[ManagerAuth] exchanging oauth code");
    try {
      await mutateSessionWithRetry("oauth code exchange", () =>
        supabase.auth.exchangeCodeForSession(code)
      );
    } catch (error) {
      console.error("[ManagerAuth] oauth code exchange failed", error);
      throw new Error(error instanceof Error ? error.message : "Could not complete sign-in.");
    }
    await storage.setItem(MANAGER_LAST_OAUTH_REDIRECT_STORAGE_KEY, normalizedUrl);
    return true;
  }

  const accessToken = params.access_token ?? params.accessToken;
  const refreshToken = params.refresh_token ?? params.refreshToken;
  if (accessToken && refreshToken) {
    console.info("[ManagerAuth] restoring session from tokens");
    try {
      await mutateSessionWithRetry("token restore", () =>
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      );
    } catch (error) {
      console.error("[ManagerAuth] token restore failed", error);
      throw new Error(error instanceof Error ? error.message : "Could not restore session.");
    }
    await storage.setItem(MANAGER_LAST_OAUTH_REDIRECT_STORAGE_KEY, normalizedUrl);
    return true;
  }

  return false;
}
