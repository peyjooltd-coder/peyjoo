import { useMemo, useState } from 'react'
import { ChevronDown, LayoutGrid, MapPin, Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useI18n } from '../../context/I18nContext'
import { popularCategories } from '../../data/mobileUiData'
import {
  CANADA_CITIES, cityLabel, normalizeCityId,
} from '../../data/canadaCities'
import MobileBackButton from './MobileBackButton'
import MobileBottomSheet from './MobileBottomSheet'
import GlassCategoryIcon from '../GlassCategoryIcon'

/**
 * Compact brand-orange header for category browse:
 * back · category · city · search · subcategory chips
 */
export default function CategoryBrowseHeader({
  title,
  categoryId,
  query,
  onQueryChange,
  searchPlaceholder,
  showCity = true,
  tiles = [],
  tileId,
  onTileChange,
  tilesMode = 'chips', // 'chips' | 'icons'
}) {
  const { openCategory, selectedRegion, setSelectedRegion, setViewTab } = useApp()
  const { t, lang, isRtl } = useI18n()
  const [catOpen, setCatOpen] = useState(false)
  const [regionOpen, setRegionOpen] = useState(false)

  const cityText = cityLabel(normalizeCityId(selectedRegion), lang)

  const switchable = useMemo(
    () => popularCategories.filter((c) => !['dating', 'hamyari'].includes(c.id)),
    [],
  )

  const showTiles = Array.isArray(tiles) && tiles.length > 1

  const handlePickCategory = (id) => {
    setCatOpen(false)
    if (id === categoryId) return
    openCategory(id)
  }

  return (
    <>
      <header className="cat-browse-header">
        <div className="cat-browse-header-row">
          <MobileBackButton
            label={t('back')}
            fallback="home"
            variant="onOrange"
            className="cat-browse-back"
          />

          <button
            type="button"
            className="cat-browse-cat-btn"
            onClick={() => setCatOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={catOpen}
          >
            <span className="cat-browse-cat-title">{title}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-90 shrink-0" strokeWidth={2.5} />
          </button>

          {showCity ? (
            <button
              type="button"
              className="cat-browse-city-btn"
              onClick={() => setRegionOpen(true)}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2.25} />
              <span className="cat-browse-city-label">{cityText}</span>
              <ChevronDown className="w-3 h-3 opacity-80 shrink-0" />
            </button>
          ) : (
            <span className="cat-browse-spacer" aria-hidden />
          )}
        </div>

        <div className="cat-browse-search">
          <Search className="w-4 h-4 shrink-0 opacity-75" strokeWidth={2.25} />
          <input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder={searchPlaceholder || t('search')}
            dir={isRtl ? 'rtl' : 'ltr'}
          />
          {query ? (
            <button
              type="button"
              className="cat-browse-search-clear"
              onClick={() => onQueryChange?.('')}
              aria-label="Clear"
            >
              ×
            </button>
          ) : null}
        </div>

        {showTiles ? (
          tilesMode === 'icons' ? (
            <div className="cat-browse-subicons cat-browse-subicons--in-header" role="tablist" aria-label={lang === 'fa' ? 'زیرمجموعه' : 'Subcategories'}>
              {tiles.map((tile) => {
                const active = tile.id === tileId
                const label = lang === 'fa' ? (tile.fa || tile.label) : (tile.en || tile.label)
                const Glyph = tile.Glyph
                return (
                  <button
                    key={tile.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`cat-browse-subicon ${active ? 'is-active' : ''}`}
                    onClick={() => onTileChange?.(tile.id)}
                  >
                    <span className="cat-browse-subicon-circle">
                      {Glyph ? <Glyph className="cat-browse-subicon-svg" /> : null}
                    </span>
                    <span className="cat-browse-subicon-label">{label}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="cat-browse-subs" role="tablist" aria-label={lang === 'fa' ? 'زیرمجموعه' : 'Subcategories'}>
              {tiles.map((tile) => {
                const active = tile.id === tileId
                const label = lang === 'fa' ? (tile.fa || tile.label) : (tile.en || tile.label)
                return (
                  <button
                    key={tile.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`cat-browse-subchip ${active ? 'is-active' : ''}`}
                    onClick={() => onTileChange?.(tile.id)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )
        ) : null}
      </header>

      <MobileBottomSheet
        open={catOpen}
        onClose={() => setCatOpen(false)}
        title={lang === 'fa' ? 'انتخاب دسته‌بندی' : 'Choose category'}
      >
        <div className="cat-browse-picker">
          <button
            type="button"
            className="cat-browse-picker-item"
            onClick={() => {
              setCatOpen(false)
              setViewTab('categories')
            }}
          >
            <span className="cat-browse-picker-all">
              <LayoutGrid className="w-5 h-5" />
            </span>
            <span>{t('allCategoriesLink')}</span>
          </button>
          {switchable.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`cat-browse-picker-item ${c.id === categoryId ? 'is-active' : ''}`}
              onClick={() => handlePickCategory(c.id)}
            >
              <GlassCategoryIcon id={c.id} size="sm" />
              <span>{t(`cats.${c.id}`)}</span>
            </button>
          ))}
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
        title={lang === 'fa' ? 'انتخاب شهر' : 'Choose city'}
      >
        <div className="cat-browse-picker">
          {CANADA_CITIES.map((city) => {
            const active = normalizeCityId(selectedRegion) === normalizeCityId(city.id)
            return (
              <button
                key={city.id}
                type="button"
                className={`cat-browse-picker-item ${active ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedRegion(city.id)
                  setRegionOpen(false)
                }}
              >
                <MapPin className="w-4 h-4 shrink-0 opacity-55" />
                <span>{lang === 'fa' ? city.fa : city.en}</span>
              </button>
            )
          })}
        </div>
      </MobileBottomSheet>
    </>
  )
}
