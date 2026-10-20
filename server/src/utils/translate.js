/**
 * Lightweight free translation (MyMemory) for bilingual listing fields.
 * Best-effort — never throws; returns original text on failure.
 */

import { getDb } from '../db/database.js'

const HAS_FA = /[\u0600-\u06FF]/

function detectLang(text) {
  return HAS_FA.test(String(text || '')) ? 'fa' : 'en'
}

async function translateText(text, from, to) {
  const q = String(text || '').trim()
  if (!q) return ''
  if (from === to) return q
  // Already looks like target language
  if (to === 'en' && !HAS_FA.test(q)) return q
  if (to === 'fa' && HAS_FA.test(q)) return q

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q.slice(0, 450))}&langpair=${from}|${to}`
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return q
    const data = await res.json()
    const out = String(data?.responseData?.translatedText || '').trim()
    if (!out || /INVALID SOURCE LANGUAGE|MYMEMORY WARNING/i.test(out)) return q
    return out
  } catch {
    return q
  }
}

/**
 * Ensure title/description have both EN and FA variants.
 * Uses provided bilingual fields when present; otherwise translates.
 */
export async function ensureBilingualContent({
  title = '',
  description = '',
  titleEn = '',
  titleFa = '',
  descriptionEn = '',
  descriptionFa = '',
  lang,
} = {}) {
  const t = String(title || '').trim()
  const d = String(description || '').trim()
  let tEn = String(titleEn || '').trim()
  let tFa = String(titleFa || '').trim()
  let dEn = String(descriptionEn || '').trim()
  let dFa = String(descriptionFa || '').trim()

  const sourceLang = lang === 'fa' || lang === 'en' ? lang : detectLang(t || d)

  if (sourceLang === 'fa') {
    if (!tFa && t) tFa = t
    if (!dFa && d) dFa = d
    if (!tEn && tFa) tEn = await translateText(tFa, 'fa', 'en')
    if (!dEn && dFa) dEn = await translateText(dFa, 'fa', 'en')
  } else {
    if (!tEn && t) tEn = t
    if (!dEn && d) dEn = d
    if (!tFa && tEn) tFa = await translateText(tEn, 'en', 'fa')
    if (!dFa && dEn) dFa = await translateText(dEn, 'en', 'fa')
  }

  // Canonical title/description prefer the posting language, then any available
  const canonicalTitle = sourceLang === 'fa' ? (tFa || tEn || t) : (tEn || tFa || t)
  const canonicalDesc = sourceLang === 'fa' ? (dFa || dEn || d) : (dEn || dFa || d)

  return {
    title: canonicalTitle,
    description: canonicalDesc,
    titleEn: tEn,
    titleFa: tFa,
    descriptionEn: dEn,
    descriptionFa: dFa,
  }
}

function needsBilingualBackfill(row) {
  const title = String(row.title || '').trim()
  const desc = String(row.description || '').trim()
  const tEn = String(row.title_en || '').trim()
  const tFa = String(row.title_fa || '').trim()
  const dEn = String(row.description_en || '').trim()
  const dFa = String(row.description_fa || '').trim()
  if (title && (!tEn || !tFa)) return true
  if (desc && (!dEn || !dFa)) return true
  return false
}

/**
 * Fill missing EN/FA columns for existing listings (rate-limited).
 * Runs in background after server boot — safe to call multiple times.
 */
export async function backfillBilingualListings({ limit = 40 } = {}) {
  let rows = []
  try {
    rows = getDb().prepare(`
      SELECT id, title, description, title_en, title_fa, description_en, description_fa
      FROM listings
      WHERE status != 'deleted'
      ORDER BY updated_at DESC
      LIMIT 200
    `).all()
  } catch (err) {
    console.warn('⚠ Bilingual backfill query failed:', err.message)
    return
  }

  const pending = rows.filter(needsBilingualBackfill).slice(0, limit)
  if (!pending.length) return

  const update = getDb().prepare(`
    UPDATE listings
    SET title = @title,
        title_en = @title_en,
        title_fa = @title_fa,
        description = @description,
        description_en = @description_en,
        description_fa = @description_fa,
        updated_at = datetime('now')
    WHERE id = @id
  `)

  let done = 0
  for (const row of pending) {
    try {
      const bilingual = await ensureBilingualContent({
        title: row.title,
        description: row.description || '',
        titleEn: row.title_en,
        titleFa: row.title_fa,
        descriptionEn: row.description_en,
        descriptionFa: row.description_fa,
      })
      update.run({
        id: row.id,
        title: bilingual.title,
        title_en: bilingual.titleEn,
        title_fa: bilingual.titleFa,
        description: bilingual.description,
        description_en: bilingual.descriptionEn,
        description_fa: bilingual.descriptionFa,
      })
      done += 1
      // MyMemory free tier — gentle pacing
      await new Promise((r) => setTimeout(r, 350))
    } catch (err) {
      console.warn(`⚠ Bilingual backfill failed for listing ${row.id}:`, err.message)
    }
  }
  if (done) console.log(`✓ Bilingual backfill updated ${done} listing(s)`)
}
