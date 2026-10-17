import { Router } from 'express'
import { z } from 'zod'
import { getDb } from '../db/database.js'
import { authRequired, optionalAuth } from '../middleware/auth.js'
import { rowToListing, listingInputToRow } from '../utils/mappers.js'
import { normalizeMediaList, parseIncomingMedia, mediaCoverUrl } from '../utils/media.js'
import { persistMediaList, persistDataUrl } from '../utils/persistMedia.js'
import { config } from '../config.js'

const router = Router()

function getListingById(id, userId, { mode = 'full' } = {}) {
  const row = getDb().prepare(`
    SELECT l.*, u.phone AS owner_phone
    FROM listings l
    LEFT JOIN users u ON u.id = l.user_id
    WHERE l.id = ?
  `).get(id)
  if (!row) return null
  const isMine = Boolean(userId && row.user_id === userId)
  return rowToListing(row, { isMine, mode })
}

function userIsExchangeTrusted(userId) {
  const row = getDb().prepare('SELECT exchange_trusted FROM users WHERE id = ?').get(userId)
  if (row?.exchange_trusted) return true
  const approved = getDb().prepare(`
    SELECT 1 AS ok FROM listings
    WHERE user_id = ? AND category = 'exchange' AND status = 'active'
    LIMIT 1
  `).get(userId)
  return Boolean(approved)
}

function markExchangeTrusted(userId) {
  getDb().prepare('UPDATE users SET exchange_trusted = 1 WHERE id = ?').run(userId)
}

function isAdminRequest(req) {
  const secret = String(config.adminSecret || '').trim()
  if (!secret) return false
  const header = String(req.headers['x-admin-secret'] || '').trim()
  const bodySecret = String(req.body?.adminSecret || '').trim()
  return header === secret || bodySecret === secret
}

router.get('/', optionalAuth, (req, res) => {
  const userId = req.user?.id
  const rows = getDb()
    .prepare(`
      SELECT l.*, u.phone AS owner_phone
      FROM listings l
      LEFT JOIN users u ON u.id = l.user_id
      WHERE l.status = 'active'
        AND l.category != 'dating-dm'
      ORDER BY l.created_at DESC
    `)
    .all()
  const listings = rows.map((r) => rowToListing(r, {
    isMine: Boolean(userId && r.user_id === userId),
    mode: 'card',
  }))
  res.json({ listings })
})

router.get('/:id', optionalAuth, (req, res) => {
  const listing = getListingById(Number(req.params.id), req.user?.id)
  if (!listing) return res.status(404).json({ error: 'Listing not found' })
  if (listing.status !== 'active' && !listing.isMine && !isAdminRequest(req)) {
    return res.status(404).json({ error: 'Listing not found' })
  }
  getDb().prepare('UPDATE listings SET views = views + 1 WHERE id = ?').run(listing.id)
  listing.views += 1
  res.json({ listing })
})

const createSchema = z.object({
  title: z.string().min(3),
  category: z.string(),
  city: z.string().optional(),
  region: z.string().optional(),
  neighborhood: z.string().optional(),
  price: z.number().optional(),
  priceLabel: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.union([
    z.string(),
    z.object({ type: z.string(), url: z.string(), poster: z.string().optional() }),
  ])).max(8).optional(),
  media: z.array(z.object({
    type: z.enum(['image', 'video']),
    url: z.string().min(1),
    poster: z.string().optional(),
  })).max(8).optional(),
  description: z.string().optional(),
  condition: z.string().optional(),
  attributes: z.record(z.any()).optional(),
  features: z.array(z.string()).optional(),
})

router.post('/', authRequired, (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const rawMedia = parseIncomingMedia(parsed.data)
  const draftId = `new-${Date.now()}`
  const media = persistMediaList(rawMedia, { folder: 'listings', id: draftId })
  let cover = mediaCoverUrl(media)
    || (parsed.data.image && !String(parsed.data.image).startsWith('data:video') ? parsed.data.image : '')
    || '/listings/phone.jpg'
  if (cover.startsWith('data:')) {
    cover = persistDataUrl(cover, { folder: 'listings', basename: `${draftId}-cover` }) || '/listings/phone.jpg'
  }

  const isExchange = parsed.data.category === 'exchange'
  const status = 'pending'

  const row = listingInputToRow(
    {
      ...parsed.data,
      seller: req.user.name,
      sellerAvatar: req.user.avatar,
      image: cover,
      images: media,
      media,
      status,
    },
    req.user.id
  )

  const cols = Object.keys(row).join(', ')
  const placeholders = Object.keys(row).map((k) => `@${k}`).join(', ')
  const r = getDb().prepare(`INSERT INTO listings (${cols}) VALUES (${placeholders})`).run(row)
  const listing = getListingById(r.lastInsertRowid, req.user.id, { mode: 'card' })
  res.status(201).json({ listing })
})

router.patch('/:id', authRequired, (req, res) => {
  const id = Number(req.params.id)
  const existing = getDb().prepare('SELECT * FROM listings WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const updates = []
  const values = {}
  if (req.body.title) { updates.push('title = @title'); values.title = req.body.title }

  // Only admins may set status directly. Owner content edits go back to pending below.
  if (req.body.status && isAdminRequest(req)) {
    updates.push('status = @status')
    values.status = String(req.body.status)
  }

  let contentChanged = false

  if (req.body.price !== undefined) {
    updates.push('price = @price', 'price_label = @price_label')
    values.price = req.body.price
    values.price_label = req.body.priceLabel || `$${Number(req.body.price).toLocaleString()}`
    contentChanged = true
  } else if (req.body.priceLabel) {
    updates.push('price_label = @price_label')
    values.price_label = req.body.priceLabel
    contentChanged = true
  }
  if (req.body.title) contentChanged = true
  if (req.body.description !== undefined) {
    updates.push('description = @description')
    values.description = req.body.description
    contentChanged = true
  }
  if (req.body.attributes) {
    let attrs = req.body.attributes
    if (existing.category === 'exchange') {
      try {
        const prev = JSON.parse(existing.attributes_json || '{}')
        // Drop live-approval flag until admin re-approves after edit
        const { exchangeApproved: _ea, exchangeApprovedAt: _eat, ...restPrev } = prev
        attrs = { ...restPrev, ...attrs }
        delete attrs.exchangeApproved
        delete attrs.exchangeApprovedAt
      } catch {
        attrs = { ...attrs }
        delete attrs.exchangeApproved
        delete attrs.exchangeApprovedAt
      }
    }
    updates.push('attributes_json = @attributes_json')
    values.attributes_json = JSON.stringify(attrs)
    contentChanged = true
  }
  if (req.body.badges) {
    updates.push('badges_json = @badges_json')
    values.badges_json = JSON.stringify(req.body.badges)
    contentChanged = true
  }

  const hasMedia = Array.isArray(req.body.media) || Array.isArray(req.body.images) || req.body.image != null
  if (hasMedia) {
    const media = persistMediaList(parseIncomingMedia(req.body), { folder: 'listings', id: String(id) })
    const normalized = normalizeMediaList(media).slice(0, 8)
    let cover = mediaCoverUrl(normalized)
      || (req.body.image && !String(req.body.image).startsWith('data:video') ? req.body.image : '')
      || ''
    if (cover.startsWith('data:')) {
      cover = persistDataUrl(cover, { folder: 'listings', basename: `${id}-cover` }) || ''
    }
    updates.push('image = @image', 'images_json = @images_json')
    values.image = cover
    values.images_json = JSON.stringify(normalized)
    contentChanged = true
  }

  if (!updates.length) return res.json({ listing: getListingById(id, req.user.id) })

  // After owner edits content, listing must be re-approved before staying public
  if (contentChanged && !isAdminRequest(req) && existing.status !== 'deleted') {
    updates.push("status = 'pending'")
  }

  updates.push("updated_at = datetime('now')")
  values.id = id
  getDb().prepare(`UPDATE listings SET ${updates.join(', ')} WHERE id = @id`).run(values)
  res.json({ listing: getListingById(id, req.user.id) })
})

/** Admin: approve first exchange listing → active + trust seller for future posts/edits */
router.post('/:id/approve', authRequired, (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin approval required' })
  }
  const id = Number(req.params.id)
  const existing = getDb().prepare('SELECT * FROM listings WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Not found' })

  let attrs = {}
  try { attrs = JSON.parse(existing.attributes_json || '{}') } catch { attrs = {} }
  attrs.exchangeApproved = true
  attrs.exchangeApprovedAt = new Date().toISOString()

  getDb().prepare(`
    UPDATE listings
    SET status = 'active',
        attributes_json = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(JSON.stringify(attrs), id)

  if (existing.category === 'exchange') {
    markExchangeTrusted(existing.user_id)
  }

  res.json({ listing: getListingById(id, req.user.id) })
})

router.delete('/:id', authRequired, (req, res) => {
  const id = Number(req.params.id)
  const existing = getDb().prepare('SELECT user_id FROM listings WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  getDb().prepare("UPDATE listings SET status = 'deleted', updated_at = datetime('now') WHERE id = ?").run(id)
  res.json({ ok: true })
})

const REPORT_REASONS = new Set([
  'spam',
  'fraud',
  'wrong-category',
  'sold',
  'inappropriate',
  'other',
])

router.post('/:id/report', authRequired, (req, res) => {
  const listingId = Number(req.params.id)
  const listing = getDb().prepare('SELECT id, user_id, status FROM listings WHERE id = ?').get(listingId)
  if (!listing || listing.status === 'deleted') {
    return res.status(404).json({ error: 'Listing not found' })
  }
  if (listing.user_id === req.user.id) {
    return res.status(400).json({ error: 'Cannot report your own ad' })
  }

  const reason = String(req.body?.reason || '').trim()
  if (!REPORT_REASONS.has(reason)) {
    return res.status(400).json({ error: 'Invalid report reason' })
  }
  const details = String(req.body?.details || '').trim().slice(0, 1000)

  const existing = getDb().prepare(
    'SELECT id FROM listing_reports WHERE listing_id = ? AND user_id = ?'
  ).get(listingId, req.user.id)

  if (existing) {
    return res.json({ ok: true, alreadyReported: true })
  }

  getDb().prepare(`
    INSERT INTO listing_reports (listing_id, user_id, reason, details)
    VALUES (?, ?, ?, ?)
  `).run(listingId, req.user.id, reason, details)

  res.status(201).json({ ok: true, alreadyReported: false })
})

export default router
