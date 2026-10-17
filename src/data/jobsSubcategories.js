/** Divar-style job subcategories for Pejo کاریابی */

export const JOBS_SUBCATEGORIES = [
  { id: 'admin-management', fa: 'اداری و مدیریت', en: 'Admin & management', icon: '👔' },
  { id: 'janitor-cleaning', fa: 'سرایداری و نظافت', en: 'Janitorial & cleaning', icon: '🧹' },
  { id: 'architecture-construction', fa: 'معماری، عمران و ساختمانی', en: 'Architecture & construction', icon: '🏗️' },
  { id: 'store-restaurant', fa: 'خدمات فروشگاه و رستوران', en: 'Store & restaurant', icon: '👨‍🍳' },
  { id: 'it-computer', fa: 'رایانه و فناوری اطلاعات', en: 'IT & computers', icon: '💻' },
  { id: 'finance-legal', fa: 'مالی، حسابداری، حقوقی', en: 'Finance, accounting & legal', icon: '⚖️' },
  { id: 'marketing-sales', fa: 'بازاریابی و فروش', en: 'Marketing & sales', icon: '📢' },
  { id: 'industrial-engineering', fa: 'صنعتی، فنی، مهندسی', en: 'Industrial & engineering', icon: '⛑️' },
  { id: 'education', fa: 'آموزشی', en: 'Education', icon: '📚' },
  { id: 'transport', fa: 'حمل و نقل', en: 'Transportation', icon: '🚚' },
  { id: 'health-beauty', fa: 'درمانی، زیبایی، بهداشتی', en: 'Health, beauty & medical', icon: '🩺' },
  { id: 'arts-media', fa: 'هنری و رسانه', en: 'Arts & media', icon: '🎨' },
]

export const JOBS_SUB_ALL = {
  id: 'all',
  fa: 'همه آگهی‌های استخدام و کاریابی',
  en: 'All job listings',
  icon: '⋯',
}

export function jobsSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? JOBS_SUB_ALL.fa : JOBS_SUB_ALL.en
  const row = JOBS_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}

export function jobsSubOptionsForSelect() {
  return JOBS_SUBCATEGORIES.map((s) => s.id)
}
