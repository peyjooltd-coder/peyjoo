import { Router } from 'express'
import { randomBytes } from 'crypto'
import { getDb } from '../db/database.js'
import { resolveUserAvatar } from '../utils/defaultAvatar.js'

const router = Router()

function newId(prefix) {
  return `${prefix}${Date.now().toString(36)}${randomBytes(3).toString('hex')}`
}

function ensureNewsTables() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS news_posts (
      id TEXT PRIMARY KEY,
      title_fa TEXT NOT NULL DEFAULT '',
      title_en TEXT NOT NULL DEFAULT '',
      body_fa TEXT NOT NULL DEFAULT '',
      body_en TEXT NOT NULL DEFAULT '',
      author_fa TEXT DEFAULT 'پی‌جو',
      author_en TEXT DEFAULT 'PeyJoo',
      role_fa TEXT DEFAULT 'تحریریه',
      role_en TEXT DEFAULT 'Editorial',
      avatar TEXT,
      media_type TEXT DEFAULT '',
      media_url TEXT DEFAULT '',
      poster TEXT DEFAULT '',
      tag TEXT DEFAULT '',
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS news_sponsors (
      id TEXT PRIMARY KEY,
      title_fa TEXT NOT NULL DEFAULT '',
      title_en TEXT NOT NULL DEFAULT '',
      body_fa TEXT NOT NULL DEFAULT '',
      body_en TEXT NOT NULL DEFAULT '',
      image_url TEXT DEFAULT '',
      cta_fa TEXT DEFAULT 'مشاهده',
      cta_en TEXT DEFAULT 'View',
      link_tag TEXT DEFAULT '',
      link_url TEXT DEFAULT '',
      placement TEXT NOT NULL DEFAULT 'inline',
      status TEXT NOT NULL DEFAULT 'active',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    );
  `)

  seedIfEmpty(db)
}

function seedIfEmpty(db) {
  const postCount = db.prepare('SELECT COUNT(1) AS c FROM news_posts').get().c
  const sponsorCount = db.prepare('SELECT COUNT(1) AS c FROM news_sponsors').get().c

  if (sponsorCount === 0) {
    const sponsors = [
      {
        id: newId('ns'),
        title_fa: 'اسپانسر ویژه — املاک ونکوور',
        title_en: 'Featured sponsor — Vancouver Real Estate',
        body_fa: 'آگهی‌های تأییدشده املاک را همین امروز ببینید.',
        body_en: 'Browse verified real-estate listings today.',
        image_url: '/categories/real-estate.png',
        cta_fa: 'مشاهده املاک',
        cta_en: 'Browse real estate',
        link_tag: 'real-estate',
        placement: 'hero',
        sort_order: 1,
      },
      {
        id: newId('ns'),
        title_fa: 'همیاری جامعه',
        title_en: 'Community Mutual Aid',
        body_fa: 'کمک بگیرید یا کمک کنید — بخش همیاری پی‌جو.',
        body_en: 'Give or get help in PeyJoo Mutual Aid.',
        image_url: '/logo.jpeg',
        cta_fa: 'ورود به همیاری',
        cta_en: 'Open Mutual Aid',
        link_tag: 'hamyari',
        placement: 'inline',
        sort_order: 2,
      },
      {
        id: newId('ns'),
        title_fa: 'اسپانسر شغلی',
        title_en: 'Jobs sponsor',
        body_fa: 'فرصت‌های کاری ایرانیان در بریتیش‌کلمبیا.',
        body_en: 'Job opportunities for the Iranian community in BC.',
        image_url: '/categories/jobs.png',
        cta_fa: 'مشاهده مشاغل',
        cta_en: 'Browse jobs',
        link_tag: 'jobs',
        placement: 'footer',
        sort_order: 3,
      },
    ]
    const ins = db.prepare(`
      INSERT INTO news_sponsors (
        id, title_fa, title_en, body_fa, body_en, image_url,
        cta_fa, cta_en, link_tag, placement, status, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, datetime('now'))
    `)
    for (const s of sponsors) {
      ins.run(
        s.id, s.title_fa, s.title_en, s.body_fa, s.body_en, s.image_url,
        s.cta_fa, s.cta_en, s.link_tag, s.placement, s.sort_order,
      )
    }
  }

  if (postCount === 0) {
    const posts = [
      {
        id: newId('np'),
        title_fa: 'خوش آمدید به اخبار پی‌جو',
        title_en: 'Welcome to PeyJoo News',
        body_fa: 'اخبار رسمی جامعه از این بخش منتشر می‌شود. فقط تحریریه پی‌جو خبر می‌گذارد.',
        body_en: 'Official community news is published here. Only PeyJoo editorial can post.',
        tag: '',
        sort_order: 1,
      },
      {
        id: newId('np'),
        title_fa: 'نکته هفته: امنیت معامله',
        title_en: 'Tip of the week: safer deals',
        body_fa: 'قبل از معامله حضوری، از چت داخل اپ هماهنگ کنید و مکان عمومی را انتخاب کنید.',
        body_en: 'Coordinate in-app chat and meet in a public place before any deal.',
        tag: 'explore',
        sort_order: 2,
      },
    ]
    const ins = db.prepare(`
      INSERT INTO news_posts (
        id, title_fa, title_en, body_fa, body_en,
        author_fa, author_en, role_fa, role_en, avatar,
        tag, status, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'پی‌جو', 'PeyJoo', 'تحریریه', 'Editorial', ?, ?, 'active', ?, datetime('now'))
    `)
    for (const p of posts) {
      ins.run(p.id, p.title_fa, p.title_en, p.body_fa, p.body_en, '/logo.jpeg', p.tag, p.sort_order)
    }
  }
}

function mapPost(row) {
  return {
    id: row.id,
    titleFa: row.title_fa || '',
    titleEn: row.title_en || '',
    bodyFa: row.body_fa || '',
    bodyEn: row.body_en || '',
    authorFa: row.author_fa || 'پی‌جو',
    authorEn: row.author_en || 'PeyJoo',
    roleFa: row.role_fa || 'تحریریه',
    roleEn: row.role_en || 'Editorial',
    avatar: resolveUserAvatar(row.avatar || '/logo.jpeg'),
    mediaType: row.media_type || '',
    mediaUrl: row.media_url || '',
    poster: row.poster || '',
    tag: row.tag || '',
    likes: row.likes || 0,
    comments: row.comments || 0,
    shares: row.shares || 0,
    timeFa: row.created_at || '',
    timeEn: row.created_at || '',
    createdAt: row.created_at,
  }
}

function mapSponsor(row) {
  return {
    id: row.id,
    titleFa: row.title_fa || '',
    titleEn: row.title_en || '',
    bodyFa: row.body_fa || '',
    bodyEn: row.body_en || '',
    imageUrl: row.image_url || '',
    ctaFa: row.cta_fa || 'مشاهده',
    ctaEn: row.cta_en || 'View',
    linkTag: row.link_tag || '',
    linkUrl: row.link_url || '',
    placement: row.placement || 'inline',
    sortOrder: row.sort_order || 0,
  }
}

router.get('/feed', (_req, res) => {
  ensureNewsTables()
  const db = getDb()
  const posts = db
    .prepare(`
      SELECT * FROM news_posts
      WHERE status = 'active'
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 80
    `)
    .all()
    .map(mapPost)

  const sponsors = db
    .prepare(`
      SELECT * FROM news_sponsors
      WHERE status = 'active'
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 40
    `)
    .all()
    .map(mapSponsor)

  res.json({
    posts,
    sponsors,
    heroSponsors: sponsors.filter((s) => s.placement === 'hero'),
    inlineSponsors: sponsors.filter((s) => s.placement === 'inline'),
    footerSponsors: sponsors.filter((s) => s.placement === 'footer'),
  })
})

export default router
