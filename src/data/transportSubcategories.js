/** «حمل و نقل» subcategories — matches the reference sheet */

export const TRANSPORT_SUBCATEGORIES = [
  { id: 'courier', fa: 'پیک و ارسال', en: 'Courier & delivery', icon: '🛵' },
  { id: 'freight', fa: 'حمل و نقل', en: 'Transport', icon: '🚛' },
  { id: 'moving', fa: 'اسباب‌کشی', en: 'Moving', icon: '📦' },
  { id: 'truck-van-rental', fa: 'اجاره کامیون و ون', en: 'Truck & van rental', icon: '🛻' },
  { id: 'driver-van', fa: 'راننده و ون', en: 'Driver & van', icon: '🚐' },
  { id: 'furniture', fa: 'حمل مبلمان', en: 'Furniture transport', icon: '🛋️' },
  { id: 'car-transport', fa: 'حمل خودرو', en: 'Car transport', icon: '🚗' },
]

export const TRANSPORT_SUB_ALL = {
  id: 'all',
  fa: 'همه',
  en: 'All',
  icon: '⋯',
}

export function transportSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? TRANSPORT_SUB_ALL.fa : TRANSPORT_SUB_ALL.en
  const row = TRANSPORT_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}
