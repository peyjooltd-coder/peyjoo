/** Full HD: longest side 1920px, high JPEG quality. */
export const HD_MAX_SIDE = 1920
export const HD_JPEG_QUALITY = 0.92

function drawHd(source, maxSide, quality) {
  const srcW = source.videoWidth || source.naturalWidth || source.width
  const srcH = source.videoHeight || source.naturalHeight || source.height
  const scale = Math.min(1, maxSide / Math.max(srcW, srcH))
  const w = Math.max(1, Math.round(srcW * scale))
  const h = Math.max(1, Math.round(srcH * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}

/** Compress an image file to a Full HD JPEG data URL for upload. */
export function fileToCompressedDataUrl(file, maxSide = HD_MAX_SIDE, quality = HD_JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('Not an image'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load image'))
      img.onload = () => resolve(drawHd(img, maxSide, quality))
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

/** No duration limit. Soft size guard only (data-URL upload). */
export const MAX_VIDEO_BYTES = 90 * 1024 * 1024

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
}

export function isVideoUrl(url = '') {
  return (
    typeof url === 'string'
    && (url.startsWith('data:video')
      || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)
      || url.includes('video/'))
  )
}

function isImageDataUrl(url = '') {
  return typeof url === 'string' && (url.startsWith('data:image') || (!isVideoUrl(url) && !!url))
}

/** Normalize legacy string[] or mixed media into { type, url, poster? }[] */
export function normalizeMedia(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((item) => {
      if (!item) return null
      if (typeof item === 'string') {
        return { type: isVideoUrl(item) ? 'video' : 'image', url: item }
      }
      if (typeof item === 'object' && item.url) {
        const type = item.type === 'video' || isVideoUrl(item.url) ? 'video' : 'image'
        const out = { type, url: item.url }
        if (type === 'video' && item.poster && isImageDataUrl(item.poster) && !isVideoUrl(item.poster)) {
          out.poster = item.poster
        }
        return out
      }
      return null
    })
    .filter(Boolean)
}

/** Prefer real image / video poster — never a raw video URL for <img> feeds. */
export function mediaCoverUrl(media) {
  const list = normalizeMedia(media)
  if (!list.length) return ''
  const img = list.find((m) => m.type === 'image')
  if (img?.url && !isVideoUrl(img.url)) return img.url
  const withPoster = list.find((m) => m.type === 'video' && m.poster && !isVideoUrl(m.poster))
  if (withPoster) return withPoster.poster
  return ''
}

/** Cover for a listing object (handles legacy video-as-image). */
export function listingCoverUrl(listing) {
  if (!listing) return ''
  const fromMedia = mediaCoverUrl(listing.media || listing.images)
  if (fromMedia) return fromMedia
  if (listing.image && !isVideoUrl(listing.image)) return listing.image
  return ''
}

export function mediaImageUrls(media) {
  return normalizeMedia(media).filter((m) => m.type === 'image').map((m) => m.url)
}

function uiError(fa, en) {
  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'en'
  return lang === 'fa' ? fa : en
}

export function captureVideoFrame(videoEl, { maxSide = HD_MAX_SIDE, quality = HD_JPEG_QUALITY } = {}) {
  const w = videoEl.videoWidth
  const h = videoEl.videoHeight
  if (!w || !h) throw new Error(uiError('ویدیو هنوز آماده نیست', 'The video is not ready yet'))
  return drawHd(videoEl, maxSide, quality)
}

/** Grab a JPEG poster from a video URL at a given time (seconds). */
export function extractVideoPoster(videoUrl, timeSec = 0.15) {
  return new Promise((resolve, reject) => {
    if (!videoUrl) {
      reject(new Error(uiError('ویدیو نامعتبر است', 'This video is not valid')))
      return
    }
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.setAttribute('playsinline', '')
    video.src = videoUrl

    const cleanup = () => {
      try {
        video.removeAttribute('src')
        video.load()
      } catch {
        /* ignore */
      }
    }

    const fail = (msg) => {
      cleanup()
      reject(new Error(msg || uiError('بارگذاری ویدیو ناموفق بود', 'Could not load the video')))
    }

    video.onerror = () => fail(uiError('بارگذاری ویدیو ناموفق بود', 'Could not load the video'))
    video.onloadedmetadata = () => {
      const dur = Number.isFinite(video.duration) ? video.duration : 0
      const t = dur > 0
        ? Math.min(Math.max(0, timeSec), Math.max(0, dur - 0.05))
        : Math.max(0, timeSec)

      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked)
        try {
          const poster = captureVideoFrame(video)
          cleanup()
          resolve(poster)
        } catch (e) {
          fail(e.message)
        }
      }

      video.addEventListener('seeked', onSeeked)
      try {
        video.currentTime = t
      } catch {
        // Some browsers need play+pause before seek
        video.play().then(() => {
          video.pause()
          video.currentTime = t
        }).catch(() => fail(uiError('انتخاب فریم ممکن نشد', 'Could not pick a frame')))
      }
    }
  })
}

/**
 * Convert a picked File into a media item (compressed image or video).
 * Prefers Firebase Storage; falls back to a data URL if Storage is not ready.
 * options.onProgress(0–100) reports prepare + upload progress.
 */
export async function fileToMediaItem(file, options = {}) {
  if (!file) throw new Error('No file')
  const { onProgress } = options
  const report = (pct) => {
    if (typeof onProgress !== 'function') return
    onProgress(Math.min(100, Math.max(0, Math.round(pct))))
  }
  const { uploadToFirebase, uploadOrKeep } = await import('./firebaseStorage.js')

  if (file.type?.startsWith('image/')) {
    report(4)
    const localUrl = await fileToCompressedDataUrl(file)
    report(18)
    const url = await uploadOrKeep(localUrl, 'listings', {
      onProgress: (p) => report(18 + (p / 100) * 82),
    })
    report(100)
    return { type: 'image', url }
  }
  if (file.type?.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name || '')) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error(uiError('ویدیو خیلی بزرگ است (حداکثر حدود ۹۰ مگابایت)', 'The video is too large (about 90 MB max)'))
    }
    report(2)
    try {
      const url = await uploadToFirebase(file, 'videos', {
        onProgress: (p) => report(2 + (p / 100) * 98),
      })
      report(100)
      return { type: 'video', url, name: file.name || 'video' }
    } catch {
      report(40)
      const url = await fileToDataUrl(file)
      report(100)
      return { type: 'video', url, name: file.name || 'video' }
    }
  }
  throw new Error(uiError('فقط عکس و فیلم مجاز است', 'Only photos and videos are allowed'))
}

export const MAX_MEDIA_ITEMS = 8
export const MAX_VIDEO_ITEMS = 8
