/** Shared media helpers for listings / hamyari JSON payloads */

export function isVideoUrl(url = '') {
  return (
    typeof url === 'string'
    && (url.startsWith('data:video')
      || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)
      || url.includes('video/'))
  )
}

export function normalizeMediaList(raw) {
  let list = raw
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw || '[]')
    } catch {
      list = []
    }
  }
  if (!Array.isArray(list)) return []
  return list
    .map((item) => {
      if (!item) return null
      if (typeof item === 'string') {
        return { type: isVideoUrl(item) ? 'video' : 'image', url: item }
      }
      if (item.url) {
        const type = item.type === 'video' || isVideoUrl(item.url) ? 'video' : 'image'
        const out = { type, url: item.url }
        if (type === 'video' && item.poster && !isVideoUrl(item.poster)) {
          out.poster = item.poster
        }
        return out
      }
      return null
    })
    .filter(Boolean)
    .slice(0, 8)
}

/** Prefer image or video poster — never a raw video URL for feed thumbs. */
export function mediaCoverUrl(media) {
  const list = normalizeMediaList(media)
  if (!list.length) return ''
  const img = list.find((m) => m.type === 'image')
  if (img?.url && !isVideoUrl(img.url)) return img.url
  const withPoster = list.find((m) => m.type === 'video' && m.poster && !isVideoUrl(m.poster))
  if (withPoster) return withPoster.poster
  return ''
}

export function parseIncomingMedia(body = {}) {
  if (Array.isArray(body.media)) {
    return normalizeMediaList(body.media)
  }
  if (Array.isArray(body.images)) {
    return normalizeMediaList(body.images)
  }
  if (body.image) return normalizeMediaList([body.image])
  return []
}
