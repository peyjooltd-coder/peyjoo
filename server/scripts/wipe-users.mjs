import { initDatabase, getDb, closeDatabase } from '../src/db/database.js'

initDatabase()
const db = getDb()

db.exec('PRAGMA foreign_keys = OFF')

const statements = [
  'DELETE FROM chat_messages',
  'DELETE FROM chat_threads',
  'DELETE FROM pulse_matches',
  'DELETE FROM handshake_offers',
  'DELETE FROM want_signals',
  'DELETE FROM demand_pulse',
  'DELETE FROM search_alerts',
  'DELETE FROM compare_listings',
  'DELETE FROM saved_listings',
  'DELETE FROM dating_messages',
  'DELETE FROM dating_likes',
  'DELETE FROM dating_matches',
  'DELETE FROM dating_profiles',
  'DELETE FROM users',
]

for (const sql of statements) {
  try {
    db.exec(sql)
    console.log('ok', sql)
  } catch (err) {
    console.warn('skip', sql, '-', err.message)
  }
}

db.exec('PRAGMA foreign_keys = ON')

const n = db.prepare('SELECT COUNT(*) AS c FROM users').get()
console.log('users remaining:', n.c)
closeDatabase()
