import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { config } from '../config.js'
import { schema } from './schema.js'

let db

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  return db
}

export function initDatabase() {
  const dir = path.dirname(config.databasePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  db = new Database(config.databasePath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(schema)

  // Lightweight migrations for existing DBs
  const cols = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name)
  if (!cols.includes('phone')) {
    db.exec('ALTER TABLE users ADD COLUMN phone TEXT')
  }
  if (!cols.includes('contact_email')) {
    db.exec('ALTER TABLE users ADD COLUMN contact_email TEXT')
  }
  if (!cols.includes('email_verified')) {
    db.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0')
  }
  if (!cols.includes('exchange_trusted')) {
    db.exec('ALTER TABLE users ADD COLUMN exchange_trusted INTEGER DEFAULT 0')
  }

  // Bilingual listing content (EN / FA)
  const listingCols = db.prepare('PRAGMA table_info(listings)').all().map((c) => c.name)
  const bilingualListingCols = [
    ['title_en', 'TEXT'],
    ['title_fa', 'TEXT'],
    ['description_en', 'TEXT'],
    ['description_fa', 'TEXT'],
  ]
  for (const [name, type] of bilingualListingCols) {
    if (!listingCols.includes(name)) {
      db.exec(`ALTER TABLE listings ADD COLUMN ${name} ${type}`)
    }
  }
  // Backfill from legacy single-language title/description
  try {
    db.exec(`
      UPDATE listings
      SET title_fa = title
      WHERE (title_fa IS NULL OR TRIM(title_fa) = '')
        AND title IS NOT NULL
        AND title GLOB '*[آ-ی]*'
    `)
    db.exec(`
      UPDATE listings
      SET title_en = title
      WHERE (title_en IS NULL OR TRIM(title_en) = '')
        AND title IS NOT NULL
        AND title NOT GLOB '*[آ-ی]*'
    `)
    db.exec(`
      UPDATE listings
      SET description_fa = description
      WHERE (description_fa IS NULL OR TRIM(description_fa) = '')
        AND description IS NOT NULL AND TRIM(description) != ''
        AND description GLOB '*[آ-ی]*'
    `)
    db.exec(`
      UPDATE listings
      SET description_en = description
      WHERE (description_en IS NULL OR TRIM(description_en) = '')
        AND description IS NOT NULL AND TRIM(description) != ''
        AND description NOT GLOB '*[آ-ی]*'
    `)
  } catch {
    /* older SQLite GLOB quirks — ignore */
  }

  // Listing chat: peer user id so both buyer and seller get an inbox
  const chatCols = db.prepare('PRAGMA table_info(chat_threads)').all().map((c) => c.name)
  if (!chatCols.includes('other_user_id')) {
    db.exec('ALTER TABLE chat_threads ADD COLUMN other_user_id INTEGER')
  }
  if (!chatCols.includes('last_read_at')) {
    db.exec('ALTER TABLE chat_threads ADD COLUMN last_read_at TEXT')
  }
  db.prepare(`
    UPDATE chat_threads
    SET other_user_id = (
      SELECT listings.user_id FROM listings WHERE listings.id = chat_threads.listing_id
    )
    WHERE other_user_id IS NULL
      AND listing_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM listings WHERE listings.id = chat_threads.listing_id)
  `).run()

  // Legacy email/password accounts: treat real emails as verified contact emails
  db.prepare(`
    UPDATE users
    SET contact_email = email, email_verified = 1
    WHERE (contact_email IS NULL OR TRIM(contact_email) = '')
      AND email NOT LIKE '%@divar.phone'
      AND email LIKE '%@%'
  `).run()

  // Ensure Call works: backfill missing phones for seeded / phone-login users
  const phoneBackfill = db.prepare(`
    UPDATE users SET phone = ? WHERE id = ? AND (phone IS NULL OR TRIM(phone) = '')
  `)
  const withoutPhone = db.prepare(`
    SELECT id, email FROM users WHERE phone IS NULL OR TRIM(phone) = ''
  `).all()
  withoutPhone.forEach((u, i) => {
    const fromEmail = String(u.email || '').match(/^p(\d{8,15})@divar\.phone$/i)
    const phone = fromEmail ? fromEmail[1] : `604555${String(1000 + (u.id % 9000)).padStart(4, '0')}`
    phoneBackfill.run(phone, u.id)
  })

  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
