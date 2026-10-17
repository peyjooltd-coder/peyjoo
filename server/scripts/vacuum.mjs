import Database from 'better-sqlite3'
import fs from 'fs'

const db = new Database('./data/divar.db')
db.pragma('wal_checkpoint(TRUNCATE)')
db.exec('VACUUM')
const top = db.prepare(`
  SELECT id, status, length(images_json) AS n
  FROM listings
  ORDER BY n DESC
  LIMIT 10
`).all()
console.log('top listings by images_json', top)
db.close()
console.log('DB MB', (fs.statSync('./data/divar.db').size / 1024 / 1024).toFixed(2))
for (const f of ['divar.db', 'divar.db-wal', 'divar.db-shm']) {
  if (fs.existsSync(`./data/${f}`)) {
    console.log(f, (fs.statSync(`./data/${f}`).size / 1024 / 1024).toFixed(2), 'MB')
  }
}
