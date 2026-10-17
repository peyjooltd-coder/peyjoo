import { Router } from 'express'
import { randomBytes } from 'crypto'
import { getDb } from '../db/database.js'
import { authRequired, optionalAuth } from '../middleware/auth.js'
import { normalizeMediaList, parseIncomingMedia } from '../utils/media.js'
import { resolveUserAvatar } from '../utils/defaultAvatar.js'

const router = Router()

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
    CREATE TABLE IF NOT EXISTS hamyari_posts (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      title TEXT DEFAULT '',
      body TEXT NOT NULL,
      images_json TEXT DEFAULT '[]',
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hamyari_likes (
      user_id INTEGER NOT NULL,
      post_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES hamyari_posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hamyari_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      time_label TEXT,
      FOREIGN KEY (post_id) REFERENCES hamyari_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hamyari_threads (
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

    CREATE TABLE IF NOT EXISTS hamyari_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      from_side TEXT NOT NULL CHECK (from_side IN ('me', 'them')),
      text TEXT NOT NULL,
      time_label TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (thread_id) REFERENCES hamyari_threads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hamyari_notifications (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      actor_name TEXT,
      body TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  const cols = db.prepare('PRAGMA table_info(hamyari_posts)').all().map((c) => c.name)
  if (!cols.includes('status')) {
    db.exec("ALTER TABLE hamyari_posts ADD COLUMN status TEXT DEFAULT 'active'")
  }
  if (!cols.includes('updated_at')) {
    db.exec('ALTER TABLE hamyari_posts ADD COLUMN updated_at TEXT')
  }
  // Legacy posts without moderation stay public
  db.prepare(`
    UPDATE hamyari_posts
    SET status = 'active'
    WHERE status IS NULL OR TRIM(status) = ''
  `).run()
  db.prepare(`
    UPDATE hamyari_posts
    SET updated_at = COALESCE(updated_at, created_at, datetime('now'))
    WHERE updated_at IS NULL OR TRIM(updated_at) = ''
  `).run()
}

function mapPost(row, likedByMe = false) {
  const media = normalizeMediaList(row.images_json)
  const imageUrls = media.filter((m) => m.type === 'image').map((m) => m.url)
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name || row.name || 'Member',
    authorAvatar: resolveUserAvatar(row.author_avatar || row.avatar),
    category: row.category,
    title: row.title || '',
    body: row.body,
    images: imageUrls.length ? imageUrls : media.map((m) => m.url),
    media,
    likesCount: row.likes_count || 0,
    commentsCount: row.comments_count || 0,
    likedByMe: !!likedByMe,
    status: row.status || 'pending',
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    timeLabel: row.time_label || row.created_at,
  }
}

const DEMO_GALLERIES = [
  [
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=700&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=700&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&h=700&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&h=700&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1555041469-a586c624eaef?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&h=700&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&h=700&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&h=700&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&h=700&fit=crop',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&h=700&fit=crop',
  ],
]

function seedDemoPosts() {}

function mapThread(row, messages = []) {
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

function loadThread(threadId, userId) {
  const row = getDb()
    .prepare('SELECT * FROM hamyari_threads WHERE id = ? AND user_id = ?')
    .get(threadId, userId)
  if (!row) return null
  const messages = getDb()
    .prepare('SELECT * FROM hamyari_messages WHERE thread_id = ? ORDER BY created_at ASC, rowid ASC')
    .all(threadId)
  return mapThread(row, messages)
}

router.get('/feed', optionalAuth, (req, res) => {
  ensureTable()
  seedDemoPosts()

  const category = String(req.query.category || '').trim()
  const meId = req.user?.id
  const lim = Math.min(50, Math.max(1, Number(req.query.limit) || 30))

  let rows
  if (category && category !== 'all') {
    rows = getDb()
      .prepare(`
        SELECT p.*, u.name AS author_name, u.avatar AS author_avatar
        FROM hamyari_posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.category = ? AND p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT ?
      `)
      .all(category, lim)
  } else {
    rows = getDb()
      .prepare(`
        SELECT p.*, u.name AS author_name, u.avatar AS author_avatar
        FROM hamyari_posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT ?
      `)
      .all(lim)
  }

  const likedSet = new Set()
  if (meId && rows.length) {
    const ids = rows.map((r) => r.id)
    const placeholders = ids.map(() => '?').join(',')
    const likes = getDb()
      .prepare(`SELECT post_id FROM hamyari_likes WHERE user_id = ? AND post_id IN (${placeholders})`)
      .all(meId, ...ids)
    likes.forEach((l) => likedSet.add(l.post_id))
  }

  res.json({
    posts: rows.map((r) => mapPost(r, likedSet.has(r.id))),
  })
})

router.post('/posts', authRequired, (req, res) => {
  ensureTable()
  const body = String(req.body?.body || '').trim()
  const title = String(req.body?.title || '').trim()
  const category = String(req.body?.category || 'general').trim() || 'general'
  const media = parseIncomingMedia(req.body)

  if (body.length < 2) {
    return res.status(400).json({ error: 'Post text is required' })
  }

  const id = newId('hp')
  getDb()
    .prepare(`
      INSERT INTO hamyari_posts (id, user_id, category, title, body, images_json, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `)
    .run(id, req.user.id, category, title, body, JSON.stringify(media))

  const row = getDb()
    .prepare(`
      SELECT p.*, u.name AS author_name, u.avatar AS author_avatar
      FROM hamyari_posts p JOIN users u ON u.id = p.user_id
      WHERE p.id = ?
    `)
    .get(id)

  res.status(201).json({ post: mapPost(row, false) })
})

router.get('/me/posts', authRequired, (req, res) => {
  ensureTable()
  const rows = getDb()
    .prepare(`
      SELECT p.*, u.name AS author_name, u.avatar AS author_avatar
      FROM hamyari_posts p JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ? AND p.status != 'deleted'
      ORDER BY p.updated_at DESC, p.created_at DESC
    `)
    .all(req.user.id)

  res.json({ posts: rows.map((r) => mapPost(r, false)) })
})

router.patch('/posts/:id', authRequired, (req, res) => {
  ensureTable()
  const postId = req.params.id
  const existing = getDb().prepare('SELECT * FROM hamyari_posts WHERE id = ?').get(postId)
  if (!existing) return res.status(404).json({ error: 'Post not found' })
  if (Number(existing.user_id) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  if (existing.status === 'deleted') {
    return res.status(404).json({ error: 'Post not found' })
  }

  const title = req.body?.title !== undefined
    ? String(req.body.title || '').trim()
    : existing.title
  const body = req.body?.body !== undefined
    ? String(req.body.body || '').trim()
    : existing.body
  const category = req.body?.category !== undefined
    ? (String(req.body.category || '').trim() || 'general')
    : existing.category

  if (String(body || '').trim().length < 2) {
    return res.status(400).json({ error: 'Post text is required' })
  }

  let imagesJson = existing.images_json
  const hasMedia = Array.isArray(req.body?.media) || Array.isArray(req.body?.images)
  if (hasMedia) {
    imagesJson = JSON.stringify(parseIncomingMedia(req.body))
  }

  // Any owner edit goes back to pending until admin re-approves
  getDb()
    .prepare(`
      UPDATE hamyari_posts
      SET title = ?, body = ?, category = ?, images_json = ?,
          status = 'pending', updated_at = datetime('now')
      WHERE id = ?
    `)
    .run(title, body, category, imagesJson, postId)

  const row = getDb()
    .prepare(`
      SELECT p.*, u.name AS author_name, u.avatar AS author_avatar
      FROM hamyari_posts p JOIN users u ON u.id = p.user_id
      WHERE p.id = ?
    `)
    .get(postId)

  res.json({ post: mapPost(row, false) })
})

router.delete('/posts/:id', authRequired, (req, res) => {
  ensureTable()
  const postId = req.params.id
  const existing = getDb().prepare('SELECT * FROM hamyari_posts WHERE id = ?').get(postId)
  if (!existing) return res.status(404).json({ error: 'Post not found' })
  if (Number(existing.user_id) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  getDb()
    .prepare(`
      UPDATE hamyari_posts
      SET status = 'deleted', updated_at = datetime('now')
      WHERE id = ?
    `)
    .run(postId)

  res.json({ ok: true })
})

router.post('/posts/:id/like', authRequired, (req, res) => {
  ensureTable()
  const postId = req.params.id
  const post = getDb().prepare('SELECT id, likes_count FROM hamyari_posts WHERE id = ?').get(postId)
  if (!post) return res.status(404).json({ error: 'Post not found' })

  const existing = getDb()
    .prepare('SELECT 1 AS ok FROM hamyari_likes WHERE user_id = ? AND post_id = ?')
    .get(req.user.id, postId)

  let liked
  if (existing) {
    getDb().prepare('DELETE FROM hamyari_likes WHERE user_id = ? AND post_id = ?').run(req.user.id, postId)
    getDb()
      .prepare('UPDATE hamyari_posts SET likes_count = CASE WHEN likes_count > 0 THEN likes_count - 1 ELSE 0 END WHERE id = ?')
      .run(postId)
    liked = false
  } else {
    getDb().prepare('INSERT INTO hamyari_likes (user_id, post_id) VALUES (?, ?)').run(req.user.id, postId)
    getDb().prepare('UPDATE hamyari_posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId)
    liked = true
  }

  const updated = getDb().prepare('SELECT likes_count FROM hamyari_posts WHERE id = ?').get(postId)
  res.json({ liked, likesCount: updated.likes_count })
})

router.get('/posts/:id/comments', optionalAuth, (req, res) => {
  ensureTable()
  const rows = getDb()
    .prepare(`
      SELECT c.*, u.name AS author_name, u.avatar AS author_avatar
      FROM hamyari_comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC, c.rowid ASC
    `)
    .all(req.params.id)

  res.json({
    comments: rows.map((c) => ({
      id: c.id,
      userId: c.user_id,
      authorName: c.author_name,
      authorAvatar: c.author_avatar,
      body: c.body,
      time: c.time_label || c.created_at,
    })),
  })
})

router.post('/posts/:id/comments', authRequired, (req, res) => {
  ensureTable()
  const postId = req.params.id
  const text = String(req.body?.body || '').trim()
  if (!text) return res.status(400).json({ error: 'Comment required' })

  const post = getDb().prepare('SELECT id FROM hamyari_posts WHERE id = ?').get(postId)
  if (!post) return res.status(404).json({ error: 'Post not found' })

  const id = newId('hc')
  const now = timeLabelNow()
  getDb()
    .prepare(`
      INSERT INTO hamyari_comments (id, post_id, user_id, body, time_label)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(id, postId, req.user.id, text, now)
  getDb().prepare('UPDATE hamyari_posts SET comments_count = comments_count + 1 WHERE id = ?').run(postId)

  res.status(201).json({
    comment: {
      id,
      userId: req.user.id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
      body: text,
      time: now,
    },
  })
})

router.delete('/comments/:id', authRequired, (req, res) => {
  ensureTable()
  const commentId = req.params.id
  const row = getDb()
    .prepare(`
      SELECT c.id, c.user_id AS comment_user_id, c.post_id, p.user_id AS post_user_id
      FROM hamyari_comments c
      JOIN hamyari_posts p ON p.id = c.post_id
      WHERE c.id = ?
    `)
    .get(commentId)

  if (!row) return res.status(404).json({ error: 'Comment not found' })

  const uid = req.user.id
  const canDelete = row.comment_user_id === uid || row.post_user_id === uid
  if (!canDelete) return res.status(403).json({ error: 'Forbidden' })

  getDb().prepare('DELETE FROM hamyari_comments WHERE id = ?').run(commentId)
  getDb()
    .prepare(`
      UPDATE hamyari_posts
      SET comments_count = CASE WHEN comments_count > 0 THEN comments_count - 1 ELSE 0 END
      WHERE id = ?
    `)
    .run(row.post_id)

  res.json({ ok: true, postId: row.post_id })
})

router.get('/notifications', authRequired, (req, res) => {
  ensureTable()
  const rows = getDb()
    .prepare(`
      SELECT * FROM hamyari_notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 40
    `)
    .all(req.user.id)

  const unread = rows.filter((r) => !r.read).length
  res.json({
    unread,
    notifications: rows.map((n) => ({
      id: n.id,
      type: n.type,
      actorName: n.actor_name,
      body: n.body,
      read: !!n.read,
      createdAt: n.created_at,
    })),
  })
})

router.patch('/notifications/read', authRequired, (req, res) => {
  ensureTable()
  getDb().prepare('UPDATE hamyari_notifications SET read = 1 WHERE user_id = ?').run(req.user.id)
  res.json({ ok: true })
})

router.get('/threads', authRequired, (req, res) => {
  ensureTable()
  const rows = getDb()
    .prepare('SELECT * FROM hamyari_threads WHERE user_id = ? ORDER BY updated_at DESC')
    .all(req.user.id)

  const threads = rows.map((row) => {
    const messages = getDb()
      .prepare('SELECT * FROM hamyari_messages WHERE thread_id = ? ORDER BY created_at ASC, rowid ASC')
      .all(row.id)
    return mapThread(row, messages)
  })
  res.json({ threads })
})

router.post('/message', authRequired, (req, res) => {
  ensureTable()
  const targetUserId = Number(req.body?.userId)
  if (!Number.isFinite(targetUserId) || targetUserId === req.user.id) {
    return res.status(400).json({ error: 'Invalid user' })
  }

  const other = getDb().prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(targetUserId)
  if (!other) return res.status(404).json({ error: 'User not found' })

  const existing = getDb()
    .prepare('SELECT id FROM hamyari_threads WHERE user_id = ? AND other_user_id = ?')
    .get(req.user.id, targetUserId)
  if (existing) {
    const peerExists = getDb()
      .prepare('SELECT id FROM hamyari_threads WHERE user_id = ? AND other_user_id = ?')
      .get(targetUserId, req.user.id)
    if (!peerExists) {
      const me = getDb().prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(req.user.id)
      const now = timeLabelNow()
      const peerId = newId('ht')
      getDb()
        .prepare(`
          INSERT INTO hamyari_threads
            (id, user_id, other_user_id, other_name, other_avatar, unread, updated_label, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))
        `)
        .run(peerId, targetUserId, req.user.id, me?.name || 'کاربر', me?.avatar || null, now)
      const msgs = getDb()
        .prepare(
          'SELECT from_side, text, time_label FROM hamyari_messages WHERE thread_id = ? ORDER BY created_at ASC, rowid ASC',
        )
        .all(existing.id)
      for (const m of msgs) {
        getDb()
          .prepare(
            'INSERT INTO hamyari_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
          )
          .run(newId('hm'), peerId, m.from_side === 'me' ? 'them' : 'me', m.text, m.time_label || now)
      }
    }
    return res.json({ thread: loadThread(existing.id, req.user.id) })
  }

  const threadId = newId('ht')
  const msgId = newId('hm')
  const now = timeLabelNow()
  const text =
    (typeof req.body?.message === 'string' && req.body.message.trim()) ||
    `Hi ${other.name}! I saw your Hamyari post.`

  const me = getDb().prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(req.user.id)
  const peerThreadId = newId('ht')

  const tx = getDb().transaction(() => {
    getDb()
      .prepare(`
        INSERT INTO hamyari_threads
          (id, user_id, other_user_id, other_name, other_avatar, unread, updated_label, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))
      `)
      .run(threadId, req.user.id, other.id, other.name, other.avatar, now)
    getDb()
      .prepare(
        'INSERT INTO hamyari_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
      )
      .run(msgId, threadId, 'me', text, now)

    getDb()
      .prepare(`
        INSERT INTO hamyari_threads
          (id, user_id, other_user_id, other_name, other_avatar, unread, updated_label, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, datetime('now'))
      `)
      .run(peerThreadId, other.id, req.user.id, me?.name || 'کاربر', me?.avatar || null, now)
    getDb()
      .prepare(
        'INSERT INTO hamyari_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
      )
      .run(newId('hm'), peerThreadId, 'them', text, now)
  })
  tx()
  res.status(201).json({ thread: loadThread(threadId, req.user.id) })
})

router.post('/threads/:id/messages', authRequired, (req, res) => {
  ensureTable()
  const threadId = req.params.id
  const row = getDb()
    .prepare('SELECT * FROM hamyari_threads WHERE id = ? AND user_id = ?')
    .get(threadId, req.user.id)
  if (!row) return res.status(404).json({ error: 'Thread not found' })

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
  if (!text) return res.status(400).json({ error: 'Message required' })

  const msgId = newId('hm')
  const now = timeLabelNow()
  const db = getDb()
  let peer = db
    .prepare('SELECT id FROM hamyari_threads WHERE user_id = ? AND other_user_id = ?')
    .get(row.other_user_id, req.user.id)

  const tx = db.transaction(() => {
    db.prepare(
      'INSERT INTO hamyari_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
    ).run(msgId, threadId, 'me', text, now)
    db.prepare(`
      UPDATE hamyari_threads
      SET updated_label = ?, updated_at = datetime('now'), unread = 0
      WHERE id = ?
    `).run(now, threadId)

    if (!peer?.id) {
      const me = db.prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(req.user.id)
      const peerId = newId('ht')
      db.prepare(`
        INSERT INTO hamyari_threads
          (id, user_id, other_user_id, other_name, other_avatar, unread, updated_label, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))
      `).run(peerId, row.other_user_id, req.user.id, me?.name || 'کاربر', me?.avatar || null, now)
      peer = { id: peerId }
    }

    db.prepare(
      'INSERT INTO hamyari_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
    ).run(newId('hm'), peer.id, 'them', text, now)
    db.prepare(`
      UPDATE hamyari_threads
      SET updated_label = ?, updated_at = datetime('now'), unread = unread + 1
      WHERE id = ?
    `).run(now, peer.id)
  })
  tx()

  res.status(201).json({ thread: loadThread(threadId, req.user.id) })
})

router.patch('/threads/:id/read', authRequired, (req, res) => {
  ensureTable()
  const info = getDb()
    .prepare('UPDATE hamyari_threads SET unread = 0 WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id)
  if (!info.changes) return res.status(404).json({ error: 'Thread not found' })
  res.json({ ok: true })
})

export default router
