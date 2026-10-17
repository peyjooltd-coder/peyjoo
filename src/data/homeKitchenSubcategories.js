/** Divar-style «خانه و آشپزخانه» subcategories */

export const HOME_KITCHEN_SUBCATEGORIES = [
  { id: 'electric-appliances', fa: 'لوازم خانگی برقی', en: 'Electric appliances', icon: '🧊' },
  { id: 'kitchenware', fa: 'ظروف و لوازم آشپزخانه', en: 'Kitchenware', icon: '🍲' },
  { id: 'food-drink', fa: 'خوردنی و آشامیدنی', en: 'Food & drinks', icon: '🛒' },
  { id: 'sewing', fa: 'خیاطی و بافتنی', en: 'Sewing & knitting', icon: '🧶' },
  { id: 'furniture-wood', fa: 'مبلمان و صنایع چوب', en: 'Furniture & woodwork', icon: '🪑' },
  { id: 'lighting', fa: 'نور و روشنایی', en: 'Lighting', icon: '💡' },
  { id: 'carpets', fa: 'فرش، گلیم، موکت', en: 'Carpets & rugs', icon: '🧺' },
  { id: 'bedding', fa: 'تشک، روتختی، رختخواب', en: 'Mattress & bedding', icon: '🛏️' },
  { id: 'decor', fa: 'لوازم دکوری و تزئینی', en: 'Decor & ornaments', icon: '🪴' },
  { id: 'climate', fa: 'تهویه، سرمایش، گرمایش', en: 'HVAC & climate', icon: '❄️' },
  { id: 'cleaning', fa: 'شست‌وشو و نظافت', en: 'Cleaning', icon: '🧽' },
  { id: 'bathroom', fa: 'حمام و سرویس بهداشتی', en: 'Bathroom', icon: '🚿' },
]

export const HOME_KITCHEN_SUB_ALL = {
  id: 'all',
  fa: 'همه آگهی‌های خانه و آشپزخانه',
  en: 'All home & kitchen ads',
  icon: '⋯',
}

export function homeKitchenSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? HOME_KITCHEN_SUB_ALL.fa : HOME_KITCHEN_SUB_ALL.en
  const row = HOME_KITCHEN_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
