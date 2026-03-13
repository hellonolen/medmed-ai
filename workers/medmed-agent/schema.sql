CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  queries_today INTEGER NOT NULL DEFAULT 0,
  last_query_date TEXT,
  stripe_customer_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS search_history (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  query TEXT NOT NULL,
  result_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_search_user ON search_history(user_id);
