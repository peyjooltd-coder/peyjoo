import { Router } from 'express'
import { randomBytes } from 'crypto'
import { getDb } from '../db/database.js'
import { authRequired } from '../middleware/auth.js'
import { rowToChatThread } from '../utils/mappers.js'

const router = Router()
router.use(authRequired)

/** Legacy auto-replies — delete from DB; never generate again. */
const LEGACY_AUTO_REPLIES = [
  'سلام، پیام‌تان را دیدم. در خدمتم 👍',
  'سلام! هنوز موجود است. سؤال دیگری دارید؟',
  'وقت بازدید را همین‌جا در چت هماهنگ کنیم؟',
  'قیمت نهایی قابل مذاکره است. بفرمایید.',
  'ممنون از پیام‌تان — تا چند دقیقه دیگر جواب کامل‌تری می‌دهم.',
]

function purgeLegacyAutoReplies() {
  try {
    const db = getDb()
    const del = db.prepare(
      "DELETE FROM chat_messages WHERE from_side = 'them' AND text = ?",
    )
    const tx = db.transaction(() => {
      for (const text of LEGACY_AUTO_REPLIES) del.run(text)
    })
    tx()
  } catch {
    /* ignore */
  }
}

let chatReady = false
function ensureChatReady() {
  if (chatReady) return
  purgeLegacyAutoReplies()
  backfillMissingPeers()
  chatReady = true
}

function newId(prefix) {
  return `${prefix}${Date.now().toString(36)}${randomBytes(3).toString('hex')}`
}

function timeLabelNow() {
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

function userPublic(userId) {
  const row = getDb().prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(userId)
  if (!row) return { id: userId, name: 'کاربر', avatar: null }
  return { id: row.id, name: row.name || 'کاربر', avatar: row.avatar || null }
}

function peerLastReadAtFor(row) {
  if (!row?.other_user_id || !row?.listing_id) return null
  const peer = getDb()
    .prepare(
      `SELECT last_read_at FROM chat_threads
       WHERE user_id = ? AND other_user_id = ? AND listing_id = ?`,
    )
    .get(row.other_user_id, row.user_id, row.listing_id)
  return peer?.last_read_at || null
}

function loadThread(threadId, userId) {
  const row = getDb().prepare('SELECT * FROM chat_threads WHERE id = ? AND user_id = ?').get(threadId, userId)
  if (!row) return null
  const messages = getDb()
    .prepare('SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC, rowid ASC')
    .all(threadId)
  return rowToChatThread(row, messages, peerLastReadAtFor(row))
}

function findPeerThread(myThread) {
  if (!myThread?.other_user_id || !myThread?.listing_id) return null
  return getDb()
    .prepare(
      `SELECT * FROM chat_threads
       WHERE user_id = ? AND other_user_id = ? AND listing_id = ?`,
    )
    .get(myThread.other_user_id, myThread.user_id, myThread.listing_id)
}

function insertMessage(threadId, fromSide, text, timeLabel) {
  const msgId = newId('m')
  getDb()
    .prepare(
      'INSERT INTO chat_messages (id, thread_id, from_side, text, time_label) VALUES (?, ?, ?, ?, ?)',
    )
    .run(msgId, threadId, fromSide, text, timeLabel)
  return msgId
}

function bumpThread(threadId, { timeLabel, unreadDelta = null, unreadSet = null }) {
  if (unreadSet != null) {
    getDb()
      .prepare(
        `UPDATE chat_threads
         SET updated_label = ?, updated_at = datetime('now'), unread = ?
         WHERE id = ?`,
      )
      .run(timeLabel, unreadSet, threadId)
    return
  }
  if (unreadDelta != null) {
    getDb()
      .prepare(
        `UPDATE chat_threads
         SET updated_label = ?, updated_at = datetime('now'), unread = unread + ?
         WHERE id = ?`,
      )
      .run(timeLabel, unreadDelta, threadId)
    return
  }
  getDb()
    .prepare(
      `UPDATE chat_threads
       SET updated_label = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
    .run(timeLabel, threadId)
}

/** Ensure seller (or peer) has a mirrored inbox thread for this listing chat. */
function ensurePeerThread(myThread, openerText = null) {
  const db = getDb()
  const peerUserId = myThread.other_user_id
  if (!peerUserId || peerUserId === myThread.user_id) return null

  let peer = findPeerThread(myThread)
  if (peer) return peer

  const me = userPublic(myThread.user_id)
  const peerId = newId('c')
  const now = timeLabelNow()

  db.prepare(`
    INSERT INTO chat_threads (
      id, user_id, other_user_id, listing_id, listing_title, listing_image, listing_category,
      other_name, other_avatar, unread, updated_label
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    peerId,
    peerUserId,
    myThread.user_id,
    myThread.listing_id,
    myThread.listing_title,
    myThread.listing_image,
    myThread.listing_category,
    me.name,
    me.avatar,
    openerText ? 1 : 0,
    now,
  )

  if (openerText) {
    insertMessage(peerId, 'them', openerText, now)
  } else {
    // Backfill existing messages with flipped sides
    const msgs = db
      .prepare(
        'SELECT from_side, text, time_label FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC, rowid ASC',
      )
      .all(myThread.id)
    for (const m of msgs) {
      const side = m.from_side === 'me' ? 'them' : 'me'
      insertMessage(peerId, side, m.text, m.time_label || now)
    }
    if (msgs.length) {
      const unread = msgs.filter((m) => m.from_side === 'me').length
      bumpThread(peerId, { timeLabel: now, unreadSet: Math.max(1, unread) })
    }
  }

  return db.prepare('SELECT * FROM chat_threads WHERE id = ?').get(peerId)
}

function deliverToPeer(myThread, text, timeLabel) {
  let peer = findPeerThread(myThread)
  if (!peer) {
    peer = ensurePeerThread(myThread, text)
    return peer
  }
  insertMessage(peer.id, 'them', text, timeLabel)
  bumpThread(peer.id, { timeLabel, unreadDelta: 1 })
  return peer
}

/** One-time: create missing peer inboxes for older buyer-only threads. */
function backfillMissingPeers() {
  try {
    const db = getDb()
    const rows = db
      .prepare(
        `SELECT * FROM chat_threads
         WHERE other_user_id IS NOT NULL
           AND other_user_id != user_id`,
      )
      .all()
    const tx = db.transaction(() => {
      for (const row of rows) {
        const peer = findPeerThread(row)
        if (!peer) ensurePeerThread(row, null)
      }
    })
    tx()
  } catch {
    /* ignore */
  }
}

router.get('/threads', (req, res) => {
  ensureChatReady()
  const rows = getDb()
    .prepare('SELECT * FROM chat_threads WHERE user_id = ? ORDER BY updated_at DESC')
    .all(req.user.id)
  const threads = rows.map((row) => {
    const messages = getDb()
      .prepare('SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC, rowid ASC')
      .all(row.id)
    return rowToChatThread(row, messages)
  })
  res.json({ threads })
})

router.get('/threads/:id', (req, res) => {
  ensureChatReady()
  const thread = loadThread(req.params.id, req.user.id)
  if (!thread) return res.status(404).json({ error: 'Thread not found' })
  res.json({ thread })
})

router.post('/threads', (req, res) => {
  ensureChatReady()
  const listingId = Number(req.body.listingId)
  const listing = getDb().prepare('SELECT * FROM listings WHERE id = ?').get(listingId)
  if (!listing) return res.status(404).json({ error: 'Listing not found' })

  const sellerId = listing.user_id
  if (!sellerId) return res.status(400).json({ error: 'Listing has no owner' })
  if (Number(sellerId) === Number(req.user.id)) {
    return res.status(400).json({ error: 'Cannot chat on your own listing' })
  }

  const existing = getDb()
    .prepare('SELECT * FROM chat_threads WHERE user_id = ? AND listing_id = ?')
    .get(req.user.id, listingId)
  if (existing) {
    if (!existing.other_user_id) {
      getDb()
        .prepare('UPDATE chat_threads SET other_user_id = ? WHERE id = ?')
        .run(sellerId, existing.id)
      existing.other_user_id = sellerId
    }
    ensurePeerThread(existing, null)
    return res.json({ thread: loadThread(existing.id, req.user.id) })
  }

  const seller = userPublic(sellerId)
  const buyer = userPublic(req.user.id)
  const threadId = newId('c')
  const peerThreadId = newId('c')
  const now = timeLabelNow()
  const text =
    (typeof req.body.message === 'string' && req.body.message.trim()) ||
    `سلام، درباره «${listing.title}» پیام می‌دهم.`

  const tx = getDb().transaction(() => {
    getDb()
      .prepare(`
      INSERT INTO chat_threads (
        id, user_id, other_user_id, listing_id, listing_title, listing_image, listing_category,
        other_name, other_avatar, unread, updated_label
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `)
      .run(
        threadId,
        req.user.id,
        sellerId,
        listingId,
        listing.title,
        listing.image,
        listing.category,
        seller.name || listing.seller_name,
        seller.avatar || listing.seller_avatar,
        now,
      )
    insertMessage(threadId, 'me', text, now)

    getDb()
      .prepare(`
      INSERT INTO chat_threads (
        id, user_id, other_user_id, listing_id, listing_title, listing_image, listing_category,
        other_name, other_avatar, unread, updated_label
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `)
      .run(
        peerThreadId,
        sellerId,
        req.user.id,
        listingId,
        listing.title,
        listing.image,
        listing.category,
        buyer.name,
        buyer.avatar,
        now,
      )
    insertMessage(peerThreadId, 'them', text, now)
  })

  tx()
  res.status(201).json({ thread: loadThread(threadId, req.user.id) })
})

router.post('/threads/:id/messages', (req, res) => {
  ensureChatReady()
  const threadId = req.params.id
  const row = getDb()
    .prepare('SELECT * FROM chat_threads WHERE id = ? AND user_id = ?')
    .get(threadId, req.user.id)
  if (!row) return res.status(404).json({ error: 'Thread not found' })

  const text = req.body.text?.trim()
  if (!text) return res.status(400).json({ error: 'Message text required' })

  // Repair legacy rows missing peer link
  if (!row.other_user_id && row.listing_id) {
    const listing = getDb().prepare('SELECT user_id FROM listings WHERE id = ?').get(row.listing_id)
    if (listing?.user_id && Number(listing.user_id) !== Number(req.user.id)) {
      getDb().prepare('UPDATE chat_threads SET other_user_id = ? WHERE id = ?').run(listing.user_id, row.id)
      row.other_user_id = listing.user_id
    } else if (listing?.user_id && Number(listing.user_id) === Number(req.user.id)) {
      // Seller thread from before peer model: find buyer from any peer-looking thread
      const buyerThread = getDb()
        .prepare(
          `SELECT * FROM chat_threads
           WHERE listing_id = ? AND user_id != ? AND (other_user_id IS NULL OR other_user_id = ?)
           ORDER BY updated_at DESC LIMIT 1`,
        )
        .get(row.listing_id, req.user.id, req.user.id)
      if (buyerThread) {
        getDb()
          .prepare('UPDATE chat_threads SET other_user_id = ? WHERE id = ?')
          .run(buyerThread.user_id, row.id)
        row.other_user_id = buyerThread.user_id
        if (!buyerThread.other_user_id) {
          getDb()
            .prepare('UPDATE chat_threads SET other_user_id = ? WHERE id = ?')
            .run(req.user.id, buyerThread.id)
        }
      }
    }
  }

  if (!row.other_user_id) {
    return res.status(400).json({ error: 'Chat peer missing — start chat from listing again' })
  }

  const now = timeLabelNow()

  const tx = getDb().transaction(() => {
    insertMessage(threadId, 'me', text, now)
    bumpThread(threadId, { timeLabel: now, unreadSet: 0 })
    deliverToPeer(row, text, now)
  })

  tx()
  res.status(201).json({ thread: loadThread(threadId, req.user.id) })
})

router.patch('/threads/:id/read', (req, res) => {
  getDb()
    .prepare(
      `UPDATE chat_threads
       SET unread = 0, last_read_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
    )
    .run(req.params.id, req.user.id)
  res.json({ ok: true })
})

export default router
