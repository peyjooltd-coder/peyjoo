import { useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import MobileBottomSheet from './mobile/MobileBottomSheet'
import { RE_ROOM_OPTIONS } from '../data/realEstateDetailFields'
import { REAL_ESTATE_SUBCATEGORIES, realEstateSubLabel } from '../data/realEstateSubcategories'

function Chip({ active, removable, children, onClick, onRemove }) {
  return (
    <button
      type="button"
      className={`divar-filter-chip ${active ? 'is-active' : ''}`}
      onClick={onClick}
    >
      <span>{children}</span>
      {removable && (
        <span
          className="divar-filter-chip-x"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation()
              onRemove?.()
            }
          }}
        >
          <X className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
  )
}

export default function ExploreFilterChips({ onOpenFullFilters }) {
  const {
    categoryFilters, setCategoryFilters, filteredListings, selectedCategory,
  } = useApp()
  const { t, lang } = useI18n()
  const isFa = lang === 'fa'
  const isRE = selectedCategory === 'real-estate'

  const [sheet, setSheet] = useState(null) // rooms | neighborhood | deposit | rent | area | age

  const neighborhoods = useMemo(() => {
    const set = new Set()
    filteredListings.forEach((l) => {
      if (l.neighborhood) set.add(l.neighborhood)
    })
    return [...set].sort()
  }, [filteredListings])

  const activeCount = useMemo(() => {
    let n = 0
    const f = categoryFilters
    if (f.realEstateSubcategory && f.realEstateSubcategory !== 'all') n += 1
    if (f.rooms) n += 1
    if (f.neighborhood) n += 1
    if (f.balcony) n += 1
    if (f.elevator) n += 1
    if (f.parking) n += 1
    if (f.depositMin || f.depositMax) n += 1
    if (f.rentMin || f.rentMax) n += 1
    if (f.areaMin || f.areaMax) n += 1
    if (f.buildingAgeMin || f.buildingAgeMax || f.buildingAge) n += 1
    return n
  }, [categoryFilters])

  const clearKey = (key, empty = '') => {
    setCategoryFilters((prev) => ({ ...prev, [key]: empty }))
  }

  const setKey = (key, value) => {
    setCategoryFilters((prev) => ({ ...prev, [key]: value }))
    setSheet(null)
  }

  if (!isRE) {
    return (
      <div className="divar-filter-chips-row">
        <Chip active={activeCount > 0} onClick={onOpenFullFilters}>
          <SlidersHorizontal className="w-3.5 h-3.5 inline me-1" />
          {activeCount > 0 ? t('filterCount').replace('{n}', String(activeCount)) : t('filters')}
        </Chip>
      </div>
    )
  }

  return (
    <>
      <div className="divar-filter-chips-row">
        <Chip active={activeCount > 0} onClick={onOpenFullFilters}>
          <SlidersHorizontal className="w-3.5 h-3.5 inline me-1" />
          {activeCount > 0 ? t('filterCount').replace('{n}', String(activeCount)) : t('filters')}
        </Chip>

        {categoryFilters.realEstateSubcategory && categoryFilters.realEstateSubcategory !== 'all' && (
          <Chip
            active
            removable
            onClick={() => setSheet('subtype')}
            onRemove={() => clearKey('realEstateSubcategory', 'all')}
          >
            {realEstateSubLabel(categoryFilters.realEstateSubcategory, lang)}
          </Chip>
        )}

        <Chip
          active={!!categoryFilters.neighborhood}
          removable={!!categoryFilters.neighborhood}
          onClick={() => setSheet('neighborhood')}
          onRemove={() => clearKey('neighborhood')}
        >
          {categoryFilters.neighborhood || t('reNeighborhood')}
        </Chip>

        <Chip
          active={!!(categoryFilters.depositMin || categoryFilters.depositMax)}
          removable={!!(categoryFilters.depositMin || categoryFilters.depositMax)}
          onClick={() => setSheet('deposit')}
          onRemove={() => {
            setCategoryFilters((p) => ({ ...p, depositMin: '', depositMax: '' }))
          }}
        >
          {t('reDeposit')}
        </Chip>

        <Chip
          active={!!(categoryFilters.rentMin || categoryFilters.rentMax)}
          removable={!!(categoryFilters.rentMin || categoryFilters.rentMax)}
          onClick={() => setSheet('rent')}
          onRemove={() => {
            setCategoryFilters((p) => ({ ...p, rentMin: '', rentMax: '' }))
          }}
        >
          {t('reMonthlyRent')}
        </Chip>

        <Chip
          active={!!(categoryFilters.areaMin || categoryFilters.areaMax)}
          removable={!!(categoryFilters.areaMin || categoryFilters.areaMax)}
          onClick={() => setSheet('area')}
          onRemove={() => {
            setCategoryFilters((p) => ({ ...p, areaMin: '', areaMax: '' }))
          }}
        >
          {t('reArea')}
        </Chip>

        <Chip
          active={!!categoryFilters.rooms}
          removable={!!categoryFilters.rooms}
          onClick={() => setSheet('rooms')}
          onRemove={() => clearKey('rooms')}
        >
          {categoryFilters.rooms
            ? `${t('reRooms')}: ${RE_ROOM_OPTIONS.find((o) => o.id === categoryFilters.rooms)?.[isFa ? 'fa' : 'en'] || categoryFilters.rooms}`
            : t('reRooms')}
        </Chip>

        <Chip
          active={!!(categoryFilters.buildingAgeMin || categoryFilters.buildingAgeMax)}
          removable={!!(categoryFilters.buildingAgeMin || categoryFilters.buildingAgeMax)}
          onClick={() => setSheet('age')}
          onRemove={() => {
            setCategoryFilters((p) => ({ ...p, buildingAgeMin: '', buildingAgeMax: '' }))
          }}
        >
          {t('reBuilt')}
        </Chip>

        <Chip
          active={!!categoryFilters.balcony}
          onClick={() => setCategoryFilters((p) => ({ ...p, balcony: !p.balcony }))}
        >
          {t('reWithBalcony')}
        </Chip>

        <Chip
          active={!!categoryFilters.parking}
          onClick={() => setCategoryFilters((p) => ({ ...p, parking: !p.parking }))}
        >
          {t('reWithParking')}
        </Chip>

        <Chip
          active={!!categoryFilters.elevator}
          onClick={() => setCategoryFilters((p) => ({ ...p, elevator: !p.elevator }))}
        >
          {t('reWithElevator')}
        </Chip>
      </div>

      <MobileBottomSheet open={sheet === 'rooms'} title={t('reRooms')} onClose={() => setSheet(null)}>
        <div className="jobs-filter-chips p-1">
          {RE_ROOM_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`jobs-filter-chip ${categoryFilters.rooms === o.id ? 'is-active' : ''}`}
              onClick={() => setKey('rooms', categoryFilters.rooms === o.id ? '' : o.id)}
            >
              {isFa ? o.fa : o.en}
            </button>
          ))}
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={sheet === 'neighborhood'} title={t('reNeighborhood')} onClose={() => setSheet(null)}>
        <ul className="mobile-sheet-list">
          <li>
            <button
              type="button"
              className={`mobile-sheet-option ${!categoryFilters.neighborhood ? 'mobile-sheet-option-active' : ''}`}
              onClick={() => setKey('neighborhood', '')}
            >
              {t('allRegion')}
            </button>
          </li>
          {neighborhoods.map((n) => (
            <li key={n}>
              <button
                type="button"
                className={`mobile-sheet-option ${categoryFilters.neighborhood === n ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => setKey('neighborhood', n)}
              >
                {n}
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet open={sheet === 'subtype'} title={t('realEstateFilterField')} onClose={() => setSheet(null)}>
        <ul className="mobile-sheet-list">
          {REAL_ESTATE_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option ${categoryFilters.realEstateSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => setKey('realEstateSubcategory', s.id)}
              >
                {isFa ? s.fa : s.en}
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet open={sheet === 'deposit'} title={t('reDeposit')} onClose={() => setSheet(null)}>
        <div className="mobile-sheet-filters">
          <label className="mobile-sheet-field">
            <span>{t('from')}</span>
            <input
              type="number"
              className="post-input"
              value={categoryFilters.depositMin || ''}
              onChange={(e) => setCategoryFilters((p) => ({ ...p, depositMin: e.target.value }))}
            />
          </label>
          <label className="mobile-sheet-field">
            <span>{t('to')}</span>
            <input
              type="number"
              className="post-input"
              value={categoryFilters.depositMax || ''}
              onChange={(e) => setCategoryFilters((p) => ({ ...p, depositMax: e.target.value }))}
            />
          </label>
          <button type="button" className="post-submit-btn !mt-2" onClick={() => setSheet(null)}>
            {t('applyFilters')}
          </button>
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={sheet === 'rent'} title={t('reMonthlyRent')} onClose={() => setSheet(null)}>
        <div className="mobile-sheet-filters">
          <label className="mobile-sheet-field">
            <span>{t('from')}</span>
            <input
              type="number"
              className="post-input"
              value={categoryFilters.rentMin || ''}
              onChange={(e) => setCategoryFilters((p) => ({ ...p, rentMin: e.target.value }))}
            />
          </label>
          <label className="mobile-sheet-field">
            <span>{t('to')}</span>
            <input
              type="number"
              className="post-input"
              value={categoryFilters.rentMax || ''}
              onChange={(e) => setCategoryFilters((p) => ({ ...p, rentMax: e.target.value }))}
            />
          </label>
          <button type="button" className="post-submit-btn !mt-2" onClick={() => setSheet(null)}>
            {t('applyFilters')}
          </button>
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={sheet === 'area'} title={t('reArea')} onClose={() => setSheet(null)}>
        <div className="mobile-sheet-filters">
          <label className="mobile-sheet-field">
            <span>{t('from')}</span>
            <input
              type="number"
              className="post-input"
              value={categoryFilters.areaMin || ''}
              onChange={(e) => setCategoryFilters((p) => ({ ...p, areaMin: e.target.value }))}
            />
          </label>
          <label className="mobile-sheet-field">
            <span>{t('to')}</span>
            <input
              type="number"
              className="post-input"
              value={categoryFilters.areaMax || ''}
              onChange={(e) => setCategoryFilters((p) => ({ ...p, areaMax: e.target.value }))}
            />
          </label>
          <button type="button" className="post-submit-btn !mt-2" onClick={() => setSheet(null)}>
            {t('applyFilters')}
          </button>
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={sheet === 'age'} title={t('reBuilt')} onClose={() => setSheet(null)}>
        <div className="mobile-sheet-filters">
          <label className="mobile-sheet-field">
            <span>{t('from')}</span>
            <input
              type="number"
              className="post-input"
              value={categoryFilters.buildingAgeMin || ''}
              onChange={(e) => setCategoryFilters((p) => ({ ...p, buildingAgeMin: e.target.value }))}
            />
          </label>
          <label className="mobile-sheet-field">
            <span>{t('to')}</span>
            <input
              type="number"
              className="post-input"
              value={categoryFilters.buildingAgeMax || ''}
              onChange={(e) => setCategoryFilters((p) => ({ ...p, buildingAgeMax: e.target.value }))}
            />
          </label>
          <button type="button" className="post-submit-btn !mt-2" onClick={() => setSheet(null)}>
            {t('applyFilters')}
          </button>
        </div>
      </MobileBottomSheet>
    </>
  )
}
