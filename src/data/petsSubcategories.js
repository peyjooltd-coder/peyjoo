/** Divar-style «حیوانات» subcategories — matches the reference sheet */

export const PETS_SUBCATEGORIES = [
  { id: 'cat', fa: 'گربه', en: 'Cats', icon: '🐱' },
  { id: 'rodents', fa: 'موش و خرگوش', en: 'Mice & rabbits', icon: '🐰' },
  { id: 'reptile', fa: 'خزنده', en: 'Reptiles', icon: '🦎' },
  { id: 'bird', fa: 'پرنده', en: 'Birds', icon: '🐦' },
  { id: 'fish', fa: 'ماهی', en: 'Fish', icon: '🐟' },
  { id: 'accessories', fa: 'لوازم جانبی', en: 'Accessories', icon: '🦴' },
  { id: 'farm', fa: 'حیوانات مزرعه', en: 'Farm animals', icon: '🐄' },
  { id: 'dog', fa: 'سگ', en: 'Dogs', icon: '🐕' },
]

export const PETS_SUB_ALL = {
  id: 'all',
  fa: 'همه',
  en: 'All',
  icon: '⋯',
}

export function petsSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? PETS_SUB_ALL.fa : PETS_SUB_ALL.en
  const row = PETS_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
