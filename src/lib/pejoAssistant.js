import { allCategories } from '../data/mobileUiData'

const INTENTS = [
  {
    id: 'dating',
    view: 'dating',
    keywords: [
      'دوست یابی', 'دوستیابی', 'دوست‌یابی', 'دیت', 'dating', 'match', 'لایک', 'مچ', 'پارتنر', 'رابطه',
    ],
    titleFa: 'دوست‌یابی',
    titleEn: 'Dating',
    replyFa: 'بخش دوست‌یابی را پیدا کردم. آنجا می‌توانی افراد نزدیک را ببینی و لایک کنی.',
    replyEn: 'I found Dating. You can browse nearby people and like profiles there.',
  },
  {
    id: 'hamyari',
    view: 'hamyari',
    keywords: [
      'همیاری', 'کمک', 'کمک رایگان', 'mutual aid', 'help', 'اهدا', 'بخشش',
    ],
    titleFa: 'همیاری',
    titleEn: 'Mutual Aid',
    replyFa: 'بخش همیاری برای درخواست و پیشنهاد کمک جامعه است.',
    replyEn: 'Mutual Aid is for community help requests and offers.',
  },
  {
    id: 'news',
    view: 'news',
    keywords: ['اخبار', 'خبر', 'news', 'پست خبری', 'لینکدین'],
    titleFa: 'اخبار',
    titleEn: 'News',
    replyFa: 'فید اخبار پی جو را باز می‌کنم؛ پست‌های تصویری و ویدیویی آنجا هستند.',
    replyEn: 'Opening PeyJoo News — image and video updates live there.',
  },
  {
    id: 'post',
    view: 'post',
    keywords: [
      'ثبت آگهی', 'آگهی بزنم', 'فروش', 'بفروشم', 'post ad', 'sell', 'listing', 'آگهی جدید',
    ],
    titleFa: 'ثبت آگهی',
    titleEn: 'Post an ad',
    replyFa: 'برای ثبت آگهی جدید آماده‌ام. روی دکمه برو تا فرم باز شود.',
    replyEn: 'Ready to post a new ad. Tap go to open the form.',
  },
  {
    id: 'messages',
    view: 'chat',
    keywords: ['پیام', 'چت', 'پیام رسان', 'پیام‌رسان', 'message', 'chat', 'inbox', 'گفتگو'],
    titleFa: 'پیام‌ها',
    titleEn: 'Messages',
    replyFa: 'پیام‌رسان داخل پی جو است. از آنجا گفتگوهای آگهی را می‌بینی.',
    replyEn: 'Messenger lives inside PeyJoo. You can open your listing chats there.',
  },
  {
    id: 'profile',
    view: 'profile',
    keywords: ['پروفایل', 'پی جو', 'حساب', 'profile', 'account', 'تنظیمات'],
    titleFa: 'پی جو',
    titleEn: 'PeyJoo profile',
    replyFa: 'پروفایل پی جو برای حساب، پیام‌ها و آگهی‌های توست.',
    replyEn: 'Your PeyJoo profile has account, messages, and your ads.',
  },
  {
    id: 'categories',
    view: 'categories',
    keywords: ['دسته بندی', 'دسته‌بندی', 'categories', 'همه دسته'],
    titleFa: 'دسته‌بندی‌ها',
    titleEn: 'Categories',
    replyFa: 'لیست کامل دسته‌بندی‌ها اینجاست.',
    replyEn: 'Here is the full categories list.',
  },
  {
    id: 'explore',
    view: 'explore',
    keywords: ['جستجو', 'explore', 'search', 'بگرد', 'آگهی ها', 'آگهی‌ها'],
    titleFa: 'جستجوی آگهی‌ها',
    titleEn: 'Browse ads',
    replyFa: 'می‌توانی در همه آگهی‌ها جستجو و فیلتر کنی.',
    replyEn: 'You can search and filter all marketplace ads.',
  },
  {
    id: 'jobs',
    category: 'jobs',
    keywords: ['کار', 'شغل', 'کاریابی', 'استخدام', 'job', 'jobs', 'work', 'رزومه'],
    titleFa: 'کاریابی',
    titleEn: 'Jobs',
    replyFa: 'دسته کاریابی را پیدا کردم.',
    replyEn: 'I found the Jobs category.',
  },
  {
    id: 'real-estate',
    category: 'real-estate',
    keywords: [
      'خانه', 'آپارتمان', 'اجاره', 'املاک', 'رنت', 'rent', 'apartment', 'condo', 'house', 'ملک',
    ],
    titleFa: 'املاک',
    titleEn: 'Real estate',
    replyFa: 'برای خانه و اجاره، دسته املاک مناسب است.',
    replyEn: 'For homes and rentals, open Real estate.',
  },
  {
    id: 'vehicles',
    category: 'vehicles',
    keywords: ['ماشین', 'خودرو', 'اتومبیل', 'car', 'vehicle', 'خودرو', 'فروش ماشین'],
    titleFa: 'خودرو',
    titleEn: 'Vehicles',
    replyFa: 'آگهی‌های خودرو اینجاست.',
    replyEn: 'Vehicle listings are here.',
  },
  {
    id: 'repairs',
    category: 'repairs',
    keywords: ['تعمیر', 'تعمیرات', 'repair', 'خراب', 'سرویس'],
    titleFa: 'تعمیرات',
    titleEn: 'Repairs',
    replyFa: 'خدمات و آگهی‌های تعمیرات را باز می‌کنم.',
    replyEn: 'Opening repair-related listings.',
  },
]

function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreIntent(text, intent) {
  let score = 0
  for (const kw of intent.keywords) {
    const k = normalize(kw)
    if (!k) continue
    if (text.includes(k)) score += k.length > 4 ? 3 : 2
  }
  return score
}

function matchListings(query, listings = [], limit = 4) {
  const q = normalize(query)
  if (!q || q.length < 2) return []
  const tokens = q.split(' ').filter((t) => t.length > 1)
  return listings
    .map((l) => {
      const hay = normalize(`${l.title || ''} ${l.description || ''} ${l.category || ''} ${l.neighborhood || ''}`)
      let score = 0
      tokens.forEach((t) => {
        if (hay.includes(t)) score += 1
      })
      if (hay.includes(q)) score += 2
      return { listing: l, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.listing)
}

function matchCategoryByName(text) {
  const q = normalize(text)
  for (const cat of allCategories) {
    const name = normalize(cat.name)
    if (name && q.includes(name)) {
      return {
        id: cat.id,
        category: cat.id,
        view: null,
        titleFa: cat.name,
        titleEn: cat.name,
        replyFa: `دسته «${cat.name}» را پیدا کردم.`,
        replyEn: `I found the “${cat.name}” category.`,
      }
    }
  }
  return null
}

/**
 * Resolve a user chat message into navigation + listing suggestions.
 */
export function resolveAssistantQuery(rawQuery, { listings = [], lang = 'fa' } = {}) {
  const text = normalize(rawQuery)
  const isFa = lang === 'fa'

  if (!text) {
    return {
      reply: isFa
        ? 'سلام! بگو دنبال چی هستی؛ خانه، ماشین، کار، دوست‌یابی یا ثبت آگهی.'
        : 'Hi! Tell me what you need — home, car, job, dating, or post an ad.',
      intent: null,
      listings: [],
    }
  }

  let best = null
  let bestScore = 0
  for (const intent of INTENTS) {
    const s = scoreIntent(text, intent)
    if (s > bestScore) {
      best = intent
      bestScore = s
    }
  }

  const namedCat = matchCategoryByName(text)
  if (namedCat && bestScore < 3) {
    best = namedCat
    bestScore = 3
  }

  const foundListings = matchListings(text, listings)

  if (!best && foundListings.length) {
    return {
      reply: isFa
        ? `چند آگهی مرتبط پیدا کردم. می‌توانی یکی را باز کنی یا همه آگهی‌ها را ببینی.`
        : `I found some related ads. Open one, or browse all listings.`,
      intent: {
        id: 'explore',
        view: 'explore',
        titleFa: 'مشاهده آگهی‌ها',
        titleEn: 'Browse ads',
      },
      listings: foundListings,
    }
  }

  if (!best) {
    return {
      reply: isFa
        ? 'دقیق‌تر بگو لطفاً. مثال: «خانه اجاره»، «کاریابی»، «دوست‌یابی»، «ثبت آگهی»، «اخبار».'
        : 'Please be more specific. Examples: “rent apartment”, “jobs”, “dating”, “post ad”, “news”.',
      intent: {
        id: 'categories',
        view: 'categories',
        titleFa: 'دسته‌بندی‌ها',
        titleEn: 'Categories',
      },
      listings: foundListings,
    }
  }

  return {
    reply: isFa ? best.replyFa : best.replyEn,
    intent: best,
    listings: foundListings,
  }
}

export const ASSISTANT_QUICK_PROMPTS = {
  fa: ['خانه اجاره', 'کاریابی', 'دوست‌یابی', 'ثبت آگهی', 'اخبار', 'همیاری'],
  en: ['Rent home', 'Jobs', 'Dating', 'Post ad', 'News', 'Mutual aid'],
}
