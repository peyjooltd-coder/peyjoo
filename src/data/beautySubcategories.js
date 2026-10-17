/** Divar-style «زیبایی» specialties */

export const BEAUTY_SUBCATEGORIES = [
  { id: 'brow-face', fa: 'زیبایی ابرو و صورت', en: 'Brows & face', icon: '✨' },
  { id: 'body', fa: 'زیبایی بدن', en: 'Body beauty', icon: '🧴' },
  { id: 'hair', fa: 'زیبایی مو', en: 'Hair beauty', icon: '💇' },
  { id: 'health-treatment', fa: 'سلامت و درمان', en: 'Health & treatment', icon: '🩺' },
  { id: 'nails', fa: 'مراقبت و زیبایی ناخن', en: 'Nail care', icon: '💅' },
  { id: 'other', fa: 'سایر آرایشی و زیبایی', en: 'Other beauty', icon: '💄' },
]

export const BEAUTY_SUB_ALL = {
  id: 'all',
  fa: 'همه آگهی‌های زیبایی',
  en: 'All beauty ads',
  icon: '⋯',
}

export function beautySubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? BEAUTY_SUB_ALL.fa : BEAUTY_SUB_ALL.en
  const row = BEAUTY_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
