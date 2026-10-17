/** Soft pastel circle + 3D category PNGs — shared app icon language */
import {
  Heart, Briefcase, Home, Wrench, Car, CookingPot, Sofa, Hammer, Truck,
  Users, ArrowLeftRight, Sparkles, GraduationCap, ShoppingBag, PawPrint,
  Dumbbell, UtensilsCrossed, HeartPulse, Package, Handshake, Stamp, HardHat,
  Smartphone, Building2, HandHeart, TicketPercent, PartyPopper, Search, Music2,
  Gift, LayoutGrid, BookOpen, Armchair, Shirt, MoreHorizontal, Leaf, Baby, Apple,
  Bed, Bath, KeyRound, Store, Trees, Warehouse, CircleDot, ShoppingBasket,
} from 'lucide-react'

/** Final 3D icons cropped from the brand Categories sheet → /categories/{id}.png */
const V = 'v=icons7'
export const CATEGORY_IMAGE_MAP = {
  'real-estate': `/categories/real-estate.png?${V}`,
  business: `/categories/business.png?${V}`,
  'buy-sell': `/categories/buy-sell.png?${V}`,
  services: `/categories/services.png?${V}`,
  beauty: `/categories/beauty.png?${V}`,
  vehicles: `/categories/vehicles.png?${V}`,
  couriers: `/categories/couriers.png?${V}`,
  kolbaran: `/categories/couriers.png?${V}`,
  exchange: `/categories/exchange.png?${V}`,
  transport: `/categories/transport.png?${V}`,
  education: `/categories/education.png?${V}`,
  health: `/categories/health.png?${V}`,
  restaurant: `/categories/restaurant.png?${V}`,
  sports: `/categories/sports.png?${V}`,
  pets: `/categories/pets.png?${V}`,
  'home-market': `/categories/home-market.png?${V}`,
  jobs: `/categories/jobs.png?${V}`,
  migration: `/categories/migration.png?${V}`,
  dating: `/categories/dating.png?${V}`,
  hamyari: `/categories/hamyari.png?${V}`,
  // aliases / legacy ids
  food: `/categories/restaurant.png?${V}`,
  kitchen: `/categories/home-market.png?${V}`,
  'home-appliances': `/categories/home-market.png?${V}`,
  furniture: `/categories/buy-sell.png?${V}`,
  'tools-rental': `/categories/buy-sell.png?${V}`,
  occupations: `/categories/jobs.png?${V}`,
  charity: `/categories/hamyari.png?${V}`,
  travel: `/categories/couriers.png?${V}`,
  repairs: `/categories/services.png?${V}`,
  favorites: `/categories/favorites.png?${V}`,
  saved: `/categories/favorites.png?${V}`,
  more: `/categories/more.png?${V}`,
}

export const CATEGORY_ICON_MAP = {
  favorites: Heart,
  saved: Heart,
  jobs: Briefcase,
  'real-estate': Home,
  repairs: Wrench,
  vehicles: Car,
  kitchen: CookingPot,
  furniture: Sofa,
  'home-appliances': CookingPot,
  'home-market': ShoppingBasket,
  services: Hammer,
  transport: Truck,
  travel: Users,
  couriers: Package,
  kolbaran: Package,
  exchange: ArrowLeftRight,
  beauty: Sparkles,
  education: GraduationCap,
  'buy-sell': ShoppingBag,
  pets: PawPrint,
  sports: Dumbbell,
  food: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  health: HeartPulse,
  'tools-rental': Package,
  dating: Handshake,
  migration: Stamp,
  occupations: HardHat,
  business: Building2,
  charity: HandHeart,
  hamyari: HandHeart,
  discounts: TicketPercent,
  events: PartyPopper,
  'lost-found': Search,
  music: Music2,
  home: Home,
  more: LayoutGrid,
  all: LayoutGrid,
  'donation-free': Gift,
  clothes: Shirt,
  books: BookOpen,
  baby: Baby,
  'plants-animals': Leaf,
  other: MoreHorizontal,
  apartment: Building2,
  house: Home,
  condo: Building2,
  townhouse: Home,
  land: Trees,
  commercial: Store,
  parking: Car,
  rent: KeyRound,
  sale: Store,
  beds: Bed,
  baths: Bath,
  warehouse: Warehouse,
  armchair: Armchair,
  apple: Apple,
  gift: Gift,
  leaf: Leaf,
  shirt: Shirt,
  grid: LayoutGrid,
  electronics: Smartphone,
}

export const CATEGORY_TONE_MAP = {
  favorites: 'rose',
  saved: 'rose',
  jobs: 'amber',
  'real-estate': 'sky',
  repairs: 'slate',
  vehicles: 'coral',
  kitchen: 'orange',
  furniture: 'sand',
  'home-appliances': 'orange',
  'home-market': 'orange',
  services: 'navy',
  transport: 'blue',
  travel: 'violet',
  couriers: 'blue',
  kolbaran: 'mint',
  exchange: 'teal',
  beauty: 'pink',
  education: 'indigo',
  'buy-sell': 'emerald',
  pets: 'amber',
  sports: 'violet',
  food: 'orange',
  restaurant: 'orange',
  health: 'mint',
  'tools-rental': 'slate',
  dating: 'rose',
  migration: 'emerald',
  occupations: 'sky',
  electronics: 'indigo',
  business: 'navy',
  charity: 'pink',
  hamyari: 'rose',
  discounts: 'amber',
  events: 'violet',
  'lost-found': 'teal',
  music: 'indigo',
  home: 'sand',
  more: 'slate',
  all: 'slate',
  'donation-free': 'rose',
  clothes: 'pink',
  books: 'indigo',
  baby: 'sky',
  'plants-animals': 'emerald',
  other: 'slate',
  food_hamyari: 'orange',
}

export function getCategoryIcon(id) {
  return CATEGORY_ICON_MAP[id] || CircleDot
}

export function getCategoryTone(id) {
  return CATEGORY_TONE_MAP[id] || 'coral'
}

export function getCategoryImage(id) {
  if (!id) return null
  return CATEGORY_IMAGE_MAP[id] || null
}

/**
 * @param {{ id?: string, icon?: import('lucide-react').LucideIcon, tone?: string, size?: 'sm'|'md'|'lg', className?: string, filled?: boolean }} props
 */
export default function GlassCategoryIcon({
  id,
  icon: IconProp,
  tone: toneProp,
  size = 'md',
  className = '',
  filled,
}) {
  const img = getCategoryImage(id)
  const Icon = IconProp || CATEGORY_ICON_MAP[id] || CircleDot
  const tone = toneProp || CATEGORY_TONE_MAP[id] || 'coral'
  const isFilled = filled ?? (id === 'favorites' || id === 'saved')

  // Prefer brand 3D PNGs whenever available (even if a lucide fallback was passed)
  if (img) {
    return (
      <span
        className={`cat-glyph cat-glyph-img cat-glyph-${size} ${className}`}
        aria-hidden
      >
        <img src={img} alt="" draggable={false} />
      </span>
    )
  }

  return (
    <span
      className={`cat-glyph cat-glyph-${size} cat-glyph-tone-${tone} ${className}`}
      aria-hidden
    >
      <span className="cat-glyph-shine" />
      <Icon
        className={`cat-glyph-svg${isFilled ? ' cat-glyph-svg--fill' : ''}`}
        strokeWidth={1.75}
      />
    </span>
  )
}
