/** «تعمیرات» subcategories */

export const REPAIRS_SUBCATEGORIES = [
  { id: 'auto', fa: 'خودرو', en: 'Cars', icon: '🚗' },
  { id: 'appliances', fa: 'لوازم خانگی', en: 'Home appliances', icon: '🧊' },
  { id: 'mobile-computer', fa: 'موبایل و کامپیوتر', en: 'Mobile & computer', icon: '💻' },
  { id: 'electrical-plumbing', fa: 'برق و لوله‌کشی', en: 'Electrical & plumbing', icon: '🔧' },
  { id: 'hvac', fa: 'تأسیسات', en: 'HVAC & facilities', icon: '⚙️' },
  { id: 'building', fa: 'ساختمان', en: 'Building', icon: '🏗️' },
  { id: 'locksmith', fa: 'قفل و کلید', en: 'Lock & key', icon: '🔑' },
  { id: 'other', fa: 'سایر تعمیرات', en: 'Other repairs', icon: '🛠️' },
]

export const REPAIRS_SUB_ALL = {
  id: 'all',
  fa: 'همه آگهی‌های تعمیرات',
  en: 'All repair ads',
  icon: '⋯',
}

export function repairsSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? REPAIRS_SUB_ALL.fa : REPAIRS_SUB_ALL.en
  const row = REPAIRS_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
