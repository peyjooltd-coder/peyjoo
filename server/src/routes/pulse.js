import { Router } from 'express'
import { getDb } from '../db/database.js'
import { optionalAuth, authRequired } from '../middleware/auth.js'
import { rowToListing } from '../utils/mappers.js'

const router = Router()

router.get('/demand', (req, res) => {
  const demandPulse = getDb().prepare('SELECT area, category, intensity, seekers, trend, hot FROM demand_pulse ORDER BY intensity DESC').all()
  res.json({
    demandPulse: demandPulse.map((d) => ({
      area: d.area,
      category: d.category,
      intensity: d.intensity,
      seekers: d.seekers,
      trend: d.trend,
      hot: !!d.hot,
    })),
  })
})

router.get('/wants', (req, res) => {
  const rows = getDb().prepare('SELECT * FROM want_signals ORDER BY created_at DESC').all()
  res.json({
    wantSignals: rows.map((w) => ({
      id: w.id,
      title: w.title,
      category: w.category,
      budget: w.budget,
      region: w.region,
      radius: w.radius,
      urgency: w.urgency,
      seekers: w.seekers,
      matches: w.matches,
      posted: w.posted,
      avatar: w.avatar,
      verified: !!w.verified,
    })),
  })
})

router.post('/wants', authRequired, (req, res) => {
  const id = `w${Date.now()}`
  const b = req.body
  getDb().prepare(`
    INSERT INTO want_signals (id, user_id, title, category, budget, region, radius, urgency, seekers, matches, posted, avatar, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 'Just now', ?, 1)
  `).run(
    id, req.user.id, b.title, b.category, b.budget || '', b.region || 'Vancouver',
    b.radius || '15 km', b.urgency || 'Flexible', req.user.avatar
  )
  res.status(201).json({
    want: { id, ...b, seekers: 1, matches: 0, posted: 'Just now', avatar: req.user.avatar, verified: true },
  })
})

router.get('/matches', (req, res) => {
  const rows = getDb().prepare('SELECT * FROM pulse_matches ORDER BY score DESC').all()
  const matches = rows.map((m) => ({
    id: m.id,
    wantId: m.want_id,
    listingId: m.listing_id,
    score: m.score,
    reasons: JSON.parse(m.reasons_json || '[]'),
    status: m.status,
  }))
  res.json({ pulseMatches: matches })
})

router.get('/handshakes', authRequired, (req, res) => {
  const rows = getDb().prepare('SELECT * FROM handshake_offers WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
  res.json({
    handshakeOffers: rows.map((o) => ({
      id: o.id,
      listingTitle: o.listing_title,
      listingImage: o.listing_image,
      from: o.from_name,
      to: o.to_name,
      offerPrice: o.offer_price,
      counterPrice: o.counter_price,
      meetPoint: o.meet_point,
      timeSlot: o.time_slot,
      conditions: JSON.parse(o.conditions_json || '[]'),
      status: o.status,
      expires: o.expires,
      created: o.created_label,
    })),
  })
})

router.post('/handshakes', authRequired, (req, res) => {
  const id = `o${Date.now()}`
  const b = req.body
  getDb().prepare(`
    INSERT INTO handshake_offers (
      id, listing_id, user_id, listing_title, listing_image, from_name, to_name,
      offer_price, meet_point, time_slot, conditions_json, status, expires, created_label
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', '48h', 'Just now')
  `).run(
    id,
    b.listingId || null,
    req.user.id,
    b.listingTitle || '',
    b.listingImage || '',
    'You',
    b.seller || b.to || 'Seller',
    b.offerPrice,
    b.meetPoint,
    b.timeSlot,
    JSON.stringify(b.conditions || [])
  )
  res.status(201).json({
    offer: {
      id,
      from: 'You',
      to: b.seller || 'Seller',
      status: 'pending',
      expires: '48h',
      created: 'Just now',
      ...b,
    },
  })
})

export default router
