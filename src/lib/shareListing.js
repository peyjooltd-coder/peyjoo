/** Share helpers + in-app destinations (no auto-WhatsApp). */

export function listingShareUrl(listingId) {
  // Hits API (via Vite /api proxy) so WhatsApp/Telegram can read Open Graph tags
  return `${window.location.origin}/api/share/ad/${listingId}`
}

export function listingAppUrl(listingId) {
  const url = new URL(window.location.href)
  url.searchParams.set('ad', String(listingId))
  url.hash = ''
  return url.toString()
}

export function listingShareText(listing, lang = 'fa') {
  const parts = [
    listing.title,
    listing.priceLabel,
    listing.neighborhood && listing.city
      ? `${listing.neighborhood}، ${listing.city}`
      : (listing.city || ''),
    listing.description,
  ].filter(Boolean)
  const body = parts.join('\n')
  const site = lang === 'fa' ? 'پی‌جو ونکوور' : 'PeyJoo Vancouver'
  return `${body}\n\n${site}`.slice(0, 1200)
}

export function listingSharePayload(listing, lang = 'fa') {
  const url = listingShareUrl(listing.id)
  const text = listingShareText(listing, lang)
  const title = listing.title || (lang === 'fa' ? 'آگهی پی‌جو' : 'PeyJoo listing')
  return { title, text, url, full: `${text}\n${url}` }
}

export async function copyShareText(full) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(full)
    return true
  }
  const ta = document.createElement('textarea')
  ta.value = full
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(ta)
  return ok
}

export async function shareViaSystem(listing, lang = 'fa') {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unsupported'
  }
  const { title, text, url } = listingSharePayload(listing, lang)
  try {
    await navigator.share({ title, text, url })
    return 'shared'
  } catch (e) {
    if (e?.name === 'AbortError') return 'aborted'
    throw e
  }
}

export function openWhatsAppShare(full) {
  window.open(`https://wa.me/?text=${encodeURIComponent(full)}`, '_blank', 'noopener,noreferrer')
}

export function openTelegramShare(url, text) {
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    '_blank',
    'noopener,noreferrer',
  )
}

export function scrollAppToTop({ smooth = false } = {}) {
  const behavior = smooth ? 'smooth' : 'auto'
  const screen = document.querySelector('.mobile-screen')
  if (screen) {
    screen.scrollTo({ top: 0, left: 0, behavior })
  }
  window.scrollTo({ top: 0, left: 0, behavior })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}
