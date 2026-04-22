CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_auth_codes_email_created_at
ON auth_codes(email, created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
ON sessions(user_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS sync_keys (
  sync_key TEXT PRIMARY KEY,
  user_id TEXT,
  device_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_keys_user_id
ON sync_keys(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS moderation_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_key TEXT NOT NULL,
  user_id TEXT,
  device_id TEXT,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'extension',
  thread_url TEXT,
  thread_status_id TEXT,
  reply_status_id TEXT,
  reply_handle TEXT,
  reply_display_name TEXT,
  reply_text TEXT,
  normalized_text TEXT,
  compact_text TEXT,
  account_protected INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_sync_key_created_at
ON moderation_events(sync_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_user_id_created_at
ON moderation_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_event_type_created_at
ON moderation_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_user_id_event_type_created_at
ON moderation_events(user_id, event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS developer_global_decisions (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  event_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  sync_key TEXT NOT NULL,
  thread_url TEXT,
  thread_status_id TEXT,
  reply_status_id TEXT,
  reply_handle TEXT,
  reply_display_name TEXT,
  reply_text TEXT,
  normalized_text TEXT,
  compact_text TEXT,
  confirm_count INTEGER NOT NULL DEFAULT 1,
  revoke_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  last_confirmed_at TEXT NOT NULL,
  revoked_at TEXT,
  revoked_by_user_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_developer_decisions_user_id_last_confirmed_at
ON developer_global_decisions(user_id, last_confirmed_at DESC);

CREATE INDEX IF NOT EXISTS idx_developer_decisions_revoked_at_last_confirmed_at
ON developer_global_decisions(revoked_at, last_confirmed_at DESC);

CREATE TABLE IF NOT EXISTS developer_pending_reviews (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  sync_key TEXT NOT NULL,
  thread_url TEXT,
  thread_status_id TEXT,
  reply_status_id TEXT,
  reply_handle TEXT,
  reply_display_name TEXT,
  reply_text TEXT,
  normalized_text TEXT,
  compact_text TEXT,
  review_type TEXT NOT NULL DEFAULT 'not_garbage',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (user_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_developer_pending_reviews_user_id_updated_at
ON developer_pending_reviews(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_developer_pending_reviews_review_type_updated_at
ON developer_pending_reviews(review_type, updated_at DESC);

CREATE TABLE IF NOT EXISTS global_rule_cache (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_event_id INTEGER NOT NULL DEFAULT 0,
  decision_signature TEXT NOT NULL DEFAULT '',
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
