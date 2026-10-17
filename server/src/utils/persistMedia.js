import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { config } from '../config.js'
import { normalizeMediaList, isVideoUrl } from './media.js'

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
}

function ensureUploadsDir(...parts) {
  const dir = path.join(config.uploadsPath, ...parts)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function extForMime(mime = '') {
  const key = String(mime).toLowerCase().split(';')[0].trim()
  if (MIME_EXT[key]) return MIME_EXT[key]
  if (key.startsWith('image/')) return `.${key.slice(6).replace(/[^a-z0-9]/gi, '') || 'jpg'}`
  if (key.startsWith('video/')) return `.${key.slice(6).replace(/[^a-z0-9]/gi, '') || 'mp4'}`
  return '.bin'
}

function isDataUrl(url) {
  return typeof url === 'string' && url.startsWith('data:')
}

const MAX_UPLOAD_BYTES = 95 * 1024 * 1024

/** Persist a buffer to disk; return public /uploads/... path. */
export function persistBuffer(buf, { folder = 'misc', mime = 'application/octet-stream', basename } = {}) {
  if (!buf || !buf.length) return ''
  if (buf.length > MAX_UPLOAD_BYTES) return ''
  const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 10)
  const name = `${basename || 'file'}-${hash}${extForMime(mime)}`
  const dir = ensureUploadsDir(folder)
  const filePath = path.join(dir, name)
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, buf)
  return `${config.uploadsUrlPrefix}/${folder}/${name}`.replace(/\\/g, '/')
}

/** Persist a data URL to disk; return public /uploads/... path. Pass through normal URLs. */
export function persistDataUrl(dataUrl, { folder = 'misc', basename } = {}) {
  if (!isDataUrl(dataUrl)) return dataUrl
  const match = /^data:([^;,]+);base64,([\s\S]+)$/i.exec(dataUrl)
  if (!match) return dataUrl

  const mime = match[1]
  const buf = Buffer.from(match[2], 'base64')
  return persistBuffer(buf, { folder, mime, basename })
}

export function persistMediaList(raw, { folder = 'listings', id = 'x' } = {}) {
  const list = normalizeMediaList(raw)
  return list.map((item, i) => {
    const out = { type: item.type, url: persistDataUrl(item.url, { folder, basename: `${id}-${i}` }) }
    if (item.poster) {
      const poster = persistDataUrl(item.poster, { folder, basename: `${id}-${i}-poster` })
      if (poster && !isVideoUrl(poster)) out.poster = poster
    }
    return out
  }).filter((m) => m.url)
}

/** True if payload still embeds inline base64 (slow to ship over JSON). */
export function mediaHasInlineData(raw) {
  try {
    const list = normalizeMediaList(raw)
    return list.some((m) => isDataUrl(m.url) || (m.poster && isDataUrl(m.poster)))
  } catch {
    return false
  }
}
