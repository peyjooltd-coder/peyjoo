import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { allCategories } from '../data/mobileUiData'
import SectionOrangeHeader from '../components/mobile/SectionOrangeHeader'
import GlassCategoryIcon from '../components/GlassCategoryIcon'

export default function CategoriesPage() {
  const { openCategory, setViewTab } = useApp()
  const { t, isRtl } = useI18n()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allCategories
    return allCategories.filter((c) => {
      const label = t(`cats.${c.id}`).toLowerCase()
      return label.includes(q) || c.name.includes(query.trim())
    })
  }, [query, t])

  return (
    <div className="mobile-page categories-page">
      <SectionOrangeHeader title={t('categories')} onBack={() => setViewTab('home')}>
        <button type="button" className="section-orange-icon" aria-label={t('search')}>
          <Search className="w-5 h-5" />
        </button>
      </SectionOrangeHeader>

      <div className="categories-search-wrap">
        <Search className="w-4 h-4 text-divar-muted shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchCategories')}
          className="categories-search-input"
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      </div>

      <div className="categories-grid-3col">
        {filtered.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="category-tile"
            onClick={() => openCategory(cat.id)}
          >
            <GlassCategoryIcon id={cat.id} size="lg" />
            <span className="category-tile-label">{t(`cats.${cat.id}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
