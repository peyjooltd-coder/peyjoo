/**
 * Pejo category browse configs — FB Marketplace layout (tiles + filters)
 * with the app's existing Divar-style categories & soft colored glyph tiles.
 */

import {
  LayoutGrid, Briefcase, Wrench, Car, Home, Sofa, Hammer, Truck, Sparkles,
  GraduationCap, ShoppingBag, PawPrint, Dumbbell, HeartPulse, Package,
  Users, Smartphone, Building2, CookingPot, Scissors, Stethoscope, Bus,
  Bike, Dog, Cat,   Camera, Laptop, Paintbrush, Music2, Leaf, Baby, Shirt, ArrowLeftRight,
} from 'lucide-react'
import { VEHICLES_SUBCATEGORIES } from './vehiclesSubcategories'
import { HOME_KITCHEN_SUBCATEGORIES } from './homeKitchenSubcategories'
import { SPORTS_SUBCATEGORIES } from './sportsSubcategories'
import { HEALTH_SUBCATEGORIES } from './healthSubcategories'
import { TOOLS_RENTAL_SUBCATEGORIES } from './toolsRentalSubcategories'
import { TRANSPORT_SUBCATEGORIES } from './transportSubcategories'
import { KOLBARAN_SUBCATEGORIES } from './kolbaranSubcategories'

const TONES = ['sky', 'emerald', 'amber', 'rose', 'indigo', 'coral', 'teal', 'violet', 'orange', 'pink', 'mint', 'sand']

const TILE_ICON_POOL = [
  Briefcase, Car, Home, Wrench, CookingPot, Sofa, Hammer, Truck, Sparkles,
  GraduationCap, ShoppingBag, PawPrint, Dumbbell, HeartPulse, Package,
  Users, Smartphone, Building2, Scissors, Stethoscope, Bus, Bike, Dog, Cat,
  Camera, Laptop, Paintbrush, Music2, Leaf, Baby, Shirt,
]

function allTile() {
  return {
    id: 'all',
    fa: 'همه',
    en: 'All',
    Icon: LayoutGrid,
    tone: 'slate',
    match: () => true,
  }
}

function fromSubs(subs, attrKey) {
  return [
    allTile(),
    ...subs.map((s, i) => ({
      id: s.id,
      fa: s.fa,
      en: s.en,
      Icon: TILE_ICON_POOL[i % TILE_ICON_POOL.length],
      tone: TONES[i % TONES.length],
      match: (listing) => {
        const v = listing?.attributes?.[attrKey]
        if (v) return v === s.id
        const hay = `${listing?.title || ''} ${listing?.description || ''}`.toLowerCase()
        return hay.includes(String(s.fa).slice(0, 4).toLowerCase())
          || hay.includes(String(s.en).split(' ')[0].toLowerCase())
      },
    })),
  ]
}

/**
 * @type {Record<string, {
 *   id: string,
 *   fa: string,
 *   en: string,
 *   apiCategory: string,
 *   png?: string,
 *   tiles: Array,
 *   filters: string[],
 * }>}
 */
export const PEJO_BROWSE_CATEGORIES = {
  jobs: {
    id: 'jobs',
    fa: 'مشاغل',
    en: 'Jobs',
    apiCategory: 'jobs',
    png: '/categories/jobs.png',
    filters: [],
    tiles: [allTile()],
  },
  business: {
    id: 'business',
    fa: 'بیزنس‌ها',
    en: 'Businesses',
    apiCategory: 'business',
    png: '/categories/business.png',
    filters: [],
    tiles: [allTile()],
  },
  vehicles: {
    id: 'vehicles',
    fa: 'وسایل نقلیه',
    en: 'Vehicles',
    apiCategory: 'vehicles',
    png: '/categories/vehicles.png',
    filters: [],
    tiles: fromSubs(VEHICLES_SUBCATEGORIES, 'vehiclesSubcategory'),
  },
  'home-appliances': {
    id: 'home-appliances',
    fa: 'خانه و آشپزخانه',
    en: 'Home & kitchen',
    apiCategory: 'home-appliances',
    png: '/categories/home-appliances.png',
    filters: [],
    tiles: fromSubs(HOME_KITCHEN_SUBCATEGORIES, 'homeKitchenSubcategory'),
  },
  kitchen: {
    id: 'kitchen',
    fa: 'خانه و آشپزخانه',
    en: 'Home & kitchen',
    apiCategory: 'home-appliances',
    png: '/categories/home-appliances.png',
    filters: [],
    tiles: fromSubs(HOME_KITCHEN_SUBCATEGORIES, 'homeKitchenSubcategory'),
  },
  furniture: {
    id: 'furniture',
    fa: 'مبل و دکور',
    en: 'Furniture',
    apiCategory: 'furniture',
    alsoCategories: ['home-appliances'],
    png: '/categories/furniture.png',
    filters: [],
    tiles: [
      allTile(),
      {
        id: 'furniture-wood',
        fa: 'مبلمان',
        en: 'Furniture',
        Icon: Sofa,
        tone: 'sand',
        match: (l) => l.category === 'furniture'
          || l?.attributes?.homeKitchenSubcategory === 'furniture-wood'
          || /مبل|sofa|میز|صندلی/i.test(`${l.title || ''} ${l.description || ''}`),
      },
      {
        id: 'decor',
        fa: 'دکور',
        en: 'Decor',
        Icon: Leaf,
        tone: 'emerald',
        match: (l) => l?.attributes?.homeKitchenSubcategory === 'decor'
          || /دکور|decor|فرش/i.test(`${l.title || ''} ${l.description || ''}`),
      },
    ],
  },
  services: {
    id: 'services',
    fa: 'خدمات',
    en: 'Services',
    apiCategory: 'services',
    png: '/categories/services.png',
    filters: [],
    tiles: [allTile()],
  },
  travel: {
    id: 'travel',
    fa: 'مسافر',
    en: 'Travel',
    apiCategory: 'services',
    png: '/categories/travel.png',
    filters: [],
    tiles: [
      allTile(),
      {
        id: 'passenger',
        fa: 'مسافر',
        en: 'Passenger',
        Icon: Users,
        tone: 'indigo',
        match: (l) => /مسافر|travel|ride/i.test(`${l.title || ''} ${l.description || ''}`),
      },
    ],
  },
  exchange: {
    id: 'exchange',
    fa: 'صرافی',
    en: 'Currency Exchange',
    apiCategory: 'exchange',
    png: '/categories/exchange.png',
    filters: [],
    tiles: [allTile()],
  },
  beauty: {
    id: 'beauty',
    fa: 'زیبایی',
    en: 'Beauty',
    apiCategory: 'beauty',
    png: '/categories/beauty.png',
    filters: [],
    tiles: [allTile()],
  },
  education: {
    id: 'education',
    fa: 'آموزش',
    en: 'Education',
    apiCategory: 'education',
    png: '/categories/education.png',
    filters: [],
    tiles: [allTile()],
  },
  transport: {
    id: 'transport',
    fa: 'حمل و نقل',
    en: 'Moving & Shipping',
    apiCategory: 'transport',
    png: '/categories/transport.png',
    filters: [],
    tiles: fromSubs(TRANSPORT_SUBCATEGORIES, 'transportSubcategory'),
  },
  kolbaran: {
    id: 'kolbaran',
    fa: 'کولبران',
    en: 'Traveler Couriers',
    apiCategory: 'kolbaran',
    png: '/categories/couriers.png',
    filters: [],
    tiles: fromSubs(KOLBARAN_SUBCATEGORIES, 'kolbaranSubcategory'),
  },
  pets: {
    id: 'pets',
    fa: 'حیوانات',
    en: 'Pets',
    apiCategory: 'pets',
    png: '/categories/pets.png',
    filters: [],
    tiles: [allTile()],
  },
  sports: {
    id: 'sports',
    fa: 'ورزش',
    en: 'Sports',
    apiCategory: 'sports',
    png: '/categories/sports.png',
    filters: [],
    tiles: fromSubs(SPORTS_SUBCATEGORIES, 'sportsSubcategory'),
  },
  health: {
    id: 'health',
    fa: 'سلامت',
    en: 'Health',
    apiCategory: 'health',
    png: '/categories/health.png',
    filters: [],
    tiles: fromSubs(HEALTH_SUBCATEGORIES, 'healthSubcategory'),
  },
  'tools-rental': {
    id: 'tools-rental',
    fa: 'اجاره ابزار',
    en: 'Tool rental',
    apiCategory: 'tools-rental',
    png: '/categories/tools-rental.png',
    filters: [],
    tiles: fromSubs(TOOLS_RENTAL_SUBCATEGORIES, 'toolsRentalSubcategory'),
  },
  'buy-sell': {
    id: 'buy-sell',
    fa: 'خرید و فروش',
    en: 'Buy & Sell',
    apiCategory: 'buy-sell',
    alsoCategories: ['electronics', 'fashion', 'furniture', 'home-appliances', 'tools-rental'],
    png: '/categories/buy-sell.png',
    filters: [],
    tiles: [allTile()],
  },
  'home-market': {
    id: 'home-market',
    fa: 'بازارچه خانگی',
    en: 'Home Market',
    apiCategory: 'home-market',
    alsoCategories: ['home-appliances', 'kitchen'],
    png: '/categories/home-market.png',
    filters: [],
    tiles: [allTile()],
  },
  restaurant: {
    id: 'restaurant',
    fa: 'رستوران',
    en: 'Restaurants',
    apiCategory: 'restaurant',
    alsoCategories: ['food'],
    png: '/categories/food.png',
    filters: [],
    tiles: [allTile()],
  },
  /** @deprecated use restaurant */
  food: {
    id: 'restaurant',
    fa: 'رستوران',
    en: 'Restaurants',
    apiCategory: 'restaurant',
    png: '/categories/food.png',
    filters: [],
    tiles: [allTile()],
  },
  migration: {
    id: 'migration',
    fa: 'مهاجرت',
    en: 'Immigration',
    apiCategory: 'migration',
    png: '/categories/migration.png',
    filters: [],
    tiles: [allTile()],
  },
  occupations: {
    id: 'occupations',
    fa: 'مشاغل',
    en: 'Occupations',
    apiCategory: 'jobs',
    png: '/categories/occupations.png',
    filters: [],
    tiles: [allTile()],
  },
  electronics: {
    id: 'electronics',
    fa: 'الکترونیک',
    en: 'Electronics',
    apiCategory: 'electronics',
    png: '/categories/electronics.png',
    filters: [],
    tiles: [allTile()],
  },
}

export const CONDITION_OPTIONS = [
  { id: 'any', fa: 'همه', en: 'Any' },
  { id: 'new', fa: 'نو', en: 'New' },
  { id: 'like-new', fa: 'در حد نو', en: 'Like new' },
  { id: 'good', fa: 'خوب', en: 'Good' },
  { id: 'fair', fa: 'قابل قبول', en: 'Fair' },
]

export function conditionLabel(id, lang = 'fa') {
  const row = CONDITION_OPTIONS.find((o) => o.id === id) || CONDITION_OPTIONS[0]
  return lang === 'fa' ? row.fa : row.en
}

export function matchCondition(listing, conditionId) {
  if (!conditionId || conditionId === 'any') return true
  const c = String(listing.condition || '').toLowerCase()
  if (conditionId === 'new') return /^(new|نو)$/i.test(c) || (c.includes('نو') && !c.includes('حد'))
  if (conditionId === 'like-new') return /like\s*new|در\s*حد\s*نو|مثل\s*نو/i.test(c)
  if (conditionId === 'good') return /good|خوب/i.test(c)
  if (conditionId === 'fair') return /fair|قابل\s*قبول|متوسط/i.test(c)
  return true
}

export function getPejoBrowseCategory(id) {
  if (!id) return null
  // خانه و آشپزخانه / اجاره ابزار → زیر خرید و فروش
  if (id === 'kitchen' || id === 'home-appliances' || id === 'tools-rental') {
    return PEJO_BROWSE_CATEGORIES['buy-sell']
  }
  if (id === 'food') return PEJO_BROWSE_CATEGORIES.restaurant
  return PEJO_BROWSE_CATEGORIES[id] || null
}

export function isPejoBrowseCategory(id) {
  if (!id) return false
  if (id === 'kitchen' || id === 'home-appliances' || id === 'tools-rental' || id === 'food') return true
  return Boolean(PEJO_BROWSE_CATEGORIES[id])
}

export function listingInPejoBrowse(listing, cat) {
  if (!listing || !cat) return false
  const cats = [cat.apiCategory, ...(cat.alsoCategories || [])]
  return cats.includes(listing.category)
}
