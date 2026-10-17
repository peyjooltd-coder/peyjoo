import { initDatabase, getDb, closeDatabase } from '../src/db/database.js'
import { mediaHasInlineData, persistMediaList, persistDataUrl } from '../src/utils/persistMedia.js'
import { mediaCoverUrl } from '../src/utils/media.js'

initDatabase()
const db = getDb()
const rows = db.prepare(`
  SELECT id, image, images_json FROM listings
  WHERE images_json LIKE '%' || 'data:' || '%' OR image LIKE 'data:%'
`).all()
console.log('matched', rows.length, rows.map((r) => r.id))

for (const row of rows) {
  console.log('id', row.id, 'hasInline', mediaHasInlineData(row.images_json), 'imgData', String(row.image || '').startsWith('data:'), 'len', row.images_json?.length)
}

const update = db.prepare(`
  UPDATE listings
  SET image = @image, images_json = @images_json, updated_at = datetime('now')
  WHERE id = @id
`)

let migrated = 0
for (const row of rows) {
  if (!mediaHasInlineData(row.images_json) && !(row.image && String(row.image).startsWith('data:'))) continue
  const media = persistMediaList(row.images_json, { folder: 'listings', id: String(row.id) })
  let image = row.image || ''
  if (image && String(image).startsWith('data:')) {
    image = persistDataUrl(image, { folder: 'listings', basename: `${row.id}-cover` })
  }
  const cover = mediaCoverUrl(media) || image || ''
  update.run({ id: row.id, image: cover, images_json: JSON.stringify(media) })
  migrated += 1
  console.log('migrated listing', row.id, 'cover', cover.slice(0, 60))
}
console.log('done', migrated)
closeDatabase()
