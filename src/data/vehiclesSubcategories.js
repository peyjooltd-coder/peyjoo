/** Divar-style «وسایل نقلیه» subcategories — matches the reference sheet */

export const VEHICLES_SUBCATEGORIES = [
  { id: 'car', fa: 'خودرو', en: 'Cars', icon: '🚗' },
  { id: 'motorcycle', fa: 'موتورسیکلت', en: 'Motorcycles', icon: '🏍️' },
  { id: 'parts-accessories', fa: 'قطعات یدکی و لوازم جانبی', en: 'Parts & accessories', icon: '🛞' },
  { id: 'boat-other', fa: 'لوازم و سایر وسایل نقلیه', en: 'Equipment & other vehicles', icon: '🔧' },
  { id: 'garage', fa: 'تعمیرگاه ها', en: 'Repair shops', icon: '🛠️' },
  { id: 'car-rental', fa: 'اجاره خودرو', en: 'Car rental', icon: '🔑' },
]

export const VEHICLES_SUB_ALL = {
  id: 'all',
  fa: 'همه',
  en: 'All',
  icon: '⋯',
}

export function vehiclesSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? VEHICLES_SUB_ALL.fa : VEHICLES_SUB_ALL.en
  const row = VEHICLES_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
