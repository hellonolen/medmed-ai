-- MedMed.AI — Full Schema v2
-- Run via: wrangler d1 execute medmed-db --file=schema.sql --remote

-- ─── Magic Links (passwordless auth) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS magic_links (
  token       TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  expires_at  INTEGER NOT NULL,
  used        INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_magic_links_user ON magic_links(user_id);


-- ─── Users ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,
  email             TEXT UNIQUE NOT NULL,
  name              TEXT,
  password_hash     TEXT NOT NULL,
  tier              TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'max', 'team', 'enterprise')),
  role              TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  queries_today     INTEGER NOT NULL DEFAULT 0,
  last_query_date   TEXT,
  trial_expires_at  TEXT,
  plan_expires_at   TEXT,
  referral_code     TEXT UNIQUE,
  referred_by       TEXT,
  whop_member_id    TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_code);

-- ─── Health Profile (user memory) ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS health_profiles (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id           TEXT NOT NULL UNIQUE,
  age               INTEGER,
  sex               TEXT,
  weight_lbs        INTEGER,
  height_in         INTEGER,
  conditions        TEXT DEFAULT '[]',   -- JSON array of strings
  allergies         TEXT DEFAULT '[]',   -- JSON array of strings
  current_meds      TEXT DEFAULT '[]',   -- JSON array of strings
  notes             TEXT,
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_health_user ON health_profiles(user_id);

-- ─── Medication Tracker ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medications (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL,
  name        TEXT NOT NULL,
  dosage      TEXT,
  frequency   TEXT,
  time_of_day TEXT,  -- morning | afternoon | evening | bedtime
  notes       TEXT,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_med_user ON medications(user_id);

-- ─── Medication Logs ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medication_logs (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id       TEXT NOT NULL,
  medication_id TEXT NOT NULL,
  taken_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (medication_id) REFERENCES medications(id)
);

CREATE INDEX IF NOT EXISTS idx_medlog_user ON medication_logs(user_id, taken_at);

-- ─── Conversations ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL,
  title       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations(user_id, updated_at);

-- ─── Messages ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  conversation_id TEXT NOT NULL,
  user_id         TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, created_at);

-- ─── Symptom Journal ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS symptom_logs (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL,
  symptoms    TEXT NOT NULL,   -- JSON array of symptom strings
  severity    INTEGER CHECK (severity BETWEEN 1 AND 10),
  notes       TEXT,
  logged_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_symptom_user ON symptom_logs(user_id, logged_at);

-- ─── Referrals ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS referrals (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  referrer_id    TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  referred_id    TEXT,
  converted      INTEGER NOT NULL DEFAULT 0,
  bonus_days     INTEGER NOT NULL DEFAULT 30,
  granted_at     TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (referrer_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referrals(referrer_id);

-- ─── Media Captures ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS media_captures (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('image', 'video')),
  r2_key      TEXT NOT NULL,
  analysis    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_media_user ON media_captures(user_id);

-- ─── Password Reset ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reset_token ON password_reset_tokens(token);

-- ─── Sponsors ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sponsors (
  id                TEXT PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE,
  name              TEXT,
  company_name      TEXT NOT NULL,
  package           TEXT NOT NULL DEFAULT 'Standard' CHECK (package IN ('Standard', 'Premium')),
  password_hash     TEXT NOT NULL,
  api_key           TEXT NOT NULL UNIQUE,
  is_active         INTEGER NOT NULL DEFAULT 0,
  is_on_waitlist    INTEGER NOT NULL DEFAULT 1,
  waitlist_position INTEGER,
  start_date        TEXT,
  end_date          TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sponsors_email ON sponsors(email);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON sponsors(is_active);

-- ─── Search History ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS search_history (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id      TEXT,
  query        TEXT NOT NULL,
  result_count INTEGER DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_search_user ON search_history(user_id);

-- ─── Global stats (for live counter) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS global_stats (
  key   TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO global_stats (key, value) VALUES ('total_questions', 0);
INSERT OR IGNORE INTO global_stats (key, value) VALUES ('total_users', 0);
