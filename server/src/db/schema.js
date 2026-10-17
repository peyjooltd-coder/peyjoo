export const schema = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  city TEXT DEFAULT 'Vancouver',
  phone TEXT,
  verified INTEGER DEFAULT 1,
  pro_tier TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL DEFAULT 0,
  price_label TEXT,
  city TEXT NOT NULL,
  neighborhood TEXT,
  image TEXT,
  images_json TEXT DEFAULT '[]',
  description TEXT,
  condition TEXT,
  seller_name TEXT,
  seller_avatar TEXT,
  seller_verified INTEGER DEFAULT 0,
  seller_rating REAL DEFAULT 5,
  seller_reviews INTEGER DEFAULT 0,
  is_pro INTEGER DEFAULT 0,
  is_mine INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  badges_json TEXT DEFAULT '[]',
  features_json TEXT DEFAULT '[]',
  attributes_json TEXT DEFAULT '{}',
  views INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  lat REAL,
  lng REAL,
  time_label TEXT DEFAULT 'Just now',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

CREATE TABLE IF NOT EXISTS saved_listings (
  user_id INTEGER NOT NULL,
  listing_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, listing_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS compare_listings (
  user_id INTEGER NOT NULL,
  listing_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, listing_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS want_signals (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  budget TEXT,
  region TEXT,
  radius TEXT,
  urgency TEXT,
  seekers INTEGER DEFAULT 1,
  matches INTEGER DEFAULT 0,
  posted TEXT,
  avatar TEXT,
  verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS handshake_offers (
  id TEXT PRIMARY KEY,
  listing_id INTEGER,
  user_id INTEGER,
  listing_title TEXT,
  listing_image TEXT,
  from_name TEXT,
  to_name TEXT,
  offer_price REAL,
  counter_price REAL,
  meet_point TEXT,
  time_slot TEXT,
  conditions_json TEXT DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  expires TEXT,
  created_label TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chat_threads (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  other_user_id INTEGER,
  listing_id INTEGER NOT NULL,
  listing_title TEXT,
  listing_image TEXT,
  listing_category TEXT,
  other_name TEXT,
  other_avatar TEXT,
  unread INTEGER DEFAULT 0,
  last_read_at TEXT,
  updated_label TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (other_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  from_side TEXT NOT NULL CHECK (from_side IN ('me', 'them')),
  text TEXT NOT NULL,
  time_label TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  query TEXT NOT NULL,
  region TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS demand_pulse (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area TEXT NOT NULL,
  category TEXT NOT NULL,
  intensity INTEGER,
  seekers INTEGER,
  trend TEXT,
  hot INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pulse_matches (
  id TEXT PRIMARY KEY,
  want_id TEXT NOT NULL,
  listing_id INTEGER NOT NULL,
  score INTEGER,
  reasons_json TEXT DEFAULT '[]',
  status TEXT DEFAULT 'new',
  FOREIGN KEY (want_id) REFERENCES want_signals(id),
  FOREIGN KEY (listing_id) REFERENCES listings(id)
);

CREATE TABLE IF NOT EXISTS listing_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  details TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(listing_id, user_id),
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_listing_reports_listing ON listing_reports(listing_id);

CREATE TABLE IF NOT EXISTS dating_profiles (
  user_id INTEGER PRIMARY KEY,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  age INTEGER,
  gender TEXT,
  looking_for TEXT,
  avatar TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  interests_json TEXT DEFAULT '[]',
  active INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`
