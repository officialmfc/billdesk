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
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_device_leases_active_slot
  ON auth_device_leases (auth_user_id, app, platform)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_auth_device_leases_auth_user_id_updated_at
  ON auth_device_leases (auth_user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_device_leases_device_id
  ON auth_device_leases (device_id, updated_at DESC);
