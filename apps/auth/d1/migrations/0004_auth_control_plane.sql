CREATE TABLE IF NOT EXISTS auth_account_directory (
  id TEXT PRIMARY KEY,
  auth_user_id TEXT,
  email TEXT NOT NULL,
  app TEXT NOT NULL CHECK (app IN ('manager', 'admin', 'user')),
  platform TEXT,
  role TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN (
      'pending_review',
      'invited',
      'approved_activation',
      'active',
      'blocked',
      'revoked'
    )
  ),
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
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_account_directory_email_app
  ON auth_account_directory (email, app);

CREATE INDEX IF NOT EXISTS idx_auth_account_directory_auth_user_id
  ON auth_account_directory (auth_user_id);

CREATE INDEX IF NOT EXISTS idx_auth_account_directory_status
  ON auth_account_directory (status, app);

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
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_events_email_created_at
  ON auth_audit_events (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_audit_events_auth_user_id_created_at
  ON auth_audit_events (auth_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_audit_events_event_type_created_at
  ON auth_audit_events (event_type, created_at DESC);
