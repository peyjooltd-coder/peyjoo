import { getDb } from '../db/database.js'
import { mediaHasInlineData, persistMediaList, persistDataUrl } from './persistMedia.js'
import { mediaCoverUrl } from './media.js'

/** One-time (idempotent) extract of base64 media from SQLite into /uploads files. */
export function migrateInlineListingMedia() {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, image, images_json FROM listings
    WHERE images_json LIKE '%' || 'data:' || '%'
       OR image LIKE 'data:%'
  `).all()

  if (!rows.length) return { migrated: 0 }

  const update = db.prepare(`
    UPDATE listings
    SET image = @image, images_json = @images_json, updated_at = datetime('now')
    WHERE id = @id
  `)

  let migrated = 0
  const tx = db.transaction((list) => {
    for (const row of list) {
      if (!mediaHasInlineData(row.images_json) && !(row.image && String(row.image).startsWith('data:'))) {
        continue
      }
      const media = persistMediaList(row.images_json, { folder: 'listings', id: String(row.id) })
      let image = row.image || ''
      if (image && String(image).startsWith('data:')) {
        image = persistDataUrl(image, { folder: 'listings', basename: `${row.id}-cover` })
      }
      const cover = mediaCoverUrl(media) || image || ''
      update.run({
        id: row.id,
        image: cover,
        images_json: JSON.stringify(media),
      })
      migrated += 1
    }
  })

  tx(rows)
  if (migrated) console.log(`✓ Migrated inline media for ${migrated} listing(s) → uploads/`)
  return { migrated }
}
