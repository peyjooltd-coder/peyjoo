/** «اجاره ابزار» subcategories */

export const TOOLS_RENTAL_SUBCATEGORIES = [
  { id: 'construction', fa: 'ساختمانی', en: 'Construction', icon: '🏗️' },
  { id: 'power-tools', fa: 'ابزار برقی', en: 'Power tools', icon: '🔌' },
  { id: 'gardening', fa: 'باغبانی', en: 'Gardening', icon: '🌿' },
  { id: 'carpentry', fa: 'نجاری', en: 'Carpentry', icon: '🪚' },
  { id: 'mechanical', fa: 'مکانیکی', en: 'Mechanical', icon: '⚙️' },
  { id: 'cleaning', fa: 'نظافت', en: 'Cleaning', icon: '🧹' },
  { id: 'generator-compressor', fa: 'ژنراتور و کمپرسور', en: 'Generator & compressor', icon: '⚡' },
  { id: 'lift-ladder', fa: 'بالابر و نردبان', en: 'Lift & ladder', icon: '🪜' },
]

export const TOOLS_RENTAL_SUB_ALL = {
  id: 'all',
  fa: 'همه آگهی‌های اجاره ابزار',
  en: 'All tool rental ads',
  icon: '⋯',
}

export function toolsRentalSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? TOOLS_RENTAL_SUB_ALL.fa : TOOLS_RENTAL_SUB_ALL.en
  const row = TOOLS_RENTAL_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
