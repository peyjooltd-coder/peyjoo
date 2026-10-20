/** Detect Arabic/Persian script in user content. */
export function hasPersianScript(text) {
  return /[\u0600-\u06FF]/.test(String(text || ''))
}

function pickBilingual(primary, en, fa, lang) {
  const a = String(en || '').trim()
  const b = String(fa || '').trim()
  const p = String(primary || '').trim()
  if (lang === 'fa') return b || (hasPersianScript(p) ? p : '') || a || p
  return a || (!hasPersianScript(p) ? p : '') || b || p
}

/** Listing title for the active UI language. */
export function listingTitle(listing, lang = 'en') {
  if (!listing) return ''
  return pickBilingual(listing.title, listing.titleEn, listing.titleFa, lang)
}

/** Listing description for the active UI language. */
export function listingDescription(listing, lang = 'en') {
  if (!listing) return ''
  return pickBilingual(listing.description, listing.descriptionEn, listing.descriptionFa, lang)
}

const CONDITION_KEYS = {
  new: 'conditionNew',
  'like new': 'conditionLikeNew',
  good: 'conditionGood',
  fair: 'conditionFair',
  any: 'conditionAny',
}

/** Localized condition label (New / Like New / …). */
export function listingCondition(listing, lang, t) {
  const raw = String(listing?.condition || '').trim()
  if (!raw) return ''
  const key = CONDITION_KEYS[raw.toLowerCase()]
  if (key && typeof t === 'function') {
    const translated = t(key)
    if (translated && translated !== key) return translated
  }
  // Persian stored values → English keys when UI is EN
  const faMap = {
    نو: 'conditionNew',
    'در حد نو': 'conditionLikeNew',
    خوب: 'conditionGood',
    متوسط: 'conditionFair',
  }
  if (faMap[raw] && typeof t === 'function') {
    const translated = t(faMap[raw])
    if (translated && translated !== faMap[raw]) return translated
  }
  return raw
}

function isNegotiableListing(listing) {
  const attrs = listing?.attributes || {}
  if (attrs.priceNegotiable || attrs.kolbaranNegotiable) return true
  const label = String(listing?.priceLabel || '')
  return /توافقی|negotiable/i.test(label)
}

/**
 * Price label that follows the active UI language.
 * Regenerates from structured price / negotiable flags when possible.
 */
export function listingPriceLabel(listing, lang, t) {
  if (!listing) return ''
  if (isNegotiableListing(listing)) {
    return typeof t === 'function' ? t('negotiable') : (lang === 'fa' ? 'توافقی' : 'Negotiable')
  }
  const price = Number(listing.price)
  if (Number.isFinite(price) && price > 0) {
    const locale = lang === 'fa' ? 'fa-IR' : 'en-CA'
    return `$${price.toLocaleString(locale)}`
  }
  const label = String(listing.priceLabel || '').trim()
  if (/توافقی/i.test(label)) {
    return typeof t === 'function' ? t('negotiable') : (lang === 'fa' ? 'توافقی' : 'Negotiable')
  }
  if (/^negotiable$/i.test(label)) {
    return typeof t === 'function' ? t('negotiable') : (lang === 'fa' ? 'توافقی' : 'Negotiable')
  }
  return label
}

/** Relative time from createdAt, localized. Falls back to stored time label with swaps. */
export function listingTimeLabel(listing, lang, t) {
  const created = listing?.createdAt || listing?.created_at
  if (created) {
    const ts = Date.parse(created)
    if (!Number.isNaN(ts)) {
      const diffSec = Math.max(0, Math.round((Date.now() - ts) / 1000))
      if (typeof t === 'function') {
        if (diffSec < 90) return t('justNow')
        if (diffSec < 3600) {
          const m = Math.max(1, Math.round(diffSec / 60))
          return t('minutesAgo').replace('{n}', String(m))
        }
        if (diffSec < 86400) {
          const h = Math.max(1, Math.round(diffSec / 3600))
          return t('hoursAgo').replace('{n}', String(h))
        }
        const d = Math.max(1, Math.round(diffSec / 86400))
        if (d < 30) return t('daysAgo').replace('{n}', String(d))
      }
      try {
        return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-CA', {
          month: 'short',
          day: 'numeric',
        }).format(new Date(ts))
      } catch {
        /* fall through */
      }
    }
  }
  const raw = String(listing?.time || listing?.timeLabel || '').trim()
  if (!raw) return ''
  if (typeof t === 'function') {
    if (/just now|همین الان|الان/i.test(raw)) return t('justNow')
  }
  return raw
}

/** Payload helpers when creating/updating a listing in the active language. */
export function bilingualFieldsFromInput(title, description, lang) {
  const t = String(title || '').trim()
  const d = String(description || '').trim()
  if (lang === 'fa') {
    return {
      title: t,
      description: d,
      titleFa: t,
      descriptionFa: d,
      titleEn: '',
      descriptionEn: '',
    }
  }
  return {
    title: t,
    description: d,
    titleEn: t,
    descriptionEn: d,
    titleFa: '',
    descriptionFa: '',
  }
}
