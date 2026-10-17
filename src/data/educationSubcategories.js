/** «آموزش» subcategories — matches the reference sheet */

export const EDUCATION_SUBCATEGORIES = [
  { id: 'computer-tech', fa: 'کامپیوتر و فناوری', en: 'Computer & technology', icon: '💻' },
  { id: 'mobile-software', fa: 'موبایل و نرم‌افزار', en: 'Mobile & software', icon: '📱' },
  { id: 'accounting-finance', fa: 'مالی و حسابداری', en: 'Finance & accounting', icon: '📊' },
  { id: 'marketing-sales', fa: 'بازاریابی و فروش', en: 'Marketing & sales', icon: '📣' },
  { id: 'programming', fa: 'برنامه‌نویسی', en: 'Programming', icon: '👨‍💻' },
  { id: 'cooking', fa: 'آشپزی و شیرینی‌پزی', en: 'Cooking & baking', icon: '👨‍🍳' },
  { id: 'sewing-crafts', fa: 'خیاطی و صنایع دستی', en: 'Sewing & crafts', icon: '🧵' },
  { id: 'technical-repairs', fa: 'مهارت‌های فنی و تعمیرات', en: 'Technical & repair skills', icon: '🔧' },
  { id: 'public-speaking', fa: 'فن بیان و سخنرانی', en: 'Public speaking', icon: '🎤' },
  { id: 'resume-career', fa: 'رزومه و مهارت‌های کاری', en: 'Resume & career skills', icon: '📄' },
  { id: 'private-tutoring', fa: 'تدریس خصوصی', en: 'Private tutoring', icon: '📚' },
  { id: 'language', fa: 'آموزش زبان', en: 'Language learning', icon: '🗣️' },
]

export const EDUCATION_SUB_ALL = {
  id: 'all',
  fa: 'همه',
  en: 'All',
  icon: '⋯',
}

export function educationSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? EDUCATION_SUB_ALL.fa : EDUCATION_SUB_ALL.en
  const row = EDUCATION_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
