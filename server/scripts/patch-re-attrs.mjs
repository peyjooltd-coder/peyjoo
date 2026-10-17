import { initDatabase, getDb, closeDatabase } from '../src/db/database.js'

initDatabase()
const db = getDb()
const rows = db.prepare(`SELECT id, title, attributes_json, lat, lng FROM listings WHERE category = 'real-estate'`).all()
const update = db.prepare(`UPDATE listings SET attributes_json = ?, lat = ?, lng = ? WHERE id = ?`)

const patches = {
  'کوآل هاربر': {
    lat: 49.2897,
    lng: -123.1165,
    extra: {
      realEstatePropertyType: 'apartment',
      deposit: 4400,
      convertible: true,
      photosAuthentic: true,
      buildingYear: 1400,
      cooling: 'split',
      flooring: 'laminate',
    },
  },
  'مترون': {
    lat: 49.2257,
    lng: -123.0036,
    extra: { realEstatePropertyType: 'apartment', deposit: 3700, photosAuthentic: true },
  },
  'یوبی‌سی': {
    lat: 49.2606,
    lng: -123.246,
    extra: { realEstatePropertyType: 'house-villa', photosAuthentic: true },
  },
  'داون‌تاون': {
    lat: 49.2827,
    lng: -123.1207,
    extra: { realEstatePropertyType: 'shop', photosAuthentic: true },
  },
}

let n = 0
for (const row of rows) {
  let attrs = {}
  try { attrs = JSON.parse(row.attributes_json || '{}') } catch { attrs = {} }
  const key = Object.keys(patches).find((k) => String(row.title || '').includes(k))
  const patch = key ? patches[key] : { lat: 49.2827, lng: -123.1207, extra: { realEstatePropertyType: attrs.realEstatePropertyType || 'apartment', photosAuthentic: true } }
  const next = { ...attrs, ...patch.extra }
  if (!next.realEstateSubcategory) next.realEstateSubcategory = 'rent-residential'
  update.run(JSON.stringify(next), patch.lat, patch.lng, row.id)
  n += 1
  console.log('patched', row.id, row.title.slice(0, 40))
}
console.log('done', n)
closeDatabase()
