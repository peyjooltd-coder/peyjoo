import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { listingMatchesCity } from '../data/canadaCities'
import {
  FB_RE_TILES, FB_RE_DEFAULT_TILE,
} from '../data/fbMarketplaceRealEstate'
import { RE_AGENCIES } from '../data/realEstateAgencyBanners'
import CategoryBrowseHeader from '../components/mobile/CategoryBrowseHeader'
import FbRealEstateListingCard from '../components/FbRealEstateListingCard'
import RealEstateAgencySlider from '../components/RealEstateAgencySlider'
import { listingSortTs } from '../lib/listingTime'

const COLS = 2
const ROW_PATTERN = [2, 3]

export default function RealEstateBrowsePage() {
  const {
    listings, openListing, savedIds, toggleSave,
    selectedRegion,
  } = useApp()
  const { t, lang } = useI18n()

  const [tileId, setTileId] = useState(FB_RE_DEFAULT_TILE)
  const [query, setQuery] = useState('')

  const realEstateListings = useMemo(
    () => listings.filter((l) => l.category === 'real-estate'),
    [listings],
  )

  const activeTile = FB_RE_TILES.find((x) => x.id === tileId) || FB_RE_TILES[0]

  const matched = useMemo(() => {
    const q = query.trim().toLowerCase()
    return realEstateListings.filter((l) => {
      const a = l.attributes || {}
      if (!activeTile.match(a)) return false
      if (selectedRegion && !listingMatchesCity(l.city, selectedRegion)) return false
      if (q) {
        const hay = `${l.title || ''} ${l.description || ''} ${l.city || ''} ${l.neighborhood || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (l.status !== 'active') return false
      return true
    }).sort((a, b) => listingSortTs(b) - listingSortTs(a))
  }, [realEstateListings, activeTile, selectedRegion, query])

  const sectionTitle = lang === 'fa' ? 'املاک' : 'Real Estate'

  const bannerAfter = useMemo(() => {
    const marks = new Map()
    let cursor = 0
    let step = 0
    while (cursor < matched.length) {
      const rows = ROW_PATTERN[step % ROW_PATTERN.length]
      const next = cursor + rows * COLS
      if (next > matched.length) break
      marks.set(next, step)
      cursor = next
      step += 1
    }
    return marks
  }, [matched.length])

  return (
    <div className="mobile-page fb-re-page">
      <CategoryBrowseHeader
        title={sectionTitle}
        categoryId="real-estate"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={lang === 'fa' ? 'جستجو در املاک' : 'Search property rentals'}
        tiles={FB_RE_TILES}
        tileId={tileId}
        onTileChange={setTileId}
        tilesMode="chips"
      />

      <div className="fb-re-grid">
        <RealEstateAgencySlider key="re-biz-top" agency={RE_AGENCIES[0]} />
        {matched.length === 0 ? (
          <div className="fb-re-empty">
            <p>{t('noResults')}</p>
          </div>
        ) : (
          matched.flatMap((l, i) => {
            const nodes = [
              <FbRealEstateListingCard
                key={l.id}
                listing={l}
                isSaved={savedIds.has(Number(l.id))}
                onSave={() => toggleSave(l.id)}
                onClick={() => openListing(l)}
              />,
            ]
            const slot = bannerAfter.get(i + 1)
            if (slot != null) {
              const agency = RE_AGENCIES[(slot + 1) % RE_AGENCIES.length]
              nodes.push(
                <RealEstateAgencySlider key={`re-biz-${slot}-${agency.id}`} agency={agency} />,
              )
            }
            return nodes
          })
        )}
      </div>
    </div>
  )
}
