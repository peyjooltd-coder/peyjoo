/** Sort/display helpers for listing timestamps (createdAt + relative time labels). */

function parseSqliteDate(value) {
  if (!value) return NaN
  if (value instanceof Date) return value.getTime()
  const s = String(value).trim()
  if (!s) return NaN
  const iso = Date.parse(s)
  if (!Number.isNaN(iso)) return iso
  const normalized = s.includes('T') ? s : s.replace(' ', 'T')
  const withZ = /Z$|[+-]\d{2}:\d{2}$/.test(normalized) ? normalized : `${normalized}Z`
  return Date.parse(withZ)
}

function toEnglishDigits(str) {
  return String(str).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
}

/** Approximate age in ms from labels like "2h ago", "دیروز", "۳ ساعت پیش". */
export function parseRelativeTimeLabel(label) {
  if (!label) return null
  const raw = toEnglishDigits(String(label)).trim().toLowerCase()
  if (!raw) return null

  if (/just now|همین ?الان|الان/.test(raw)) return 0
  if (/دیروز|yesterday/.test(raw)) return 24 * 60 * 60 * 1000

  const min = raw.match(/(\d+)\s*(دقیقه|min)/)
  if (min) return Number(min[1]) * 60 * 1000

  const hour = raw.match(/(\d+)\s*(ساعت|h\b|hr)/)
  if (hour) return Number(hour[1]) * 60 * 60 * 1000

  const day = raw.match(/(\d+)\s*(روز|d\b|day)/)
  if (day) return Number(day[1]) * 24 * 60 * 60 * 1000

  const week = raw.match(/(\d+)\s*(هفته|w\b|week)/)
  if (week) return Number(week[1]) * 7 * 24 * 60 * 60 * 1000

  return null
}

/**
 * Higher = newer.
 * Prefer createdAt for real posts; if createdAt is "just seeded" but label says older, use label.
 */
export function listingSortTs(listing) {
  const created = parseSqliteDate(listing?.createdAt)
  const age = parseRelativeTimeLabel(listing?.time)
  const fromLabel = age != null ? Date.now() - age : NaN

  if (!Number.isNaN(created) && !Number.isNaN(fromLabel)) {
    const createdAge = Date.now() - created
    // Seed rows often share a fresh created_at while time_label is older — trust the label then.
    if (createdAge < 6 * 3600000 && age >= 30 * 60000) return fromLabel
    return created
  }
  if (!Number.isNaN(created)) return created
  if (!Number.isNaN(fromLabel)) return fromLabel
  return Number(listing?.id) || 0
}

function startOfLocalDay(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function formatListingRelativeTime(listing, lang = 'fa') {
  const ts = listingSortTs(listing)
  if (!ts) return listing?.time || ''

  const diff = Math.max(0, Date.now() - ts)
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (lang === 'fa') {
    if (mins < 1) return 'همین الان'
    if (mins < 60) return `${mins} دقیقه پیش`
    if (hours < 24) return `${hours} ساعت پیش`
    if (days === 1) return 'دیروز'
    if (days < 7) return `${days} روز پیش`
    if (days < 30) return `${Math.floor(days / 7)} هفته پیش`
    try {
      return new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(ts))
    } catch {
      return listing?.time || ''
    }
  }

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  try {
    return new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' }).format(new Date(ts))
  } catch {
    return listing?.time || ''
  }
}

export function listingDayGroupKey(listing) {
  const ts = listingSortTs(listing)
  if (!ts) return 'older'
  const today = startOfLocalDay(Date.now())
  const day = startOfLocalDay(ts)
  const diffDays = Math.round((today - day) / 86400000)
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `d${diffDays}`
  return 'older'
}

export function listingDayGroupLabel(key, lang = 'fa') {
  const fa = {
    today: 'امروز',
    yesterday: 'دیروز',
    d2: '۲ روز پیش',
    d3: '۳ روز پیش',
    d4: '۴ روز پیش',
    d5: '۵ روز پیش',
    d6: '۶ روز پیش',
    older: 'قدیمی‌تر',
  }
  const en = {
    today: 'Today',
    yesterday: 'Yesterday',
    d2: '2 days ago',
    d3: '3 days ago',
    d4: '4 days ago',
    d5: '5 days ago',
    d6: '6 days ago',
    older: 'Earlier',
  }
  const map = lang === 'fa' ? fa : en
  return map[key] || map.older
}

/** Group already-newest-sorted listings into day buckets (order preserved). */
export function groupListingsByDay(listings, lang = 'fa') {
  const groups = []
  let current = null
  for (const listing of listings) {
    const key = listingDayGroupKey(listing)
    if (!current || current.key !== key) {
      current = { key, label: listingDayGroupLabel(key, lang), items: [] }
      groups.push(current)
    }
    current.items.push(listing)
  }
  return groups
}
