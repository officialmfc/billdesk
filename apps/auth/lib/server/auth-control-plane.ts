import type { AppSlug, AuthContext, Platform } from "@/lib/config";
import { getAuthHubEnv } from "@/lib/server/cloudflare";

export type AuthGateAction =
  | "login_password"
  | "magic_link"
  | "password_reset"
  | "invite_signup"
  | "self_registration";

export type AuthAccountStatus =
  | "pending_review"
  | "invited"
  | "approved_activation"
  | "active"
  | "blocked"
  | "revoked";

export type AuthAccountReadModelRow = {
  app: AppSlug;
  auth_user_id: string | null;
  blocked_at: string | null;
  blocked_reason: string | null;
  business_name: string | null;
  created_at: string;
  email: string;
  full_name: string;
  id: string;
  last_login_at: string | null;
  last_login_device_id: string | null;
  last_login_ip: string | null;
  metadata_json: string;
  platform: Platform | null;
  role: string;
  source: string;
  status: AuthAccountStatus;
  updated_at: string;
};

export type AuthDirectoryAccessContext = {
  has_user_profile: boolean;
  is_admin: boolean;
  is_manager: boolean;
  staff_id: string | null;
  user_id: string | null;
};

type RateLimitRule = {
  limit: number;
  windowSeconds: number;
};

type AuditDecision = "allow" | "deny";

const DEFAULT_ACCOUNT_STATUS: AuthAccountStatus = "pending_review";

const RATE_LIMIT_RULES: Record<AuthGateAction, RateLimitRule> = {
  invite_signup: { limit: 6, windowSeconds: 30 * 60 },
  login_password: { limit: 8, windowSeconds: 15 * 60 },
  magic_link: { limit: 5, windowSeconds: 15 * 60 },
  password_reset: { limit: 4, windowSeconds: 15 * 60 },
  self_registration: { limit: 3, windowSeconds: 30 * 60 },
};

const CONTROL_PLANE_SCHEMA_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS auth_account_directory (
      id TEXT PRIMARY KEY,
      auth_user_id TEXT,
      email TEXT NOT NULL,
      app TEXT NOT NULL CHECK (app IN ('manager', 'admin', 'user')),
      platform TEXT,
      role TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending_review', 'invited', 'approved_activation', 'active', 'blocked', 'revoked')),
      source TEXT NOT NULL,
      full_name TEXT NOT NULL,
      business_name TEXT,
      blocked_at TEXT,
      blocked_reason TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      last_login_at TEXT,
      last_login_ip TEXT,
      last_login_device_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_account_directory_email_app
      ON auth_account_directory (email, app)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_auth_account_directory_auth_user_id
      ON auth_account_directory (auth_user_id)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_auth_account_directory_status
      ON auth_account_directory (status, app)
  `,
  `
    CREATE TABLE IF NOT EXISTS auth_audit_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      decision TEXT NOT NULL CHECK (decision IN ('allow', 'deny')),
      reason TEXT,
      email TEXT,
      auth_user_id TEXT,
      app TEXT,
      platform TEXT,
      device_id TEXT,
      ip_address TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_auth_audit_events_email_created_at
      ON auth_audit_events (email, created_at DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_auth_audit_events_auth_user_id_created_at
      ON auth_audit_events (auth_user_id, created_at DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_auth_audit_events_event_type_created_at
      ON auth_audit_events (event_type, created_at DESC)
  `,
] as const;

let controlPlaneBootstrapPromise: Promise<void> | null = null;

function normalizeRequiredText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }
  return trimmed;
}

function normalizeEmail(email: string): string {
  const trimmed = normalizeRequiredText(email, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Enter a valid email address.");
  }
  return trimmed;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getRateLimitKeyParts(params: {
  action: AuthGateAction;
  deviceId?: string | null;
  email: string;
  ipAddress?: string | null;
}): Array<{ scope: string; value: string }> {
  const parts = [{ scope: "email", value: params.email }];

  if (params.ipAddress) {
    parts.push({ scope: "ip", value: params.ipAddress });
  }

  if (params.deviceId) {
    parts.push({ scope: "device", value: params.deviceId });
  }

  return parts.map((part) => ({
    scope: `${params.action}:${part.scope}`,
    value: part.value,
  }));
}

function buildRateLimitKey(action: string, scope: string, value: string): string {
  return `auth-gate:${action}:${scope}:${value.toLowerCase()}`;
}

async function getRateLimitStore() {
  const env = await getAuthHubEnv();
  return (env.auth_rate_limit_kv ?? env.AUTH_RATE_LIMIT_KV ?? null) as
    | {
        get: (key: string, options?: { type?: "json" | "text" }) => Promise<unknown>;
        put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
      }
    | null;
}

export async function ensureControlPlaneSchema(): Promise<void> {
  if (!controlPlaneBootstrapPromise) {
    controlPlaneBootstrapPromise = (async () => {
      const env = await getAuthHubEnv();
      for (const statement of CONTROL_PLANE_SCHEMA_STATEMENTS) {
        await env.auth_d1_binding.prepare(statement).run();
      }
    })().catch((error) => {
      controlPlaneBootstrapPromise = null;
      throw error;
    });
  }

  await controlPlaneBootstrapPromise;
}

export async function recordAuthAuditEvent(params: {
  app?: AppSlug | null;
  authUserId?: string | null;
  decision: AuditDecision;
  deviceId?: string | null;
  email?: string | null;
  eventType: string;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
  platform?: Platform | null;
  reason?: string | null;
}): Promise<void> {
  await ensureControlPlaneSchema();
  const env = await getAuthHubEnv();
  await env.auth_d1_binding
    .prepare(
      `
        INSERT INTO auth_audit_events (
          id,
          event_type,
          decision,
          reason,
          email,
          auth_user_id,
          app,
          platform,
          device_id,
          ip_address,
          metadata_json,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `
    )
    .bind(
      crypto.randomUUID(),
      params.eventType,
      params.decision,
      normalizeOptionalText(params.reason),
      normalizeOptionalText(params.email),
      normalizeOptionalText(params.authUserId),
      params.app ?? null,
      params.platform ?? null,
      normalizeOptionalText(params.deviceId),
      normalizeOptionalText(params.ipAddress),
      JSON.stringify(params.metadata ?? {})
    )
    .run();
}

async function applyRateLimit(params: {
  action: AuthGateAction;
  deviceId?: string | null;
  email: string;
  ipAddress?: string | null;
}): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  const store = await getRateLimitStore();
  const rule = RATE_LIMIT_RULES[params.action];

  if (!store) {
    return { allowed: true };
  }

  const scopeParts = getRateLimitKeyParts({
    action: params.action,
    deviceId: params.deviceId,
    email: params.email,
    ipAddress: params.ipAddress,
  });

  for (const part of scopeParts) {
    const key = buildRateLimitKey(params.action, part.scope, part.value);
    const current = await store.get(key, { type: "json" });
    const state =
      current && typeof current === "object"
        ? (current as {
            count?: number;
            expiresAt?: string;
            firstSeenAt?: string;
            lastSeenAt?: string;
          })
        : {};
    const count = (typeof state.count === "number" ? state.count : 0) + 1;
    const firstSeenAt = state.firstSeenAt || new Date().toISOString();
    const lastSeenAt = new Date().toISOString();

    await store.put(
      key,
      JSON.stringify({
        count,
        expiresAt: new Date(Date.now() + rule.windowSeconds * 1000).toISOString(),
        firstSeenAt,
        lastSeenAt,
      }),
      { expirationTtl: rule.windowSeconds }
    );

    if (count > rule.limit) {
      return {
        allowed: false,
        reason: "Too many attempts. Please try again later.",
      };
    }
  }

  return { allowed: true };
}

async function getAuthAccountDirectoryRow(params: {
  app: AppSlug;
  email: string;
}): Promise<AuthAccountReadModelRow | null> {
  await ensureControlPlaneSchema();
  const env = await getAuthHubEnv();
  return env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          auth_user_id,
          blocked_at,
          blocked_reason,
          business_name,
          created_at,
          email,
          full_name,
          last_login_at,
          last_login_device_id,
          last_login_ip,
          metadata_json,
          platform,
          role,
          source,
          status,
          updated_at,
          app
        FROM auth_account_directory
        WHERE email = ?
          AND app = ?
        LIMIT 1
      `
    )
    .bind(normalizeEmail(params.email), params.app)
    .first<AuthAccountReadModelRow>();
}

export async function getAuthAccountDirectoryRowsByAuthUserId(
  authUserId: string
): Promise<AuthAccountReadModelRow[]> {
  await ensureControlPlaneSchema();
  const env = await getAuthHubEnv();
  const result = await env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          auth_user_id,
          blocked_at,
          blocked_reason,
          business_name,
          created_at,
          email,
          full_name,
          last_login_at,
          last_login_device_id,
          last_login_ip,
          metadata_json,
          platform,
          role,
          source,
          status,
          updated_at,
          app
        FROM auth_account_directory
        WHERE auth_user_id = ?
        ORDER BY updated_at DESC
      `
    )
    .bind(normalizeRequiredText(authUserId, "Auth user id"))
    .all<AuthAccountReadModelRow>();

  return result.results ?? [];
}

export function deriveAuthDirectoryAccessContext(
  rows: AuthAccountReadModelRow[]
): AuthDirectoryAccessContext {
  const activeRows = rows.filter((row) => row.status === "active");
  const managerRow = activeRows.find((row) => row.app === "manager");
  const adminRow = activeRows.find((row) => row.app === "admin");
  const userRow = activeRows.find((row) => row.app === "user");

  return {
    has_user_profile: Boolean(userRow),
    is_admin: Boolean(adminRow),
    is_manager: Boolean(managerRow),
    staff_id: adminRow?.auth_user_id ?? managerRow?.auth_user_id ?? null,
    user_id: userRow?.auth_user_id ?? null,
  };
}

export async function upsertAuthAccountDirectory(params: {
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
  await ensureControlPlaneSchema();
  const env = await getAuthHubEnv();
  const email = normalizeEmail(params.email);
  const metadata = normalizeMetadata(params.metadata);
  const existing = await getAuthAccountDirectoryRow({ app: params.app, email });
  const nextStatus = params.status || existing?.status || DEFAULT_ACCOUNT_STATUS;

  if (existing) {
    await env.auth_d1_binding
      .prepare(
        `
          UPDATE auth_account_directory
          SET
            auth_user_id = COALESCE(?, auth_user_id),
            full_name = ?,
            role = ?,
            status = ?,
            source = ?,
            business_name = ?,
            platform = ?,
            metadata_json = ?,
            last_login_at = ?,
            last_login_ip = ?,
            last_login_device_id = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
      )
      .bind(
        normalizeOptionalText(params.authUserId),
        normalizeRequiredText(params.fullName, "Full name"),
        normalizeRequiredText(params.role, "Role"),
        nextStatus,
        normalizeRequiredText(params.source, "Source"),
        normalizeOptionalText(params.businessName),
        params.platform ?? existing.platform ?? null,
        JSON.stringify(metadata),
        params.status === "active" ? new Date().toISOString() : existing.last_login_at,
        params.status === "active" ? normalizeOptionalText(params.ipAddress) : existing.last_login_ip,
        params.status === "active"
          ? normalizeOptionalText(params.deviceId)
          : existing.last_login_device_id,
        existing.id
      )
      .run();
    return;
  }

  await env.auth_d1_binding
    .prepare(
      `
        INSERT INTO auth_account_directory (
          id,
          auth_user_id,
          email,
          app,
          platform,
          role,
          status,
          source,
          full_name,
          business_name,
          metadata_json,
          last_login_at,
          last_login_ip,
          last_login_device_id,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    )
    .bind(
      crypto.randomUUID(),
      normalizeOptionalText(params.authUserId),
      email,
      params.app,
      params.platform ?? null,
      normalizeRequiredText(params.role, "Role"),
      nextStatus,
      normalizeRequiredText(params.source, "Source"),
      normalizeRequiredText(params.fullName, "Full name"),
      normalizeOptionalText(params.businessName),
      JSON.stringify(metadata),
      params.status === "active" ? new Date().toISOString() : null,
      params.status === "active" ? normalizeOptionalText(params.ipAddress) : null,
      params.status === "active" ? normalizeOptionalText(params.deviceId) : null
    )
    .run();
}

export async function markAuthAccountLogin(params: {
  app: AppSlug;
  authUserId: string;
  businessName?: string | null;
  deviceId?: string | null;
  email: string;
  fullName: string;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
  platform?: Platform | null;
  role: string;
  source?: string;
}): Promise<void> {
  await upsertAuthAccountDirectory({
    app: params.app,
    authUserId: params.authUserId,
    email: params.email,
    fullName: params.fullName,
    role: params.role,
    source: params.source || "finalization",
    status: "active",
    businessName: params.businessName,
    deviceId: params.deviceId,
    ipAddress: params.ipAddress,
    metadata: params.metadata,
    platform: params.platform,
  });
}

export async function syncAuthAccountDirectoryLogin(params: {
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
  await markAuthAccountLogin({
    app: params.app,
    authUserId: params.authUserId,
    businessName: params.businessName,
    deviceId: params.deviceId,
    email: params.email,
    fullName: params.fullName,
    ipAddress: params.ipAddress,
    metadata: params.metadata,
    platform: params.platform,
    role: params.role,
    source: params.source || "auth_handoff",
  });

  if (params.status && params.status !== "active") {
    await upsertAuthAccountDirectory({
      app: params.app,
      authUserId: params.authUserId,
      email: params.email,
      fullName: params.fullName,
      role: params.role,
      source: params.source || "auth_handoff",
      status: params.status,
      businessName: params.businessName,
      deviceId: params.deviceId,
      ipAddress: params.ipAddress,
      metadata: params.metadata,
      platform: params.platform,
    });
  }
}

export async function preflightAuthGate(params: {
  action: AuthGateAction;
  app: AppSlug;
  email: string;
  fullName?: string | null;
  deviceId?: string | null;
  deviceLabel?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
  platform?: Platform;
}): Promise<
  | {
      allowed: true;
      account: AuthAccountReadModelRow | null;
    }
  | {
      allowed: false;
      account: AuthAccountReadModelRow | null;
      reason: string;
    }
> {
  await ensureControlPlaneSchema();
  const email = normalizeEmail(params.email);
  const rateLimit = await applyRateLimit({
    action: params.action,
    deviceId: params.deviceId,
    email,
    ipAddress: params.ipAddress,
  });

  const account = await getAuthAccountDirectoryRow({ app: params.app, email });

  if (!rateLimit.allowed) {
    await recordAuthAuditEvent({
      app: params.app,
      decision: "deny",
      deviceId: params.deviceId,
      email,
      eventType: params.action,
      ipAddress: params.ipAddress,
      metadata: { ...(params.metadata ?? {}), device_label: params.deviceLabel, reason: rateLimit.reason },
      platform: params.platform ?? null,
      reason: rateLimit.reason,
    });

    return {
      allowed: false,
      account,
      reason: rateLimit.reason,
    };
  }

  if (params.action === "self_registration") {
    await recordAuthAuditEvent({
      app: params.app,
      decision: "allow",
      deviceId: params.deviceId,
      email,
      eventType: params.action,
      ipAddress: params.ipAddress,
      metadata: { ...(params.metadata ?? {}), device_label: params.deviceLabel },
      platform: params.platform ?? null,
      reason: "Self registration preflight passed.",
    });
    return { allowed: true, account };
  }

  if (!account) {
    const reason = "No read-model entry exists yet.";
    await recordAuthAuditEvent({
      app: params.app,
      decision: "allow",
      deviceId: params.deviceId,
      email,
      eventType: `${params.action}_read_model_miss`,
      ipAddress: params.ipAddress,
      metadata: { ...(params.metadata ?? {}), device_label: params.deviceLabel, reason },
      platform: params.platform ?? null,
      reason,
    });
    return { allowed: true, account: null };
  }

  const blockedStatuses = new Set<AuthAccountStatus>(["blocked", "revoked", "pending_review"]);
  if (blockedStatuses.has(account.status)) {
    const reason =
      account.status === "pending_review"
        ? "This account is still waiting for approval."
        : "This account is not allowed to sign in.";
    await recordAuthAuditEvent({
      app: params.app,
      authUserId: account.auth_user_id,
      decision: "deny",
      deviceId: params.deviceId,
      email,
      eventType: params.action,
      ipAddress: params.ipAddress,
      metadata: { ...(params.metadata ?? {}), device_label: params.deviceLabel, reason, status: account.status },
      platform: params.platform ?? null,
      reason,
    });
    return { allowed: false, account, reason };
  }

  if (params.action === "invite_signup" && account.status !== "invited" && account.status !== "approved_activation" && account.status !== "active") {
    const reason = "This invitation is not ready yet.";
    await recordAuthAuditEvent({
      app: params.app,
      authUserId: account.auth_user_id,
      decision: "deny",
      deviceId: params.deviceId,
      email,
      eventType: params.action,
      ipAddress: params.ipAddress,
      metadata: { ...(params.metadata ?? {}), device_label: params.deviceLabel, reason, status: account.status },
      platform: params.platform ?? null,
      reason,
    });
    return { allowed: false, account, reason };
  }

  if (params.action !== "invite_signup" && account.status !== "active") {
    const reason = "This account is not active yet.";
    await recordAuthAuditEvent({
      app: params.app,
      authUserId: account.auth_user_id,
      decision: "deny",
      deviceId: params.deviceId,
      email,
      eventType: params.action,
      ipAddress: params.ipAddress,
      metadata: { ...(params.metadata ?? {}), device_label: params.deviceLabel, reason, status: account.status },
      platform: params.platform ?? null,
      reason,
    });
    return { allowed: false, account, reason };
  }

  await recordAuthAuditEvent({
    app: params.app,
    authUserId: account.auth_user_id,
    decision: "allow",
    deviceId: params.deviceId,
    email,
    eventType: params.action,
    ipAddress: params.ipAddress,
    metadata: { ...(params.metadata ?? {}), device_label: params.deviceLabel, status: account.status },
    platform: params.platform ?? null,
    reason: "Preflight passed.",
  });

  return { allowed: true, account };
}
