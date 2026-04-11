CREATE TABLE IF NOT EXISTS registration_requests (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('self_signup', 'manager_invite', 'user_invite')),
  target_app TEXT NOT NULL CHECK (target_app IN ('manager', 'user')),
  status TEXT NOT NULL CHECK (
    status IN (
      'pending_review',
      'approved_activation',
      'invited',
      'opened',
      'activated',
      'rejected',
      'expired',
      'revoked',
      'sync_failed'
    )
  ),
  email TEXT NOT NULL COLLATE NOCASE,
  full_name TEXT,
  editable_name INTEGER NOT NULL DEFAULT 1,
  phone TEXT,
  business_name TEXT,
  message TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  requested_platform TEXT,
  invited_by_auth_user_id TEXT,
  invited_by_staff_id TEXT,
  approved_by_auth_user_id TEXT,
  activation_token_hash TEXT,
  activation_expires_at TEXT,
  opened_at TEXT,
  approved_at TEXT,
  rejected_at TEXT,
  activated_at TEXT,
  rejection_reason TEXT,
  supabase_auth_user_id TEXT,
  supabase_record_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_activation_token_hash
  ON registration_requests (activation_token_hash)
  WHERE activation_token_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_active_email_kind
  ON registration_requests (email, kind)
  WHERE status IN ('pending_review', 'approved_activation', 'invited', 'opened');

CREATE INDEX IF NOT EXISTS idx_registration_status_created_at
  ON registration_requests (status, created_at);

CREATE INDEX IF NOT EXISTS idx_registration_target_app_status
  ON registration_requests (target_app, status, created_at);

CREATE TABLE IF NOT EXISTS registration_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_auth_user_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_registration_events_request_id
  ON registration_events (request_id, created_at);
