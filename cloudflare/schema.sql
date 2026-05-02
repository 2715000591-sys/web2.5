CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  sidebar_controls_enabled INTEGER NOT NULL DEFAULT 1,
  blocked_topic_terms_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_ai_settings (
  user_id TEXT PRIMARY KEY,
  reply_ai_enabled INTEGER NOT NULL DEFAULT 0,
  provider_base_url TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  moderation_prompt TEXT NOT NULL DEFAULT '',
  api_key_ciphertext TEXT NOT NULL DEFAULT '',
  api_key_last4 TEXT NOT NULL DEFAULT '',
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

CREATE INDEX IF NOT EXISTS idx_auth_codes_email_expires_at
ON auth_codes(email, expires_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
ON sessions(user_id, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
ON sessions(expires_at DESC);

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
  created_at TEXT NOT NULL,
  event_fingerprint TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_sync_key_created_at
ON moderation_events(sync_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_user_id_created_at
ON moderation_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_event_type_created_at
ON moderation_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_user_id_event_type_created_at
ON moderation_events(user_id, event_type, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_event_fingerprint_unique
ON moderation_events(event_fingerprint)
WHERE event_fingerprint IS NOT NULL AND TRIM(event_fingerprint) != '';

CREATE TABLE IF NOT EXISTS timeline_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_key TEXT NOT NULL,
  user_id TEXT,
  device_id TEXT,
  timeline_kind TEXT NOT NULL DEFAULT '',
  page_url TEXT,
  status_id TEXT,
  author_handle TEXT,
  author_display_name TEXT,
  post_text TEXT,
  quote_text TEXT,
  link_title TEXT,
  media_mode TEXT NOT NULL DEFAULT 'text',
  text_sparse INTEGER NOT NULL DEFAULT 0,
  seen_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  post_fingerprint TEXT
);

CREATE INDEX IF NOT EXISTS idx_timeline_posts_user_seen_at
ON timeline_posts(user_id, seen_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_posts_sync_seen_at
ON timeline_posts(sync_key, seen_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_posts_device_seen_at
ON timeline_posts(device_id, seen_at DESC, id DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_timeline_posts_post_fingerprint_unique
ON timeline_posts(post_fingerprint)
WHERE post_fingerprint IS NOT NULL AND TRIM(post_fingerprint) != '';

CREATE TABLE IF NOT EXISTS timeline_ai_results (
  post_id INTEGER PRIMARY KEY,
  blocked INTEGER NOT NULL DEFAULT 0,
  matched_blocked_terms_json TEXT NOT NULL DEFAULT '[]',
  confidence TEXT NOT NULL DEFAULT 'low',
  reason_short TEXT NOT NULL DEFAULT '',
  limited_by_video INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'skipped',
  model TEXT NOT NULL DEFAULT '',
  raw_response_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_ai_results_status_updated_at
ON timeline_ai_results(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS reply_ai_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_key TEXT NOT NULL,
  user_id TEXT,
  device_id TEXT,
  thread_url TEXT,
  thread_status_id TEXT,
  reply_status_id TEXT,
  reply_handle TEXT,
  reply_display_name TEXT,
  reply_text TEXT,
  main_post_text TEXT,
  account_protected INTEGER NOT NULL DEFAULT 0,
  profile_path TEXT NOT NULL DEFAULT '',
  profile_bio_text TEXT NOT NULL DEFAULT '',
  profile_signal_tags_json TEXT NOT NULL DEFAULT '[]',
  profile_links_json TEXT NOT NULL DEFAULT '[]',
  profile_fetch_status TEXT NOT NULL DEFAULT 'not_requested',
  profile_fetched_at TEXT,
  created_at TEXT NOT NULL,
  item_fingerprint TEXT
);

CREATE INDEX IF NOT EXISTS idx_reply_ai_items_user_created_at
ON reply_ai_items(user_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_reply_ai_items_sync_created_at
ON reply_ai_items(sync_key, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_reply_ai_items_handle_created_at
ON reply_ai_items(reply_handle, created_at DESC, id DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reply_ai_items_fingerprint_unique
ON reply_ai_items(item_fingerprint)
WHERE item_fingerprint IS NOT NULL AND TRIM(item_fingerprint) != '';

CREATE TABLE IF NOT EXISTS reply_ai_results (
  item_id INTEGER PRIMARY KEY,
  action TEXT NOT NULL DEFAULT 'allow',
  decision_layer TEXT NOT NULL DEFAULT 'skipped',
  matched_safety_labels_json TEXT NOT NULL DEFAULT '[]',
  matched_profile_signals_json TEXT NOT NULL DEFAULT '[]',
  confidence TEXT NOT NULL DEFAULT 'low',
  reason_short TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'skipped',
  model TEXT NOT NULL DEFAULT '',
  raw_response_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reply_ai_results_status_updated_at
ON reply_ai_results(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS reply_ai_memory (
  id TEXT PRIMARY KEY,
  memory_key TEXT NOT NULL,
  memory_key_type TEXT NOT NULL DEFAULT 'exact_text',
  action TEXT NOT NULL DEFAULT 'hide',
  confidence TEXT NOT NULL DEFAULT 'high',
  matched_safety_labels_json TEXT NOT NULL DEFAULT '[]',
  matched_profile_signals_json TEXT NOT NULL DEFAULT '[]',
  reason_short TEXT NOT NULL DEFAULT '',
  prompt_version TEXT NOT NULL DEFAULT '',
  source_item_id INTEGER,
  source_result_updated_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  disabled_reason TEXT NOT NULL DEFAULT '',
  expires_at TEXT,
  hit_count INTEGER NOT NULL DEFAULT 0,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reply_ai_memory_key_version_unique
ON reply_ai_memory(memory_key, prompt_version);

CREATE INDEX IF NOT EXISTS idx_reply_ai_memory_status_expires
ON reply_ai_memory(status, expires_at, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_reply_ai_memory_source_item
ON reply_ai_memory(source_item_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS reply_ai_account_risk (
  reply_handle TEXT PRIMARY KEY,
  total_high_confidence_hide_count INTEGER NOT NULL DEFAULT 0,
  recent_high_confidence_hide_count INTEGER NOT NULL DEFAULT 0,
  active_global_block INTEGER NOT NULL DEFAULT 0,
  first_flagged_at TEXT,
  last_flagged_at TEXT,
  global_blocked_at TEXT,
  last_reason_short TEXT NOT NULL DEFAULT '',
  last_item_id INTEGER,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reply_ai_account_risk_global_block
ON reply_ai_account_risk(active_global_block, updated_at DESC);

CREATE TABLE IF NOT EXISTS reply_ai_provider_cooldowns (
  scope_key TEXT PRIMARY KEY,
  user_id TEXT,
  provider_base_url TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  failure_count INTEGER NOT NULL DEFAULT 0,
  cooldown_until TEXT,
  last_failure_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reply_ai_provider_cooldowns_updated_at
ON reply_ai_provider_cooldowns(updated_at DESC);

CREATE TABLE IF NOT EXISTS ai_provider_cooldowns (
  scope_key TEXT PRIMARY KEY,
  user_id TEXT,
  provider_base_url TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  failure_count INTEGER NOT NULL DEFAULT 0,
  cooldown_until TEXT,
  last_failure_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_provider_cooldowns_updated_at
ON ai_provider_cooldowns(updated_at DESC);

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

CREATE TABLE IF NOT EXISTS moderation_samples (
  id TEXT PRIMARY KEY,
  sample_fingerprint TEXT,
  source_kind TEXT NOT NULL DEFAULT 'moderation_event',
  source_ref_id TEXT NOT NULL DEFAULT '',
  user_id TEXT,
  sync_key TEXT,
  device_id TEXT,
  contribution_scope TEXT NOT NULL DEFAULT 'private',
  surface TEXT NOT NULL DEFAULT 'reply',
  content_url TEXT,
  thread_status_id TEXT,
  reply_status_id TEXT,
  author_handle TEXT,
  author_display_name TEXT,
  primary_text TEXT,
  context_text TEXT,
  normalized_text TEXT,
  compact_text TEXT,
  account_protected INTEGER NOT NULL DEFAULT 0,
  feature_keys_json TEXT NOT NULL DEFAULT '[]',
  safety_labels_json TEXT NOT NULL DEFAULT '[]',
  quality_status TEXT NOT NULL DEFAULT 'pending',
  sample_weight INTEGER NOT NULL DEFAULT 1,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_moderation_samples_fingerprint_unique
ON moderation_samples(sample_fingerprint)
WHERE sample_fingerprint IS NOT NULL AND TRIM(sample_fingerprint) != '';

CREATE INDEX IF NOT EXISTS idx_moderation_samples_scope_status_updated_at
ON moderation_samples(contribution_scope, quality_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_samples_source
ON moderation_samples(source_kind, source_ref_id);

CREATE INDEX IF NOT EXISTS idx_moderation_samples_user_updated_at
ON moderation_samples(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS moderation_sample_labels (
  id TEXT PRIMARY KEY,
  sample_id TEXT NOT NULL,
  label_source TEXT NOT NULL DEFAULT 'user_feedback',
  reviewer_user_id TEXT,
  reviewer_sync_key TEXT,
  decision TEXT NOT NULL DEFAULT 'unknown',
  safety_labels_json TEXT NOT NULL DEFAULT '[]',
  reason_short TEXT NOT NULL DEFAULT '',
  confidence TEXT NOT NULL DEFAULT 'low',
  trust_weight INTEGER NOT NULL DEFAULT 1,
  model TEXT NOT NULL DEFAULT '',
  raw_response_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_moderation_sample_labels_sample_created_at
ON moderation_sample_labels(sample_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_sample_labels_decision_created_at
ON moderation_sample_labels(decision, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_sample_labels_reviewer_created_at
ON moderation_sample_labels(reviewer_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS moderation_rule_candidates (
  id TEXT PRIMARY KEY,
  rule_type TEXT NOT NULL,
  pattern_key TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'hide',
  safety_label TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  positive_label_count INTEGER NOT NULL DEFAULT 0,
  negative_label_count INTEGER NOT NULL DEFAULT 0,
  distinct_user_count INTEGER NOT NULL DEFAULT 0,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'candidate',
  source_sample_id TEXT,
  promoted_decision_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  promoted_at TEXT,
  revoked_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_moderation_rule_candidates_type_key_unique
ON moderation_rule_candidates(rule_type, pattern_key);

CREATE INDEX IF NOT EXISTS idx_moderation_rule_candidates_status_score
ON moderation_rule_candidates(status, confidence_score DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_rule_candidates_sample
ON moderation_rule_candidates(source_sample_id, updated_at DESC);
