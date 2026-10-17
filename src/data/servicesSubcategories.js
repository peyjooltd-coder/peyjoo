/** Divar-style «خدمات» subcategories */

export const SERVICES_SUBCATEGORIES = [
  { id: 'auto-moto', fa: 'خودرو و موتورسیکلت', en: 'Cars & motorcycles', icon: '🏎️' },
  { id: 'catering-events', fa: 'پذیرایی، مراسم', en: 'Catering & events', icon: '🍽️' },
  { id: 'computer-mobile', fa: 'رایانه‌ای و موبایل', en: 'Computer & mobile', icon: '💻' },
  { id: 'legal-finance', fa: 'مالی، حقوقی و اداری', en: 'Legal, finance & admin', icon: '🧮' },
  { id: 'transport', fa: 'حمل و نقل', en: 'Transport & moving', icon: '🚚' },
  { id: 'trades-skills', fa: 'پیشه و مهارت', en: 'Trades & skills', icon: '🔧' },
  { id: 'beauty-health', fa: 'زیبایی و سلامت', en: 'Beauty & health', icon: '💇' },
  { id: 'cleaning', fa: 'نظافت', en: 'Cleaning', icon: '🪣' },
  { id: 'gardening', fa: 'باغبانی و درختکاری', en: 'Gardening', icon: '✂️' },
  { id: 'education', fa: 'آموزشی', en: 'Education', icon: '🎓' },
]

export const SERVICES_SUB_ALL = {
  id: 'all',
  fa: 'همه آگهی‌های خدمات',
  en: 'All service ads',
  icon: '⋯',
}

export function servicesSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? SERVICES_SUB_ALL.fa : SERVICES_SUB_ALL.en
  const row = SERVICES_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
