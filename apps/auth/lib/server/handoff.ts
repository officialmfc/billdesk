import type { AuthContext } from "@/lib/config";
import { getContextLabel } from "@/lib/config";
import { canAccessRequestedApp, getAuthServerAccessContext } from "@/lib/server/access";
import { getAuthHubEnv } from "@/lib/server/cloudflare";
import { buildHandoffHref } from "@/lib/handoff";
import { markAuthFlowStatus } from "@/lib/server/flows";
import { policySyncAuthAccountDirectoryLogin } from "@/lib/server/policy-client";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import {
  finalizeManagerRegistration,
  finalizeUserRegistration,
} from "@/lib/server/finalize";
import {
  claimDeviceLease,
  type DeviceLeaseRow,
} from "@/lib/server/device-leases";

type HandoffRow = {
  access_token: string;
  app: AuthContext["app"];
  auth_user_id: string;
  expires_at: string;
  id: string;
  next_path: string | null;
  platform: AuthContext["platform"];
  refresh_token: string;
  return_to: string | null;
  status: string;
};

type HandoffError = Error & {
  handoffAuthUserId?: string;
  handoffApp?: AuthContext["app"];
  handoffPlatform?: AuthContext["platform"];
  handoffStage?: string;
  deviceLeaseConflict?: boolean;
  activeDeviceLease?: DeviceLeaseRow | null;
};

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

function normalizeMetadataText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getAccessDeniedMessage(app: AuthContext["app"]): string {
  switch (app) {
    case "admin":
      return "This account does not have admin access.";
    case "manager":
      return "This account does not have manager access.";
    case "user":
      return "This account does not have a user profile.";
  }
}

async function finalizeRegistrationFromSession(params: {
  accessToken: string;
  authUserId: string;
  context: AuthContext;
}): Promise<{
  businessName: string | null;
  email: string;
  fullName: string;
  metadata: Record<string, unknown>;
  role: string;
} | null> {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(params.accessToken);

  if (error) {
    throw error;
  }

  const user = data.user;
  if (!user?.email) {
    return null;
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const requestedApp = normalizeMetadataText(metadata.requested_app);
  const hasInviteToken = Boolean(normalizeMetadataText(metadata.invite_token));
  const hasManagerRegistrationData =
    params.context.app === "manager" &&
    (requestedApp === "manager" ||
      hasInviteToken ||
      Boolean(normalizeMetadataText(metadata.requested_staff_role)));
  const hasUserRegistrationData =
    params.context.app === "user" &&
    (requestedApp === "user" ||
      hasInviteToken ||
      Boolean(normalizeMetadataText(metadata.requested_user_type)) ||
      Boolean(normalizeMetadataText(metadata.requested_default_role)));

  const derivedRole =
    normalizeMetadataText(metadata.requested_staff_role) ||
    normalizeMetadataText(metadata.requested_default_role) ||
    normalizeMetadataText(metadata.requested_user_type) ||
    (params.context.app === "admin"
      ? "admin"
      : params.context.app === "manager"
        ? "manager"
        : "user");

  const fullName =
    normalizeMetadataText(metadata.full_name) ||
    normalizeMetadataText(metadata.name) ||
    user.email.split("@")[0] ||
    user.email;

  const profile = {
    businessName: normalizeMetadataText(metadata.business_name),
    email: user.email,
    fullName,
    metadata,
    role: derivedRole,
  };

  if (!hasManagerRegistrationData && !hasUserRegistrationData) {
    return profile;
  }

  if (hasManagerRegistrationData) {
    await finalizeManagerRegistration({
      actorStaffId: null,
      authUserId: params.authUserId,
      email: user.email,
      fullName,
      payload: metadata,
    });
    return profile;
  }

  await finalizeUserRegistration({
    actorStaffId: null,
    authUserId: params.authUserId,
    email: user.email,
    fullName,
    payload: metadata,
  });

  return profile;
}

export type CreateHandoffInput = {
  accessToken: string;
  authUserId: string;
  context: AuthContext;
  deviceId?: string;
  deviceLabel?: string;
  flowId?: string;
  refreshToken: string;
};

export async function createAuthHandoff(params: CreateHandoffInput): Promise<{
  handoffId: string;
  redirectUrl: string;
}> {
  const env = await getAuthHubEnv();
  const accessToken = normalizeRequiredText(params.accessToken, "Access token");
  const refreshToken = normalizeRequiredText(params.refreshToken, "Refresh token");
  const authUserId = normalizeRequiredText(params.authUserId, "Auth user id");
  const context = params.context;
  const deviceId = normalizeOptionalText(params.deviceId);
  const deviceLabel = normalizeOptionalText(params.deviceLabel);
  const flowId = normalizeOptionalText(params.flowId);

  let stage = "access-check";

  try {
    stage = "finalize-registration";
    const registrationProfile = await finalizeRegistrationFromSession({
      accessToken,
      authUserId,
      context,
    });

    stage = "access-check";
    const accessContext = await getAuthServerAccessContext(authUserId);
    if (!canAccessRequestedApp(accessContext, context.app)) {
      throw new Error(getAccessDeniedMessage(context.app));
    }

    stage = "device-lease";
    if (!deviceId) {
      throw new Error("Device id is required.");
    }

    const leaseResult = await claimDeviceLease({
      authUserId,
      app: context.app,
      deviceId,
      deviceLabel: deviceLabel ?? undefined,
      platform: context.platform,
    });

    if (!leaseResult.ok) {
      const activeDeviceLabel = leaseResult.activeLease?.device_label?.trim() || null;
      const conflictError = new Error(
        activeDeviceLabel
          ? `This ${context.platform} slot is already active on ${activeDeviceLabel}. Open account center to replace it.`
          : `This ${context.platform} slot is already in use. Open account center to replace it.`
      ) as HandoffError;
      conflictError.deviceLeaseConflict = true;
      conflictError.activeDeviceLease = leaseResult.activeLease ?? null;
      throw conflictError;
    }

    if (registrationProfile) {
      await policySyncAuthAccountDirectoryLogin({
        app: context.app,
        authUserId,
        email: registrationProfile.email,
        fullName: registrationProfile.fullName,
        role: registrationProfile.role,
        source: "auth_handoff",
        status: "active",
        deviceId,
        metadata: registrationProfile.metadata,
        platform: context.platform,
        businessName: registrationProfile.businessName,
      });
    }

    stage = "insert-handoff";
    const handoffId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await env.auth_d1_binding
      .prepare(
        `
          INSERT INTO auth_handoffs (
            id,
            status,
            app,
            platform,
            next_path,
            return_to,
            auth_user_id,
            access_token,
            refresh_token,
            expires_at,
            created_at,
            updated_at
          )
          VALUES (?, 'created', ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
      )
      .bind(
        handoffId,
        context.app,
        context.platform,
        normalizeOptionalText(context.next),
        normalizeOptionalText(context.returnTo),
        authUserId,
        accessToken,
        refreshToken,
        expiresAt
      )
      .run();

    stage = "build-redirect";
    if (flowId) {
      await markAuthFlowStatus(flowId, "completed").catch(() => undefined);
    }
    return {
      handoffId,
      redirectUrl: buildHandoffHref(context, handoffId),
    };
  } catch (error) {
    console.error("[AuthHub] createAuthHandoff failed", {
      stage,
      app: context.app,
      platform: context.platform,
      authUserId,
      error: error instanceof Error ? error.message : String(error),
    });
    const normalizedError =
      error instanceof Error ? (error as HandoffError) : new Error(String(error)) as HandoffError;

    normalizedError.handoffStage = stage;
    normalizedError.handoffApp = context.app;
    normalizedError.handoffPlatform = context.platform;
    normalizedError.handoffAuthUserId = authUserId;
    normalizedError.deviceLeaseConflict = normalizedError.deviceLeaseConflict || false;

    throw normalizedError;
  }
}

export async function exchangeAuthHandoff(handoffId: string): Promise<{
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
}> {
  const env = await getAuthHubEnv();
  const id = normalizeRequiredText(handoffId, "Handoff id");

  const row = await env.auth_d1_binding
    .prepare(
      `
        SELECT id, status, access_token, refresh_token, expires_at
        FROM auth_handoffs
        WHERE id = ?
        LIMIT 1
      `
    )
    .bind(id)
    .first<HandoffRow>();

  if (!row) {
    throw new Error("Handoff not found.");
  }

  if (row.status === "exchanged") {
    return {
      accessToken: row.access_token,
      expiresAt: row.expires_at,
      refreshToken: row.refresh_token,
    };
  }

  if (row.status !== "created") {
    throw new Error("This handoff is no longer available.");
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await env.auth_d1_binding
      .prepare(
        `
          UPDATE auth_handoffs
          SET status = 'expired', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
      )
      .bind(id)
      .run();
    throw new Error("This handoff has expired.");
  }

  await env.auth_d1_binding
    .prepare(
      `
        UPDATE auth_handoffs
        SET status = 'exchanged',
            exchanged_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
    )
    .bind(id)
    .run();

  return {
    accessToken: row.access_token,
    expiresAt: row.expires_at,
    refreshToken: row.refresh_token,
  };
}
