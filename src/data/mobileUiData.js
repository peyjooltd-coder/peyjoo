/** Persian UI — final Pejo category list (matches icon sheet + postable cats) */

export const popularCategories = [
  { id: 'real-estate', name: 'املاک', icon: '🏠', tint: 'bg-sky-100' },
  { id: 'business', name: 'بیزنس‌ها', icon: '👔', tint: 'bg-amber-100' },
  { id: 'buy-sell', name: 'خرید و فروش', icon: '🛍️', tint: 'bg-emerald-50' },
  { id: 'services', name: 'خدمات', icon: '🔧', tint: 'bg-slate-100' },
  { id: 'beauty', name: 'زیبایی', icon: '💄', tint: 'bg-pink-50' },
  { id: 'vehicles', name: 'وسایل نقلیه', icon: '🚗', tint: 'bg-red-50' },
  { id: 'kolbaran', name: 'کولبران', icon: '🧳', tint: 'bg-green-50' },
  { id: 'exchange', name: 'صرافی', icon: '💱', tint: 'bg-cyan-50' },
  { id: 'transport', name: 'حمل و نقل', icon: '🚚', tint: 'bg-blue-50' },
  { id: 'education', name: 'آموزش', icon: '🎓', tint: 'bg-sky-50' },
  { id: 'health', name: 'سلامت', icon: '💗', tint: 'bg-teal-50' },
  { id: 'restaurant', name: 'رستوران', icon: '🍽️', tint: 'bg-orange-50' },
  { id: 'sports', name: 'ورزش', icon: '⚽', tint: 'bg-violet-50' },
  { id: 'pets', name: 'حیوانات', icon: '🐕', tint: 'bg-amber-50' },
  { id: 'home-market', name: 'بازارچه خانگی', icon: '🧺', tint: 'bg-orange-50' },
  { id: 'jobs', name: 'مشاغل', icon: '💼', tint: 'bg-amber-100' },
  { id: 'migration', name: 'مهاجرت', icon: '🛂', tint: 'bg-emerald-50' },
]

/** Categories page + post-ad picker — all marketplace cats (dating & hamyari stay in bottom nav) */
export const allCategories = [...popularCategories]

/** Explicit postable category ids (same order as home / categories) */
export const POSTABLE_CATEGORY_IDS = popularCategories.map((c) => c.id)

export const featuredAds = [
  {
    id: 'f1',
    title: 'آپارتمان یک خوابه لوکس',
    priceLabel: '$2,200',
    image: '/listings/apt.jpg',
    region: 'Downtown',
  },
  {
    id: 'f2',
    title: 'تویوتا کمری ۲۰۲۰',
    priceLabel: '$18,500',
    image: '/listings/car.jpg',
    region: 'Burnaby',
  },
  {
    id: 'f3',
    title: 'لپ‌تاپ مک‌بوک پرو',
    priceLabel: '$1,450',
    image: '/listings/laptop.jpg',
    region: 'Richmond',
  },
  {
    id: 'f4',
    title: 'مبل راحتی سه‌نفره',
    priceLabel: '$380',
    image: '/listings/sofa.jpg',
    region: 'Surrey',
  },
]

export const feedCategories = [
  { id: 'all', name: 'همه', icon: 'grid', active: true },
  { id: 'jobs', name: 'مشاغل', icon: '💼' },
  { id: 'real-estate', name: 'املاک', icon: '🏠' },
  { id: 'vehicles', name: 'وسایل نقلیه', icon: '🚗' },
  { id: 'buy-sell', name: 'خرید و فروش', icon: '🛍️' },
  { id: 'services', name: 'خدمات', icon: '🔧' },
  { id: 'restaurant', name: 'رستوران', icon: '🍽️' },
  { id: 'more', name: 'بیشتر', icon: 'more' },
]
