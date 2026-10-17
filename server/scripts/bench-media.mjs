import fs from 'fs'
import { initDatabase, closeDatabase, getDb } from '../src/db/database.js'
import { migrateInlineListingMedia } from '../src/utils/migrateInlineMedia.js'
import { rowToListing } from '../src/utils/mappers.js'

initDatabase()
const before = fs.statSync('./data/divar.db').size
console.log('DB size before MB', (before / 1024 / 1024).toFixed(2))
const r = migrateInlineListingMedia()
console.log('migrated', r)
const after = fs.statSync('./data/divar.db').size
console.log('DB size after MB', (after / 1024 / 1024).toFixed(2))

const rows = getDb().prepare(`
  SELECT l.* FROM listings l
  WHERE status NOT IN ('deleted', 'hidden') AND category != 'dating-dm'
`).all()

const cards = JSON.stringify({ listings: rows.map((row) => rowToListing(row, { mode: 'card' })) })
const full = JSON.stringify({ listings: rows.map((row) => rowToListing(row, { mode: 'full' })) })
console.log('card payload MB', (Buffer.byteLength(cards) / 1024 / 1024).toFixed(3))
console.log('full payload MB', (Buffer.byteLength(full) / 1024 / 1024).toFixed(3))
console.log('listings', rows.length)

const uploads = './data/uploads'
if (fs.existsSync(uploads)) {
  let bytes = 0
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = `${dir}/${name}`
      const st = fs.statSync(p)
      if (st.isDirectory()) walk(p)
      else bytes += st.size
    }
  }
  walk(uploads)
  console.log('uploads MB', (bytes / 1024 / 1024).toFixed(2))
}

closeDatabase()
