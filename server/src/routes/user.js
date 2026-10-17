import { Router } from 'express'
import { getDb } from '../db/database.js'
import { authRequired } from '../middleware/auth.js'
import { rowToListing } from '../utils/mappers.js'

const router = Router()
router.use(authRequired)

router.get('/saved', (req, res) => {
  const rows = getDb().prepare(`
    SELECT l.*, u.phone AS owner_phone
    FROM listings l
    INNER JOIN saved_listings s ON s.listing_id = l.id
    LEFT JOIN users u ON u.id = l.user_id
    WHERE s.user_id = ? AND l.status != 'deleted'
  `).all(req.user.id)
  res.json({
    savedIds: rows.map((r) => r.id),
    listings: rows.map((r) => rowToListing(r, { isMine: r.user_id === req.user.id, mode: 'card' })),
  })
})

router.post('/saved/:listingId/toggle', (req, res) => {
  const listingId = Number(req.params.listingId)
  const existing = getDb().prepare('SELECT 1 FROM saved_listings WHERE user_id = ? AND listing_id = ?').get(req.user.id, listingId)
  if (existing) {
    getDb().prepare('DELETE FROM saved_listings WHERE user_id = ? AND listing_id = ?').run(req.user.id, listingId)
    getDb().prepare('UPDATE listings SET saves = MAX(0, saves - 1) WHERE id = ?').run(listingId)
    return res.json({ saved: false })
  }
  getDb().prepare('INSERT INTO saved_listings (user_id, listing_id) VALUES (?, ?)').run(req.user.id, listingId)
  getDb().prepare('UPDATE listings SET saves = saves + 1 WHERE id = ?').run(listingId)
  res.json({ saved: true })
})

router.get('/compare', (req, res) => {
  const rows = getDb().prepare(`
    SELECT l.* FROM listings l
    INNER JOIN compare_listings c ON c.listing_id = l.id
    WHERE c.user_id = ?
    ORDER BY c.position
  `).all(req.user.id)
  res.json({
    compareIds: rows.map((r) => r.id),
    listings: rows.map((r) => rowToListing(r, { mode: 'card' })),
  })
})

router.post('/compare/:listingId/toggle', (req, res) => {
  const listingId = Number(req.params.listingId)
  const existing = getDb().prepare('SELECT 1 FROM compare_listings WHERE user_id = ? AND listing_id = ?').get(req.user.id, listingId)
  if (existing) {
    getDb().prepare('DELETE FROM compare_listings WHERE user_id = ? AND listing_id = ?').run(req.user.id, listingId)
    return res.json({ added: false, compareIds: getCompareIds(req.user.id) })
  }
  const count = getDb().prepare('SELECT COUNT(*) as c FROM compare_listings WHERE user_id = ?').get(req.user.id).c
  if (count >= 3) return res.status(400).json({ error: 'Maximum 3 listings to compare' })
  getDb().prepare('INSERT INTO compare_listings (user_id, listing_id, position) VALUES (?, ?, ?)').run(req.user.id, listingId, count)
  res.json({ added: true, compareIds: getCompareIds(req.user.id) })
})

function getCompareIds(userId) {
  return getDb().prepare('SELECT listing_id FROM compare_listings WHERE user_id = ? ORDER BY position').all(userId).map((r) => r.listing_id)
}

router.get('/alerts', (req, res) => {
  const alerts = getDb().prepare('SELECT id, query, region, active FROM search_alerts WHERE user_id = ?').all(req.user.id)
  res.json({
    alerts: alerts.map((a) => ({ id: a.id, query: a.query, region: a.region, active: !!a.active })),
  })
})

router.post('/alerts', (req, res) => {
  const { query, region } = req.body
  if (!query?.trim()) return res.status(400).json({ error: 'Query required' })
  const r = getDb().prepare('INSERT INTO search_alerts (user_id, query, region, active) VALUES (?, ?, ?, 1)').run(
    req.user.id, query.trim(), region || 'All Greater Vancouver'
  )
  res.status(201).json({ id: r.lastInsertRowid, query, region, active: true })
})

router.delete('/alerts/:id', (req, res) => {
  getDb().prepare('DELETE FROM search_alerts WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.user.id)
  res.json({ ok: true })
})

router.get('/listings', (req, res) => {
  const rows = getDb().prepare(`
    SELECT l.*, u.phone AS owner_phone
    FROM listings l
    LEFT JOIN users u ON u.id = l.user_id
    WHERE l.user_id = ? AND l.status != ?
    ORDER BY l.created_at DESC
  `).all(req.user.id, 'deleted')
  res.json({ listings: rows.map((r) => rowToListing(r, { isMine: true, mode: 'card' })) })
})

export default router
