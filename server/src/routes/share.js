import { Router } from 'express'
import { getDb } from '../db/database.js'
import { config } from '../config.js'

const router = Router()

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function absoluteUrl(req, maybeUrl) {
  if (!maybeUrl) return ''
  const raw = String(maybeUrl)
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw
  const origin = config.publicWebUrl
    || req.get('x-forwarded-origin')
    || `${req.protocol}://${req.get('host')}`
  if (raw.startsWith('/')) return `${origin.replace(/\/$/, '')}${raw}`
  return raw
}

function webAppUrl(req, listingId) {
  const base = (config.publicWebUrl || '').replace(/\/$/, '')
    || `${req.protocol}://${req.get('host')}`.replace(/:13001$/, ':15173')
  return `${base}/?ad=${encodeURIComponent(listingId)}`
}

/** HTML page with Open Graph tags for WhatsApp/Telegram previews + redirect for humans */
router.get('/ad/:id', (req, res) => {
  const id = Number(req.params.id)
  const row = getDb().prepare(`
    SELECT id, title, description, price_label, city, neighborhood, image, images_json
    FROM listings
    WHERE id = ? AND status NOT IN ('deleted', 'hidden')
  `).get(id)

  if (!row) {
    return res.status(404).type('html').send('<!doctype html><title>Not found</title><p>Ad not found</p>')
  }

  let image = row.image || ''
  if (!image) {
    try {
      const media = JSON.parse(row.images_json || '[]')
      const first = media[0]
      image = typeof first === 'string' ? first : (first?.url || '')
    } catch {
      image = ''
    }
  }

  const title = row.title || 'PeyJoo ad'
  const descParts = [
    row.price_label,
    row.neighborhood && row.city ? `${row.neighborhood}, ${row.city}` : row.city,
    row.description,
  ].filter(Boolean)
  const description = descParts.join(' — ').slice(0, 280)
  const appUrl = webAppUrl(req, row.id)
  const shareUrl = absoluteUrl(req, `/api/share/ad/${row.id}`)
  const imageUrl = absoluteUrl(req, image)

  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="PeyJoo Vancouver" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(shareUrl)}" />
  ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />` : ''}
  ${imageUrl ? `<meta property="og:image:alt" content="${escapeHtml(title)}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : ''}
  <link rel="canonical" href="${escapeHtml(appUrl)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(appUrl)}" />
</head>
<body style="font-family:sans-serif;padding:24px;text-align:center">
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  ${imageUrl ? `<p><img src="${escapeHtml(imageUrl)}" alt="" style="max-width:100%;border-radius:12px" /></p>` : ''}
  <p><a href="${escapeHtml(appUrl)}">مشاهده آگهی در پی‌جو</a></p>
  <script>location.replace(${JSON.stringify(appUrl)})</script>
</body>
</html>`

  res
    .status(200)
    .set('Cache-Control', 'public, max-age=300')
    .type('html')
    .send(html)
})

export default router
