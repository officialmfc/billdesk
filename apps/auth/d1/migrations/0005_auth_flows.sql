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
);

CREATE INDEX IF NOT EXISTS idx_auth_flows_status_expires_at
  ON auth_flows (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_auth_flows_app_platform_created_at
  ON auth_flows (app, platform, created_at DESC);
