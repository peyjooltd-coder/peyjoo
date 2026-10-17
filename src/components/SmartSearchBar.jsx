import { useState, useRef, useEffect } from 'react'
import { Search, Sparkles, X, MapPin, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { regions, trendingSearches } from '../data/mockData'
import { getSearchSuggestions } from '../lib/smartSearch'

export default function SmartSearchBar({ showRegion = true, className = '' }) {
  const {
    searchQuery, runSmartSearch, clearSearch, searchIntent,
    selectedRegion, setSelectedRegion, setView, applySmartCategory, setApplySmartCategory,
  } = useApp()

  const [focused, setFocused] = useState(false)
  const [local, setLocal] = useState(searchQuery)
  const wrapRef = useRef(null)

  useEffect(() => setLocal(searchQuery), [searchQuery])

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const suggestions = getSearchSuggestions(local, trendingSearches)

  const submit = (q = local) => {
    runSmartSearch(q)
    setFocused(false)
    setView('explore')
  }

  return (
    <div className={`space-y-2 ${className}`} ref={wrapRef}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-divar-muted pointer-events-none" />
          <input
            type="search"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
              if (e.key === 'Escape') setFocused(false)
            }}
            placeholder="What are you looking for? e.g. 2BR rent Kitsilano, Tesla under $45k"
            className="dv-search w-full py-3 pl-10 pr-10 text-base sm:text-sm min-h-[48px]"
          />
          {local && (
            <button
              type="button"
              onClick={() => { setLocal(''); clearSearch() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-divar-muted"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button type="button" onClick={() => submit()} className="dv-btn-primary px-6 py-3 text-sm shrink-0 min-h-[48px] sm:min-h-0">
          Search
        </button>
      </div>

      {showRegion && (
        <div className="relative max-w-md">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-divar-red pointer-events-none" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full appearance-none bg-white border border-divar-border rounded-xl py-2.5 pl-9 pr-9 text-sm font-semibold"
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-divar-muted pointer-events-none" />
        </div>
      )}

      <label className="flex items-center gap-2 text-xs text-divar-text-secondary cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={applySmartCategory}
          onChange={(e) => setApplySmartCategory(e.target.checked)}
          className="accent-[#c62828] w-3.5 h-3.5"
        />
        <Sparkles className="w-3.5 h-3.5 text-divar-orange" />
        Smart category & filters from search
      </label>

      {searchIntent?.label && searchQuery && (
        <p className="text-xs font-semibold text-divar-red bg-divar-red-soft px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> {searchIntent.label}
        </p>
      )}

      {focused && suggestions.length > 0 && (
        <div className="dv-card p-2 shadow-lg border-divar-border max-h-48 overflow-y-auto">
          <p className="text-[10px] font-bold text-divar-muted uppercase px-2 py-1">Suggestions</p>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setLocal(s); submit(s) }}
              className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-divar-bg text-divar-text"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
