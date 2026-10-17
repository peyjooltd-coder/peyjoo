import bcrypt from 'bcryptjs'
import { config } from '../config.js'
import { initDatabase, getDb, closeDatabase } from './database.js'
import * as data from './persianSeedData.js'

async function main() {
  initDatabase()
  const db = getDb()
  const passwordHash = bcrypt.hashSync(data.DEMO_PASSWORD, 10)

  db.exec('DELETE FROM chat_messages; DELETE FROM chat_threads; DELETE FROM pulse_matches;')
  db.exec('DELETE FROM handshake_offers; DELETE FROM want_signals; DELETE FROM demand_pulse;')
  db.exec('DELETE FROM search_alerts; DELETE FROM compare_listings; DELETE FROM saved_listings;')
  db.exec('DELETE FROM listings; DELETE FROM users;')

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, name, avatar, city, phone, verified, pro_tier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const mainRow = insertUser.run(
    data.mainUser.email,
    passwordHash,
    data.mainUser.name,
    data.mainUser.avatar,
    data.mainUser.city,
    data.mainUser.phone,
    data.mainUser.verified,
    data.mainUser.pro_tier
  )
  const mainUserId = mainRow.lastInsertRowid

  // No phone-login twin / demo OTP account — phone auth creates real accounts only.

  const sellerIds = data.sellers.map((s, i) => {
    const phone = s.phone || `604555${String(1100 + i).padStart(4, '0')}`
    const r = insertUser.run(
      s.email,
      passwordHash,
      s.name,
      s.avatar,
      s.city,
      phone,
      s.verified ?? 1,
      s.pro_tier ?? null
    )
    return r.lastInsertRowid
  })

  const insertListing = db.prepare(`
    INSERT INTO listings (
      user_id, title, category, price, price_label, city, neighborhood, image, images_json,
      description, condition, seller_name, seller_avatar, seller_verified, seller_rating,
      seller_reviews, is_pro, is_mine, status, badges_json, features_json, attributes_json,
      views, saves, lat, lng, time_label
    ) VALUES (
      @user_id, @title, @category, @price, @price_label, @city, @neighborhood, @image, @images_json,
      @description, @condition, @seller_name, @seller_avatar, @seller_verified, @seller_rating,
      @seller_reviews, @is_pro, @is_mine, @status, @badges_json, @features_json, @attributes_json,
      @views, @saves, @lat, @lng, @time_label
    )
  `)

  const listingIdMap = {}
  data.listings.forEach((l, idx) => {
    const sellerIdx = l.seller ?? 0
    const sellerUserId = sellerIds[sellerIdx] ?? sellerIds[0]
    const sellerMeta = data.sellers[sellerIdx]
    const isMine = idx % 7 === 0 || idx === 2 || idx === 9

    const r = insertListing.run({
      user_id: isMine ? mainUserId : sellerUserId,
      title: l.title,
      category: l.category,
      price: l.price,
      price_label: l.priceLabel,
      city: l.city,
      neighborhood: l.neighborhood,
      image: l.image,
      images_json: JSON.stringify([l.image]),
      description: l.description,
      condition: l.condition,
      seller_name: isMine ? data.mainUser.name : sellerMeta.name,
      seller_avatar: isMine ? data.mainUser.avatar : sellerMeta.avatar,
      seller_verified: sellerMeta?.verified ? 1 : 0,
      seller_rating: 4.7 + (idx % 3) * 0.1,
      seller_reviews: 12 + idx * 3,
      is_pro: l.isPro ? 1 : 0,
      is_mine: isMine ? 1 : 0,
      status: 'active',
      badges_json: JSON.stringify(l.badges || []),
      features_json: JSON.stringify(l.features || []),
      attributes_json: JSON.stringify(l.attributes || {}),
      views: l.views ?? 100,
      saves: l.saves ?? 5,
      lat: l.lat ?? null,
      lng: l.lng ?? null,
      time_label: l.time,
    })
    listingIdMap[idx + 1] = r.lastInsertRowid
  })

  const save = db.prepare('INSERT INTO saved_listings (user_id, listing_id) VALUES (?, ?)')
  ;[1, 2, 3, 7, 15].forEach((i) => {
    if (listingIdMap[i]) save.run(mainUserId, listingIdMap[i])
  })

  const insertWant = db.prepare(`
    INSERT INTO want_signals (id, user_id, title, category, budget, region, radius, urgency, seekers, matches, posted, avatar, verified)
    VALUES (@id, @user_id, @title, @category, @budget, @region, @radius, @urgency, @seekers, @matches, @posted, @avatar, @verified)
  `)
  for (const w of data.wantSignals) {
    insertWant.run({ ...w, user_id: mainUserId, verified: w.verified ? 1 : 0 })
  }

  const insertPulse = db.prepare(`
    INSERT INTO demand_pulse (area, category, intensity, seekers, trend, hot) VALUES (?, ?, ?, ?, ?, ?)
  `)
  for (const d of data.demandPulse) {
    insertPulse.run(d.area, d.category, d.intensity, d.seekers, d.trend, d.hot ? 1 : 0)
  }

  const insertThread = db.prepare(`
    INSERT INTO chat_threads (id, user_id, listing_id, listing_title, listing_image, listing_category, other_name, other_avatar, unread, updated_label)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertMsg = db.prepare(`
    INSERT INTO chat_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)
  `)

  for (const t of data.buildChatThreads(listingIdMap, mainUserId)) {
    insertThread.run(
      t.id, mainUserId, t.listingId, t.listingTitle, t.listingImage,
      t.listingCategory, t.otherName, t.otherAvatar, t.unread, t.updated
    )
    t.messages.forEach((m, i) => {
      insertMsg.run(`${t.id}-${m.id || i}`, t.id, m.from, m.text, m.time)
    })
  }

  db.prepare('INSERT INTO search_alerts (user_id, query, region, active) VALUES (?, ?, ?, 1)').run(mainUserId, 'آپارتمان اجاره ونکوور', 'ونکوور')
  db.prepare('INSERT INTO search_alerts (user_id, query, region, active) VALUES (?, ?, ?, 1)').run(mainUserId, 'خانه ویلایی برنابی', 'برنابی')

  console.log('✓ پایگاه داده با داده‌های فارسی پر شد')
  console.log(`  ورود ایمیل: ${data.mainUser.email} / ${data.DEMO_PASSWORD}`)
  console.log(`  ورود موبایل: ${data.mainUser.phone} — کد تأیید: ${data.OTP_CODE}`)
  console.log(`  آگهی‌ها: ${data.listings.length} · گفتگوها: ${data.buildChatThreads(listingIdMap, mainUserId).length}`)
  closeDatabase()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
