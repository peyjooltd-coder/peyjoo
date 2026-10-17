import { useState } from 'react'
import {
  Radio, Flame, Target, Handshake, Plus, BadgeCheck, MapPin,
  TrendingUp, Sparkles, ChevronRight, Zap, ArrowRightLeft, Clock,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { pulseFeatures } from '../data/mockData'
import SectionHeader from '../components/ui/SectionHeader'

export default function PulsePage() {
  const {
    pulseTab, setPulseTab, wantSignals, handshakeOffers, pendingOffers,
    listings, openListing, openHandshake, addWantSignal, selectedRegion,
    demandPulse, pulseMatches, categories,
  } = useApp()

  const [showWantForm, setShowWantForm] = useState(false)
  const [wantForm, setWantForm] = useState({ title: '', category: 'electronics', budget: '', urgency: 'This week' })

  const tabs = [
    { id: 'pulse', label: 'Demand Pulse', icon: Flame },
    { id: 'wants', label: 'Want Signals', icon: Target },
    { id: 'matches', label: 'Match Forge', icon: Sparkles },
    { id: 'handshakes', label: 'Handshakes', icon: Handshake, badge: pendingOffers },
  ]

  const submitWant = (e) => {
    e.preventDefault()
    addWantSignal({
      title: wantForm.title,
      category: wantForm.category,
      budget: wantForm.budget,
      region: selectedRegion === 'all' || selectedRegion === 'All Greater Vancouver' ? 'Metro Vancouver' : selectedRegion,
      radius: '15 km',
      urgency: wantForm.urgency,
    })
    setShowWantForm(false)
    setWantForm({ title: '', category: 'electronics', budget: '', urgency: 'This week' })
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto">
      {/* Hero */}
      <section className="dv-card-elevated overflow-hidden rounded-2xl">
        <div className="relative bg-gradient-to-br from-divar-red via-[var(--color-divar-red-hover)] to-[var(--color-divar-red-active)] text-white px-4 sm:px-8 py-8 md:py-12">
          <div className="mb-3 sm:absolute sm:top-4 sm:right-4 sm:mb-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full border border-white/30">
              World first · Beta
            </span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Pulse™</h1>
              <p className="text-white/80 text-sm font-medium">Intent Match Network — no messenger, no spam</p>
            </div>
          </div>
          <p className="text-white/90 max-w-2xl leading-relaxed text-sm md:text-base">
            Broadcast what you want. Sellers respond with <strong>Handshake Offers</strong> — structured price, meet point, and time.
            Live demand data shows what Metro Vancouver is hunting for <em>right now</em>.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => { setPulseTab('wants'); setShowWantForm(true) }} className="bg-white text-divar-red px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg">
              <Plus className="w-4 h-4 inline mr-1" /> Post Want Signal
            </button>
            <button onClick={() => setPulseTab('pulse')} className="border border-white/50 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/10">
              View demand heatmap
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-divar-border-light bg-divar-surface-2">
          {pulseFeatures.map(({ title }) => (
            <div key={title} className="px-4 py-3 text-center">
              <p className="text-[11px] font-bold text-divar-text">{title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div className="pulse-tab-scroll flex gap-2 overflow-x-auto scrollbar-thin bg-white border border-divar-border rounded-xl p-1.5 shadow-sm -mx-1 px-1 sm:mx-0 sm:px-1.5">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setPulseTab(id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              pulseTab === id ? 'bg-divar-red text-white shadow-sm' : 'text-divar-text-secondary hover:bg-divar-bg'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {badge > 0 && (
              <span className={`min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center ${pulseTab === id ? 'bg-white text-divar-red' : 'bg-divar-red text-white'}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Demand Pulse */}
      {pulseTab === 'pulse' && (
        <section className="space-y-6">
          <SectionHeader title="Live Demand Pulse" subtitle="Real-time buyer intent across Greater Vancouver — updated every 15 min" />
          <div className="grid gap-3">
            {demandPulse.map((d) => (
              <div key={d.area + d.category} className="dv-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-divar-text">{d.category}</span>
                    <span className="text-xs text-divar-muted">· {d.area}</span>
                    {d.hot && <span className="dv-badge-urgent text-[9px]">HOT</span>}
                  </div>
                  <p className="text-xs text-divar-muted mt-1">{d.seekers} active want signals</p>
                </div>
                <div className="flex items-center gap-4 sm:w-64">
                  <div className="flex-1 h-3 bg-divar-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${d.hot ? 'bg-gradient-to-r from-divar-orange to-divar-red' : 'bg-divar-red/70'}`}
                      style={{ width: `${d.intensity}%` }}
                    />
                  </div>
                  <span className="text-sm font-extrabold text-divar-red w-10">{d.intensity}%</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />{d.trend}
                </span>
              </div>
            ))}
          </div>
          <div className="dv-card p-6 bg-divar-yellow-soft/50 border-divar-yellow/40">
            <p className="text-sm text-divar-text-secondary">
              <strong className="text-divar-text">Seller tip:</strong> Post inventory in hot categories above — Pulse will auto-match your listings to active Want Signals.
            </p>
          </div>
        </section>
      )}

      {/* Want Signals */}
      {pulseTab === 'wants' && (
        <section className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <SectionHeader title="Want Signals" subtitle="Buyers broadcasting intent — respond with a Handshake, not a DM" />
            <button onClick={() => setShowWantForm(!showWantForm)} className="dv-btn-primary px-5 py-2.5 text-sm flex items-center gap-2 shrink-0">
              <Plus className="w-4 h-4" /> New signal
            </button>
          </div>

          {showWantForm && (
            <form onSubmit={submitWant} className="dv-card p-6 border-2 border-divar-red/20 space-y-4">
              <p className="font-bold text-divar-text">Create your Want Signal</p>
              <input
                required
                placeholder="What are you looking for?"
                value={wantForm.title}
                onChange={(e) => setWantForm({ ...wantForm, title: e.target.value })}
                className="dv-search w-full px-4 py-3"
              />
              <div className="grid sm:grid-cols-3 gap-3">
                <select value={wantForm.category} onChange={(e) => setWantForm({ ...wantForm, category: e.target.value })} className="border border-divar-border rounded-xl px-3 py-2.5 text-sm">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input placeholder="Budget range" required value={wantForm.budget} onChange={(e) => setWantForm({ ...wantForm, budget: e.target.value })} className="dv-search px-3 py-2.5 text-sm" />
                <select value={wantForm.urgency} onChange={(e) => setWantForm({ ...wantForm, urgency: e.target.value })} className="border border-divar-border rounded-xl px-3 py-2.5 text-sm">
                  {['Today', 'This week', 'This month', 'Flexible'].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <button type="submit" className="dv-btn-primary px-6 py-2.5 text-sm">Publish signal</button>
            </form>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {wantSignals.map((w) => (
              <article key={w.id} className="dv-card dv-card-interactive p-5">
                <div className="flex gap-3">
                  <img src={w.avatar} alt="" className="w-11 h-11 rounded-xl ring-2 ring-divar-border-light" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-divar-text text-sm line-clamp-2">{w.title}</h3>
                      {w.verified && <BadgeCheck className="w-4 h-4 text-divar-red shrink-0" />}
                    </div>
                    <p className="text-divar-red font-bold text-sm mt-1">{w.budget}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-divar-muted font-medium">
                  <span className="flex items-center gap-1 bg-divar-bg px-2 py-1 rounded"><MapPin className="w-3 h-3" />{w.region}</span>
                  <span className="bg-divar-bg px-2 py-1 rounded">{w.radius}</span>
                  <span className="bg-divar-orange/10 text-divar-orange px-2 py-1 rounded font-semibold">{w.urgency}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-divar-border-light">
                  <span className="text-xs text-divar-muted">{w.matches} listing matches · {w.posted}</span>
                  <button className="text-xs font-bold text-divar-red flex items-center gap-1 hover:underline">
                    Send Handshake <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Match Forge */}
      {pulseTab === 'matches' && (
        <section className="space-y-6">
          <SectionHeader title="Match Forge" subtitle="AI-scored pairings between Want Signals and live listings" />
          <div className="space-y-4">
            {pulseMatches.map((m) => {
              const listing = listings.find((l) => l.id === m.listingId)
              const want = wantSignals.find((w) => w.id === m.wantId)
              if (!listing || !want) return null
              return (
                <div key={m.id} className="dv-card p-4 sm:p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#eee" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#c62828" strokeWidth="3" strokeDasharray={`${m.score} 100`} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-divar-red">{m.score}%</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-divar-muted uppercase">Match score</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${m.status === 'new' ? 'bg-divar-red text-white' : 'bg-divar-bg text-divar-muted'}`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 grid sm:grid-cols-2 gap-4">
                    <div className="bg-divar-bg rounded-xl p-3">
                      <p className="text-[10px] font-bold text-divar-orange uppercase mb-1">Want</p>
                      <p className="text-sm font-semibold text-divar-text line-clamp-2">{want.title}</p>
                    </div>
                    <div className="bg-divar-red-soft/50 rounded-xl p-3 flex gap-2">
                      <img src={listing.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-divar-red uppercase mb-1">Listing</p>
                        <p className="text-sm font-semibold text-divar-text line-clamp-1">{listing.title}</p>
                        <p className="text-sm font-bold text-divar-red">{listing.priceLabel}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 content-start">
                    {m.reasons.map((r) => (
                      <span key={r} className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{r}</span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                    <button onClick={() => openListing(listing)} className="dv-btn-outline py-2 text-xs px-4">View ad</button>
                    <button onClick={() => openHandshake(listing)} className="dv-btn-primary py-2 text-xs px-4 flex items-center justify-center gap-1">
                      <Handshake className="w-3.5 h-3.5" /> Handshake
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Handshakes */}
      {pulseTab === 'handshakes' && (
        <section className="space-y-6">
          <SectionHeader title="Handshake Offers" subtitle="Structured deals with expiry timers — accept, counter, or decline" />
          <div className="space-y-4">
            {handshakeOffers.map((o) => (
              <article key={o.id} className="dv-card overflow-hidden">
                <div className={`h-1 ${o.status === 'counter' ? 'bg-divar-yellow' : o.status === 'pending' ? 'bg-divar-orange' : 'bg-emerald-500'}`} />
                <div className="p-5 flex flex-col md:flex-row gap-5">
                  <img src={o.listingImage} alt="" className="w-full md:w-32 h-24 object-cover rounded-xl shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        o.status === 'counter' ? 'bg-divar-yellow-soft text-amber-800' : 'bg-divar-orange/15 text-divar-orange'
                      }`}>
                        {o.status === 'counter' ? 'Counter received' : 'Pending'}
                      </span>
                      <span className="text-[10px] text-divar-muted flex items-center gap-1"><Clock className="w-3 h-3" />Expires in {o.expires}</span>
                    </div>
                    <h3 className="font-bold text-divar-text mt-2">{o.listingTitle}</h3>
                    <p className="text-2xl font-extrabold text-divar-red mt-1">
                      ${o.offerPrice.toLocaleString()}
                      {o.counterPrice && <span className="text-base text-divar-muted line-through ml-2">${o.counterPrice.toLocaleString()} counter</span>}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2 mt-3 text-xs text-divar-text-secondary">
                      <p><strong>Meet:</strong> {o.meetPoint}</p>
                      <p><strong>When:</strong> {o.timeSlot}</p>
                      <p><strong>From:</strong> {o.from} → {o.to}</p>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-1">
                      {o.conditions.map((c) => (
                        <li key={c} className="text-[10px] bg-divar-bg px-2 py-0.5 rounded font-medium">{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex md:flex-col gap-2 shrink-0">
                    {o.status === 'counter' && (
                      <>
                        <button className="dv-btn-primary py-2.5 text-xs px-4">Accept ${o.counterPrice?.toLocaleString()}</button>
                        <button className="dv-btn-outline py-2.5 text-xs px-4 flex items-center justify-center gap-1">
                          <ArrowRightLeft className="w-3.5 h-3.5" /> Counter again
                        </button>
                      </>
                    )}
                    {o.status === 'pending' && o.from === 'You' && (
                      <span className="text-xs text-divar-muted text-center py-2">Awaiting seller response</span>
                    )}
                    {o.status === 'pending' && o.from !== 'You' && (
                      <button className="dv-btn-primary py-2.5 text-xs px-4">Review offer</button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
