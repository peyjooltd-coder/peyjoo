import { Router } from 'express'
import express from 'express'
import { z } from 'zod'
import { authRequired } from '../middleware/auth.js'
import { persistBuffer, persistDataUrl } from '../utils/persistMedia.js'

const ALLOWED_FOLDERS = new Set(['listings', 'videos', 'covers', 'avatars', 'uploads', 'dating', 'hamyari'])

function safeFolder(raw) {
  const folder = String(raw || 'uploads').replace(/[^a-z0-9_-]/gi, '')
  return ALLOWED_FOLDERS.has(folder) ? folder : 'uploads'
}

const jsonSchema = z.object({
  dataUrl: z.string().min(20).max(130_000_000),
  folder: z.string().max(40).optional(),
})

const router = Router()

router.post('/', authRequired, (req, res) => {
  const parsed = jsonSchema.safeParse(req.body)
  if (!parsed.success || !String(parsed.data.dataUrl).startsWith('data:')) {
    return res.status(400).json({ error: 'فایل نامعتبر است' })
  }
  const url = persistDataUrl(parsed.data.dataUrl, {
    folder: safeFolder(parsed.data.folder),
    basename: `u${req.user.id}`,
  })
  if (!url || url.startsWith('data:')) {
    return res.status(400).json({ error: 'آپلود ناموفق بود' })
  }
  return res.json({ url })
})

router.post(
  '/binary',
  authRequired,
  express.raw({ type: () => true, limit: '95mb' }),
  (req, res) => {
    const buf = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '')
    const mime = String(req.headers['content-type'] || 'application/octet-stream').split(';')[0].trim()
    const url = persistBuffer(buf, {
      folder: safeFolder(req.query.folder || req.headers['x-upload-folder']),
      mime,
      basename: `u${req.user.id}`,
    })
    if (!url) {
      return res.status(400).json({ error: 'آپلود ناموفق بود' })
    }
    return res.json({ url })
  },
)

export default router
