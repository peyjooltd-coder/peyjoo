import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'data', 'divar.db')
const db = new Database(dbPath)

const phone = '6040000000'
const email = `p${phone}@divar.phone`
const name = 'Test Account'
const avatar = '/logo.jpeg?v=5'
const hash = bcrypt.hashSync('google-play-review', 10)

const existing = db.prepare('SELECT id, name, phone FROM users WHERE phone = ? OR email = ?').get(phone, email)
if (existing) {
  db.prepare('UPDATE users SET name = ?, phone = ?, email = ?, verified = 1, city = ? WHERE id = ?')
    .run(name, phone, email, 'Vancouver', existing.id)
  console.log('updated', existing.id)
} else {
  const info = db.prepare(`
    INSERT INTO users (email, password_hash, name, avatar, city, phone, verified, pro_tier)
    VALUES (?, ?, ?, ?, ?, ?, 1, NULL)
  `).run(email, hash, name, avatar, 'Vancouver', phone)
  console.log('created', info.lastInsertRowid)
}

const row = db.prepare('SELECT id, name, phone, email, verified, city FROM users WHERE phone = ?').get(phone)
console.log(JSON.stringify(row, null, 2))
db.close()
