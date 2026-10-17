/** Kolbaran (کولبران) post-ad detail fields — differ by subcategory */

export const KOLBARAN_DAY_OPTIONS = [
  { id: 'saturday', fa: 'شنبه', en: 'Saturday' },
  { id: 'sunday', fa: 'یکشنبه', en: 'Sunday' },
  { id: 'monday', fa: 'دوشنبه', en: 'Monday' },
  { id: 'tuesday', fa: 'سه‌شنبه', en: 'Tuesday' },
  { id: 'wednesday', fa: 'چهارشنبه', en: 'Wednesday' },
  { id: 'thursday', fa: 'پنجشنبه', en: 'Thursday' },
  { id: 'friday', fa: 'جمعه', en: 'Friday' },
  { id: 'flexible', fa: 'انعطاف‌پذیر', en: 'Flexible' },
]

export const KOLBARAN_CARGO_TYPE_OPTIONS = [
  { id: 'documents', fa: 'مدارک / اسناد', en: 'Documents' },
  { id: 'package', fa: 'بسته / پکیج', en: 'Package' },
  { id: 'furniture', fa: 'اثاثیه', en: 'Furniture' },
  { id: 'appliances', fa: 'لوازم خانگی', en: 'Appliances' },
  { id: 'food', fa: 'مواد غذایی', en: 'Food' },
  { id: 'fragile', fa: 'شکستنی', en: 'Fragile' },
  { id: 'electronics', fa: 'الکترونیک', en: 'Electronics' },
  { id: 'clothing', fa: 'پوشاک', en: 'Clothing' },
  { id: 'other', fa: 'سایر', en: 'Other' },
]

export const EMPTY_KOLBARAN_DETAIL = {
  kolbaranDay: '',
  kolbaranCargoName: '',
  kolbaranCargoType: '',
  kolbaranWeight: '',
  kolbaranWeightMin: '',
  kolbaranWeightMax: '',
  kolbaranOrigin: '',
  kolbaranDestination: '',
  kolbaranDate: '',
  kolbaranPriceMin: '',
  kolbaranPriceMax: '',
  kolbaranNegotiable: false,
}

export function kolbaranOptionLabel(options, id, lang = 'fa') {
  const row = options.find((o) => o.id === id)
  if (!row) return id || ''
  return lang === 'fa' ? row.fa : row.en
}

export function formatKolbaranPriceLabel(attrs, lang = 'fa') {
  if (!attrs) return lang === 'fa' ? 'توافقی' : 'Negotiable'
  if (attrs.kolbaranNegotiable) return lang === 'fa' ? 'توافقی' : 'Negotiable'
  const min = Number(attrs.kolbaranPriceMin)
  const max = Number(attrs.kolbaranPriceMax)
  const hasMin = Number.isFinite(min) && min > 0
  const hasMax = Number.isFinite(max) && max > 0
  if (hasMin && hasMax) {
    const a = min.toLocaleString()
    const b = max.toLocaleString()
    return lang === 'fa' ? `${a} – ${b} $` : `$${a} – $${b}`
  }
  if (hasMin) return lang === 'fa' ? `از ${min.toLocaleString()} $` : `From $${min.toLocaleString()}`
  if (hasMax) return lang === 'fa' ? `تا ${max.toLocaleString()} $` : `Up to $${max.toLocaleString()}`
  return lang === 'fa' ? 'توافقی' : 'Negotiable'
}
