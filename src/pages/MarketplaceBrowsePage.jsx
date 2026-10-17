import { useMemo, useState, useEffect } from 'react'
import {
  ArrowUpDown, ChevronDown, Tag,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { listingMatchesCity } from '../data/canadaCities'
import {
  getPejoBrowseCategory,
  listingInPejoBrowse,
  CONDITION_OPTIONS,
  conditionLabel,
  matchCondition,
} from '../data/pejoBrowseCatalog'
import MobileBottomSheet from '../components/mobile/MobileBottomSheet'
import CategoryBrowseHeader from '../components/mobile/CategoryBrowseHeader'
import FbMarketplaceListingCard from '../components/FbMarketplaceListingCard'
import { listingSortTs } from '../lib/listingTime'

const SORT_IDS = ['newest', 'price-asc', 'price-desc', 'popular']

function priceChipLabel({ minPrice, maxPrice, lang }) {
  if (minPrice && maxPrice) {
    return `$${Number(minPrice).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-CA')} – $${Number(maxPrice).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-CA')}`
  }
  if (minPrice) return `${lang === 'fa' ? 'از' : 'From'} $${Number(minPrice).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-CA')}`
  if (maxPrice) return `${lang === 'fa' ? 'تا' : 'Up to'} $${Number(maxPrice).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-CA')}`
  return null
}

/**
 * FB-Marketplace-style browse for Pejo's existing categories.
 * Tile icons = emoji (same as subcategory gates) in glass circles.
 */
export default function MarketplaceBrowsePage() {
  const {
    listings, openListing, savedIds, toggleSave, setViewTab,
    selectedRegion, selectedCategory, setCategoryFilters,
  } = useApp()
  const { t, lang } = useI18n()

  const cat = getPejoBrowseCategory(selectedCategory)
  const filters = cat?.filters || []

  const [tileId, setTileId] = useState('all')
  const [query, setQuery] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [condition, setCondition] = useState('any')
  const [sortBy, setSortBy] = useState('newest')

  const [sortOpen, setSortOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)
  const [conditionOpen, setConditionOpen] = useState(false)

  useEffect(() => {
    setTileId('all')
    setQuery('')
    setMinPrice('')
    setMaxPrice('')
    setCondition('any')
    setSortBy('newest')
  }, [selectedCategory])

  useEffect(() => {
    if (!cat) return
    // Keep browse tile in sync so «Post Ad» can seed the matching subcategory
    const attrKeys = {
      vehicles: 'vehiclesSubcategory',
      sports: 'sportsSubcategory',
      health: 'healthSubcategory',
      transport: 'transportSubcategory',
      kolbaran: 'kolbaranSubcategory',
      'tools-rental': 'toolsRentalSubcategory',
      'home-appliances': 'homeKitchenSubcategory',
      kitchen: 'homeKitchenSubcategory',
    }
    const key = attrKeys[cat.id]
    if (!key) return
    setCategoryFilters((f) => ({
      ...f,
      [key]: tileId && tileId !== 'all' ? tileId : '',
    }))
  }, [cat, tileId, setCategoryFilters])

  useEffect(() => {
    if (!cat) setViewTab('home')
  }, [cat, setViewTab])

  const pool = useMemo(() => {
    if (!cat) return []
    return listings.filter((l) => (
      listingInPejoBrowse(l, cat)
      && l.status === 'active'
    ))
  }, [listings, cat])

  const activeTile = cat?.tiles?.find((x) => x.id === tileId) || cat?.tiles?.[0]

  const matched = useMemo(() => {
    if (!cat || !activeTile) return []
    const q = query.trim().toLowerCase()
    return pool
      .filter((l) => {
        if (!activeTile.match(l)) return false
        if (filters.includes('price')) {
          if (minPrice && (l.price ?? 0) < Number(minPrice)) return false
          if (maxPrice && (l.price ?? 0) > Number(maxPrice)) return false
        }
        if (filters.includes('condition') && !matchCondition(l, condition)) return false
        if (selectedRegion && !listingMatchesCity(l.city, selectedRegion)) return false
        if (q) {
          const hay = `${l.title || ''} ${l.description || ''} ${l.city || ''} ${l.neighborhood || ''}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0)
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0)
        if (sortBy === 'popular') return (b.views || 0) - (a.views || 0)
        return listingSortTs(b) - listingSortTs(a)
      })
  }, [pool, cat, activeTile, minPrice, maxPrice, condition, selectedRegion, query, sortBy, filters])

  if (!cat) return null

  const priceActive = Boolean(minPrice || maxPrice)
  const conditionActive = condition !== 'any'
  const sortLabels = {
    newest: t('sortNewest'),
    'price-asc': t('sortCheapest'),
    'price-desc': t('sortExpensive'),
    popular: t('sortPopular'),
  }
  const title = lang === 'fa' ? cat.fa : cat.en

  return (
    <div className="mobile-page fb-re-page">
      <CategoryBrowseHeader
        title={title}
        categoryId={cat.id}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={lang === 'fa' ? `جستجو در ${cat.fa}` : `Search ${cat.en}`}
        tiles={cat.tiles}
        tileId={tileId}
        onTileChange={setTileId}
        tilesMode="chips"
      />

      {filters.length > 0 && (
      <div className="fb-re-fbar">
        {filters.includes('sort') && (
          <button type="button" className="fb-re-fchip" onClick={() => setSortOpen(true)}>
            <ArrowUpDown className="w-4 h-4" />
            <span>{t('sort')}</span>
          </button>
        )}
        {filters.includes('price') && (
          <button
            type="button"
            className={`fb-re-fchip ${priceActive ? 'is-active' : ''}`}
            onClick={() => setPriceOpen(true)}
          >
            <span>{priceChipLabel({ minPrice, maxPrice, lang }) || (lang === 'fa' ? 'قیمت' : 'Price')}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
        )}
        {filters.includes('condition') && (
          <button
            type="button"
            className={`fb-re-fchip ${conditionActive ? 'is-active' : ''}`}
            onClick={() => setConditionOpen(true)}
          >
            <Tag className="w-4 h-4" />
            <span>
              {conditionActive
                ? conditionLabel(condition, lang)
                : (lang === 'fa' ? 'وضعیت' : 'Condition')}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
        )}
      </div>
      )}

      <div className="fb-re-grid">
        {matched.length === 0 ? (
          <div className="fb-re-empty">
            <p>{t('noResults')}</p>
          </div>
        ) : (
          matched.map((l) => (
            <FbMarketplaceListingCard
              key={l.id}
              listing={l}
              isSaved={savedIds.has(Number(l.id))}
              onSave={() => toggleSave(l.id)}
              onClick={() => openListing(l)}
            />
          ))
        )}
      </div>

      <MobileBottomSheet open={sortOpen} title={t('sort')} onClose={() => setSortOpen(false)}>
        <ul className="mobile-sheet-list">
          {SORT_IDS.map((id) => (
            <li key={id}>
              <button
                type="button"
                className={`mobile-sheet-option ${sortBy === id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => { setSortBy(id); setSortOpen(false) }}
              >
                {sortLabels[id]}
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={priceOpen}
        title={lang === 'fa' ? 'محدوده قیمت' : 'Price range'}
        onClose={() => setPriceOpen(false)}
      >
        <div className="fb-re-price-form">
          <label className="fb-re-price-field">
            <span>{lang === 'fa' ? 'حداقل' : 'Min'}</span>
            <input type="number" inputMode="numeric" min="0" placeholder="$0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </label>
          <label className="fb-re-price-field">
            <span>{lang === 'fa' ? 'حداکثر' : 'Max'}</span>
            <input type="number" inputMode="numeric" min="0" placeholder={lang === 'fa' ? 'بدون سقف' : 'No max'} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </label>
          <div className="fb-re-sheet-actions">
            <button type="button" className="fb-re-btn-ghost" onClick={() => { setMinPrice(''); setMaxPrice('') }}>
              {t('clearFilters')}
            </button>
            <button type="button" className="fb-re-btn-primary" onClick={() => setPriceOpen(false)}>
              {t('applyFilters')}
            </button>
          </div>
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={conditionOpen}
        title={lang === 'fa' ? 'وضعیت کالا' : 'Condition'}
        onClose={() => setConditionOpen(false)}
      >
        <ul className="mobile-sheet-list">
          {CONDITION_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                className={`mobile-sheet-option ${condition === opt.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => { setCondition(opt.id); setConditionOpen(false) }}
              >
                {lang === 'fa' ? opt.fa : opt.en}
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

    </div>
  )
}
