-- MedMed.AI — D1 Database Schema
-- Run via: wrangler d1 execute medmed-db --file=schema.sql --remote

-- ─── Users (consumer accounts) ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  password_hash TEXT NOT NULL,
  tier          TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'business')),
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  queries_today INTEGER NOT NULL DEFAULT 0,
  last_query_date TEXT,
  stripe_customer_id TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─── Sponsors (B2B advertiser accounts) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS sponsors (
  id               TEXT PRIMARY KEY,
  email            TEXT NOT NULL UNIQUE,
  name             TEXT,
  company_name     TEXT NOT NULL,
  package          TEXT NOT NULL DEFAULT 'Standard' CHECK (package IN ('Standard', 'Premium')),
  password_hash    TEXT NOT NULL,
  api_key          TEXT NOT NULL UNIQUE,
  is_active        INTEGER NOT NULL DEFAULT 0,
  is_on_waitlist   INTEGER NOT NULL DEFAULT 1,
  waitlist_position INTEGER,
  start_date       TEXT,
  end_date         TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sponsors_email ON sponsors(email);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON sponsors(is_active);

-- ─── Password Reset Tokens ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id    TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reset_token ON password_reset_tokens(token);

-- ─── Search History ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS search_history (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id      TEXT,
  query        TEXT NOT NULL,
  result_count INTEGER DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_search_user ON search_history(user_id);
