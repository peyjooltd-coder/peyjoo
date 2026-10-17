/** Divar-style real-estate category tree (L1 → L2) for Pejo املاک */

export const REAL_ESTATE_SUBCATEGORIES = [
  { id: 'rent-residential', fa: 'اجاره مسکونی', en: 'Residential rental', icon: '🔑' },
  { id: 'sale-residential', fa: 'فروش مسکونی', en: 'Residential sale', icon: '🏠' },
  { id: 'sale-commercial', fa: 'فروش اداری و تجاری', en: 'Office & commercial sale', icon: '🏢' },
  { id: 'rent-commercial', fa: 'اجاره اداری و تجاری', en: 'Office & commercial rental', icon: '🏬' },
  { id: 'construction-projects', fa: 'پروژه‌های ساخت‌وساز', en: 'Construction projects', icon: '🏗️' },
  { id: 'short-term-rent', fa: 'اجاره کوتاه‌مدت', en: 'Short-term rental', icon: '⏱️' },
]

export const REAL_ESTATE_SUB_ALL = {
  id: 'all',
  fa: 'همه آگهی‌های املاک',
  en: 'All real estate ads',
  icon: '⋯',
}

/** L2 property types per L1 subcategory */
export const REAL_ESTATE_PROPERTY_TYPES = {
  'rent-residential': [
    { id: 'apartment', fa: 'آپارتمان', en: 'Apartment', icon: '🏢' },
    { id: 'house-villa', fa: 'خانه و ویلا', en: 'House & villa', icon: '🏡' },
    { id: 'roommate', fa: 'همخانه', en: 'Roommate', icon: '🧑‍🤝‍🧑' },
  ],
  'sale-residential': [
    { id: 'apartment', fa: 'آپارتمان', en: 'Apartment', icon: '🏢' },
    { id: 'house-villa', fa: 'خانه و ویلا', en: 'House & villa', icon: '🏡' },
    { id: 'land', fa: 'زمین و ملک کلنگی', en: 'Land & tear-down', icon: '🗺️' },
  ],
  'sale-commercial': [
    { id: 'office', fa: 'دفتر کار، اتاق اداری، مطب', en: 'Office / clinic', icon: '🪑' },
    { id: 'shop', fa: 'مغازه و غرفه', en: 'Shop & booth', icon: '🏪' },
    { id: 'industrial', fa: 'صنعتی، کشاورزی، تجاری', en: 'Industrial / agri / commercial', icon: '🏭' },
  ],
  'rent-commercial': [
    { id: 'office', fa: 'دفتر کار، اتاق اداری، مطب', en: 'Office / clinic', icon: '🪑' },
    { id: 'shop', fa: 'مغازه و غرفه', en: 'Shop & booth', icon: '🏪' },
    { id: 'industrial', fa: 'صنعتی، کشاورزی، تجاری', en: 'Industrial / agri / commercial', icon: '🏭' },
  ],
  'construction-projects': [
    { id: 'partnership', fa: 'مشارکت در ساخت', en: 'Construction partnership', icon: '🤝' },
    { id: 'presale', fa: 'پیش‌فروش', en: 'Pre-sale', icon: '📄' },
  ],
  'short-term-rent': [
    { id: 'apartment-suite', fa: 'آپارتمان و سوئیت', en: 'Apartment & suite', icon: '🛏️' },
    { id: 'villa-garden', fa: 'ویلا و باغ', en: 'Villa & garden', icon: '🌳' },
    { id: 'office-space', fa: 'دفتر کار و فضای آموزشی', en: 'Office & learning space', icon: '📚' },
  ],
}

export function realEstateSubLabel(id, lang = 'fa') {
  if (!id || id === 'all') return lang === 'fa' ? REAL_ESTATE_SUB_ALL.fa : REAL_ESTATE_SUB_ALL.en
  const row = REAL_ESTATE_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}

export function realEstatePropertyTypeLabel(subId, typeId, lang = 'fa') {
  if (!typeId || typeId === 'all') {
    const sub = realEstateSubLabel(subId, lang)
    return lang === 'fa' ? `همه آگهی‌های ${sub}` : `All ${sub} ads`
  }
  const list = REAL_ESTATE_PROPERTY_TYPES[subId] || []
  const row = list.find((t) => t.id === typeId)
  if (!row) return typeId
  return lang === 'fa' ? row.fa : row.en
}

export function realEstateAllAdsLabel(subId, lang = 'fa') {
  if (!subId || subId === 'all') {
    return lang === 'fa' ? REAL_ESTATE_SUB_ALL.fa : REAL_ESTATE_SUB_ALL.en
  }
  return realEstatePropertyTypeLabel(subId, 'all', lang)
}

export function getRealEstateL2(subId) {
  return REAL_ESTATE_PROPERTY_TYPES[subId] || []
}
