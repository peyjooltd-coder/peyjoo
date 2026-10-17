const PREFS_KEY = 'pejo_notif_prefs'

export function chatNotifsEnabled() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return true
    return JSON.parse(raw).chat !== false
  } catch {
    return true
  }
}

/** Title = listing subject; body = a few words + ellipsis */
export function truncatePreview(text, maxWords = 7, maxChars = 52) {
  const cleaned = String(text || '')
    .trim()
    .replace(/\s+/g, ' ')
  if (!cleaned) return '…'
  const words = cleaned.split(' ')
  let out = words.slice(0, maxWords).join(' ')
  if (out.length > maxChars) out = `${out.slice(0, maxChars).trim()}`
  if (out.length < cleaned.length) out = `${out}…`
  return out
}

export function listingNotifyTitle(listingTitle, fallback = 'PeyJoo') {
  const title = String(listingTitle || '').trim()
  if (!title) return fallback
  return title.length > 60 ? `${title.slice(0, 57).trim()}…` : title
}

export async function ensureChatNotifyPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

let audioCtx = null

/** Short incoming-message chime (no external audio file). */
export function playMessageSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    if (!audioCtx) audioCtx = new Ctx()
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }
    const now = audioCtx.currentTime
    const beep = (freq, start, dur, gain = 0.08) => {
      const osc = audioCtx.createOscillator()
      const g = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      g.gain.setValueAtTime(0.0001, now + start)
      g.gain.exponentialRampToValueAtTime(gain, now + start + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
      osc.connect(g)
      g.connect(audioCtx.destination)
      osc.start(now + start)
      osc.stop(now + start + dur + 0.02)
    }
    beep(880, 0, 0.12, 0.09)
    beep(1175, 0.11, 0.16, 0.07)
  } catch {
    /* ignore autoplay / audio errors */
  }
}

/**
 * Sound + OS notification for a new listing chat message.
 * @param {{ listingTitle?: string, text?: string, tag?: string, showBanner?: boolean, onClick?: () => void }} opts
 */
export function notifyNewChatMessage({
  listingTitle,
  text,
  tag,
  showBanner = true,
  onClick,
} = {}) {
  if (!chatNotifsEnabled()) return

  playMessageSound()

  if (!showBanner) return
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const title = listingNotifyTitle(listingTitle)
  const body = truncatePreview(text)
  try {
    const n = new Notification(title, {
      body,
      tag: tag || `peyjoo-chat-${title}`,
      renotify: true,
      icon: '/logo.jpeg',
      badge: '/logo.jpeg',
      lang: document.documentElement.lang || 'fa',
      dir: document.documentElement.dir || 'rtl',
    })
    n.onclick = () => {
      try {
        window.focus()
      } catch {
        /* ignore */
      }
      onClick?.()
      n.close()
    }
  } catch {
    /* ignore */
  }
}

/** Collect message ids from threads for change detection */
export function collectThemMessageIds(threads = []) {
  const map = new Map()
  for (const t of threads) {
    const ids = (t.messages || [])
      .filter((m) => m.from === 'them')
      .map((m) => m.id)
      .filter(Boolean)
    map.set(String(t.id), ids)
  }
  return map
}

export function findNewThemMessages(prevMap, threads = []) {
  const found = []
  if (!prevMap) return found
  for (const t of threads) {
    const tid = String(t.id)
    const prevIds = new Set(prevMap.get(tid) || [])
    for (const m of t.messages || []) {
      if (m.from !== 'them' || !m.id) continue
      if (prevIds.has(m.id)) continue
      found.push({ thread: t, message: m })
    }
  }
  return found
}
