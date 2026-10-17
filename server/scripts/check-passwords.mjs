import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'data/divar.db'))

const users = db.prepare(`
  SELECT id, email, password_hash, length(password_hash) as len
  FROM users ORDER BY id DESC LIMIT 25
`).all()

for (const u of users) {
  const bcryptOk = typeof u.password_hash === 'string' && u.password_hash.startsWith('$2')
  console.log({
    id: u.id,
    email: u.email,
    len: u.len,
    kind: bcryptOk ? 'bcrypt' : `other:${u.password_hash}`,
  })
}

const demo = db.prepare(`SELECT email, password_hash FROM users WHERE email LIKE '%@%' LIMIT 5`).all()
for (const u of demo) {
  if (u.password_hash?.startsWith('$2')) {
    console.log('demo12345?', u.email, bcrypt.compareSync('12345', u.password_hash))
  }
}
