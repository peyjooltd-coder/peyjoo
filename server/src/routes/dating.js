import { Router } from 'express'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { getDb } from '../db/database.js'
import { config } from '../config.js'
import { authRequired, optionalAuth } from '../middleware/auth.js'
import { PEJO_DEFAULT_AVATAR, resolveUserAvatar } from '../utils/defaultAvatar.js'

const router = Router()

const VAN_LAT = 49.2827
const VAN_LNG = -123.1207
const DEFAULT_RADIUS_KM = 5
const ONLINE_WINDOW_MS = 5 * 60 * 1000

function newId(prefix) {
  return `${prefix}${Date.now().toString(36)}${randomBytes(3).toString('hex')}`
}

function timeLabelNow() {
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

function ensureTable() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS dating_profiles (
      user_id INTEGER PRIMARY KEY,
      display_name TEXT NOT NULL,
      bio TEXT DEFAULT '',
      age INTEGER,
      gender TEXT,
      looking_for TEXT,
      avatar TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      interests_json TEXT DEFAULT '[]',
      active INTEGER DEFAULT 1,
      last_seen_at TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dating_blocks (
      user_id INTEGER NOT NULL,
      blocked_user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, blocked_user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dating_threads (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      other_user_id INTEGER NOT NULL,
      other_name TEXT,
      other_avatar TEXT,
      unread INTEGER DEFAULT 0,
      updated_label TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, other_user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (other_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dating_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      from_side TEXT NOT NULL CHECK (from_side IN ('me', 'them')),
      text TEXT NOT NULL,
      time_label TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (thread_id) REFERENCES dating_threads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dating_likes (
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (from_user_id, to_user_id),
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dating_passes (
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (from_user_id, to_user_id),
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
  try {
    db.exec('ALTER TABLE dating_profiles ADD COLUMN last_seen_at TEXT')
  } catch {
    /* column already exists */
  }
  try {
    db.exec("ALTER TABLE dating_profiles ADD COLUMN photos_json TEXT DEFAULT '[]'")
  } catch {
    /* exists */
  }
  try {
    db.exec("ALTER TABLE dating_profiles ADD COLUMN details_json TEXT DEFAULT '{}'")
  } catch {
    /* exists */
  }
}

function mapDatingThread(row, messages = []) {
  return {
    id: row.id,
    otherUserId: row.other_user_id,
    otherName: row.other_name,
    otherAvatar: row.other_avatar,
    unread: row.unread || 0,
    updated: row.updated_label,
    messages: messages.map((m) => ({
      id: m.id,
      from: m.from_side,
      text: m.text,
      time: m.time_label,
    })),
  }
}

function loadDatingThread(threadId, userId) {
  const row = getDb()
    .prepare('SELECT * FROM dating_threads WHERE id = ? AND user_id = ?')
    .get(threadId, userId)
  if (!row) return null
  const messages = getDb()
    .prepare('SELECT * FROM dating_messages WHERE thread_id = ? ORDER BY created_at ASC, rowid ASC')
    .all(threadId)
  return mapDatingThread(row, messages)
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function isOnline(lastSeenAt) {
  if (!lastSeenAt) return false
  const ts = Date.parse(lastSeenAt.includes('T') ? lastSeenAt : `${lastSeenAt.replace(' ', 'T')}Z`)
  if (Number.isNaN(ts)) return false
  return Date.now() - ts <= ONLINE_WINDOW_MS
}

function parseJson(raw, fallback) {
  try {
    return JSON.parse(raw || '') ?? fallback
  } catch {
    return fallback
  }
}

function photoList(row) {
  const photos = parseJson(row.photos_json, [])
  if (Array.isArray(photos) && photos.length) return photos.filter(Boolean)
  if (row.avatar) return [resolveUserAvatar(row.avatar)]
  return [PEJO_DEFAULT_AVATAR]
}

function cleanPhotoUrls(list) {
  if (!Array.isArray(list)) return []
  const out = []
  for (const raw of list) {
    if (typeof raw !== 'string') continue
    const url = raw.trim()
    if (!url || url.length > 500) continue
    if (url.startsWith('data:') || url.startsWith('blob:')) continue
    const ok = /^https?:\/\//i.test(url) || url.startsWith('/uploads/') || url.startsWith('/logo')
    if (!ok) continue
    if (!out.includes(url)) out.push(url)
    if (out.length >= 6) break
  }
  return out
}

function likeFlags(meId, otherId) {
  if (!meId || !otherId) return { likedByMe: false, likedMe: false, matched: false }
  const db = getDb()
  const likedByMe = !!db
    .prepare('SELECT 1 AS ok FROM dating_likes WHERE from_user_id = ? AND to_user_id = ?')
    .get(meId, otherId)
  const likedMe = !!db
    .prepare('SELECT 1 AS ok FROM dating_likes WHERE from_user_id = ? AND to_user_id = ?')
    .get(otherId, meId)
  return { likedByMe: !!likedByMe, likedMe: !!likedMe, matched: !!(likedByMe && likedMe) }
}

function passedIdsFor(userId) {
  if (!userId) return new Set()
  const rows = getDb()
    .prepare('SELECT to_user_id AS id FROM dating_passes WHERE from_user_id = ?')
    .all(userId)
  return new Set(rows.map((r) => r.id))
}

function isMatched(a, b) {
  const flags = likeFlags(a, b)
  return flags.matched
}

function ensureMatchThreads(meId, otherProfile, myProfile) {
  const db = getDb()
  const now = timeLabelNow()
  const otherId = otherProfile.user_id
  const otherName = otherProfile.display_name
  const otherAvatar = resolveUserAvatar(otherProfile.avatar)
  const myName = myProfile?.display_name || 'You'
  const myAvatar = resolveUserAvatar(myProfile?.avatar)

  let myThread = db
    .prepare('SELECT id FROM dating_threads WHERE user_id = ? AND other_user_id = ?')
    .get(meId, otherId)
  let theirThread = db
    .prepare('SELECT id FROM dating_threads WHERE user_id = ? AND other_user_id = ?')
    .get(otherId, meId)

  const opener = 'It\'s a match! Say hi 👋'

  if (!myThread) {
    const id = newId('dt')
    db.prepare(`
      INSERT INTO dating_threads (
        id, user_id, other_user_id, other_name, other_avatar, unread, updated_label, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))
    `).run(id, meId, otherId, otherName, otherAvatar, now)
    db.prepare(
      'INSERT INTO dating_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
    ).run(newId('dm'), id, 'me', opener, now)
    myThread = { id }
  }

  if (!theirThread) {
    const id = newId('dt')
    db.prepare(`
      INSERT INTO dating_threads (
        id, user_id, other_user_id, other_name, other_avatar, unread, updated_label, updated_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, datetime('now'))
    `).run(id, otherId, meId, myName, myAvatar, now)
    db.prepare(
      'INSERT INTO dating_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
    ).run(newId('dm'), id, 'them', opener, now)
    theirThread = { id }
  }

  return loadDatingThread(myThread.id, meId)
}

function mapProfile(row, originLat, originLng, meId = null) {
  const details = parseJson(row.details_json, {})
  const photos = photoList(row)
  const flags = likeFlags(meId, row.user_id)
  return {
    userId: row.user_id,
    displayName: row.display_name,
    bio: row.bio || '',
    age: row.age,
    gender: row.gender,
    lookingFor: row.looking_for,
    avatar: resolveUserAvatar(row.avatar || photos[0]),
    photos: photos.map(resolveUserAvatar),
    lat: row.lat,
    lng: row.lng,
    interests: parseJson(row.interests_json, []),
    distanceKm: Math.round(haversineKm(originLat, originLng, row.lat, row.lng) * 10) / 10,
    online: isOnline(row.last_seen_at),
    lastSeenAt: row.last_seen_at || null,
    neighborhood: details.neighborhood || 'Vancouver, British Columbia',
    height: details.height || '',
    smoking: details.smoking || '',
    kids: details.kids || '',
    relationshipIntent: details.relationshipIntent
      || (row.looking_for === 'dating' ? 'long-term' : row.looking_for === 'friendship' ? 'friends' : 'open'),
    commonNote: details.commonNote || 'Also from Vancouver, British Columbia.',
    likedByMe: flags.likedByMe,
    likedMe: flags.likedMe,
    matched: flags.matched,
    isMine: false,
  }
}

function blockedIdsFor(userId) {
  if (!userId) return new Set()
  const rows = getDb()
    .prepare(`
      SELECT blocked_user_id AS id FROM dating_blocks WHERE user_id = ?
      UNION
      SELECT user_id AS id FROM dating_blocks WHERE blocked_user_id = ?
    `)
    .all(userId, userId)
  return new Set(rows.map((r) => r.id))
}

const DEMO_PROFILES = [
  { lat: 49.2827 + 0.012, lng: -123.1207 - 0.008, age: 28, gender: 'woman', looking: 'friendship', bio: 'Coffee walks around Kitsilano', interests: ['coffee', 'hiking', 'Travel'], online: true, neighborhood: 'Kitsilano, Vancouver', height: "5' 5\"", smoking: 'never', kids: 'none', relationshipIntent: 'friends' },
  { lat: 49.2827 - 0.009, lng: -123.1207 + 0.014, age: 32, gender: 'man', looking: 'dating', bio: 'New in Vancouver · love food markets', interests: ['food', 'music', 'Reading'], online: true, neighborhood: 'Downtown Vancouver', height: "5' 11\"", smoking: 'never', kids: 'none', relationshipIntent: 'long-term' },
  { lat: 49.2827 + 0.018, lng: -123.1207 + 0.006, age: 26, gender: 'woman', looking: 'both', bio: 'Photographer · Stanley Park weekends', interests: ['photo', 'art', 'Movie Theaters'], online: false, neighborhood: 'West End, Vancouver', height: "5' 4\"", smoking: 'never', kids: 'none', relationshipIntent: 'open' },
  { lat: 49.2827 - 0.015, lng: -123.1207 - 0.012, age: 35, gender: 'man', looking: 'friendship', bio: 'Board games & boardwalks', interests: ['games', 'movies'], online: true, neighborhood: 'Yaletown, Vancouver', height: "5' 10\"", smoking: 'sometimes', kids: 'has', relationshipIntent: 'friends' },
  { lat: 49.2827 + 0.006, lng: -123.1207 + 0.02, age: 29, gender: 'nonbinary', looking: 'friendship', bio: 'Looking for chill hangouts', interests: ['books', 'cafes'], online: false, neighborhood: 'Mount Pleasant', height: "5' 7\"", smoking: 'never', kids: 'none', relationshipIntent: 'friends' },
  { lat: 49.2827 + 0.022, lng: -123.1207 - 0.015, age: 31, gender: 'woman', looking: 'dating', bio: 'Yoga & seawall mornings', interests: ['fitness', 'travel', 'Reading'], online: true, neighborhood: 'West Vancouver', height: "5' 3\"", smoking: 'never', kids: 'none', relationshipIntent: 'long-term' },
  { lat: 49.2827 - 0.02, lng: -123.1207 + 0.01, age: 27, gender: 'man', looking: 'both', bio: 'Tech + tacos', interests: ['tech', 'food'], online: false, neighborhood: 'Burnaby', height: "6' 0\"", smoking: 'never', kids: 'none', relationshipIntent: 'open' },
  { lat: 49.2827 + 0.004, lng: -123.1207 - 0.018, age: 33, gender: 'woman', looking: 'friendship', bio: 'Language exchange Farsi/English', interests: ['language', 'culture', 'Travel'], online: false, neighborhood: 'North Vancouver', height: "5' 6\"", smoking: 'never', kids: 'none', relationshipIntent: 'friends' },
  { lat: 49.2488, lng: -122.9805, age: 30, gender: 'woman', looking: 'dating', bio: 'Burnaby evenings · Metrotown walks', interests: ['movies', 'coffee'], online: true, neighborhood: 'Burnaby, British Columbia', height: "5' 5\"", smoking: 'never', kids: 'none', relationshipIntent: 'long-term' },
  { lat: 49.1913, lng: -122.849, age: 29, gender: 'man', looking: 'friendship', bio: 'Surrey weekends · road trips', interests: ['cars', 'outdoors'], online: false, neighborhood: 'Surrey, British Columbia', height: "5' 9\"", smoking: 'never', kids: 'none', relationshipIntent: 'friends' },
  { lat: 49.1666, lng: -123.1336, age: 27, gender: 'woman', looking: 'both', bio: 'Richmond foodie', interests: ['food', 'travel'], online: true, neighborhood: 'Richmond, British Columbia', height: "5' 4\"", smoking: 'never', kids: 'none', relationshipIntent: 'open' },
  { lat: 49.32, lng: -123.0724, age: 34, gender: 'man', looking: 'dating', bio: 'North Van trails', interests: ['hiking', 'dogs'], online: false, neighborhood: 'North Vancouver', height: "5' 11\"", smoking: 'never', kids: 'has', relationshipIntent: 'long-term' },
  { lat: 49.2838, lng: -122.7932, age: 28, gender: 'nonbinary', looking: 'friendship', bio: 'Coquitlam cafes & art', interests: ['art', 'music'], online: true, neighborhood: 'Coquitlam', height: "5' 8\"", smoking: 'never', kids: 'none', relationshipIntent: 'friends' },
]

function upsertDemoProfiles() {}

function seedDemoProfilesSafe() {
  upsertDemoProfiles()
}

router.get('/nearby', optionalAuth, (req, res) => {
  ensureTable()
  seedDemoProfilesSafe()

  const lat = Number(req.query.lat ?? VAN_LAT)
  const lng = Number(req.query.lng ?? VAN_LNG)
  const radiusKm = Math.min(100, Math.max(1, Number(req.query.radiusKm ?? DEFAULT_RADIUS_KM) || DEFAULT_RADIUS_KM))
  const meId = req.user?.id
  const blocked = blockedIdsFor(meId)
  const passed = passedIdsFor(meId)

  const rows = getDb()
    .prepare('SELECT * FROM dating_profiles WHERE active = 1')
    .all()

  const people = rows
    .filter((r) => r.user_id !== meId && !blocked.has(r.user_id) && !passed.has(r.user_id))
    .map((r) => mapProfile(r, lat, lng, meId))
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  res.json({
    center: { lat, lng },
    radiusKm,
    people,
  })
})

router.get('/online', optionalAuth, (req, res) => {
  ensureTable()
  seedDemoProfilesSafe()

  const lat = Number(req.query.lat ?? VAN_LAT)
  const lng = Number(req.query.lng ?? VAN_LNG)
  const meId = req.user?.id
  const blocked = blockedIdsFor(meId)
  const passed = passedIdsFor(meId)

  const rows = getDb()
    .prepare('SELECT * FROM dating_profiles WHERE active = 1')
    .all()

  const people = rows
    .filter((r) => r.user_id !== meId && !blocked.has(r.user_id) && !passed.has(r.user_id))
    .map((r) => mapProfile(r, lat, lng, meId))
    .filter((p) => p.online)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  res.json({ people })
})

router.post('/heartbeat', authRequired, (req, res) => {
  ensureTable()
  const row = getDb()
    .prepare('SELECT user_id FROM dating_profiles WHERE user_id = ? AND active = 1')
    .get(req.user.id)

  if (!row) {
    return res.json({ ok: false, reason: 'no_profile' })
  }

  const lat = req.body?.lat
  const lng = req.body?.lng
  if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    getDb()
      .prepare(`
        UPDATE dating_profiles
        SET last_seen_at = datetime('now'), lat = ?, lng = ?, updated_at = datetime('now')
        WHERE user_id = ?
      `)
      .run(Number(lat), Number(lng), req.user.id)
  } else {
    getDb()
      .prepare(`
        UPDATE dating_profiles
        SET last_seen_at = datetime('now'), updated_at = datetime('now')
        WHERE user_id = ?
      `)
      .run(req.user.id)
  }

  res.json({ ok: true })
})

router.get('/me', authRequired, (req, res) => {
  ensureTable()
  const row = getDb()
    .prepare('SELECT * FROM dating_profiles WHERE user_id = ?')
    .get(req.user.id)

  if (!row) {
    return res.json({ profile: null })
  }

  res.json({
    profile: {
      ...mapProfile(row, row.lat, row.lng, req.user.id),
      isMine: true,
      distanceKm: 0,
    },
  })
})

router.put('/me', authRequired, (req, res) => {
  ensureTable()
  const {
    displayName,
    bio = '',
    age,
    gender,
    lookingFor,
    avatar,
    lat,
    lng,
    interests = [],
    photos = [],
    active = true,
  } = req.body || {}

  if (!displayName?.trim()) {
    return res.status(400).json({ error: 'Display name is required' })
  }

  const safeAge = age === '' || age == null ? null : Number(age)
  if (safeAge != null && (!Number.isFinite(safeAge) || safeAge < 19 || safeAge > 99)) {
    return res.status(400).json({ error: 'دوستیابی فقط برای ۱۹ سال به بالا است' })
  }

  const safeLat = Number(lat ?? VAN_LAT)
  const safeLng = Number(lng ?? VAN_LNG)
  const gallery = cleanPhotoUrls(photos)
  let safeAvatar = cleanPhotoUrls([avatar])[0] || ''
  if (safeAvatar && !gallery.includes(safeAvatar)) gallery.unshift(safeAvatar)
  const storedPhotos = gallery.slice(0, 6)
  if (!safeAvatar) safeAvatar = storedPhotos[0] || resolveUserAvatar(req.user.avatar)

  const db = getDb()
  db.prepare(`
      INSERT INTO dating_profiles
        (user_id, display_name, bio, age, gender, looking_for, avatar, lat, lng, interests_json, photos_json, active, last_seen_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        display_name = excluded.display_name,
        bio = excluded.bio,
        age = excluded.age,
        gender = excluded.gender,
        looking_for = excluded.looking_for,
        avatar = excluded.avatar,
        lat = excluded.lat,
        lng = excluded.lng,
        interests_json = excluded.interests_json,
        photos_json = excluded.photos_json,
        active = excluded.active,
        last_seen_at = datetime('now'),
        updated_at = datetime('now')
    `)
    .run(
      req.user.id,
      displayName.trim(),
      String(bio || ''),
      safeAge,
      gender || null,
      lookingFor || null,
      safeAvatar,
      safeLat,
      safeLng,
      JSON.stringify(Array.isArray(interests) ? interests : []),
      JSON.stringify(storedPhotos),
      active ? 1 : 0,
    )

  if (safeAvatar && !String(safeAvatar).includes('logo.jpeg')) {
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(safeAvatar, req.user.id)
  }

  const row = getDb()
    .prepare('SELECT * FROM dating_profiles WHERE user_id = ?')
    .get(req.user.id)

  res.json({
    profile: {
      ...mapProfile(row, row.lat, row.lng, req.user.id),
      isMine: true,
      distanceKm: 0,
    },
  })
})

router.post('/block', authRequired, (req, res) => {
  ensureTable()
  const blockedUserId = Number(req.body?.userId)
  if (!Number.isFinite(blockedUserId) || blockedUserId === req.user.id) {
    return res.status(400).json({ error: 'Invalid user' })
  }

  getDb()
    .prepare(`
      INSERT OR IGNORE INTO dating_blocks (user_id, blocked_user_id)
      VALUES (?, ?)
    `)
    .run(req.user.id, blockedUserId)

  res.json({ ok: true, blockedUserId })
})

router.post('/like', authRequired, (req, res) => {
  ensureTable()
  const targetUserId = Number(req.body?.userId)
  if (!Number.isFinite(targetUserId) || targetUserId === req.user.id) {
    return res.status(400).json({ error: 'Invalid user' })
  }

  const blocked = blockedIdsFor(req.user.id)
  if (blocked.has(targetUserId)) {
    return res.status(403).json({ error: 'User is blocked' })
  }

  const other = getDb()
    .prepare('SELECT * FROM dating_profiles WHERE user_id = ? AND active = 1')
    .get(targetUserId)
  if (!other) return res.status(404).json({ error: 'Profile not found' })

  getDb()
    .prepare('DELETE FROM dating_passes WHERE from_user_id = ? AND to_user_id = ?')
    .run(req.user.id, targetUserId)

  getDb()
    .prepare(`
      INSERT OR IGNORE INTO dating_likes (from_user_id, to_user_id)
      VALUES (?, ?)
    `)
    .run(req.user.id, targetUserId)

  // Demo profiles auto-like back so mutual match can be tested
  if (targetUserId >= 9000) {
    getDb()
      .prepare(`
        INSERT OR IGNORE INTO dating_likes (from_user_id, to_user_id)
        VALUES (?, ?)
      `)
      .run(targetUserId, req.user.id)
  }

  const matched = isMatched(req.user.id, targetUserId)
  let thread = null
  if (matched) {
    const me = getDb()
      .prepare('SELECT * FROM dating_profiles WHERE user_id = ?')
      .get(req.user.id)
    thread = ensureMatchThreads(req.user.id, other, me)
  }

  res.json({
    ok: true,
    matched,
    likedByMe: true,
    likedMe: likeFlags(req.user.id, targetUserId).likedMe,
    thread,
    person: mapProfile(other, other.lat, other.lng, req.user.id),
  })
})

router.post('/pass', authRequired, (req, res) => {
  ensureTable()
  const targetUserId = Number(req.body?.userId)
  if (!Number.isFinite(targetUserId) || targetUserId === req.user.id) {
    return res.status(400).json({ error: 'Invalid user' })
  }

  getDb()
    .prepare('DELETE FROM dating_likes WHERE from_user_id = ? AND to_user_id = ?')
    .run(req.user.id, targetUserId)

  getDb()
    .prepare(`
      INSERT OR IGNORE INTO dating_passes (from_user_id, to_user_id)
      VALUES (?, ?)
    `)
    .run(req.user.id, targetUserId)

  res.json({ ok: true, passedUserId: targetUserId })
})

router.get('/matches', authRequired, (req, res) => {
  ensureTable()
  const meId = req.user.id
  const rows = getDb()
    .prepare(`
      SELECT p.*
      FROM dating_likes a
      JOIN dating_likes b
        ON a.from_user_id = b.to_user_id AND a.to_user_id = b.from_user_id
      JOIN dating_profiles p ON p.user_id = a.to_user_id
      WHERE a.from_user_id = ? AND p.active = 1
    `)
    .all(meId)

  const me = getDb().prepare('SELECT lat, lng FROM dating_profiles WHERE user_id = ?').get(meId)
  const lat = me?.lat ?? VAN_LAT
  const lng = me?.lng ?? VAN_LNG
  res.json({
    matches: rows.map((r) => mapProfile(r, lat, lng, meId)),
  })
})

/** People who liked you — Facebook Dating "Liked You" inbox */
router.get('/liked-me', authRequired, (req, res) => {
  ensureTable()
  const meId = req.user.id
  const db = getDb()
  const blocked = blockedIdsFor(meId)
  const passed = passedIdsFor(meId)

  const rows = db
    .prepare(`
      SELECT p.*
      FROM dating_likes l
      JOIN dating_profiles p ON p.user_id = l.from_user_id
      WHERE l.to_user_id = ?
        AND p.active = 1
        AND NOT EXISTS (
          SELECT 1 FROM dating_likes me
          WHERE me.from_user_id = ? AND me.to_user_id = l.from_user_id
        )
      ORDER BY l.rowid DESC
    `)
    .all(meId, meId)

  const me = db.prepare('SELECT lat, lng FROM dating_profiles WHERE user_id = ?').get(meId)
  const lat = me?.lat ?? VAN_LAT
  const lng = me?.lng ?? VAN_LNG

  res.json({
    people: rows
      .filter((r) => !blocked.has(r.user_id) && !passed.has(r.user_id))
      .map((r) => mapProfile(r, lat, lng, meId)),
  })
})

/** Secret Crush — up to 9 anonymous picks (Facebook Dating) */
router.get('/secret-crush', authRequired, (req, res) => {
  ensureTable()
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS dating_secret_crush (
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (from_user_id, to_user_id)
    )
  `)
  const meId = req.user.id
  const rows = db
    .prepare('SELECT to_user_id AS id FROM dating_secret_crush WHERE from_user_id = ?')
    .all(meId)
  const mutual = db
    .prepare(`
      SELECT a.to_user_id AS id
      FROM dating_secret_crush a
      JOIN dating_secret_crush b
        ON a.from_user_id = b.to_user_id AND a.to_user_id = b.from_user_id
      WHERE a.from_user_id = ?
    `)
    .all(meId)
    .map((r) => r.id)

  res.json({
    crushIds: rows.map((r) => r.id),
    mutualIds: mutual,
    max: 9,
  })
})

router.put('/secret-crush', authRequired, (req, res) => {
  ensureTable()
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS dating_secret_crush (
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (from_user_id, to_user_id)
    )
  `)
  const meId = req.user.id
  const ids = Array.isArray(req.body?.userIds)
    ? [...new Set(req.body.userIds.map(Number).filter((n) => Number.isFinite(n) && n !== meId))].slice(0, 9)
    : []

  db.prepare('DELETE FROM dating_secret_crush WHERE from_user_id = ?').run(meId)
  const insert = db.prepare(`
    INSERT OR IGNORE INTO dating_secret_crush (from_user_id, to_user_id) VALUES (?, ?)
  `)
  ids.forEach((id) => insert.run(meId, id))

  // Mutual crush → auto mutual like + match
  const likeIns = db.prepare(`
    INSERT OR IGNORE INTO dating_likes (from_user_id, to_user_id) VALUES (?, ?)
  `)
  const meProfile = db.prepare('SELECT * FROM dating_profiles WHERE user_id = ?').get(meId)
  ids.forEach((id) => {
    const theyCrush = db
      .prepare('SELECT 1 AS ok FROM dating_secret_crush WHERE from_user_id = ? AND to_user_id = ?')
      .get(id, meId)
    if (theyCrush) {
      likeIns.run(meId, id)
      likeIns.run(id, meId)
      const other = db.prepare('SELECT * FROM dating_profiles WHERE user_id = ?').get(id)
      if (other && meProfile) ensureMatchThreads(meId, other, meProfile)
    }
  })

  const mutual = db
    .prepare(`
      SELECT a.to_user_id AS id
      FROM dating_secret_crush a
      JOIN dating_secret_crush b
        ON a.from_user_id = b.to_user_id AND a.to_user_id = b.from_user_id
      WHERE a.from_user_id = ?
    `)
    .all(meId)
    .map((r) => r.id)

  res.json({ crushIds: ids, mutualIds: mutual, max: 9 })
})

router.get('/threads', authRequired, (req, res) => {
  ensureTable()
  const rows = getDb()
    .prepare('SELECT * FROM dating_threads WHERE user_id = ? ORDER BY updated_at DESC')
    .all(req.user.id)

  const threads = rows.map((row) => {
    const messages = getDb()
      .prepare('SELECT * FROM dating_messages WHERE thread_id = ? ORDER BY created_at ASC, rowid ASC')
      .all(row.id)
    return mapDatingThread(row, messages)
  })

  res.json({ threads })
})

router.get('/threads/:id', authRequired, (req, res) => {
  ensureTable()
  const thread = loadDatingThread(req.params.id, req.user.id)
  if (!thread) return res.status(404).json({ error: 'Thread not found' })
  res.json({ thread })
})

router.post('/message', authRequired, (req, res) => {
  ensureTable()
  const targetUserId = Number(req.body?.userId)
  if (!Number.isFinite(targetUserId) || targetUserId === req.user.id) {
    return res.status(400).json({ error: 'Invalid user' })
  }

  const blocked = blockedIdsFor(req.user.id)
  if (blocked.has(targetUserId)) {
    return res.status(403).json({ error: 'User is blocked' })
  }

  const profile = getDb()
    .prepare('SELECT * FROM dating_profiles WHERE user_id = ? AND active = 1')
    .get(targetUserId)
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' })
  }

  if (!isMatched(req.user.id, targetUserId)) {
    return res.status(403).json({
      error: 'Chat unlocks after a mutual like',
      code: 'MATCH_REQUIRED',
    })
  }

  const existing = getDb()
    .prepare('SELECT id FROM dating_threads WHERE user_id = ? AND other_user_id = ?')
    .get(req.user.id, targetUserId)

  if (existing) {
    return res.json({ thread: loadDatingThread(existing.id, req.user.id) })
  }

  const me = getDb()
    .prepare('SELECT * FROM dating_profiles WHERE user_id = ?')
    .get(req.user.id)
  const thread = ensureMatchThreads(req.user.id, profile, me)

  if (typeof req.body?.message === 'string' && req.body.message.trim()) {
    const msgId = newId('dm')
    const now = timeLabelNow()
    getDb()
      .prepare(
        'INSERT INTO dating_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
      )
      .run(msgId, thread.id, 'me', req.body.message.trim(), now)
    getDb()
      .prepare(`
        UPDATE dating_threads
        SET updated_label = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      .run(now, thread.id)
    return res.status(201).json({ thread: loadDatingThread(thread.id, req.user.id) })
  }

  res.status(201).json({ thread })
})

router.post('/threads/:id/messages', authRequired, (req, res) => {
  ensureTable()
  const threadId = req.params.id
  const row = getDb()
    .prepare('SELECT * FROM dating_threads WHERE id = ? AND user_id = ?')
    .get(threadId, req.user.id)
  if (!row) return res.status(404).json({ error: 'Thread not found' })

  if (!isMatched(req.user.id, row.other_user_id)) {
    return res.status(403).json({
      error: 'Chat unlocks after a mutual like',
      code: 'MATCH_REQUIRED',
    })
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
  if (!text) return res.status(400).json({ error: 'Message required' })

  const msgId = newId('dm')
  const now = timeLabelNow()

  const db = getDb()
  const peer = db
    .prepare('SELECT id FROM dating_threads WHERE user_id = ? AND other_user_id = ?')
    .get(row.other_user_id, req.user.id)

  const tx = db.transaction(() => {
    db.prepare(
      'INSERT INTO dating_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
    ).run(msgId, threadId, 'me', text, now)

    db.prepare(`
      UPDATE dating_threads
      SET updated_label = ?, updated_at = datetime('now'), unread = 0
      WHERE id = ?
    `).run(now, threadId)

    if (peer?.id) {
      db.prepare(
        'INSERT INTO dating_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
      ).run(newId('dm'), peer.id, 'them', text, now)
      db.prepare(`
        UPDATE dating_threads
        SET updated_label = ?, updated_at = datetime('now'), unread = unread + 1
        WHERE id = ?
      `).run(now, peer.id)
    }
  })
  tx()

  res.status(201).json({ thread: loadDatingThread(threadId, req.user.id) })
})

router.patch('/threads/:id/read', authRequired, (req, res) => {
  ensureTable()
  const info = getDb()
    .prepare('UPDATE dating_threads SET unread = 0 WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id)
  if (!info.changes) return res.status(404).json({ error: 'Thread not found' })
  res.json({ ok: true })
})

export default router
