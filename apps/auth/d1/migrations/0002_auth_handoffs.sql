CREATE TABLE IF NOT EXISTS auth_handoffs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('created', 'exchanged', 'expired', 'revoked')),
  app TEXT NOT NULL CHECK (app IN ('manager', 'admin', 'user')),
  platform TEXT NOT NULL CHECK (platform IN ('web', 'desktop', 'mobile')),
  next_path TEXT,
  return_to TEXT,
  auth_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  exchanged_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_handoffs_status_expires_at
  ON auth_handoffs (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_auth_handoffs_auth_user_id_created_at
  ON auth_handoffs (auth_user_id, created_at DESC);

