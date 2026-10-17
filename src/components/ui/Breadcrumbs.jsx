import { ChevronRight, Home } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const labels = {
  home: 'Home',
  explore: 'Browse',
  category: 'Browse',
  detail: 'Listing',
  pro: 'Pro Hub',
  dashboard: 'Dashboard',
  pulse: 'Pulse™',
  saved: 'Saved',
  profile: 'Account',
  'my-ads': 'My ads',
}

export default function Breadcrumbs({ extra }) {
  const { view, setView, selectedListing } = useApp()

  if (view === 'home') return null

  const crumbs = [{ id: 'home', label: 'Home' }]
  if (view !== 'home') crumbs.push({ id: view, label: labels[view] || view })
  if (view === 'detail' && selectedListing) {
    crumbs.push({ id: 'detail-title', label: selectedListing.title.slice(0, 40) + (selectedListing.title.length > 40 ? '…' : '') })
  }
  if (extra) crumbs.push({ id: 'extra', label: extra })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs sm:text-sm text-divar-muted mb-0 md:mb-5 flex-wrap">
      {crumbs.map((c, i) => (
        <span key={c.id} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-divar-border shrink-0" />}
          {i === 0 ? (
            <button onClick={() => setView('home')} className="flex items-center gap-1 hover:text-divar-red font-medium transition-colors">
              <Home className="w-3.5 h-3.5" />
            </button>
          ) : i === crumbs.length - 1 ? (
            <span className="text-divar-text font-medium truncate max-w-[200px]">{c.label}</span>
          ) : (
            <button onClick={() => c.id !== 'detail-title' && setView(c.id === 'detail-title' ? 'detail' : c.id)} className="hover:text-divar-red font-medium transition-colors">
              {c.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  )
}
