import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { getDb } from '../db/database.js'

export function authRequired(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret)
    const user = getDb().prepare('SELECT id, email, name, avatar, city, phone, verified, pro_tier FROM users WHERE id = ?').get(payload.sub)
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      city: user.city,
      phone: user.phone || '',
      verified: !!user.verified,
      proTier: user.pro_tier,
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next()
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret)
    const user = getDb().prepare('SELECT id, email, name, avatar, city, phone, verified, pro_tier FROM users WHERE id = ?').get(payload.sub)
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        city: user.city,
        phone: user.phone || '',
        verified: !!user.verified,
        proTier: user.pro_tier,
      }
    }
  } catch { /* ignore */ }
  next()
}
