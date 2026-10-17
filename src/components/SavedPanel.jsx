import { Heart, Bell, Scale, Trash2, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ListingCard from './ListingCard'

export default function SavedPanel() {
  const { savedListings, compareListings, toggleCompare, alerts, removeAlert } = useApp()

  return (
    <div className="space-y-8">
      {compareListings.length > 0 && (
        <section className="dv-card p-5 sm:p-6">
          <h2 className="font-bold text-divar-text flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-divar-red" />
            Compare ({compareListings.length}/3)
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {compareListings.map((l) => (
              <div key={l.id} className="relative border border-divar-border rounded-xl p-4 bg-divar-bg">
                <button type="button" onClick={() => toggleCompare(l.id)} className="absolute top-2 right-2 p-1 text-divar-muted hover:text-divar-red" aria-label="Remove">
                  <X className="w-4 h-4" />
                </button>
                <img src={l.image} alt="" className="w-full h-28 object-cover rounded-lg mb-3" />
                <p className="text-divar-red font-bold">{l.priceLabel}</p>
                <p className="text-sm font-medium text-divar-text mt-1 line-clamp-2">{l.title}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-divar-border text-[11px] text-divar-muted">
                  <span>★ {l.sellerRating}</span>
                  <span>{l.condition}</span>
                  <span>{l.city}</span>
                  <span>{l.views} views</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-divar-text flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-divar-red fill-divar-red" /> Saved ads
        </h2>
        {savedListings.length === 0 ? (
          <div className="dv-card p-12 text-center">
            <Heart className="w-12 h-12 text-divar-border mx-auto mb-3" />
            <p className="font-semibold text-divar-text">No saved ads yet</p>
            <p className="text-sm text-divar-muted mt-2">Tap the bookmark on any listing</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {savedListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-divar-text flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-divar-yellow" /> Search alerts
        </h2>
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="dv-card flex items-center justify-between px-4 sm:px-5 py-4 gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-divar-text truncate">{a.query}</p>
                <p className="text-xs text-divar-muted">{a.region} · Instant notify</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${a.active ? 'bg-emerald-50 text-emerald-700' : 'bg-divar-bg text-divar-muted'}`}>
                  {a.active ? 'ON' : 'OFF'}
                </span>
                <button type="button" onClick={() => removeAlert(a.id)} className="p-2 text-divar-muted hover:text-divar-red" aria-label="Delete alert">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="w-full border-2 border-dashed border-divar-border text-divar-muted py-4 rounded-xl text-sm font-semibold hover:border-divar-red hover:text-divar-red transition-colors">
            + New alert
          </button>
        </div>
      </section>
    </div>
  )
}
