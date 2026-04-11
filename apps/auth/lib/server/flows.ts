import type { AuthContext } from "@/lib/config";
import { getAuthHubEnv } from "@/lib/server/cloudflare";

export type AuthFlowAction =
  | "login"
  | "signup"
  | "forgot_password"
  | "reset_password"
  | "confirm"
  | "callback"
  | "handoff";

export type AuthFlowStatus = "open" | "submitted" | "completed" | "expired" | "cancelled";

export type AuthFlowRow = {
  action: AuthFlowAction;
  app: AuthContext["app"];
  created_at: string;
  device_id: string | null;
  device_label: string | null;
  email_seed: string | null;
  expires_at: string;
  id: string;
  invite_token: string | null;
  metadata_json: string;
  next_path: string | null;
  platform: AuthContext["platform"];
  return_to: string | null;
  status: AuthFlowStatus;
  updated_at: string;
};

const AUTH_FLOW_SCHEMA_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS auth_flows (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL CHECK (action IN ('login', 'signup', 'forgot_password', 'reset_password', 'confirm', 'callback', 'handoff')),
      app TEXT NOT NULL CHECK (app IN ('manager', 'admin', 'user')),
      platform TEXT NOT NULL CHECK (platform IN ('web', 'desktop', 'mobile')),
      device_id TEXT,
      device_label TEXT,
      next_path TEXT,
      return_to TEXT,
      email_seed TEXT,
      invite_token TEXT,
      status TEXT NOT NULL CHECK (status IN ('open', 'submitted', 'completed', 'expired', 'cancelled')),
      expires_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_auth_flows_status_expires_at
      ON auth_flows (status, expires_at)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_auth_flows_app_platform_created_at
      ON auth_flows (app, platform, created_at DESC)
  `,
] as const;

let authFlowSchemaBootstrapPromise: Promise<void> | null = null;

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRequiredText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }

  return trimmed;
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function computeExpiresAt(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function isExpired(flow: Pick<AuthFlowRow, "expires_at">): boolean {
  return new Date(flow.expires_at).getTime() <= Date.now();
}

export async function ensureAuthFlowSchema(): Promise<void> {
  if (!authFlowSchemaBootstrapPromise) {
    authFlowSchemaBootstrapPromise = (async () => {
      const env = await getAuthHubEnv();
      for (const statement of AUTH_FLOW_SCHEMA_STATEMENTS) {
        await env.auth_d1_binding.prepare(statement).run();
      }
    })().catch((error) => {
      authFlowSchemaBootstrapPromise = null;
      throw error;
    });
  }

  await authFlowSchemaBootstrapPromise;
}

export async function getAuthFlow(flowId: string): Promise<AuthFlowRow | null> {
  await ensureAuthFlowSchema();
  const env = await getAuthHubEnv();
  const normalizedId = normalizeRequiredText(flowId, "Flow id");
  const row = await env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          action,
          app,
          platform,
          device_id,
          device_label,
          next_path,
          return_to,
          email_seed,
          invite_token,
          status,
          expires_at,
          metadata_json,
          created_at,
          updated_at
        FROM auth_flows
        WHERE id = ?
        LIMIT 1
      `
    )
    .bind(normalizedId)
    .first<AuthFlowRow>();

  if (!row) {
    return null;
  }

  if (row.status !== "expired" && isExpired(row)) {
    await markAuthFlowStatus(row.id, "expired");
    return {
      ...row,
      status: "expired",
      updated_at: new Date().toISOString(),
    };
  }

  return row;
}

export async function createAuthFlow(params: {
  action: AuthFlowAction;
  context: AuthContext;
  deviceId?: string | null;
  deviceLabel?: string | null;
  emailSeed?: string | null;
  inviteToken?: string | null;
  metadata?: Record<string, unknown>;
  expiresInMinutes?: number;
}): Promise<AuthFlowRow> {
  await ensureAuthFlowSchema();
  const env = await getAuthHubEnv();
  const id = crypto.randomUUID();
  const expiresAt = computeExpiresAt(params.expiresInMinutes ?? 30);

  await env.auth_d1_binding
    .prepare(
      `
        INSERT INTO auth_flows (
          id,
          action,
          app,
          platform,
          device_id,
          device_label,
          next_path,
          return_to,
          email_seed,
          invite_token,
          status,
          expires_at,
          metadata_json,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    )
    .bind(
      id,
      params.action,
      params.context.app,
      params.context.platform,
      normalizeOptionalText(params.deviceId),
      normalizeOptionalText(params.deviceLabel),
      normalizeOptionalText(params.context.next),
      normalizeOptionalText(params.context.returnTo),
      normalizeOptionalText(params.emailSeed),
      normalizeOptionalText(params.inviteToken),
      expiresAt,
      JSON.stringify(normalizeMetadata(params.metadata))
    )
    .run();

  const created = await getAuthFlow(id);
  if (!created) {
    throw new Error("Could not create auth flow.");
  }

  return created;
}

export async function markAuthFlowStatus(
  flowId: string,
  status: AuthFlowStatus
): Promise<void> {
  await ensureAuthFlowSchema();
  const env = await getAuthHubEnv();
  await env.auth_d1_binding
    .prepare(
      `
        UPDATE auth_flows
        SET
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
    )
    .bind(status, normalizeRequiredText(flowId, "Flow id"))
    .run();
}

export async function resolveAuthFlowInput(params: {
  action?: AuthFlowAction | null;
  flowId?: string | null;
  context?: Partial<AuthContext> | null;
  deviceId?: string | null;
  deviceLabel?: string | null;
  email?: string | null;
  inviteToken?: string | null;
}): Promise<{
  flow: AuthFlowRow | null;
  context: AuthContext | null;
  deviceId: string | null;
  deviceLabel: string | null;
  email: string | null;
  inviteToken: string | null;
}> {
  const flow = params.flowId ? await getAuthFlow(params.flowId) : null;
  if (params.flowId && !flow) {
    throw new Error("The auth flow could not be found.");
  }
  if (flow?.status === "expired") {
    throw new Error("This auth flow expired. Please try again.");
  }

  const flowContext =
    flow
      ? {
          app: flow.app,
          platform: flow.platform,
          next: flow.next_path || undefined,
          returnTo: flow.return_to || undefined,
        }
      : null;

  const context =
    flowContext ||
    (params.context?.app && params.context?.platform
      ? {
          app: params.context.app,
          platform: params.context.platform,
          next: params.context.next,
          returnTo: params.context.returnTo,
        }
      : null);

  if (params.action && flow && flow.action !== params.action) {
    throw new Error("This auth flow cannot continue on the requested step.");
  }

  return {
    flow,
    context,
    deviceId: flow?.device_id || normalizeOptionalText(params.deviceId),
    deviceLabel: flow?.device_label || normalizeOptionalText(params.deviceLabel),
    email: flow?.email_seed || normalizeOptionalText(params.email),
    inviteToken: flow?.invite_token || normalizeOptionalText(params.inviteToken),
  };
}
