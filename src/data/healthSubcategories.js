/** «سلامت» subcategories */

export const HEALTH_SUBCATEGORIES = [
  { id: 'doctors', fa: 'پزشکان', en: 'Doctors', icon: '👨‍⚕️' },
  { id: 'pharmacy', fa: 'داروخانه', en: 'Pharmacy', icon: '💊' },
  { id: 'lab', fa: 'آزمایشگاه', en: 'Laboratory', icon: '🧪' },
  { id: 'clinic', fa: 'کلینیک', en: 'Clinic', icon: '🏥' },
  { id: 'dentistry', fa: 'دندانپزشکی', en: 'Dentistry', icon: '🦷' },
  { id: 'psychology', fa: 'روان‌شناسی', en: 'Psychology', icon: '🧠' },
  { id: 'home-care', fa: 'خدمات در منزل', en: 'Home care', icon: '🏠' },
]

export const HEALTH_SUB_ALL = {
  id: 'all',
  fa: 'همه',
  en: 'All',
  icon: '⋯',
}

export function healthSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? HEALTH_SUB_ALL.fa : HEALTH_SUB_ALL.en
  const row = HEALTH_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
