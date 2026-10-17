import {
  Shield, BarChart3, Lock, Zap, Users, Layers, Calendar, TrendingUp,
  Check, ArrowRight, BadgeCheck, Star, Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { proFeatures, proPlans, proBusinesses, proFaqs } from '../data/mockData'
import SectionHeader from '../components/ui/SectionHeader'
import ListingCard from '../components/ListingCard'

const iconMap = {
  Shield, BarChart3, Lock, Zap, Users, Layers, Calendar, TrendingUp,
}

export default function ProHubPage() {
  const { proTab, setProTab, proListings, setView } = useApp()

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Tools' },
    { id: 'businesses', label: 'Businesses' },
    { id: 'pricing', label: 'Plans' },
  ]

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="dv-card overflow-hidden">
        <div className="bg-divar-red text-white px-6 md:px-10 py-8 md:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5" /> PeyJoo Pro
              </span>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                Professional selling for Vancouver businesses
              </h1>
              <p className="text-white/85 mt-3 text-sm md:text-base leading-relaxed">
                Verified profiles, analytics, SafeTrade escrow, CRM, and market insights — the Pro layer on top of Divar&apos;s trusted marketplace.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setProTab('pricing')} className="bg-white text-divar-red px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm">
                  14-day free trial
                </button>
                <button onClick={() => setView('dashboard')} className="border-2 border-white/50 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-white/10">
                  Dashboard
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:w-80">
              {[
                { label: 'Faster sales', value: '2.4×' },
                { label: 'Trust score', value: '94%' },
                { label: 'Pro sellers', value: '840+' },
                { label: 'SafeTrade volume', value: '$4.2M' },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/10">
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-[10px] text-white/75 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin bg-divar-surface border border-divar-border rounded-xl p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setProTab(t.id)}
            className={`shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              proTab === t.id ? 'bg-divar-red text-white' : 'text-divar-text-secondary hover:bg-divar-bg'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {proTab === 'overview' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {proFeatures.slice(0, 4).map((f) => {
              const Icon = iconMap[f.icon]
              return (
                <div key={f.id} className="dv-card dv-card-interactive p-5">
                  <div className="w-10 h-10 rounded-lg bg-divar-red-soft flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-divar-red" />
                  </div>
                  <h3 className="font-bold text-divar-text text-sm">{f.title}</h3>
                  <p className="text-xs text-divar-muted mt-2 leading-relaxed line-clamp-3">{f.description}</p>
                  <button onClick={() => setProTab('features')} className="text-xs text-divar-red font-bold mt-3 flex items-center gap-0.5 hover:underline">
                    Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
          <section>
            <h2 className="text-lg font-bold text-divar-text mb-4">Pro listings</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {proListings.slice(0, 4).map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        </>
      )}

      {proTab === 'features' && (
        <div className="grid md:grid-cols-2 gap-4">
          {proFeatures.map((f) => {
            const Icon = iconMap[f.icon]
            return (
              <div key={f.id} className="dv-card flex gap-4 p-6">
                <div className="w-12 h-12 rounded-xl bg-divar-yellow-soft flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-divar-red" />
                </div>
                <div>
                  <h3 className="font-bold text-divar-text">{f.title}</h3>
                  <p className="text-sm text-divar-text-secondary mt-2 leading-relaxed">{f.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {proTab === 'businesses' && (
        <div className="grid md:grid-cols-3 gap-5">
          {proBusinesses.map((b) => (
            <div key={b.id} className="dv-card overflow-hidden">
              <div className="h-20 bg-cover bg-center" style={{ backgroundImage: `url(${b.cover})` }} />
              <div className="p-5 -mt-6 relative">
                <img src={b.avatar} alt="" className="w-14 h-14 rounded-xl border-2 border-white shadow-md" />
                <div className="flex items-center gap-2 mt-3">
                  <h3 className="font-bold text-divar-text">{b.name}</h3>
                  {b.verified && <BadgeCheck className="w-4 h-4 text-divar-red" />}
                </div>
                <p className="text-xs text-divar-muted">{b.category}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-divar-text-secondary">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-divar-yellow fill-divar-yellow" />{b.rating}
                  </span>
                  <span>{b.reviews} reviews</span>
                  <span>{b.listings} ads</span>
                </div>
                <div className="flex justify-between mt-4 pt-3 border-t border-divar-border-light text-[10px]">
                  <span className="font-bold text-divar-red bg-divar-red-soft px-2 py-0.5 rounded">{b.tier}</span>
                  <span className="text-divar-muted">Responds {b.responseTime}</span>
                </div>
                <button className="w-full mt-4 dv-btn-outline py-2.5 text-sm flex items-center justify-center gap-2">
                  View store <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {proTab === 'pricing' && (
        <>
        <div className="grid md:grid-cols-3 gap-5">
          {proPlans.map((plan) => (
            <div
              key={plan.id}
              className={`dv-card p-6 relative ${plan.popular ? 'ring-2 ring-divar-red' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 dv-badge-featured text-[10px]">
                  MOST POPULAR
                </span>
              )}
              <h3 className="font-bold text-divar-text text-lg">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold text-divar-red">${plan.price}</span>
                <span className="text-divar-muted text-sm">{plan.period}</span>
              </p>
              <p className="text-xs text-divar-muted mt-1">Up to {plan.listings} active ads</p>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-divar-text-secondary">
                    <Check className="w-4 h-4 text-divar-red shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full mt-6 py-3 rounded-lg font-bold text-sm ${plan.popular ? 'dv-btn-primary' : 'dv-btn-outline'}`}>
                {plan.popular ? 'Start free trial' : 'Select plan'}
              </button>
            </div>
          ))}
        </div>
        <section className="dv-card p-8 mt-8">
          <SectionHeader title="Frequently asked questions" />
          <div className="space-y-4 mt-4">
            {proFaqs.map(({ q, a }) => (
              <details key={q} className="group border border-divar-border-light rounded-xl overflow-hidden">
                <summary className="px-5 py-4 font-semibold text-divar-text cursor-pointer hover:bg-divar-bg list-none flex justify-between items-center">
                  {q}
                  <span className="text-divar-red text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-divar-text-secondary leading-relaxed border-t border-divar-border-light bg-divar-surface-2">{a}</p>
              </details>
            ))}
          </div>
        </section>
        </>
      )}
    </div>
  )
}
