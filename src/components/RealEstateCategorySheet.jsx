import { useMemo, useState } from 'react'
import { ChevronLeft, Search } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import {
  REAL_ESTATE_SUBCATEGORIES,
  REAL_ESTATE_SUB_ALL,
  getRealEstateL2,
  realEstateSubLabel,
  realEstateAllAdsLabel,
} from '../data/realEstateSubcategories'

/**
 * Divar-style nested category bottom sheet for املاک.
 * Mount only when open so local state resets each time.
 */
export default function RealEstateCategorySheet({ open, onClose, onSelect }) {
  const { t, lang, isRtl } = useI18n()
  const [level, setLevel] = useState('l1')
  const [subId, setSubId] = useState(null)
  const [query, setQuery] = useState('')

  const labelOf = (row) => (lang === 'fa' ? row.fa : row.en)

  const l1Items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = [...REAL_ESTATE_SUBCATEGORIES, REAL_ESTATE_SUB_ALL]
    if (!q) return rows
    return rows.filter((r) => (lang === 'fa' ? r.fa : r.en).toLowerCase().includes(q))
  }, [query, lang])

  const l2Items = useMemo(() => {
    if (!subId) return []
    const children = getRealEstateL2(subId)
    const allRow = {
      id: 'all',
      fa: realEstateAllAdsLabel(subId, 'fa'),
      en: realEstateAllAdsLabel(subId, 'en'),
      icon: '⋯',
    }
    const rows = [...children, allRow]
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => (lang === 'fa' ? r.fa : r.en).toLowerCase().includes(q))
  }, [subId, query, lang])

  if (!open) return null

  const title = level === 'l1'
    ? t('cats.real-estate')
    : `${t('cats.real-estate')} › ${realEstateSubLabel(subId, lang)}`

  const goBack = () => {
    if (level === 'l2') {
      setLevel('l1')
      setSubId(null)
      setQuery('')
      return
    }
    onClose?.()
  }

  const pickL1 = (id) => {
    if (id === 'all') {
      onSelect?.({ subcategory: 'all', propertyType: 'all' })
      return
    }
    const children = getRealEstateL2(id)
    if (!children.length) {
      onSelect?.({ subcategory: id, propertyType: 'all' })
      return
    }
    setSubId(id)
    setLevel('l2')
    setQuery('')
  }

  const pickL2 = (typeId) => {
    onSelect?.({ subcategory: subId, propertyType: typeId })
  }

  const items = level === 'l1' ? l1Items : l2Items
  const onPick = level === 'l1' ? pickL1 : pickL2

  return (
    <div className="re-cat-overlay" onClick={onClose} role="presentation">
      <div
        className="re-cat-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="re-cat-handle" aria-hidden />

        <header className="re-cat-header">
          <button type="button" className="re-cat-back" onClick={goBack} aria-label={t('back')}>
            <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <h3 className="re-cat-title">{title}</h3>
        </header>

        <div className="re-cat-search">
          <Search className="w-4 h-4 re-cat-search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('reSearchCategories')}
            aria-label={t('reSearchCategories')}
          />
        </div>

        <ul className="re-cat-list">
          {items.map((row) => {
            const isAll = row.id === 'all'
            const hasChildren = level === 'l1' && row.id !== 'all' && getRealEstateL2(row.id).length > 0
            return (
              <li key={`${level}-${row.id}`}>
                <button
                  type="button"
                  className={`re-cat-item ${isAll ? 'is-all' : ''}`}
                  onClick={() => onPick(row.id)}
                >
                  <span className="re-cat-item-icon" aria-hidden>{row.icon}</span>
                  <span className="re-cat-item-label">{labelOf(row)}</span>
                  {hasChildren && <span className="re-cat-chevron" aria-hidden>‹</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
