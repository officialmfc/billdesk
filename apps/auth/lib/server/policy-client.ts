import type { AppSlug, Platform } from "@/lib/config";
import type { AuthGateAction, AuthAccountStatus } from "@/lib/server/auth-control-plane";
import {
  preflightAuthGate,
  syncAuthAccountDirectoryLogin,
  upsertAuthAccountDirectory,
} from "@/lib/server/auth-control-plane";
import { getAuthHubEnv } from "@/lib/server/cloudflare";
import { sendSupabaseAuthEmail } from "@/lib/server/email";

type PolicyFetchable = {
  fetch: (request: Request) => Promise<Response>;
};

function policyServiceUrl(pathname: string): string {
  return `https://auth-policy.internal${pathname}`;
}

async function getPolicyBinding(): Promise<PolicyFetchable | null> {
  const env = await getAuthHubEnv();
  return (env.AUTH_POLICY ?? null) as PolicyFetchable | null;
}

async function fetchPolicyJson<T>(pathname: string, body: unknown): Promise<T> {
  const binding = await getPolicyBinding();
  if (!binding) {
    throw new Error("Auth policy binding is not available.");
  }

  const response = await binding.fetch(
    new Request(policyServiceUrl(pathname), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  );

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Auth policy request failed.");
  }

  return payload;
}

export async function policyPreflightAuthGate(params: {
  action: AuthGateAction;
  app: AppSlug;
  email: string;
  fullName?: string | null;
  deviceId?: string | null;
  deviceLabel?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
  platform?: Platform;
}) {
  const binding = await getPolicyBinding();
  if (!binding) {
    return preflightAuthGate(params);
  }

  const payload = await fetchPolicyJson<{
    account: unknown;
    allowed: boolean;
    reason?: string;
  }>("/internal/preflight", params);

  return payload.allowed
    ? { allowed: true as const, account: payload.account as any }
    : {
        allowed: false as const,
        account: payload.account as any,
        reason: payload.reason || "This account cannot continue.",
      };
}

export async function policySyncAuthAccountDirectoryLogin(params: {
  app: AppSlug;
  authUserId: string;
  email: string;
  fullName: string;
  role: string;
  source?: string;
  status?: AuthAccountStatus;
  businessName?: string | null;
  deviceId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
  platform?: Platform | null;
}): Promise<void> {
  const binding = await getPolicyBinding();
  if (!binding) {
    await syncAuthAccountDirectoryLogin(params);
    return;
  }

  await fetchPolicyJson<{ ok: true }>("/internal/account/login-sync", params);
}

export async function policyUpsertAuthAccountDirectory(params: {
  app: AppSlug;
  authUserId?: string | null;
  email: string;
  fullName: string;
  role: string;
  source: string;
  status?: AuthAccountStatus;
  businessName?: string | null;
  deviceId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
  platform?: Platform | null;
}): Promise<void> {
  const binding = await getPolicyBinding();
  if (!binding) {
    await upsertAuthAccountDirectory(params);
    return;
  }

  await fetchPolicyJson<{ ok: true }>("/internal/account/upsert", params);
}

export async function policySendSupabaseAuthEmail(params: {
  actionType: string;
  email: string;
  redirectTo: string;
  siteUrl?: string | null;
  token: string;
  tokenHash: string;
  tokenNew?: string | null;
  tokenHashNew?: string | null;
}): Promise<void> {
  const binding = await getPolicyBinding();
  if (!binding) {
    await sendSupabaseAuthEmail(params);
    return;
  }

  await fetchPolicyJson<{ ok: true }>("/internal/email/supabase", params);
}
