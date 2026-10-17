/**
 * Divar-simple real-estate top-level tiles for Pejo.
 *
 * We keep it to 3 tiles (All, For Rent, For Sale). Everything else
 * (apartment vs house vs commercial vs vacation) lives inside a
 * "Property type" filter chip so buyers can drill in without a nested
 * category tree.
 */

export const FB_RE_TILES = [
  {
    id: 'all',
    fa: 'همه',
    en: 'All',
    icon: 'LayoutGrid',
    tone: 'slate',
    match: () => true,
  },
  {
    id: 'for-rent',
    fa: 'اجاره',
    en: 'For Rent',
    icon: 'Key',
    tone: 'emerald',
    match: (a) => {
      const s = String(a.realEstateSubcategory || '')
      return s.startsWith('rent-') || s === 'short-term-rent'
    },
  },
  {
    id: 'for-sale',
    fa: 'فروش',
    en: 'For Sale',
    icon: 'Tag',
    tone: 'indigo',
    match: (a) => {
      const s = String(a.realEstateSubcategory || '')
      return s.startsWith('sale-') || s === 'construction-projects'
    },
  },
]

export const FB_RE_DEFAULT_TILE = 'all'

export function fbReTile(id) {
  return FB_RE_TILES.find((t) => t.id === id) || null
}

export function fbReTileLabel(id, lang = 'fa') {
  const tile = fbReTile(id)
  if (!tile) return ''
  return lang === 'fa' ? tile.fa : tile.en
}

/**
 * Property-type filter chips — apply inside a Rent/Sale tile so a user
 * can narrow further to "commercial" or "vacation" without a new tile.
 */
export const FB_RE_PROPERTY_TYPES = [
  {
    id: 'any',
    fa: 'همه انواع',
    en: 'All types',
    match: () => true,
  },
  {
    id: 'apartment',
    fa: 'آپارتمان',
    en: 'Apartment',
    match: (a) => a.realEstatePropertyType === 'apartment' || a.realEstatePropertyType === 'apartment-suite',
  },
  {
    id: 'house-villa',
    fa: 'خانه و ویلا',
    en: 'House / Villa',
    match: (a) => a.realEstatePropertyType === 'house-villa' || a.realEstatePropertyType === 'villa-garden',
  },
  {
    id: 'room',
    fa: 'اتاق و سوئیت',
    en: 'Room / Suite',
    match: (a) => a.rooms === '0' || a.realEstatePropertyType === 'apartment-suite',
  },
  {
    id: 'vacation',
    fa: 'کوتاه‌مدت',
    en: 'Vacation',
    match: (a) => a.realEstateSubcategory === 'short-term-rent',
  },
  {
    id: 'commercial',
    fa: 'اداری و تجاری',
    en: 'Office / Commercial',
    match: (a) =>
      a.realEstateSubcategory === 'sale-commercial'
      || a.realEstateSubcategory === 'rent-commercial'
      || a.realEstatePropertyType === 'office'
      || a.realEstatePropertyType === 'shop'
      || a.realEstatePropertyType === 'industrial'
      || a.realEstatePropertyType === 'office-space',
  },
  {
    id: 'land',
    fa: 'زمین',
    en: 'Land',
    match: (a) => a.realEstatePropertyType === 'land',
  },
]

export function fbRePropertyTypeLabel(id, lang = 'fa') {
  const row = FB_RE_PROPERTY_TYPES.find((r) => r.id === id) || FB_RE_PROPERTY_TYPES[0]
  return lang === 'fa' ? row.fa : row.en
}

export const FB_BEDS_OPTIONS = ['any', '1', '2', '3', '4+']
export const FB_BATHS_OPTIONS = ['any', '1', '2', '3+']

export function bedsLabel(id, lang = 'fa') {
  if (id === 'any') return lang === 'fa' ? 'همه' : 'Any'
  return id
}

export function bathsLabel(id, lang = 'fa') {
  if (id === 'any') return lang === 'fa' ? 'همه' : 'Any'
  return id
}

/**
 * Infer "beds" from listing attributes/title:
 * - 0 rooms → treated as studio (0)
 * - "4+" collapses everything ≥ 4
 */
export function inferBeds(listing) {
  const attrs = listing?.attributes || {}
  if (attrs.rooms != null && attrs.rooms !== '') {
    if (attrs.rooms === '4+') return 4
    const n = parseInt(attrs.rooms, 10)
    if (Number.isFinite(n)) return n
  }
  const text = `${listing?.title || ''} ${listing?.description || ''}`
  const m = text.match(/(\d+)\s*(?:خواب|bed|br|bd)/i)
  if (m) return parseInt(m[1], 10)
  if (/studio|سوئیت/i.test(text)) return 0
  return null
}

export function inferBaths(listing) {
  const attrs = listing?.attributes || {}
  if (attrs.baths != null && attrs.baths !== '') {
    if (attrs.baths === '3+') return 3
    const n = parseInt(attrs.baths, 10)
    if (Number.isFinite(n)) return n
  }
  const text = `${listing?.title || ''} ${listing?.description || ''}`
  const m = text.match(/(\d+)\s*(?:حمام|bath|ba)/i)
  if (m) return parseInt(m[1], 10)
  return null
}

export function inferIsRent(listing) {
  const attrs = listing?.attributes || {}
  const sub = String(attrs.realEstateSubcategory || '')
  if (sub.startsWith('rent-') || sub === 'short-term-rent') return true
  if (sub.startsWith('sale-')) return false
  const text = `${listing?.title || ''} ${listing?.description || ''}`
  if (/اجاره|monthly|month|rent|lease/i.test(text)) return true
  if (/فروش|for sale|sale price/i.test(text)) return false
  return (listing?.price ?? 0) > 0 && (listing?.price ?? 0) < 15000
}
