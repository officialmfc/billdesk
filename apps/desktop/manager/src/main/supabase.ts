import { shell } from "electron";
import { createSingleFlight } from "@mfc/auth";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { StaffProfile } from "../shared/contracts";
import { desktopAuthStorage } from "./auth-storage";
import { desktopEnv } from "./env";

let supabaseClient: SupabaseClient | null = null;
let currentProfile: StaffProfile | null = null;
const DESKTOP_DEVICE_ID_KEY = "desktop_manager_device_id";
const DESKTOP_DEVICE_LABEL_KEY = "desktop_manager_device_label";
type PendingOAuthCallbackState = {
  resolve: (callbackUrl: string) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
};

let pendingOAuthCallback: PendingOAuthCallbackState | null = null;
const resolveCurrentManagerProfileSingleFlight = createSingleFlight(async (): Promise<StaffProfile | null> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_current_manager_info");

  if (error) {
    return null;
  }

  const profile = (data as { profile?: { id?: string; full_name?: string; is_active?: boolean } | null } | null)
    ?.profile;

  if (!profile?.id || !profile.full_name || !profile.is_active) {
    return null;
  }

  try {
    await touchDesktopManagerDeviceLease();
  } catch (error) {
    currentProfile = null;
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user_id: profile.id,
    user_role: "manager",
    is_active: Boolean(profile.is_active),
    display_name: profile.full_name,
    full_name: profile.full_name,
    email: user?.email,
  };
});

function clearPendingOAuthCallback(): PendingOAuthCallbackState | null {
  const pending = pendingOAuthCallback;
  pendingOAuthCallback = null;

  if (pending) {
    clearTimeout(pending.timeout);
  }

  return pending;
}

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

async function exchangeHostedHandoff(handoffId: string): Promise<void> {
  const response = await fetch(`${desktopEnv.authBaseUrl}/api/auth/exchange`, {
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

  const supabase = getSupabaseClient();
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    throw new Error(sessionError.message);
  }
}

async function finalizeManagerProfile(): Promise<StaffProfile> {
  const supabase = getSupabaseClient();
  const profile = await resolveCurrentManagerProfile();

  if (!profile) {
    await supabase.auth.signOut({ scope: "local" });
    throw new Error("Unauthorized: this desktop app is available to active manager accounts only.");
  }

  currentProfile = profile;
  return profile;
}

async function getDesktopDeviceContext(): Promise<{ deviceId: string; deviceLabel: string }> {
  let deviceId = await desktopAuthStorage.getItem(DESKTOP_DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    await desktopAuthStorage.setItem(DESKTOP_DEVICE_ID_KEY, deviceId);
  }

  let deviceLabel = await desktopAuthStorage.getItem(DESKTOP_DEVICE_LABEL_KEY);
  if (!deviceLabel) {
    deviceLabel = `${process.platform} desktop`;
    await desktopAuthStorage.setItem(DESKTOP_DEVICE_LABEL_KEY, deviceLabel);
  }

  return { deviceId, deviceLabel };
}

async function touchDesktopManagerDeviceLease(): Promise<void> {
  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authenticated session is available.");
  }

  const { deviceId, deviceLabel } = await getDesktopDeviceContext();
  const response = await fetch(`${desktopEnv.authBaseUrl}/api/devices/lease`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app: "manager",
      platform: "desktop",
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

async function waitForOAuthCallback(): Promise<string> {
  if (pendingOAuthCallback) {
    const pending = clearPendingOAuthCallback();
    pending?.reject(new Error("Another sign-in request replaced the previous one."));
  }

  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearPendingOAuthCallback();
      reject(new Error("Browser sign-in timed out."));
    }, 5 * 60 * 1000);

    pendingOAuthCallback = {
      resolve: (incomingUrl) => {
        clearPendingOAuthCallback();
        resolve(incomingUrl);
      },
      reject: (reason) => {
        clearPendingOAuthCallback();
        reject(reason);
      },
      timeout,
    };
  });
}

async function establishSessionFromCallbackUrl(callbackUrl: string): Promise<void> {
  const supabase = getSupabaseClient();
  const params = parseOAuthParams(callbackUrl);
  const oauthError = params.error_description || params.error;
  if (oauthError) {
    throw new Error(decodeURIComponent(oauthError));
  }

  const handoffId = params.handoffId ?? params.handoff;
  if (handoffId) {
    await exchangeHostedHandoff(handoffId);
    return;
  }

  if (params.code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
    if (exchangeError) {
      throw new Error(exchangeError.message);
    }
    return;
  }

  if (params.access_token && params.refresh_token) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (sessionError) {
      throw new Error(sessionError.message);
    }
    await touchDesktopManagerDeviceLease();
    return;
  }

  throw new Error("Browser sign-in did not return a session.");
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(desktopEnv.supabaseUrl, desktopEnv.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: desktopAuthStorage,
      },
    });
  }

  return supabaseClient;
}

export async function loginAsManagerWithHostedAuth(): Promise<StaffProfile> {
  const device = await getDesktopDeviceContext();
  const authUrl = new URL("/login", desktopEnv.authBaseUrl);
  authUrl.searchParams.set("app", "manager");
  authUrl.searchParams.set("platform", "desktop");
  authUrl.searchParams.set("device_id", device.deviceId);
  authUrl.searchParams.set("device_label", device.deviceLabel);

  const callbackUrlPromise = waitForOAuthCallback();

  try {
    await shell.openExternal(authUrl.toString(), { activate: true });
  } catch (reason) {
    clearPendingOAuthCallback();
    throw reason instanceof Error ? reason : new Error("Could not open the browser for sign-in.");
  }

  const callbackUrl = await callbackUrlPromise;
  await establishSessionFromCallbackUrl(callbackUrl);
  return finalizeManagerProfile();
}

export async function openHostedPasswordReset(): Promise<void> {
  const device = await getDesktopDeviceContext();
  const resetUrl = new URL("/forgot-password", desktopEnv.authBaseUrl);
  resetUrl.searchParams.set("app", "manager");
  resetUrl.searchParams.set("platform", "desktop");
  resetUrl.searchParams.set("device_id", device.deviceId);
  resetUrl.searchParams.set("device_label", device.deviceLabel);
  await shell.openExternal(resetUrl.toString(), { activate: true });
}

export function resolvePendingOAuthCallback(callbackUrl: string): boolean {
  if (!callbackUrl.startsWith(desktopEnv.oauthRedirectUrl) || !pendingOAuthCallback) {
    return false;
  }

  pendingOAuthCallback.resolve(callbackUrl);
  return true;
}

export async function logoutManager(): Promise<void> {
  currentProfile = null;
  await getSupabaseClient().auth.signOut({ scope: "local" });
}

export async function getCurrentAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();

  return session?.access_token ?? null;
}

export async function getCurrentTokenExpiration(): Promise<Date | undefined> {
  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();

  return session?.expires_at ? new Date(session.expires_at * 1000) : undefined;
}

export async function resolveCurrentManagerProfile(): Promise<StaffProfile | null> {
  return resolveCurrentManagerProfileSingleFlight();
}

export async function getCachedProfile(): Promise<StaffProfile | null> {
  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();

  if (!session) {
    currentProfile = null;
    return null;
  }

  currentProfile = await resolveCurrentManagerProfile();
  return currentProfile;
}
