import {
  X, Home, Compass, Sparkles, Radio, Heart, User, Plus,
  BarChart3, MapPin, ChevronDown, Scale, Package,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { regions } from '../data/mockData'

const menuLinks = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Browse listings', icon: Compass },
  { id: 'my-ads', label: 'My ads', icon: Package },
  { id: 'pulse', label: 'Pulse™', icon: Radio, highlight: true },
  { id: 'dashboard', label: 'Dashboard & Saved', icon: BarChart3 },
  { id: 'pro', label: 'Pro Hub', icon: Sparkles },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'profile', label: 'My account', icon: User },
]

export default function MobileMenu({ open, onClose }) {
  const {
    view, setView, selectedRegion, setSelectedRegion,
    setShowPostModal, compareIds, pendingOffers, openDashboard,
  } = useApp()
  const { lang } = useI18n()

  const go = (id) => {
    if (id === 'dashboard') openDashboard('overview')
    else setView(id)
    onClose()
  }

  if (!open) return null

  return (
    <div className="lg:hidden fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <aside className="absolute inset-y-0 left-0 w-[min(100%,320px)] bg-divar-surface shadow-2xl flex flex-col animate-fade-up safe-area-top">
        <div className="flex items-center justify-between px-4 py-4 border-b border-divar-border-light">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpeg?v=6" alt="PeyJoo" className="w-10 h-10 rounded-xl object-cover bg-white" />
            <div>
              <p className="font-bold text-divar-text text-sm">{lang === 'fa' ? 'پی جو' : 'PeyJoo'}</p>
              <p className="text-[10px] text-divar-muted">{lang === 'fa' ? 'دیوار ونکوور' : 'Divar Vancouver'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-divar-bg" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-divar-border-light">
          <label className="text-[10px] font-bold text-divar-muted uppercase tracking-wider flex items-center gap-1 mb-2">
            <MapPin className="w-3.5 h-3.5 text-divar-red" /> Your area
          </label>
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full appearance-none bg-divar-bg border border-divar-border rounded-xl py-3 pl-4 pr-10 text-sm font-semibold text-divar-text"
            >
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-divar-muted pointer-events-none" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {menuLinks.map(({ id, label, icon: Icon, highlight }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-[15px] font-medium ${
                view === id || (id === 'dashboard' && view === 'saved')
                  ? 'bg-divar-red-soft text-divar-red'
                  : 'text-divar-text hover:bg-divar-bg'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{label}</span>
              {id === 'pulse' && (
                <span className="text-[9px] font-bold uppercase text-divar-orange bg-divar-orange-soft px-1.5 py-0.5 rounded">New</span>
              )}
              {id === 'dashboard' && compareIds.length > 0 && (
                <span className="text-[10px] font-bold text-divar-red flex items-center gap-0.5">
                  <Scale className="w-3 h-3" />{compareIds.length}
                </span>
              )}
              {id === 'pulse' && pendingOffers > 0 && (
                <span className="min-w-[20px] h-5 bg-divar-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {pendingOffers}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-divar-border-light safe-area-bottom space-y-3">
          <button
            onClick={() => { setShowPostModal(true); onClose() }}
            className="dv-btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm"
          >
            <Plus className="w-5 h-5" /> Post free ad
          </button>
        </div>
      </aside>
    </div>
  )
}
