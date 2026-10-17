/** نگاشت دسته‌های UI به دسته‌های واقعی API */

export const categoryToApi = {
  'real-estate': 'real-estate',
  vehicles: 'vehicles',
  electronics: 'electronics',
  furniture: 'furniture',
  services: 'services',
  fashion: 'fashion',
  sports: 'sports',
  business: 'business',
  kitchen: 'home-appliances',
  'home-appliances': 'home-appliances',
  'home-market': 'home-market',
  beauty: 'beauty',
  education: 'education',
  jobs: 'jobs',
  transport: 'transport',
  travel: 'transport',
  couriers: 'kolbaran',
  kolbaran: 'kolbaran',
  exchange: 'exchange',
  charity: 'services',
  hamyari: 'services',
  'buy-sell': 'buy-sell',
  pets: 'pets',
  food: 'restaurant',
  restaurant: 'restaurant',
  health: 'health',
  repairs: 'services',
  'tools-rental': 'tools-rental',
  events: 'services',
  dating: 'services',
  'lost-found': 'services',
  music: 'electronics',
  migration: 'migration',
  discounts: 'services',
  occupations: 'jobs',
}

export function resolveApiCategory(uiId) {
  if (!uiId || uiId === 'all' || uiId === 'more') return null
  return categoryToApi[uiId] || uiId
}
