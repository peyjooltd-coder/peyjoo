import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

const db = new Database('data/divar.db')
const rows = db.prepare(`
  SELECT id, email, hex(email) as hex, password_hash
  FROM users
  WHERE id >= 9013 OR email LIKE '%gmail%' OR email LIKE '%yahoo%'
`).all()

for (const r of rows) {
  console.log('---')
  console.log('id', r.id)
  console.log('email', JSON.stringify(r.email))
  console.log('hex', r.hex)
  console.log('hashPrefix', r.password_hash?.slice(0, 7), 'len', r.password_hash?.length)
  // verify hash is parseable by comparing random
  try {
    bcrypt.compareSync('not-the-password', r.password_hash)
    console.log('hashParse', 'ok')
  } catch (e) {
    console.log('hashParse FAIL', e.message)
  }
}
