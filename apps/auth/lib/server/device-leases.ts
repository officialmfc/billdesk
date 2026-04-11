import type { AuthContext } from "@/lib/config";
import { getAuthHubEnv } from "@/lib/server/cloudflare";

export type DeviceLeaseStatus = "active" | "revoked" | "expired";

export type DeviceLeaseRow = {
  app: AuthContext["app"];
  auth_user_id: string;
  created_at: string;
  device_id: string;
  device_label: string;
  id: string;
  last_seen_at: string;
  lease_expires_at: string;
  platform: AuthContext["platform"];
  revoked_at: string | null;
  revoked_reason: string | null;
  status: DeviceLeaseStatus;
  updated_at: string;
};

export type DeviceLeaseResult =
  | {
      activeLease: DeviceLeaseRow;
      ok: true;
      status: "active";
    }
  | {
      activeLease: DeviceLeaseRow;
      conflictLease: DeviceLeaseRow;
      ok: false;
      status: "conflict";
    }
  | {
      activeLease: DeviceLeaseRow | null;
      ok: false;
      status: "missing";
    };

type LeaseMode = "claim" | "touch";

const DEFAULT_LEASE_MINUTES = 24 * 60;
const DEVICE_LEASE_SCHEMA_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS auth_device_leases (
      id TEXT PRIMARY KEY,
      auth_user_id TEXT NOT NULL,
      app TEXT NOT NULL CHECK (app IN ('manager', 'admin', 'user')),
      platform TEXT NOT NULL CHECK (platform IN ('web', 'desktop', 'mobile')),
      device_id TEXT NOT NULL,
      device_label TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'revoked', 'expired')),
      lease_expires_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      revoked_at TEXT,
      revoked_reason TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_device_leases_active_slot
      ON auth_device_leases (auth_user_id, app, platform)
      WHERE status = 'active'
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_auth_device_leases_auth_user_id_updated_at
      ON auth_device_leases (auth_user_id, updated_at DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_auth_device_leases_device_id
      ON auth_device_leases (device_id, updated_at DESC)
  `,
] as const;

let deviceLeaseSchemaBootstrapPromise: Promise<void> | null = null;

export async function ensureDeviceLeaseSchema(): Promise<void> {
  if (!deviceLeaseSchemaBootstrapPromise) {
    deviceLeaseSchemaBootstrapPromise = (async () => {
      const env = await getAuthHubEnv();
      for (const statement of DEVICE_LEASE_SCHEMA_STATEMENTS) {
        await env.auth_d1_binding.prepare(statement).run();
      }
    })().catch((error) => {
      deviceLeaseSchemaBootstrapPromise = null;
      throw error;
    });
  }

  await deviceLeaseSchemaBootstrapPromise;
}

function normalizeDeviceLabel(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.slice(0, 120);
}

function normalizeDeviceId(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error("Device id is required.");
  }

  return trimmed.slice(0, 120);
}

function isLeaseExpired(row: Pick<DeviceLeaseRow, "lease_expires_at">): boolean {
  return new Date(row.lease_expires_at).getTime() <= Date.now();
}

function leaseExpiryIso(minutes = DEFAULT_LEASE_MINUTES): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

async function readActiveLease(
  authUserId: string,
  app: AuthContext["app"],
  platform: AuthContext["platform"],
): Promise<DeviceLeaseRow | null> {
  await ensureDeviceLeaseSchema();
  const env = await getAuthHubEnv();
  return env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          auth_user_id,
          app,
          platform,
          device_id,
          device_label,
          status,
          lease_expires_at,
          last_seen_at,
          revoked_at,
          revoked_reason,
          created_at,
          updated_at
        FROM auth_device_leases
        WHERE auth_user_id = ?
          AND app = ?
          AND platform = ?
          AND status = 'active'
        ORDER BY updated_at DESC
        LIMIT 1
      `
    )
    .bind(authUserId, app, platform)
    .first<DeviceLeaseRow>();
}

async function readLeaseByDevice(
  authUserId: string,
  app: AuthContext["app"],
  platform: AuthContext["platform"],
  deviceId: string,
): Promise<DeviceLeaseRow | null> {
  await ensureDeviceLeaseSchema();
  const env = await getAuthHubEnv();
  return env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          auth_user_id,
          app,
          platform,
          device_id,
          device_label,
          status,
          lease_expires_at,
          last_seen_at,
          revoked_at,
          revoked_reason,
          created_at,
          updated_at
        FROM auth_device_leases
        WHERE auth_user_id = ?
          AND app = ?
          AND platform = ?
          AND device_id = ?
        ORDER BY updated_at DESC
        LIMIT 1
      `
    )
    .bind(authUserId, app, platform, deviceId)
    .first<DeviceLeaseRow>();
}

async function updateLeaseAsActive(
  existingId: string,
  deviceLabel: string,
  leaseExpiresAt: string,
): Promise<DeviceLeaseRow> {
  await ensureDeviceLeaseSchema();
  const env = await getAuthHubEnv();
  await env.auth_d1_binding
    .prepare(
      `
        UPDATE auth_device_leases
        SET
          device_label = ?,
          status = 'active',
          lease_expires_at = ?,
          last_seen_at = CURRENT_TIMESTAMP,
          revoked_at = NULL,
          revoked_reason = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
    )
    .bind(deviceLabel, leaseExpiresAt, existingId)
    .run();

  const updated = await env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          auth_user_id,
          app,
          platform,
          device_id,
          device_label,
          status,
          lease_expires_at,
          last_seen_at,
          revoked_at,
          revoked_reason,
          created_at,
          updated_at
        FROM auth_device_leases
        WHERE id = ?
        LIMIT 1
      `
    )
    .bind(existingId)
    .first<DeviceLeaseRow>();

  if (!updated) {
    throw new Error("Could not refresh device lease.");
  }

  return updated;
}

async function insertLease(params: {
  authUserId: string;
  app: AuthContext["app"];
  deviceId: string;
  deviceLabel: string;
  leaseExpiresAt: string;
  platform: AuthContext["platform"];
}): Promise<DeviceLeaseRow> {
  await ensureDeviceLeaseSchema();
  const env = await getAuthHubEnv();
  const id = crypto.randomUUID();
  await env.auth_d1_binding
    .prepare(
      `
        INSERT INTO auth_device_leases (
          id,
          auth_user_id,
          app,
          platform,
          device_id,
          device_label,
          status,
          lease_expires_at,
          last_seen_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'active', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
    )
    .bind(
      id,
      params.authUserId,
      params.app,
      params.platform,
      params.deviceId,
      params.deviceLabel,
      params.leaseExpiresAt
    )
    .run();

  const created = await env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          auth_user_id,
          app,
          platform,
          device_id,
          device_label,
          status,
          lease_expires_at,
          last_seen_at,
          revoked_at,
          revoked_reason,
          created_at,
          updated_at
        FROM auth_device_leases
        WHERE id = ?
        LIMIT 1
      `
    )
    .bind(id)
    .first<DeviceLeaseRow>();

  if (!created) {
    throw new Error("Could not create device lease.");
  }

  return created;
}

function isUniqueDeviceLeaseConflict(error: unknown): boolean {
  return (
    error instanceof Error &&
    /UNIQUE constraint failed: auth_device_leases\.auth_user_id, auth_device_leases\.app, auth_device_leases\.platform/i.test(
      error.message
    )
  );
}

async function activateLeaseWithRecovery(params: {
  authUserId: string;
  app: AuthContext["app"];
  deviceId: string;
  deviceLabel: string;
  leaseExpiresAt: string;
  platform: AuthContext["platform"];
  existingLeaseId?: string;
}): Promise<DeviceLeaseResult> {
  try {
    const activeLease = params.existingLeaseId
      ? await updateLeaseAsActive(params.existingLeaseId, params.deviceLabel, params.leaseExpiresAt)
      : await insertLease({
          authUserId: params.authUserId,
          app: params.app,
          platform: params.platform,
          deviceId: params.deviceId,
          deviceLabel: params.deviceLabel,
          leaseExpiresAt: params.leaseExpiresAt,
        });

    return {
      ok: true,
      status: "active",
      activeLease,
    };
  } catch (error) {
    if (!isUniqueDeviceLeaseConflict(error)) {
      throw error;
    }

    const activeLease = await readActiveLease(params.authUserId, params.app, params.platform);
    if (activeLease) {
      if (activeLease.device_id !== params.deviceId) {
        return {
          ok: false,
          status: "conflict",
          activeLease,
          conflictLease: activeLease,
        };
      }

      return {
        ok: true,
        status: "active",
        activeLease: await updateLeaseAsActive(activeLease.id, params.deviceLabel, params.leaseExpiresAt),
      };
    }

    const existingLease = await readLeaseByDevice(
      params.authUserId,
      params.app,
      params.platform,
      params.deviceId
    );
    if (existingLease) {
      return {
        ok: true,
        status: "active",
        activeLease: await updateLeaseAsActive(existingLease.id, params.deviceLabel, params.leaseExpiresAt),
      };
    }

    throw error;
  }
}

export async function claimDeviceLease(params: {
  authUserId: string;
  app: AuthContext["app"];
  deviceId: string;
  deviceLabel?: string;
  platform: AuthContext["platform"];
  leaseMinutes?: number;
}): Promise<DeviceLeaseResult> {
  const leaseExpiresAt = leaseExpiryIso(params.leaseMinutes);
  const deviceId = normalizeDeviceId(params.deviceId);
  const deviceLabel = normalizeDeviceLabel(
    params.deviceLabel,
    `${params.app} ${params.platform} device`
  );
  await ensureDeviceLeaseSchema();

  const activeLease = await readActiveLease(params.authUserId, params.app, params.platform);
  if (activeLease && !isLeaseExpired(activeLease) && activeLease.device_id !== deviceId) {
    return {
      ok: false,
      status: "conflict",
      activeLease,
      conflictLease: activeLease,
    };
  }

  const existingLease = await readLeaseByDevice(params.authUserId, params.app, params.platform, deviceId);
  if (existingLease?.status === "active" && !isLeaseExpired(existingLease)) {
    return activateLeaseWithRecovery({
      authUserId: params.authUserId,
      app: params.app,
      deviceId,
      deviceLabel,
      existingLeaseId: existingLease.id,
      leaseExpiresAt,
      platform: params.platform,
    });
  }

  if (existingLease?.status === "active" && isLeaseExpired(existingLease)) {
    const env = await getAuthHubEnv();
    await env.auth_d1_binding
      .prepare(
        `
          UPDATE auth_device_leases
          SET status = 'expired', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
      )
      .bind(existingLease.id)
      .run();
  }

  return activateLeaseWithRecovery({
    authUserId: params.authUserId,
    app: params.app,
    deviceId,
    deviceLabel,
    existingLeaseId: existingLease?.id,
    leaseExpiresAt,
    platform: params.platform,
  });
}

export async function touchDeviceLease(params: {
  authUserId: string;
  app: AuthContext["app"];
  deviceId: string;
  deviceLabel?: string;
  platform: AuthContext["platform"];
  leaseMinutes?: number;
}): Promise<DeviceLeaseResult> {
  const leaseExpiresAt = leaseExpiryIso(params.leaseMinutes);
  const deviceId = normalizeDeviceId(params.deviceId);
  const deviceLabel = normalizeDeviceLabel(
    params.deviceLabel,
    `${params.app} ${params.platform} device`
  );
  await ensureDeviceLeaseSchema();

  const activeLease = await readActiveLease(params.authUserId, params.app, params.platform);
  if (!activeLease || isLeaseExpired(activeLease)) {
    if (activeLease) {
      const env = await getAuthHubEnv();
      await env.auth_d1_binding
        .prepare(
          `
            UPDATE auth_device_leases
            SET status = 'expired', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `
        )
        .bind(activeLease.id)
        .run();
    }

    const existingLease = await readLeaseByDevice(
      params.authUserId,
      params.app,
      params.platform,
      deviceId
    );

    if (existingLease?.status === "revoked") {
      return { ok: false, status: "missing", activeLease: null };
    }

    return activateLeaseWithRecovery({
      authUserId: params.authUserId,
      app: params.app,
      deviceId,
      deviceLabel,
      existingLeaseId: existingLease?.id,
      leaseExpiresAt,
      platform: params.platform,
    });
  }

  if (activeLease.device_id !== deviceId) {
    return { ok: false, status: "conflict", activeLease, conflictLease: activeLease };
  }

  return activateLeaseWithRecovery({
    authUserId: params.authUserId,
    app: params.app,
    deviceId,
    deviceLabel,
    existingLeaseId: activeLease.id,
    leaseExpiresAt,
    platform: params.platform,
  });
}

export async function revokeDeviceLease(params: {
  authUserId: string;
  deviceId: string;
}): Promise<DeviceLeaseRow | null> {
  await ensureDeviceLeaseSchema();
  const env = await getAuthHubEnv();
  const deviceId = normalizeDeviceId(params.deviceId);
  const row = await env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          auth_user_id,
          app,
          platform,
          device_id,
          device_label,
          status,
          lease_expires_at,
          last_seen_at,
          revoked_at,
          revoked_reason,
          created_at,
          updated_at
        FROM auth_device_leases
        WHERE auth_user_id = ?
          AND device_id = ?
          AND status = 'active'
        ORDER BY updated_at DESC
        LIMIT 1
      `
    )
    .bind(params.authUserId, deviceId)
    .first<DeviceLeaseRow>();

  if (!row) {
    return null;
  }

  await env.auth_d1_binding
    .prepare(
      `
        UPDATE auth_device_leases
        SET
          status = 'revoked',
          revoked_at = CURRENT_TIMESTAMP,
          revoked_reason = 'revoked by user',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
    )
    .bind(row.id)
    .run();

  const revoked = await env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          auth_user_id,
          app,
          platform,
          device_id,
          device_label,
          status,
          lease_expires_at,
          last_seen_at,
          revoked_at,
          revoked_reason,
          created_at,
          updated_at
        FROM auth_device_leases
        WHERE id = ?
        LIMIT 1
      `
    )
    .bind(row.id)
    .first<DeviceLeaseRow>();

  return revoked;
}

export async function revokeAllDeviceLeases(authUserId: string): Promise<DeviceLeaseRow[]> {
  await ensureDeviceLeaseSchema();
  const env = await getAuthHubEnv();
  const rows = await listActiveDeviceLeases(authUserId);

  if (!rows.length) {
    return [];
  }

  await env.auth_d1_binding
    .prepare(
      `
        UPDATE auth_device_leases
        SET
          status = 'revoked',
          revoked_at = CURRENT_TIMESTAMP,
          revoked_reason = 'revoked by user',
          updated_at = CURRENT_TIMESTAMP
        WHERE auth_user_id = ?
          AND status = 'active'
      `
    )
    .bind(authUserId)
    .run();

  return rows.map((row) => ({
    ...row,
    status: "revoked",
    revoked_at: new Date().toISOString(),
    revoked_reason: "revoked by user",
    updated_at: new Date().toISOString(),
  }));
}

export async function listActiveDeviceLeases(authUserId: string): Promise<DeviceLeaseRow[]> {
  await ensureDeviceLeaseSchema();
  const env = await getAuthHubEnv();
  const result = await ((env.auth_d1_binding
    .prepare(
      `
        SELECT
          id,
          auth_user_id,
          app,
          platform,
          device_id,
          device_label,
          status,
          lease_expires_at,
          last_seen_at,
          revoked_at,
          revoked_reason,
          created_at,
          updated_at
        FROM auth_device_leases
        WHERE auth_user_id = ?
          AND status = 'active'
        ORDER BY updated_at DESC
      `
    )
    .bind(authUserId)) as unknown as {
    all: <T = unknown>() => Promise<{ results?: T[] }>;
  }).all<DeviceLeaseRow>();

  return result.results ?? [];
}
