/** Canadian Metro Vancouver cities — ids match listing.city in seed data */

export const CANADA_CITIES = [
  { id: 'all', fa: 'همه مترو ونکوور', en: 'All Metro Vancouver' },
  { id: 'ونکوور', fa: 'ونکوور', en: 'Vancouver' },
  { id: 'برنابی', fa: 'برنابی', en: 'Burnaby' },
  { id: 'سوری', fa: 'سوری', en: 'Surrey' },
  { id: 'ریچموند', fa: 'ریچموند', en: 'Richmond' },
  { id: 'نورث ونکوور', fa: 'نورث ونکوور', en: 'North Vancouver' },
  { id: 'وست ونکوور', fa: 'وست ونکوور', en: 'West Vancouver' },
  { id: 'کوکیتلام', fa: 'کوکیتلام', en: 'Coquitlam' },
  { id: 'نیو وستمینستر', fa: 'نیو وستمینستر', en: 'New Westminster' },
  { id: 'پورت کوکیتلام', fa: 'پورت کوکیتلام', en: 'Port Coquitlam' },
  { id: 'لنگلی', fa: 'لنگلی', en: 'Langley' },
]

/** Legacy English region keys → Persian city ids */
const LEGACY_REGION_MAP = {
  'All Greater Vancouver': 'all',
  Vancouver: 'ونکوور',
  Burnaby: 'برنابی',
  Surrey: 'سوری',
  Richmond: 'ریچموند',
  'North Vancouver': 'نورث ونکوور',
  Coquitlam: 'کوکیتلام',
  'New Westminster': 'نیو وستمینستر',
}

export function normalizeCityId(region) {
  if (!region || region === 'all' || region === 'All Greater Vancouver') return 'all'
  return LEGACY_REGION_MAP[region] || region
}

export function cityLabel(id, lang = 'fa') {
  const key = normalizeCityId(id)
  const row = CANADA_CITIES.find((c) => c.id === key)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}

export function listingMatchesCity(listingCity, selectedRegion) {
  const cityId = normalizeCityId(selectedRegion)
  if (cityId === 'all') return true
  return listingCity === cityId
}
