import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../data/divar.db')
const logo = '/logo.jpeg?v=6'

const db = new Database(dbPath)
db.pragma('foreign_keys = OFF')

for (const [table, col] of [
  ['users', 'avatar'],
  ['listings', 'seller_avatar'],
]) {
  try {
    const r = db.prepare(`
      UPDATE ${table}
      SET ${col} = ?
      WHERE ${col} IS NULL OR ${col} = '' OR ${col} LIKE '%pravatar%'
    `).run(logo)
    console.log(table, r.changes)
  } catch (e) {
    console.log(table, e.message)
  }
}

for (const [table, col] of [
  ['dating_profiles', 'avatar'],
  ['dating_threads', 'other_avatar'],
  ['chat_threads', 'other_avatar'],
]) {
  try {
    const r = db.prepare(`
      UPDATE ${table}
      SET ${col} = ?
      WHERE ${col} IS NULL OR ${col} = '' OR ${col} LIKE '%pravatar%'
    `).run(logo)
    console.log(table, r.changes)
  } catch (e) {
    console.log(table, e.message)
  }
}

db.close()
console.log('done')
