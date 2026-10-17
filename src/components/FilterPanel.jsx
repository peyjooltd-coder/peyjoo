import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { sortOptions, categories } from '../data/mockData'
import { getFilterFieldsForCategory } from '../data/categoryConfig'
import { CategoryFieldInputs } from './CategoryFieldInputs'

export default function FilterPanel({ className = '' }) {
  const { selectedCategory, categoryFilters, setCategoryFilters, sortBy, setSortBy, resetAllFilters } = useApp()

  const fields = getFilterFieldsForCategory(selectedCategory)
  const cat = categories.find((c) => c.id === selectedCategory)

  const onField = (id, value) => setCategoryFilters({ ...categoryFilters, [id]: value })

  return (
    <div className={`dv-card p-5 space-y-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-divar-text text-[15px] flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-divar-red" />
            Filters
          </h3>
          {cat && (
            <p className="text-[11px] text-divar-muted mt-0.5">{cat.icon} {cat.name} — category-specific</p>
          )}
          {!cat && <p className="text-[11px] text-divar-muted mt-0.5">Select a category for more filters</p>}
        </div>
        <button type="button" onClick={resetAllFilters} className="text-xs text-divar-red font-semibold hover:underline flex items-center gap-1">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold text-divar-text-secondary mb-2 block uppercase tracking-wide">Sort</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-divar-bg border border-divar-border rounded-lg px-3 py-2.5 text-sm text-divar-text focus:outline-none focus:border-divar-red"
        >
          {sortOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      <CategoryFieldInputs fields={fields} values={categoryFilters} onChange={onField} />
    </div>
  )
}
