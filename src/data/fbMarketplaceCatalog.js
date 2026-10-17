/**
 * Facebook Marketplace category catalog for Pejo.
 *
 * Top-level categories + "Shop by Category" tiles mirror FB Marketplace.
 * Each category maps to an existing API `listings.category` value so we
 * don't need to reseed — tiles filter by attribute keys / keywords.
 */

import {
  Baby, BookOpen, Briefcase, Building2, Camera, Car, Cat, Dog, Dumbbell,
  Flower2, Gamepad2, Gift, Guitar, Hammer, Headphones, Heart, Home, Key, LayoutGrid,
  Monitor, Music, Package, PawPrint, Phone, Shirt, Sofa, Tag, Tent, ToyBrick,
  Truck, Tv, Wrench,
} from 'lucide-react'

function textOf(listing) {
  return `${listing?.title || ''} ${listing?.description || ''} ${listing?.condition || ''}`.toLowerCase()
}

function attr(listing, key) {
  return listing?.attributes?.[key]
}

function kw(listing, re) {
  return re.test(textOf(listing))
}

/** Shared All tile factory */
function allTile() {
  return {
    id: 'all',
    fa: 'همه',
    en: 'All',
    icon: 'LayoutGrid',
    tone: 'slate',
    match: () => true,
  }
}

/**
 * @typedef {{
 *   id: string,
 *   fa: string,
 *   en: string,
 *   icon: string,
 *   tone: string,
 *   apiCategory: string,
 *   tiles: Array<{id, fa, en, icon, tone, match}>,
 *   filters?: Array<'sort'|'price'|'condition'|'beds'|'baths'|'propertyType'>,
 * }} FbCategory
 */

/** @type {FbCategory[]} */
export const FB_MARKETPLACE_CATEGORIES = [
  {
    id: 'vehicles',
    fa: 'وسایل نقلیه',
    en: 'Vehicles',
    icon: 'Car',
    tone: 'coral',
    apiCategory: 'vehicles',
    filters: ['sort', 'price', 'condition'],
    tiles: [
      allTile(),
      {
        id: 'cars',
        fa: 'خودرو و وانت',
        en: 'Cars & trucks',
        icon: 'Car',
        tone: 'sky',
        match: (l) => attr(l, 'vehiclesSubcategory') === 'car'
          || kw(l, /خودرو|سواری|sedan|suv|truck|van|pickup|کامیون|ون\b/i),
      },
      {
        id: 'motorcycles',
        fa: 'موتورسیکلت',
        en: 'Motorcycles',
        icon: 'Truck',
        tone: 'amber',
        match: (l) => attr(l, 'vehiclesSubcategory') === 'motorcycle'
          || kw(l, /موتور|motorcycle|scooter|اسکوتر/i),
      },
      {
        id: 'boats',
        fa: 'قایق',
        en: 'Boats',
        icon: 'Ship',
        tone: 'teal',
        match: (l) => attr(l, 'vehiclesSubcategory') === 'boat-other'
          || kw(l, /قایق|boat|yacht|جت\s*اسکی/i),
      },
      {
        id: 'parts',
        fa: 'قطعات و لوازم',
        en: 'Parts & accessories',
        icon: 'Wrench',
        tone: 'slate',
        match: (l) => attr(l, 'vehiclesSubcategory') === 'parts-accessories'
          || kw(l, /قطعه|لاستیک|رینگ|parts|tire|rim|battery|باتری/i),
      },
    ],
  },
  {
    id: 'electronics',
    fa: 'الکترونیک',
    en: 'Electronics',
    icon: 'Monitor',
    tone: 'indigo',
    apiCategory: 'electronics',
    filters: ['sort', 'price', 'condition'],
    tiles: [
      allTile(),
      {
        id: 'phones',
        fa: 'موبایل',
        en: 'Cell phones',
        icon: 'Phone',
        tone: 'sky',
        match: (l) => kw(l, /iphone|samsung|pixel|موبایل|گوشی|phone|galaxy/i),
      },
      {
        id: 'computers',
        fa: 'کامپیوتر و لپ‌تاپ',
        en: 'Computers',
        icon: 'Monitor',
        tone: 'indigo',
        match: (l) => kw(l, /laptop|macbook|pc|کامپیوتر|لپ\s*تاپ|desktop|imac/i),
      },
      {
        id: 'tvs',
        fa: 'تلویزیون',
        en: 'TVs',
        icon: 'Tv',
        tone: 'slate',
        match: (l) => kw(l, /tv|تلویزیون|television|smart\s*tv/i),
      },
      {
        id: 'games',
        fa: 'بازی و کنسول',
        en: 'Video games',
        icon: 'Gamepad2',
        tone: 'violet',
        match: (l) => kw(l, /ps5|ps4|xbox|nintendo|playstation|کنسول|بازی/i),
      },
      {
        id: 'cameras',
        fa: 'دوربین',
        en: 'Cameras',
        icon: 'Camera',
        tone: 'amber',
        match: (l) => kw(l, /camera|دوربین|canon|nikon|sony\s*a|gopro/i),
      },
      {
        id: 'audio',
        fa: 'صوتی',
        en: 'Audio',
        icon: 'Headphones',
        tone: 'rose',
        match: (l) => kw(l, /headphone|earbud|speaker|هدفون|اسپیکر|airpods/i),
      },
    ],
  },
  {
    id: 'apparel',
    fa: 'پوشاک',
    en: 'Apparel',
    icon: 'Shirt',
    tone: 'rose',
    apiCategory: 'fashion',
    filters: ['sort', 'price', 'condition'],
    tiles: [
      allTile(),
      {
        id: 'women',
        fa: 'زنانه',
        en: "Women's",
        icon: 'Shirt',
        tone: 'rose',
        match: (l) => kw(l, /زنانه|women|dress|مانتو|کیف\s*زن/i),
      },
      {
        id: 'men',
        fa: 'مردانه',
        en: "Men's",
        icon: 'Shirt',
        tone: 'sky',
        match: (l) => kw(l, /مردانه|men|suit|کت\s*شلوار/i),
      },
      {
        id: 'kids',
        fa: 'بچه‌گانه',
        en: "Kids'",
        icon: 'Baby',
        tone: 'amber',
        match: (l) => kw(l, /بچ|کودک|kids|baby|نوزاد/i),
      },
      {
        id: 'shoes',
        fa: 'کفش',
        en: 'Shoes',
        icon: 'Package',
        tone: 'coral',
        match: (l) => kw(l, /کفش|shoe|sneaker|boot|نایک|adidas/i),
      },
      {
        id: 'bags',
        fa: 'کیف و چمدان',
        en: 'Bags & luggage',
        icon: 'Package',
        tone: 'teal',
        match: (l) => kw(l, /کیف|چمدان|bag|luggage|backpack/i),
      },
      {
        id: 'jewelry',
        fa: 'زیورآلات',
        en: 'Jewelry',
        icon: 'Gift',
        tone: 'violet',
        match: (l) => kw(l, /طلا|نقره|ساعت|جواهر|jewelry|watch|ring/i),
      },
    ],
  },
  {
    id: 'home-goods',
    fa: 'لوازم منزل',
    en: 'Home goods',
    icon: 'Sofa',
    tone: 'orange',
    apiCategory: 'home-appliances',
    alsoCategories: ['furniture'],
    filters: ['sort', 'price', 'condition'],
    tiles: [
      allTile(),
      {
        id: 'furniture',
        fa: 'مبلمان',
        en: 'Furniture',
        icon: 'Sofa',
        tone: 'sand',
        match: (l) => l.category === 'furniture'
          || attr(l, 'homeKitchenSubcategory') === 'furniture-wood'
          || kw(l, /مبل|میز|صندلی|sofa|table|desk|bed\b|کمد/i),
      },
      {
        id: 'appliances',
        fa: 'لوازم برقی',
        en: 'Appliances',
        icon: 'Home',
        tone: 'sky',
        match: (l) => attr(l, 'homeKitchenSubcategory') === 'electric-appliances'
          || kw(l, /یخچال|ماشین\s*لباس|جاروبرقی|fridge|washer|dryer|dishwasher/i),
      },
      {
        id: 'kitchen',
        fa: 'آشپزخانه',
        en: 'Kitchen',
        icon: 'Home',
        tone: 'orange',
        match: (l) => ['kitchenware', 'food-drink'].includes(attr(l, 'homeKitchenSubcategory'))
          || kw(l, /آشپزخانه|ظروف|kitchen|cookware/i),
      },
      {
        id: 'decor',
        fa: 'دکور',
        en: 'Home décor',
        icon: 'Flower2',
        tone: 'rose',
        match: (l) => ['decor', 'lighting', 'carpets'].includes(attr(l, 'homeKitchenSubcategory'))
          || kw(l, /دکور|فرش|لامپ|decor|rug|lamp/i),
      },
      {
        id: 'bedding',
        fa: 'خواب و رختخواب',
        en: 'Bedding',
        icon: 'Home',
        tone: 'indigo',
        match: (l) => attr(l, 'homeKitchenSubcategory') === 'bedding'
          || kw(l, /تشک|روتختی|بالش|mattress|bedding|pillow/i),
      },
    ],
  },
  {
    id: 'home-improvement',
    fa: 'تعمیرات و ابزار',
    en: 'Home improvement',
    icon: 'Hammer',
    tone: 'slate',
    apiCategory: 'repairs',
    alsoCategories: ['tools-rental'],
    filters: ['sort', 'price'],
    tiles: [
      allTile(),
      {
        id: 'tools',
        fa: 'ابزار',
        en: 'Tools',
        icon: 'Wrench',
        tone: 'amber',
        match: (l) => l.category === 'tools-rental'
          || kw(l, /ابزار|دریل|drill|saw|hammer|آچار/i),
      },
      {
        id: 'plumbing',
        fa: 'لوله‌کشی',
        en: 'Plumbing',
        icon: 'Wrench',
        tone: 'sky',
        match: (l) => attr(l, 'repairsSubcategory')
          || kw(l, /لوله|plumbing|شیرآلات|faucet/i),
      },
      {
        id: 'electrical',
        fa: 'برق',
        en: 'Electrical',
        icon: 'Hammer',
        tone: 'coral',
        match: (l) => kw(l, /برق|electrical|سیم\s*کشی|wiring/i),
      },
      {
        id: 'building',
        fa: 'مصالح ساختمانی',
        en: 'Building materials',
        icon: 'Building2',
        tone: 'slate',
        match: (l) => kw(l, /مصالح|سیمان|کاشی|building|lumber|tile/i),
      },
    ],
  },
  {
    id: 'garden',
    fa: 'باغ و حیاط',
    en: 'Garden & outdoor',
    icon: 'Flower2',
    tone: 'emerald',
    apiCategory: 'home-appliances',
    alsoCategories: ['sports'],
    filters: ['sort', 'price'],
    tiles: [
      allTile(),
      {
        id: 'plants',
        fa: 'گیاه و گل',
        en: 'Plants',
        icon: 'Flower2',
        tone: 'emerald',
        match: (l) => kw(l, /گیاه|گل|plant|flower|باغچه/i),
      },
      {
        id: 'outdoor-furniture',
        fa: 'مبلمان فضای باز',
        en: 'Outdoor furniture',
        icon: 'Sofa',
        tone: 'sand',
        match: (l) => kw(l, /patio|outdoor|آلاچیق|مبلمان\s*باغی/i),
      },
      {
        id: 'lawn',
        fa: 'چمن و باغ',
        en: 'Lawn & garden',
        icon: 'Flower2',
        tone: 'teal',
        match: (l) => kw(l, /چمن|lawn|mower|شیلنگ|hose|garden/i),
      },
    ],
  },
  {
    id: 'sporting-goods',
    fa: 'ورزشی',
    en: 'Sporting goods',
    icon: 'Dumbbell',
    tone: 'violet',
    apiCategory: 'sports',
    filters: ['sort', 'price', 'condition'],
    tiles: [
      allTile(),
      {
        id: 'exercise',
        fa: 'تناسب اندام',
        en: 'Exercise',
        icon: 'Dumbbell',
        tone: 'coral',
        match: (l) => attr(l, 'sportsSubcategory') === 'equipment'
          || kw(l, /gym|fitness|دمبل|treadmill|دوچرخه\s*ثابت/i),
      },
      {
        id: 'camping',
        fa: 'کمپینگ',
        en: 'Camping',
        icon: 'Tent',
        tone: 'emerald',
        match: (l) => attr(l, 'sportsSubcategory') === 'hiking-camping'
          || kw(l, /کمپ|چادر|camping|tent|hiking/i),
      },
      {
        id: 'bikes',
        fa: 'دوچرخه',
        en: 'Bicycles',
        icon: 'Truck',
        tone: 'sky',
        match: (l) => kw(l, /دوچرخه|bike|bicycle|cycling/i),
      },
      {
        id: 'water',
        fa: 'ورزش آبی',
        en: 'Water sports',
        icon: 'Dumbbell',
        tone: 'teal',
        match: (l) => ['water-sports', 'fishing'].includes(attr(l, 'sportsSubcategory'))
          || kw(l, /غواصی|ماهیگیری|surf|kayak|diving/i),
      },
      {
        id: 'winter',
        fa: 'ورزش زمستانی',
        en: 'Winter sports',
        icon: 'Tent',
        tone: 'indigo',
        match: (l) => attr(l, 'sportsSubcategory') === 'winter-sports'
          || kw(l, /اسکی|snowboard|ski|skate/i),
      },
    ],
  },
  {
    id: 'pet-supplies',
    fa: 'حیوانات',
    en: 'Pet supplies',
    icon: 'PawPrint',
    tone: 'amber',
    apiCategory: 'pets',
    filters: ['sort', 'price'],
    tiles: [
      allTile(),
      {
        id: 'dogs',
        fa: 'سگ',
        en: 'Dogs',
        icon: 'Dog',
        tone: 'amber',
        match: (l) => attr(l, 'petsSubcategory') === 'dog' || kw(l, /سگ|dog|puppy/i),
      },
      {
        id: 'cats',
        fa: 'گربه',
        en: 'Cats',
        icon: 'Cat',
        tone: 'rose',
        match: (l) => attr(l, 'petsSubcategory') === 'cat' || kw(l, /گربه|cat|kitten/i),
      },
      {
        id: 'birds',
        fa: 'پرنده',
        en: 'Birds',
        icon: 'PawPrint',
        tone: 'sky',
        match: (l) => attr(l, 'petsSubcategory') === 'bird' || kw(l, /پرنده|bird|parrot/i),
      },
      {
        id: 'fish',
        fa: 'ماهی',
        en: 'Fish',
        icon: 'PawPrint',
        tone: 'teal',
        match: (l) => attr(l, 'petsSubcategory') === 'fish' || kw(l, /ماهی|aquarium|آکواریوم/i),
      },
      {
        id: 'accessories',
        fa: 'لوازم جانبی',
        en: 'Accessories',
        icon: 'Package',
        tone: 'slate',
        match: (l) => attr(l, 'petsSubcategory') === 'accessories'
          || kw(l, /قلاده|قفس|pet\s*food|غذای\s*حیوان/i),
      },
    ],
  },
  {
    id: 'toys-games',
    fa: 'اسباب‌بازی',
    en: 'Toys & games',
    icon: 'ToyBrick',
    tone: 'violet',
    apiCategory: 'electronics',
    alsoCategories: ['sports'],
    filters: ['sort', 'price'],
    tiles: [
      allTile(),
      {
        id: 'toys',
        fa: 'اسباب‌بازی',
        en: 'Toys',
        icon: 'ToyBrick',
        tone: 'rose',
        match: (l) => kw(l, /اسباب\s*بازی|toy|lego|عروسک/i),
      },
      {
        id: 'board-games',
        fa: 'بازی رومیزی',
        en: 'Board games',
        icon: 'Gamepad2',
        tone: 'indigo',
        match: (l) => kw(l, /board\s*game|پازل|puzzle|مونوپولی/i),
      },
      {
        id: 'collectibles',
        fa: 'کلکسیون',
        en: 'Collectibles',
        icon: 'Gift',
        tone: 'amber',
        match: (l) => kw(l, /کلکسیون|collectible|figure| فیگور/i),
      },
    ],
  },
  {
    id: 'entertainment',
    fa: 'سرگرمی',
    en: 'Entertainment',
    icon: 'Music',
    tone: 'indigo',
    apiCategory: 'electronics',
    filters: ['sort', 'price'],
    tiles: [
      allTile(),
      {
        id: 'books',
        fa: 'کتاب',
        en: 'Books',
        icon: 'BookOpen',
        tone: 'sand',
        match: (l) => kw(l, /کتاب|book|novel|رمان/i),
      },
      {
        id: 'movies',
        fa: 'فیلم و سریال',
        en: 'Movies',
        icon: 'Tv',
        tone: 'slate',
        match: (l) => kw(l, /dvd|blu.?ray|فیلم|movie/i),
      },
      {
        id: 'music',
        fa: 'موسیقی',
        en: 'Music',
        icon: 'Music',
        tone: 'violet',
        match: (l) => kw(l, /vinyl|cd\b|آلبوم|album/i),
      },
      {
        id: 'instruments',
        fa: 'ساز',
        en: 'Instruments',
        icon: 'Guitar',
        tone: 'coral',
        match: (l) => kw(l, /گیتار|پیانو|ویولن|guitar|piano|drum|ساز/i),
      },
    ],
  },
  {
    id: 'hobbies',
    fa: 'سرگرمی‌ها',
    en: 'Hobbies',
    icon: 'Guitar',
    tone: 'teal',
    apiCategory: 'electronics',
    alsoCategories: ['sports'],
    filters: ['sort', 'price'],
    tiles: [
      allTile(),
      {
        id: 'arts-crafts',
        fa: 'هنر و صنایع دستی',
        en: 'Arts & crafts',
        icon: 'Gift',
        tone: 'rose',
        match: (l) => kw(l, /صنایع\s*دستی|craft|paint|نقاشی|خیاطی/i),
      },
      {
        id: 'collectibles-hobby',
        fa: 'کلکسیونی',
        en: 'Collectibles',
        icon: 'Gift',
        tone: 'amber',
        match: (l) => kw(l, /کلکسیون|stamp|سکه|coin|antique/i),
      },
      {
        id: 'musical',
        fa: 'موسیقی',
        en: 'Musical',
        icon: 'Guitar',
        tone: 'indigo',
        match: (l) => kw(l, /گیتار|پیانو|guitar|piano|amp/i),
      },
    ],
  },
  {
    id: 'family',
    fa: 'خانواده',
    en: 'Family',
    icon: 'Baby',
    tone: 'rose',
    apiCategory: 'fashion',
    alsoCategories: ['home-appliances'],
    filters: ['sort', 'price'],
    tiles: [
      allTile(),
      {
        id: 'baby',
        fa: 'نوزاد',
        en: 'Baby',
        icon: 'Baby',
        tone: 'rose',
        match: (l) => kw(l, /نوزاد|baby|stroller|کالسکه|پوشک/i),
      },
      {
        id: 'kids-family',
        fa: 'کودک',
        en: 'Kids',
        icon: 'Baby',
        tone: 'amber',
        match: (l) => kw(l, /کودک|بچ|kids|toddler/i),
      },
    ],
  },
  {
    id: 'free-stuff',
    fa: 'رایگان',
    en: 'Free stuff',
    icon: 'Gift',
    tone: 'emerald',
    apiCategory: 'electronics',
    alsoCategories: ['furniture', 'home-appliances', 'fashion', 'vehicles'],
    filters: ['sort'],
    tiles: [
      allTile(),
      {
        id: 'free',
        fa: 'رایگان',
        en: 'Free',
        icon: 'Gift',
        tone: 'emerald',
        match: (l) => Number(l.price) === 0
          || /رایگان|free|giveaway/i.test(String(l.priceLabel || '') + textOf(l)),
      },
    ],
  },
  {
    id: 'classifieds',
    fa: 'آگهی‌ها',
    en: 'Classifieds',
    icon: 'Tag',
    tone: 'slate',
    apiCategory: 'services',
    alsoCategories: ['beauty', 'education', 'health', 'transport'],
    filters: ['sort', 'price'],
    tiles: [
      allTile(),
      {
        id: 'services',
        fa: 'خدمات',
        en: 'Services',
        icon: 'Wrench',
        tone: 'navy',
        match: (l) => l.category === 'services'
          || kw(l, /خدمات|service|نظافت|تعمیر/i),
      },
      {
        id: 'beauty',
        fa: 'زیبایی',
        en: 'Beauty',
        icon: 'Gift',
        tone: 'rose',
        match: (l) => l.category === 'beauty' || kw(l, /زیبایی|salon|ناخن|مو/i),
      },
      {
        id: 'education',
        fa: 'آموزش',
        en: 'Education',
        icon: 'BookOpen',
        tone: 'sky',
        match: (l) => l.category === 'education' || kw(l, /آموزش|کلاس|tutor|درس/i),
      },
      {
        id: 'health',
        fa: 'سلامت',
        en: 'Health',
        icon: 'Heart',
        tone: 'mint',
        match: (l) => l.category === 'health' || kw(l, /سلامت|پزشک|clinic|دارو/i),
      },
      {
        id: 'transport',
        fa: 'حمل‌ونقل',
        en: 'Transport',
        icon: 'Truck',
        tone: 'blue',
        match: (l) => l.category === 'transport' || kw(l, /اسباب\s*کشی|باربری|moving|courier/i),
      },
    ],
  },
  {
    id: 'jobs',
    fa: 'کاریابی',
    en: 'Jobs',
    icon: 'Briefcase',
    tone: 'amber',
    apiCategory: 'jobs',
    filters: ['sort'],
    tiles: [
      allTile(),
      {
        id: 'admin',
        fa: 'اداری',
        en: 'Admin',
        icon: 'Briefcase',
        tone: 'sky',
        match: (l) => ['admin-management', 'finance-legal', 'marketing-sales'].includes(attr(l, 'jobSubcategory'))
          || kw(l, /اداری|منشی|حسابدار|office/i),
      },
      {
        id: 'it',
        fa: 'فناوری',
        en: 'IT',
        icon: 'Monitor',
        tone: 'indigo',
        match: (l) => attr(l, 'jobSubcategory') === 'it-computer'
          || kw(l, /\bit\b|برنامه\s*نویس|developer|software/i),
      },
      {
        id: 'hospitality',
        fa: 'فروشگاه و رستوران',
        en: 'Hospitality',
        icon: 'Home',
        tone: 'orange',
        match: (l) => attr(l, 'jobSubcategory') === 'store-restaurant'
          || kw(l, /رستوران|گارسون|cashier|فروشنده/i),
      },
      {
        id: 'trades',
        fa: 'فنی و صنعتی',
        en: 'Trades',
        icon: 'Hammer',
        tone: 'slate',
        match: (l) => ['industrial-engineering', 'architecture-construction', 'janitor-cleaning'].includes(attr(l, 'jobSubcategory'))
          || kw(l, /فنی|مهندس|ساختمان|نظافت/i),
      },
      {
        id: 'transport-jobs',
        fa: 'حمل‌ونقل',
        en: 'Transport jobs',
        icon: 'Truck',
        tone: 'blue',
        match: (l) => attr(l, 'jobSubcategory') === 'transport'
          || kw(l, /راننده|driver|courier/i),
      },
      {
        id: 'health-jobs',
        fa: 'سلامت و زیبایی',
        en: 'Health & beauty',
        icon: 'Heart',
        tone: 'rose',
        match: (l) => attr(l, 'jobSubcategory') === 'health-beauty'
          || kw(l, /پرستار|nurse|زیبایی|salon/i),
      },
    ],
  },
]

/** Lucide icon component lookup used by browse UI */
export const FB_MP_ICONS = {
  LayoutGrid,
  Car,
  Truck,
  Ship: Car,
  Wrench,
  Monitor,
  Phone,
  Tv,
  Gamepad2,
  Camera,
  Headphones,
  Shirt,
  Baby,
  Package,
  Gift,
  Sofa,
  Home,
  Flower2,
  Hammer,
  Building2,
  Dumbbell,
  Tent,
  PawPrint,
  Dog,
  Cat,
  ToyBrick,
  Music,
  BookOpen,
  Guitar,
  Tag,
  Briefcase,
  Key,
  Heart,
}

export const FB_MP_CATEGORY_IDS = FB_MARKETPLACE_CATEGORIES.map((c) => c.id)

export function getFbMarketplaceCategory(id) {
  return FB_MARKETPLACE_CATEGORIES.find((c) => c.id === id) || null
}

export function isFbMarketplaceCategory(id) {
  return FB_MP_CATEGORY_IDS.includes(id)
}

export function fbMpCategoryLabel(id, lang = 'fa') {
  const row = getFbMarketplaceCategory(id)
  if (!row) return id
  return lang === 'fa' ? row.fa : row.en
}

export function fbMpTileLabel(catId, tileId, lang = 'fa') {
  const cat = getFbMarketplaceCategory(catId)
  const tile = cat?.tiles?.find((t) => t.id === tileId)
  if (!tile) return tileId
  return lang === 'fa' ? tile.fa : tile.en
}

/** Home / categories page list (FB order + Pejo extras) */
export const FB_MP_NAV_ITEMS = [
  { id: 'favorites', fa: 'علاقه‌مندی‌ها', en: 'Favorites', icon: '♡', tint: 'bg-rose-50', special: 'saved' },
  { id: 'vehicles', fa: 'وسایل نقلیه', en: 'Vehicles', icon: 'Car', tint: 'bg-red-50' },
  { id: 'real-estate', fa: 'املاک', en: 'Real Estate', icon: '🏠', tint: 'bg-sky-100', special: 'real-estate' },
  { id: 'electronics', fa: 'الکترونیک', en: 'Electronics', icon: 'Monitor', tint: 'bg-indigo-50' },
  { id: 'apparel', fa: 'پوشاک', en: 'Apparel', icon: 'Shirt', tint: 'bg-pink-50' },
  { id: 'home-goods', fa: 'لوازم منزل', en: 'Home goods', icon: 'Sofa', tint: 'bg-orange-50' },
  { id: 'home-improvement', fa: 'تعمیرات و ابزار', en: 'Home improvement', icon: 'Hammer', tint: 'bg-slate-100' },
  { id: 'garden', fa: 'باغ و حیاط', en: 'Garden & outdoor', icon: 'Flower2', tint: 'bg-emerald-50' },
  { id: 'sporting-goods', fa: 'ورزشی', en: 'Sporting goods', icon: 'Dumbbell', tint: 'bg-violet-50' },
  { id: 'pet-supplies', fa: 'حیوانات', en: 'Pet supplies', icon: 'PawPrint', tint: 'bg-amber-50' },
  { id: 'toys-games', fa: 'اسباب‌بازی', en: 'Toys & games', icon: 'ToyBrick', tint: 'bg-fuchsia-50' },
  { id: 'entertainment', fa: 'سرگرمی', en: 'Entertainment', icon: 'Music', tint: 'bg-indigo-50' },
  { id: 'hobbies', fa: 'سرگرمی‌ها', en: 'Hobbies', icon: 'Guitar', tint: 'bg-teal-50' },
  { id: 'family', fa: 'خانواده', en: 'Family', icon: 'Baby', tint: 'bg-rose-50' },
  { id: 'jobs', fa: 'کاریابی', en: 'Jobs', icon: 'Briefcase', tint: 'bg-amber-100' },
  { id: 'classifieds', fa: 'آگهی‌ها', en: 'Classifieds', icon: 'Tag', tint: 'bg-slate-100' },
  { id: 'free-stuff', fa: 'رایگان', en: 'Free stuff', icon: 'Gift', tint: 'bg-emerald-50' },
  { id: 'dating', fa: 'دوستیابی', en: 'Dating', icon: '🤝', tint: 'bg-pink-50', special: 'dating' },
]

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
  if (conditionId === 'new') return /^(new|نو)$/i.test(c) || c.includes('نو') && !c.includes('حد')
  if (conditionId === 'like-new') return /like\s*new|در\s*حد\s*نو|مثل\s*نو/i.test(c)
  if (conditionId === 'good') return /good|خوب/i.test(c)
  if (conditionId === 'fair') return /fair|قابل\s*قبول|متوسط/i.test(c)
  return true
}

export function listingInFbCategory(listing, cat) {
  if (!listing || !cat) return false
  const cats = [cat.apiCategory, ...(cat.alsoCategories || [])]
  return cats.includes(listing.category)
}
