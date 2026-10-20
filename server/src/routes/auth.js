import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { getDb } from '../db/database.js'
import { config } from '../config.js'
import { authRequired } from '../middleware/auth.js'
import { PEJO_DEFAULT_AVATAR, resolveUserAvatar } from '../utils/defaultAvatar.js'
import {
  BYPASS_OTP,
  canonicalBypassPhone,
  isBypassPhone,
  isGoogleReviewPhone,
} from '../lib/devBypassPhone.js'

const router = Router()

function normalizePhone(raw) {
  const bypass = canonicalBypassPhone(raw)
  if (bypass) return bypass
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 10) return digits
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return null
}

function phoneToEmail(phone) {
  return `p${phone}@divar.phone`
}

/** Trim + strip invisible chars that break password compare after paste. */
function normalizePassword(raw) {
  return String(raw ?? '')
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
    .normalize('NFC')
    .trim()
}

function normalizeEmail(raw) {
  return String(raw ?? '')
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
    .trim()
    .toLowerCase()
}

function findUserByEmail(db, email) {
  return db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(email)
}

function isPhoneLoginEmail(email) {
  return /@divar\.phone$/i.test(String(email || ''))
}

function formatUser(user) {
  const contactEmail = String(user.contact_email || '').trim()
    || (!isPhoneLoginEmail(user.email) ? String(user.email || '').trim() : '')
  const emailVerified = contactEmail
    ? (!!user.email_verified || (!user.contact_email && !isPhoneLoginEmail(user.email)))
    : false

  return {
    id: user.id,
    email: contactEmail,
    emailVerified,
    name: user.name,
    avatar: resolveUserAvatar(user.avatar),
    city: user.city,
    phone: user.phone || '',
    verified: !!user.verified,
    proTier: user.pro_tier,
  }
}

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

function passwordsMatch(password, passwordHash) {
  if (!passwordHash || typeof passwordHash !== 'string') return false
  // Dating demo rows used literal "demo" — never match real logins
  if (!passwordHash.startsWith('$2')) return false
  try {
    return bcrypt.compareSync(password, passwordHash)
  } catch {
    return false
  }
}

const loginSchema = z.object({
  email: z.string().min(3).max(200),
  password: z.string().min(1).max(200),
})

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().min(3).max(200),
  password: z.string().min(6).max(200),
  city: z.string().max(80).optional(),
})

router.post('/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'اطلاعات وارد شده معتبر نیست' })
  }

  const email = normalizeEmail(parsed.data.email)
  const password = normalizePassword(parsed.data.password)
  const name = parsed.data.name.trim()

  if (!email.includes('@') || email.length < 5) {
    return res.status(400).json({ error: 'ایمیل نامعتبر است' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  }

  const db = getDb()
  const exists = findUserByEmail(db, email)
  if (exists) {
    return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است. وارد شوید.' })
  }

  const passwordHash = hashPassword(password)
  // Sanity: never store a hash that won't verify the same password
  if (!passwordsMatch(password, passwordHash)) {
    return res.status(500).json({ error: 'خطا در ذخیره رمز عبور. دوباره تلاش کنید.' })
  }

  const avatar = PEJO_DEFAULT_AVATAR
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, avatar, city, verified, pro_tier, contact_email, email_verified)
    VALUES (?, ?, ?, ?, ?, 0, NULL, ?, 1)
  `).run(
    email,
    passwordHash,
    name,
    avatar,
    parsed.data.city?.trim() || 'Vancouver',
    email
  )

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
  const token = issueToken(user)

  res.status(201).json({ token, user: formatUser(user) })
})

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'ایمیل یا رمز عبور نامعتبر است' })
  }

  const email = normalizeEmail(parsed.data.email)
  const password = normalizePassword(parsed.data.password)
  if (!email || !password) {
    return res.status(400).json({ error: 'ایمیل یا رمز عبور نامعتبر است' })
  }

  const db = getDb()
  const user = findUserByEmail(db, email)
  if (!user) {
    return res.status(401).json({ error: 'حسابی با این ایمیل پیدا نشد. ابتدا ثبت‌نام کنید.' })
  }

  if (!passwordsMatch(password, user.password_hash)) {
    // Legacy fallback: untrimmed password (accounts created before normalize)
    const raw = String(parsed.data.password ?? '')
    if (raw !== password && passwordsMatch(raw, user.password_hash)) {
      return res.json({ token: issueToken(user), user: formatUser(user) })
    }
    return res.status(401).json({ error: 'رمز عبور اشتباه است' })
  }

  res.json({ token: issueToken(user), user: formatUser(user) })
})

const otpSendSchema = z.object({
  phone: z.string().min(8).max(20),
})

const firebaseLoginSchema = z.object({
  idToken: z.string().min(20).max(4000),
  name: z.string().min(2).max(80).optional(),
  username: z.string().min(3).max(32).optional(),
})

function findUserByPhone(db, phone) {
  const email = phoneToEmail(phone)
  return findUserByEmail(db, email)
    || db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)
}

function completePhoneLogin(res, phone, profile = {}) {
  const email = phoneToEmail(phone)
  const db = getDb()
  let user = findUserByPhone(db, phone)

  if (user) {
    if (!user.phone) {
      db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(phone, user.id)
      user = { ...user, phone }
    }
    return res.json({ token: issueToken(user), user: formatUser(user), isNewUser: false })
  }

  const username = String(profile.username || profile.name || '')
    .trim()
    .replace(/\s+/g, '_')

  if (!username || username.length < 3) {
    return res.json({ needsProfile: true, isNewUser: true, phone })
  }
  if (!/^[\w.\u0600-\u06FF-]{3,32}$/u.test(username)) {
    return res.status(400).json({ error: 'یوزرنیم نامعتبر است' })
  }

  const taken = db.prepare('SELECT id FROM users WHERE lower(name) = lower(?)').get(username)
  if (taken) {
    return res.status(409).json({ error: 'این یوزرنیم قبلاً گرفته شده است' })
  }

  const passwordHash = hashPassword(config.demoPassword || `otp-${phone}`)
  const avatar = PEJO_DEFAULT_AVATAR
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, avatar, city, phone, verified, pro_tier)
    VALUES (?, ?, ?, ?, ?, ?, 1, NULL)
  `).run(email, passwordHash, username, avatar, 'ونکوور', phone)
  user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)

  return res.status(201).json({ token: issueToken(user), user: formatUser(user), isNewUser: true })
}

async function lookupFirebaseIdToken(idToken) {
  const key = config.firebaseWebApiKey
  if (!key) {
    const err = new Error('Firebase API key is not configured on the server')
    err.status = 500
    throw err
  }
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  const data = await response.json().catch(() => ({}))
  const account = data.users?.[0]
  if (!response.ok || !account) {
    const err = new Error('توکن فایربیس نامعتبر است')
    err.status = 401
    throw err
  }
  return account
}

router.post('/check-phone', (req, res) => {
  const parsed = otpSendSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'شماره موبایل نامعتبر است' })
  }
  const phone = normalizePhone(parsed.data.phone)
  if (!phone) {
    return res.status(400).json({ error: 'شماره موبایل کانادایی ۱۰ رقمی وارد کنید' })
  }
  const existing = findUserByPhone(getDb(), phone)
  res.json({
    ok: true,
    isNewUser: !existing,
  })
})

router.post('/send-otp', (req, res) => {
  const parsed = otpSendSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'شماره موبایل نامعتبر است' })
  }
  const phone = normalizePhone(parsed.data.phone)
  if (!phone) {
    return res.status(400).json({ error: 'شماره موبایل کانادایی ۱۰ رقمی وارد کنید' })
  }
  const existing = findUserByPhone(getDb(), phone)
  res.json({
    ok: true,
    message: 'کد تأیید از فایربیس ارسال می‌شود',
    isNewUser: !existing,
  })
})

router.post('/firebase', async (req, res) => {
  const parsed = firebaseLoginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'اطلاعات تأیید نامعتبر است' })
  }
  try {
    const account = await lookupFirebaseIdToken(parsed.data.idToken)
    const phone = normalizePhone(account.phoneNumber)
    if (!phone) {
      return res.status(400).json({ error: 'شماره موبایل فایربیس نامعتبر است' })
    }
    return completePhoneLogin(res, phone, parsed.data)
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message || 'تأیید فایربیس ناموفق بود' })
  }
})

const otpVerifySchema = z.object({
  phone: z.string().min(8).max(20),
  code: z.string().min(4).max(8),
  name: z.string().min(2).max(80).optional(),
  username: z.string().min(3).max(32).optional(),
})

router.post('/verify-otp', (req, res) => {
  const parsed = otpVerifySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'اطلاعات تأیید نامعتبر است' })
  }
  const phone = normalizePhone(parsed.data.phone)
  if (!phone || !isBypassPhone(phone)) {
    return res.status(410).json({ error: 'ورود فقط با کد پیامک فایربیس انجام می‌شود' })
  }
  const code = String(parsed.data.code).trim()
  // Google review account accepts any code (or empty) so Play reviewers never get stuck.
  if (!isGoogleReviewPhone(phone) && code !== BYPASS_OTP) {
    return res.status(401).json({ error: 'کد تأیید اشتباه است' })
  }
  return completePhoneLogin(res, phone, {
    name: parsed.data.name,
    username: parsed.data.username,
  })
})

router.post('/logout', authRequired, (req, res) => {
  res.json({ ok: true, message: 'با موفقیت خارج شدید' })
})

router.get('/me', authRequired, (req, res) => {
  const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!row) return res.status(401).json({ error: 'User not found' })
  res.json({ user: formatUser(row) })
})

const emailOtpSchema = z.object({
  email: z.string().email().max(200),
})

const emailVerifySchema = z.object({
  email: z.string().email().max(200),
  code: z.string().min(4).max(8),
})

router.post('/email/send-otp', authRequired, (req, res) => {
  const parsed = emailOtpSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'ایمیل نامعتبر است' })
  }
  const email = normalizeEmail(parsed.data.email)
  if (!email.includes('@') || isPhoneLoginEmail(email)) {
    return res.status(400).json({ error: 'ایمیل نامعتبر است' })
  }

  const db = getDb()
  const taken = db.prepare(`
    SELECT id FROM users
    WHERE id != ?
      AND (
        lower(contact_email) = ?
        OR (lower(email) = ? AND email NOT LIKE '%@divar.phone')
      )
  `).get(req.user.id, email, email)
  if (taken) {
    return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است' })
  }

  db.prepare(`
    UPDATE users SET contact_email = ?, email_verified = 0 WHERE id = ?
  `).run(email, req.user.id)

  res.json({
    ok: true,
    message: 'کد تأیید ایمیل ارسال شد',
    // Temporary until real email is wired
    hint: config.otpCode,
  })
})

router.post('/email/verify-otp', authRequired, (req, res) => {
  const parsed = emailVerifySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'اطلاعات تأیید نامعتبر است' })
  }
  const email = normalizeEmail(parsed.data.email)
  if (String(parsed.data.code).trim() !== String(config.otpCode)) {
    return res.status(401).json({ error: 'کد تأیید اشتباه است' })
  }

  const db = getDb()
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!existing) return res.status(401).json({ error: 'User not found' })

  const pending = String(existing.contact_email || '').trim().toLowerCase()
  if (pending !== email) {
    return res.status(400).json({ error: 'ابتدا کد را برای همین ایمیل درخواست کنید' })
  }

  db.prepare(`
    UPDATE users SET contact_email = ?, email_verified = 1 WHERE id = ?
  `).run(email, req.user.id)

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({ user: formatUser(row), ok: true })
})

router.patch('/me', authRequired, (req, res) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!existing) return res.status(401).json({ error: 'User not found' })

  const name = req.body?.name != null ? String(req.body.name).trim() : existing.name
  const city = req.body?.city != null ? String(req.body.city).trim() : existing.city
  const avatar = req.body?.avatar != null ? String(req.body.avatar).trim() : existing.avatar
  let phone = existing.phone || ''
  if (req.body?.phone != null) {
    const normalized = normalizePhone(req.body.phone)
    if (req.body.phone && !normalized) {
      return res.status(400).json({ error: 'شماره موبایل نامعتبر است' })
    }
    phone = normalized || ''
  }

  if (!name || name.length < 3) {
    return res.status(400).json({ error: 'یوزرنیم باید حداقل ۳ کاراکتر باشد' })
  }

  const nameTaken = db.prepare('SELECT id FROM users WHERE lower(name) = lower(?) AND id != ?').get(name, existing.id)
  if (nameTaken) {
    return res.status(409).json({ error: 'این یوزرنیم قبلاً گرفته شده است' })
  }

  db.prepare(`
    UPDATE users
    SET name = ?, city = ?, avatar = ?, phone = ?
    WHERE id = ?
  `).run(name, city || existing.city, avatar || existing.avatar || PEJO_DEFAULT_AVATAR, phone, req.user.id)

  // Keep seller display fields in sync on active ads
  db.prepare(`
    UPDATE listings
    SET seller_name = ?, seller_avatar = ?, updated_at = datetime('now')
    WHERE user_id = ? AND status NOT IN ('deleted', 'hidden')
  `).run(name, avatar || existing.avatar, req.user.id)

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({ user: formatUser(row) })
})

router.delete('/account', authRequired, (req, res) => {
  const db = getDb()
  const userId = req.user.id

  const runQuiet = (sql, ...params) => {
    try {
      db.prepare(sql).run(...params)
    } catch {
      /* table may not exist yet on older DBs */
    }
  }

  const tx = db.transaction(() => {
    const listingIds = db
      .prepare('SELECT id FROM listings WHERE user_id = ?')
      .all(userId)
      .map((row) => row.id)

    // Marketplace chat (as owner or peer)
    runQuiet(
      `DELETE FROM chat_messages WHERE thread_id IN (
        SELECT id FROM chat_threads WHERE user_id = ? OR other_user_id = ?
      )`,
      userId,
      userId,
    )
    runQuiet('DELETE FROM chat_threads WHERE user_id = ? OR other_user_id = ?', userId, userId)

    // Dating
    runQuiet(
      `DELETE FROM dating_messages WHERE thread_id IN (
        SELECT id FROM dating_threads WHERE user_id = ? OR other_user_id = ?
      )`,
      userId,
      userId,
    )
    runQuiet('DELETE FROM dating_threads WHERE user_id = ? OR other_user_id = ?', userId, userId)
    runQuiet('DELETE FROM dating_likes WHERE from_user_id = ? OR to_user_id = ?', userId, userId)
    runQuiet('DELETE FROM dating_passes WHERE from_user_id = ? OR to_user_id = ?', userId, userId)
    runQuiet('DELETE FROM dating_blocks WHERE user_id = ? OR blocked_user_id = ?', userId, userId)
    runQuiet('DELETE FROM dating_secret_crush WHERE from_user_id = ? OR to_user_id = ?', userId, userId)
    runQuiet('DELETE FROM dating_profiles WHERE user_id = ?', userId)

    // Hamyari
    runQuiet(
      `DELETE FROM hamyari_messages WHERE thread_id IN (
        SELECT id FROM hamyari_threads WHERE user_id = ? OR other_user_id = ?
      )`,
      userId,
      userId,
    )
    runQuiet('DELETE FROM hamyari_threads WHERE user_id = ? OR other_user_id = ?', userId, userId)
    runQuiet('DELETE FROM hamyari_likes WHERE user_id = ?', userId)
    runQuiet('DELETE FROM hamyari_comments WHERE user_id = ?', userId)
    runQuiet('DELETE FROM hamyari_notifications WHERE user_id = ?', userId)
    runQuiet('DELETE FROM hamyari_posts WHERE user_id = ?', userId)

    // Listing dependents (must clear before deleting listings / user)
    if (listingIds.length) {
      const placeholders = listingIds.map(() => '?').join(',')
      runQuiet(`DELETE FROM saved_listings WHERE listing_id IN (${placeholders})`, ...listingIds)
      runQuiet(`DELETE FROM compare_listings WHERE listing_id IN (${placeholders})`, ...listingIds)
      runQuiet(`DELETE FROM listing_reports WHERE listing_id IN (${placeholders})`, ...listingIds)
      runQuiet(`DELETE FROM handshake_offers WHERE listing_id IN (${placeholders})`, ...listingIds)
      runQuiet(`DELETE FROM pulse_matches WHERE listing_id IN (${placeholders})`, ...listingIds)
      runQuiet(
        `DELETE FROM chat_messages WHERE thread_id IN (
          SELECT id FROM chat_threads WHERE listing_id IN (${placeholders})
        )`,
        ...listingIds,
      )
      runQuiet(`DELETE FROM chat_threads WHERE listing_id IN (${placeholders})`, ...listingIds)
    }

    runQuiet('DELETE FROM handshake_offers WHERE user_id = ?', userId)
    runQuiet('DELETE FROM search_alerts WHERE user_id = ?', userId)
    runQuiet('DELETE FROM saved_listings WHERE user_id = ?', userId)
    runQuiet('DELETE FROM compare_listings WHERE user_id = ?', userId)
    runQuiet('DELETE FROM listing_reports WHERE user_id = ?', userId)
    // Pulse matches that reference this user's wants (any listing)
    runQuiet(
      `DELETE FROM pulse_matches WHERE want_id IN (
        SELECT id FROM want_signals WHERE user_id = ?
      )`,
      userId,
    )
    runQuiet('DELETE FROM want_signals WHERE user_id = ?', userId)
    // Hard-delete listings so users.FK is not left dangling (soft-delete caused FK failures)
    runQuiet('DELETE FROM listings WHERE user_id = ?', userId)
    db.prepare('DELETE FROM users WHERE id = ?').run(userId)
  })

  try {
    tx()
    res.json({ ok: true, message: 'Account deleted permanently' })
  } catch (err) {
    console.error('delete account failed', err)
    res.status(500).json({ error: err.message || 'Could not delete account' })
  }
})

export default router
