/** Divar-style real-estate detail fields (after subcategory) */

export const RE_ROOM_OPTIONS = [
  { id: '0', fa: 'بدون اتاق', en: 'Studio / no room' },
  { id: '1', fa: '۱', en: '1' },
  { id: '2', fa: '۲', en: '2' },
  { id: '3', fa: '۳', en: '3' },
  { id: '4', fa: '۴', en: '4' },
  { id: '4+', fa: '+۴', en: '4+' },
]

export const RE_DIRECTION_OPTIONS = [
  { id: 'north', fa: 'شمالی', en: 'North' },
  { id: 'south', fa: 'جنوبی', en: 'South' },
  { id: 'east', fa: 'شرقی', en: 'East' },
  { id: 'west', fa: 'غربی', en: 'West' },
  { id: 'north-south', fa: 'شمالی‌جنوبی', en: 'North–South' },
  { id: 'east-west', fa: 'شرقی‌غربی', en: 'East–West' },
]

export const RE_COOLING_OPTIONS = [
  { id: 'evaporative', fa: 'کولر آبی', en: 'Evaporative cooler' },
  { id: 'ac', fa: 'کولر گازی', en: 'AC' },
  { id: 'duct-split', fa: 'داکت اسپلیت', en: 'Duct split' },
  { id: 'split', fa: 'اسپلیت', en: 'Split' },
  { id: 'none', fa: 'بدون سرمایش', en: 'None' },
]

export const RE_HEATING_OPTIONS = [
  { id: 'radiator', fa: 'شوفاژ', en: 'Radiator' },
  { id: 'package', fa: 'پکیج', en: 'Package boiler' },
  { id: 'heater', fa: 'بخاری', en: 'Heater' },
  { id: 'fireplace', fa: 'شومینه', en: 'Fireplace' },
  { id: 'underfloor', fa: 'از کف', en: 'Underfloor' },
  { id: 'none', fa: 'بدون گرمایش', en: 'None' },
]

export const RE_FLOORING_OPTIONS = [
  { id: 'ceramic', fa: 'سرامیک', en: 'Ceramic' },
  { id: 'wood-parquet', fa: 'پارکت چوب', en: 'Wood parquet' },
  { id: 'laminate', fa: 'لمینت', en: 'Laminate' },
  { id: 'stone', fa: 'سنگ', en: 'Stone' },
  { id: 'carpet', fa: 'موکت', en: 'Carpet' },
]

export const RE_BATHROOM_OPTIONS = [
  { id: 'iranian', fa: 'ایرانی', en: 'Iranian' },
  { id: 'western', fa: 'فرنگی', en: 'Western' },
  { id: 'both', fa: 'ایرانی و فرنگی', en: 'Both' },
]

export const RE_HOT_WATER_OPTIONS = [
  { id: 'package', fa: 'پکیج', en: 'Package' },
  { id: 'boiler-room', fa: 'موتورخانه', en: 'Boiler room' },
  { id: 'water-heater', fa: 'آبگرمکن', en: 'Water heater' },
  { id: 'tank', fa: 'مخزن', en: 'Tank' },
]

export const RE_ADVERTISER_OPTIONS = [
  { id: 'owner', fa: 'شخصی', en: 'Owner' },
  { id: 'agency', fa: 'مشاور املاک', en: 'Agency' },
]

/** Count chips when amenity is available (دارد) */
export const RE_AMENITY_COUNT_OPTIONS = [
  { id: '1', fa: '۱', en: '1' },
  { id: '2', fa: '۲', en: '2' },
  { id: '3', fa: '۳', en: '3' },
  { id: '4+', fa: '+۴', en: '4+' },
]

export const EMPTY_RE_DETAIL = {
  rooms: '',
  areaMin: '',
  areaMax: '',
  area: '',
  buildingAgeMin: '',
  buildingAgeMax: '',
  buildingAge: '',
  floorMin: '',
  floorMax: '',
  floor: '',
  buildingDirection: '',
  cooling: '',
  heating: '',
  flooring: '',
  bathroom: '',
  hotWater: '',
  advertiserType: '',
  elevator: null,
  elevatorCount: '',
  parking: null,
  parkingCount: '',
  storage: null,
  storageCount: '',
  /** Manual rent money fields — never auto-filled */
  deposit: '',
  monthlyRent: '',
  hasVideo: false,
  hasPropertyPhotos: false,
}

export function isRealEstateRentSub(subcategory = '') {
  return String(subcategory || '').includes('rent')
}

export function formatMoneyAmount(n, lang = 'fa') {
  const num = Number(n)
  if (!Number.isFinite(num) || num <= 0) return ''
  const formatted = Math.round(num).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-CA')
  return lang === 'fa' ? `${formatted} $` : `$${formatted}`
}

/** Card / listing price line for rent ads with manual ودیعه + اجاره */
export function formatRealEstateRentPriceLabel({ deposit, monthlyRent }, lang = 'fa') {
  const dep = formatMoneyAmount(deposit, lang)
  const rent = formatMoneyAmount(monthlyRent, lang)
  if (dep && rent) {
    return lang === 'fa'
      ? `ودیعه ${dep} · اجاره ${rent}`
      : `Deposit ${dep} · Rent ${rent}`
  }
  if (rent) {
    return lang === 'fa' ? `اجاره ${rent}` : `Rent ${rent}`
  }
  if (dep) {
    return lang === 'fa' ? `ودیعه ${dep}` : `Deposit ${dep}`
  }
  return lang === 'fa' ? 'توافقی' : 'Negotiable'
}

export function optionLabel(options, id, lang = 'fa') {
  const row = options.find((o) => o.id === id)
  if (!row) return id || ''
  return lang === 'fa' ? row.fa : row.en
}
