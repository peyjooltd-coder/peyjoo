/** Divar-style «ورزش و تناسب اندام» subcategories */

export const SPORTS_SUBCATEGORIES = [
  { id: 'group-meetup', fa: 'قرار گروهی', en: 'Group meetup', icon: '👥' },
  { id: 'ball-sports', fa: 'ورزش‌های توپی', en: 'Ball sports', icon: '🎱' },
  { id: 'hiking-camping', fa: 'کوهنوردی و کمپینگ', en: 'Hiking & camping', icon: '⛺' },
  { id: 'water-sports', fa: 'غواصی و ورزش‌های آبی', en: 'Diving & water sports', icon: '🤿' },
  { id: 'fishing', fa: 'ماهیگیری', en: 'Fishing', icon: '🎣' },
  { id: 'equipment', fa: 'تجهیزات ورزشی', en: 'Sports equipment', icon: '🏋️' },
  { id: 'winter-sports', fa: 'ورزش‌های زمستانی', en: 'Winter sports', icon: '🎿' },
  { id: 'horse-riding', fa: 'اسب و تجهیزات اسب‌سواری', en: 'Horses & riding gear', icon: '🐴' },
]

export const SPORTS_SUB_ALL = {
  id: 'all',
  fa: 'همه آگهی‌های ورزش و تناسب اندام',
  en: 'All sport & fitness ads',
  icon: '⋯',
}

export function sportsSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? SPORTS_SUB_ALL.fa : SPORTS_SUB_ALL.en
  const row = SPORTS_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
