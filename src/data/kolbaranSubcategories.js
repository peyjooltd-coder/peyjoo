/** «کولبران» subcategories — matches the reference sheet */

export const KOLBARAN_SUBCATEGORIES = [
  { id: 'have-load', fa: 'بار دارم', en: 'I have a load', icon: '📦' },
  { id: 'will-carry', fa: 'بار می‌برم', en: 'I will carry', icon: '🧳' },
]

export const KOLBARAN_SUB_ALL = {
  id: 'all',
  fa: 'همه',
  en: 'All',
  icon: '⋯',
}

export function kolbaranSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? KOLBARAN_SUB_ALL.fa : KOLBARAN_SUB_ALL.en
  const row = KOLBARAN_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
