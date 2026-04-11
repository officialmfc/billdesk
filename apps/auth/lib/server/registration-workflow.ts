import type { AppSlug } from "@/lib/config";
import { getAuthServerAccessContext, canAccessRequestedApp } from "@/lib/server/access";
import {
  sendRegistrationInviteEmail,
  sendSelfRegistrationApprovedEmail,
  getZeptoMailErrorDetails,
} from "@/lib/server/email";
import { captureAuthHubError } from "@/lib/server/logger";
import {
  policySyncAuthAccountDirectoryLogin,
  policyUpsertAuthAccountDirectory,
} from "@/lib/server/policy-client";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { getAuthHubEnv } from "@/lib/server/cloudflare";

export type InviteKind = "manager_invite" | "user_invite";

export type RegistrationRow = {
  activation_expires_at: string | null;
  activation_token_hash: string | null;
  approved_at: string | null;
  approved_by_auth_user_id: string | null;
  business_name: string | null;
  created_at: string;
  email: string;
  editable_name: number;
  full_name: string | null;
  id: string;
  invited_by_auth_user_id: string | null;
  kind: InviteKind | "self_signup";
  message: string | null;
  payload_json: string;
  phone: string | null;
  requested_platform: string | null;
  status: string;
  target_app: AppSlug;
};

export type InviteContext = {
  approval_target: "staff" | "user";
  business_name: string | null;
  email: string;
  full_name: string | null;
  invite_expires_at: string | null;
  registration_id: string;
  registration_kind: InviteKind | "self_signup";
  requested_app: AppSlug | null;
  requested_default_role: string | null;
  requested_platform: string | null;
  requested_staff_role: string | null;
  requested_user_type: string | null;
};

export type InviteRegistrationResult = {
  authUserId: string;
  inviteContext: InviteContext;
};

function normalizeRequiredText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }
  return trimmed;
}

function normalizeOptionalText(value: string | undefined | null): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeLowercaseEmail(value: string): string {
  return normalizeEmail(value).toLowerCase();
}

async function sendEmailNonBlocking(
  task: Promise<void>,
  context: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: ReturnType<typeof getZeptoMailErrorDetails> }> {
  try {
    await task;
    return { ok: true };
  } catch (error) {
    await captureAuthHubError(error, context).catch(() => undefined);
    return { ok: false, error: getZeptoMailErrorDetails(error) };
  }
}

function normalizeEmail(email: string): string {
  const trimmed = normalizeRequiredText(email, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Enter a valid email address.");
  }
  return trimmed;
}

function getInviteTtlHours(kind: InviteKind): number {
  return kind === "manager_invite" ? 72 : 168;
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function createTokenHashPair(): Promise<{ token: string; hash: string }> {
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  return {
    token,
    hash: await sha256Hex(token),
  };
}

function buildSignupPath(row: {
  kind: InviteKind;
  requested_app: AppSlug;
  requested_platform: string | null;
  invite_token?: string | null;
}): string {
  const url = new URL("/signup", "https://auth.mondalfishcenter.com");
  url.searchParams.set("app", row.requested_app);
  url.searchParams.set("platform", row.requested_platform || "mobile");
  if (row.invite_token) {
    url.searchParams.set("invite", row.invite_token);
  }
  return url.pathname + url.search;
}

export async function getInviteContextByToken(
  inviteToken: string
): Promise<InviteContext | null> {
  const env = await getAuthHubEnv();
  const tokenHash = await sha256Hex(inviteToken);
  const row = await env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          kind,
          target_app,
          status,
          email,
          full_name,
          business_name,
          payload_json,
          requested_platform,
          activation_expires_at
        FROM registration_requests
        WHERE activation_token_hash = ?
          AND status IN ('invited', 'opened', 'approved_activation', 'activation_pending')
        LIMIT 1
      `
    )
    .bind(tokenHash)
    .first<RegistrationRow>();

  if (!row) {
    return null;
  }

  const payload = safeParsePayload(row.payload_json);
  return {
    approval_target: row.kind === "manager_invite" ? "staff" : "user",
    business_name: row.business_name,
    email: row.email,
    full_name: row.full_name,
    invite_expires_at: row.activation_expires_at,
    registration_id: row.id,
    registration_kind: row.kind,
    requested_app: row.target_app,
    requested_default_role: typeof payload.requested_default_role === "string" ? payload.requested_default_role : null,
    requested_platform: row.requested_platform,
    requested_staff_role: typeof payload.requested_staff_role === "string" ? payload.requested_staff_role : null,
    requested_user_type: typeof payload.requested_user_type === "string" ? payload.requested_user_type : null,
  };
}

function safeParsePayload(value: string | null): Record<string, unknown> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function createInviteRecord(params: {
  actorAuthUserId: string;
  email: string;
  fullName: string;
  requestedApp: AppSlug;
  requestedPlatform: string;
  kind: InviteKind;
  payload: Record<string, unknown>;
  businessName?: string | null;
  phone?: string | null;
}): Promise<{ inviteToken: string; requestId: string; signupPath: string; signup_path: string }> {
  const env = await getAuthHubEnv();
  const requestId = crypto.randomUUID();
  const { token: inviteToken, hash: activationTokenHash } = await createTokenHashPair();
  const expiresAt = new Date(Date.now() + getInviteTtlHours(params.kind) * 60 * 60 * 1000).toISOString();
  const email = normalizeEmail(params.email);
  const fullName = normalizeRequiredText(params.fullName, "Full name");
  const payload = JSON.stringify(params.payload);
  const signupPath = buildSignupPath({
    kind: params.kind,
    requested_app: params.requestedApp,
    requested_platform: params.requestedPlatform,
    invite_token: inviteToken,
  });
  const existingInvite = await env.auth_d1_binding
    .prepare(
      `
        SELECT id
        FROM registration_requests
        WHERE email = ?
          AND kind = ?
          AND status IN ('invited', 'opened', 'pending_review', 'approved_activation')
        LIMIT 1
      `
    )
    .bind(email, params.kind)
    .first<{ id: string }>();

  const activeRequestId = existingInvite?.id || requestId;

  if (existingInvite) {
    await env.auth_d1_binding
      .prepare(
        `
          UPDATE registration_requests
          SET
            target_app = ?,
            status = 'invited',
            email = ?,
            full_name = ?,
            editable_name = 1,
            phone = ?,
            business_name = ?,
            payload_json = ?,
            requested_platform = ?,
            invited_by_auth_user_id = ?,
            activation_token_hash = ?,
            activation_expires_at = ?,
            rejected_at = NULL,
            rejection_reason = NULL,
            approved_at = NULL,
            approved_by_auth_user_id = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
      )
      .bind(
        params.requestedApp,
        email,
        fullName,
        normalizeOptionalText(params.phone),
        normalizeOptionalText(params.businessName),
        payload,
        params.requestedPlatform,
        params.actorAuthUserId,
        activationTokenHash,
        expiresAt,
        activeRequestId
      )
      .run();
  } else {
    await env.auth_d1_binding
      .prepare(
        `
          INSERT INTO registration_requests (
            id,
            kind,
            target_app,
            status,
            email,
            full_name,
            editable_name,
            phone,
            business_name,
            payload_json,
            requested_platform,
            invited_by_auth_user_id,
            activation_token_hash,
            activation_expires_at,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, 'invited', ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
      )
      .bind(
        requestId,
        params.kind,
        params.requestedApp,
        email,
        fullName,
        normalizeOptionalText(params.phone),
        normalizeOptionalText(params.businessName),
        payload,
        params.requestedPlatform,
        params.actorAuthUserId,
        activationTokenHash,
        expiresAt
      )
      .run();
  }

  await env.auth_d1_binding
    .prepare(
      `
        INSERT INTO registration_events (
          request_id,
          event_type,
          actor_auth_user_id,
          metadata_json,
          created_at
        )
        VALUES (?, 'invite_created', ?, ?, CURRENT_TIMESTAMP)
      `
    )
    .bind(
      activeRequestId,
      params.actorAuthUserId,
      JSON.stringify({
        requested_app: params.requestedApp,
        requested_platform: params.requestedPlatform,
        kind: params.kind,
        invite_reissued: Boolean(existingInvite),
      })
    )
    .run();

  await policyUpsertAuthAccountDirectory({
    app: params.requestedApp,
    email,
    fullName,
    role:
      params.kind === "manager_invite"
        ? "manager"
        : String(params.payload.requested_default_role ?? params.payload.requested_user_type ?? "user"),
    source: params.kind,
    status: "invited",
    businessName: normalizeOptionalText(params.businessName),
    metadata: {
      ...params.payload,
      invite_kind: params.kind,
      requested_platform: params.requestedPlatform,
    },
    platform: params.requestedPlatform as "web" | "desktop" | "mobile",
  });

  return {
    inviteToken,
    requestId: activeRequestId,
    signupPath,
    signup_path: signupPath,
  };
}

export async function createUserInvite(params: {
  actorAuthUserId: string;
  email: string;
  fullName: string;
  businessName?: string | null;
  phone?: string | null;
  requestedPlatform: string;
  requestedDefaultRole: string;
  requestedUserType: string;
}): Promise<{
  inviteToken: string;
  requestId: string;
  signupPath: string;
  signup_path: string;
  emailDelivery: { ok: true } | { ok: false; error: ReturnType<typeof getZeptoMailErrorDetails> };
}> {
  const result = await createInviteRecord({
    actorAuthUserId: params.actorAuthUserId,
    email: params.email,
    fullName: params.fullName,
    requestedApp: "user",
    requestedPlatform: params.requestedPlatform,
    kind: "user_invite",
    payload: {
      requested_default_role: params.requestedDefaultRole,
      requested_user_type: params.requestedUserType,
      business_name: normalizeOptionalText(params.businessName),
      phone: normalizeOptionalText(params.phone),
    },
    businessName: params.businessName,
    phone: params.phone,
  });

  const emailDelivery = await sendEmailNonBlocking(
    sendRegistrationInviteEmail({
      email: normalizeEmail(params.email),
      fullName: normalizeRequiredText(params.fullName, "Full name"),
      signupPath: result.signupPath,
      appLabel: "User App",
    }),
    {
      route: "POST /api/invites/user",
      stage: "send_invite_email",
      invite_kind: "user_invite",
      request_id: result.requestId,
    }
  );

  return { ...result, emailDelivery };
}

export async function createManagerInvite(params: {
  actorAuthUserId: string;
  email: string;
  fullName: string;
  requestedPlatform: string;
}): Promise<{
  inviteToken: string;
  requestId: string;
  signupPath: string;
  signup_path: string;
  emailDelivery: { ok: true } | { ok: false; error: ReturnType<typeof getZeptoMailErrorDetails> };
}> {
  const result = await createInviteRecord({
    actorAuthUserId: params.actorAuthUserId,
    email: params.email,
    fullName: params.fullName,
    requestedApp: "manager",
    requestedPlatform: params.requestedPlatform,
    kind: "manager_invite",
    payload: {
      requested_staff_role: "manager",
    },
  });

  const emailDelivery = await sendEmailNonBlocking(
    sendRegistrationInviteEmail({
      email: normalizeEmail(params.email),
      fullName: normalizeRequiredText(params.fullName, "Full name"),
      signupPath: result.signupPath,
      appLabel: "Manager App",
    }),
    {
      route: "POST /api/invites/manager",
      stage: "send_invite_email",
      invite_kind: "manager_invite",
      request_id: result.requestId,
    }
  );

  return { ...result, emailDelivery };
}

export async function registerInviteAccount(params: {
  inviteToken: string;
  email: string;
  fullName: string;
  password: string;
}): Promise<InviteRegistrationResult> {
  const inviteContext = await getInviteContextByToken(params.inviteToken);
  if (!inviteContext) {
    throw new Error("This invite link is invalid or has expired.");
  }

  const inviteEmail = normalizeLowercaseEmail(inviteContext.email);
  const email = normalizeLowercaseEmail(params.email);
  if (email !== inviteEmail) {
    throw new Error("This invite link does not match the email address.");
  }

  const supabase = await createSupabaseAdminClient();
  const { data, error } = await (supabase.auth as any).admin.createUser({
    email,
    password: normalizeRequiredText(params.password, "Password"),
    email_confirm: true,
    user_metadata: {
      full_name: normalizeRequiredText(params.fullName, "Full name"),
      name: normalizeRequiredText(params.fullName, "Full name"),
      invite_token: params.inviteToken,
      requested_app: inviteContext.requested_app,
      requested_platform: inviteContext.requested_platform,
      requested_default_role: inviteContext.requested_default_role,
      requested_staff_role: inviteContext.requested_staff_role,
      requested_user_type: inviteContext.requested_user_type,
      business_name: inviteContext.business_name,
    },
  });

  if (error) {
    throw new Error(error.message || "Could not create the invited account.");
  }

  const authUserId = data?.user?.id;
  if (!authUserId) {
    throw new Error("Could not create the invited account.");
  }

  await policySyncAuthAccountDirectoryLogin({
    app: inviteContext.requested_app ?? "user",
    authUserId,
    email,
    fullName: normalizeRequiredText(params.fullName, "Full name"),
    role:
      inviteContext.requested_staff_role ||
      inviteContext.requested_default_role ||
      inviteContext.requested_user_type ||
      "user",
    source: "invite_registration",
    metadata: {
      invite_token: params.inviteToken,
      requested_app: inviteContext.requested_app,
      requested_platform: inviteContext.requested_platform,
      requested_default_role: inviteContext.requested_default_role,
      requested_staff_role: inviteContext.requested_staff_role,
      requested_user_type: inviteContext.requested_user_type,
      business_name: inviteContext.business_name,
    },
    platform: (inviteContext.requested_platform as "web" | "desktop" | "mobile" | null) ?? null,
    businessName: inviteContext.business_name,
  });

  return {
    authUserId,
    inviteContext,
  };
}

export async function listPendingRegistrations(): Promise<RegistrationRow[]> {
  const env = await getAuthHubEnv();
  const result = await env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          kind,
          target_app,
          status,
          email,
          full_name,
          editable_name,
          phone,
          business_name,
          message,
          payload_json,
          requested_platform,
          invited_by_auth_user_id,
          approved_by_auth_user_id,
          activation_token_hash,
          activation_expires_at,
          approved_at,
          created_at,
          invited_by_auth_user_id,
          status
        FROM registration_requests
        WHERE status IN ('pending_review', 'invited', 'opened', 'approved_activation')
        ORDER BY created_at DESC
      `
    )
    .all<RegistrationRow>();

  return result.results ?? [];
}

export async function approveSelfRegistration(params: {
  requestId: string;
  actorAuthUserId: string;
}): Promise<{ activationToken: string; signupPath: string }> {
  const env = await getAuthHubEnv();
  const request = await env.auth_d1_binding
    .prepare(
      `
        SELECT id, email, full_name, payload_json, requested_platform, target_app, status, kind
        FROM registration_requests
        WHERE id = ?
        LIMIT 1
      `
    )
    .bind(params.requestId)
    .first<RegistrationRow>();

  if (!request) {
    throw new Error("Registration request not found.");
  }

  if (request.kind !== "self_signup") {
    throw new Error("Only self signups can be approved here.");
  }

  if (request.status !== "pending_review") {
    throw new Error(`This request is already ${request.status}.`);
  }

  const { token: activationToken, hash: activationTokenHash } = await createTokenHashPair();
  const activationExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  await env.auth_d1_binding
    .prepare(
      `
        UPDATE registration_requests
        SET
          status = 'approved_activation',
          approved_at = CURRENT_TIMESTAMP,
          approved_by_auth_user_id = ?,
          activation_token_hash = ?,
          activation_expires_at = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
    )
    .bind(params.actorAuthUserId, activationTokenHash, activationExpiresAt, params.requestId)
    .run();

  await policyUpsertAuthAccountDirectory({
    app: "user",
    email: request.email,
    fullName: request.full_name || request.email,
    role: String((safeParsePayload(request.payload_json).requested_default_role as string | undefined) || "user"),
    source: "self_registration",
    status: "approved_activation",
    businessName: request.business_name,
    metadata: {
      ...safeParsePayload(request.payload_json),
      registration_request_id: request.id,
      approved_by_auth_user_id: params.actorAuthUserId,
    },
    platform: (request.requested_platform as "web" | "desktop" | "mobile" | null) ?? null,
  });

  const signupPath = buildSignupPath({
    kind: "user_invite",
    requested_app: "user",
    requested_platform: request.requested_platform || "mobile",
    invite_token: activationToken,
  });

  await sendEmailNonBlocking(
    sendSelfRegistrationApprovedEmail({
      email: request.email,
      fullName: request.full_name || request.email,
      signupPath,
    }),
    {
      route: "POST /api/requests/:id/approve",
      stage: "send_approval_email",
      request_id: params.requestId,
    }
  );

  return { activationToken, signupPath };
}

export async function rejectRegistration(params: {
  requestId: string;
  actorAuthUserId: string;
  reason?: string | null;
}): Promise<void> {
  const env = await getAuthHubEnv();
  await env.auth_d1_binding
    .prepare(
      `
        UPDATE registration_requests
        SET
          status = 'rejected',
          rejected_at = CURRENT_TIMESTAMP,
          rejection_reason = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
    )
    .bind(normalizeOptionalText(params.reason), params.requestId)
    .run();

  await env.auth_d1_binding
    .prepare(
      `
        INSERT INTO registration_events (
          request_id,
          event_type,
          actor_auth_user_id,
          metadata_json,
          created_at
        )
        VALUES (?, 'registration_rejected', ?, ?, CURRENT_TIMESTAMP)
      `
    )
    .bind(
      params.requestId,
      params.actorAuthUserId,
      JSON.stringify({ reason: normalizeOptionalText(params.reason) })
    )
    .run();
}

export async function resolveActorFromBearer(
  authorizationHeader: string | null | undefined
): Promise<{
  accessToken: string;
  authUserId: string;
  access: Awaited<ReturnType<typeof getAuthServerAccessContext>>;
}> {
  const token = authorizationHeader?.trim().replace(/^Bearer\s+/i, "");
  if (!token) {
    throw new Error("Missing authorization token.");
  }

  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error) {
    throw new Error(error.message);
  }

  const authUserId = data.user?.id;
  if (!authUserId) {
    throw new Error("Could not resolve the current user.");
  }

  const access = await getAuthServerAccessContext(authUserId);
  return { accessToken: token, authUserId, access };
}

export async function assertInvitePermission(
  actor: Awaited<ReturnType<typeof resolveActorFromBearer>>,
  kind: InviteKind
): Promise<void> {
  if (kind === "manager_invite" && !actor.access.is_admin) {
    throw new Error("Only admin accounts can invite managers.");
  }

  if (kind === "user_invite" && !actor.access.is_manager && !actor.access.is_admin) {
    throw new Error("Only manager or admin accounts can invite users.");
  }
}

export async function assertAccessForApp(
  authUserId: string,
  app: AppSlug
): Promise<void> {
  const access = await getAuthServerAccessContext(authUserId);
  if (!canAccessRequestedApp(access, app)) {
    throw new Error("Access denied for the requested app.");
  }
}
