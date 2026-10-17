import {
  MapPin, Calendar, Car, Home, Laptop, Sofa, Wrench, Shirt, Mountain, Building2,
  FileCheck, Shield, Truck, BadgeCheck, Key, Fuel, HardDrive,
} from 'lucide-react'
import { getOverviewConfig, getListingSpecRows, getCategoryMeta } from '../../data/listingOverviewConfig'
import GlassCategoryIcon from '../GlassCategoryIcon'

const categoryIcons = {
  'real-estate': Home,
  vehicles: Car,
  electronics: Laptop,
  furniture: Sofa,
  services: Wrench,
  fashion: Shirt,
  sports: Mountain,
  business: Building2,
}

function SpecGrid({ rows }) {
  if (!rows.length) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {rows.map(({ key, label, value }) => (
        <div key={key} className="bg-divar-bg rounded-xl p-3.5 border border-divar-border-light">
          <p className="text-[10px] font-bold text-divar-muted uppercase tracking-wide">{label}</p>
          <p className="font-bold text-divar-text mt-1 text-sm">{value}</p>
        </div>
      ))}
    </div>
  )
}

function Block({ title, icon: Icon, children }) {
  return (
    <div className="dv-card p-5 sm:p-6">
      <h3 className="font-bold text-divar-text flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-divar-red" />}
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function ListingCategoryOverview({ listing, onMessageSeller }) {
  const cfg = getOverviewConfig(listing.category)
  const cat = getCategoryMeta(listing.category)
  const rows = getListingSpecRows(listing)
  const Icon = categoryIcons[listing.category] || Home
  const attrs = listing.attributes || {}

  return (
    <section className="space-y-4 mt-6">
      <div className="dv-card overflow-hidden">
        <div className="bg-gradient-to-r from-divar-red-soft to-white px-5 py-4 border-b border-divar-border-light flex flex-wrap items-start gap-4">
          <GlassCategoryIcon id={listing.category} icon={Icon} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold text-divar-red uppercase tracking-wider">{cat?.name || 'Listing'}</p>
            <h2 className="font-bold text-divar-text text-lg mt-0.5">{cfg.title}</h2>
            <p className="text-sm text-divar-muted mt-1">{cfg.subtitle}</p>
          </div>
          {listing.category === 'real-estate' && attrs.listingType && (
            <span className="text-sm font-extrabold bg-divar-red text-white px-4 py-2 rounded-xl">
              {attrs.listingType}
            </span>
          )}
          {listing.category === 'vehicles' && attrs.make && (
            <span className="text-sm font-bold bg-slate-800 text-white px-4 py-2 rounded-xl">
              {attrs.make} {attrs.model}
            </span>
          )}
        </div>

        {cfg.highlights?.length > 0 && (
          <ul className="px-5 py-3 flex flex-wrap gap-2 bg-divar-yellow-soft/50 border-b border-divar-yellow/20">
            {cfg.highlights.map((h) => (
              <li key={h} className="text-xs font-semibold text-divar-text-secondary flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-divar-orange" />
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="p-5">
          <SpecGrid rows={rows} />
        </div>
      </div>

      {cfg.blocks.includes('history') && listing.category === 'vehicles' && (
        <Block title="Vehicle history & inspection" icon={FileCheck}>
          <div className="grid sm:grid-cols-2 gap-3">
            {['Clean title', 'Dealer maintained', 'Winter tires included', 'Test drive available'].map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-divar-text-secondary">
                <input type="checkbox" readOnly checked={listing.features?.some((f) => f.toLowerCase().includes(item.split(' ')[0].toLowerCase()))} className="accent-[#c62828]" />
                {item}
              </label>
            ))}
          </div>
          {attrs.mileage && (
            <p className="text-xs text-divar-muted mt-4 flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5" /> Odometer: {Number(attrs.mileage).toLocaleString()} km · {attrs.fuel || '—'}
            </p>
          )}
        </Block>
      )}

      {cfg.blocks.includes('warranty') && listing.category === 'electronics' && (
        <Block title="Warranty & authenticity" icon={Shield}>
          <div className="flex flex-wrap gap-3">
            <span className="text-sm font-semibold bg-divar-bg px-3 py-2 rounded-lg border border-divar-border">
              Warranty: {attrs.warranty || 'Ask seller'}
            </span>
            {attrs.storage && (
              <span className="text-sm font-semibold bg-divar-bg px-3 py-2 rounded-lg border border-divar-border flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-divar-red" /> {attrs.storage}
              </span>
            )}
          </div>
        </Block>
      )}

      {cfg.blocks.includes('credentials') && listing.category === 'services' && (
        <Block title="Credentials" icon={BadgeCheck}>
          <div className="flex flex-wrap gap-2">
            {attrs.licensed && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">Licensed & insured</span>
            )}
            {listing.features?.map((f) => (
              <span key={f} className="text-xs font-semibold bg-divar-bg px-3 py-1.5 rounded-lg border border-divar-border-light">{f}</span>
            ))}
          </div>
        </Block>
      )}

      {cfg.blocks.includes('delivery') && listing.category === 'furniture' && (
        <Block title="Delivery & pickup" icon={Truck}>
          <p className="text-sm text-divar-text-secondary">
            <strong className="text-divar-text">{attrs.delivery || 'Ask seller'}</strong>
            {attrs.material && ` · Material: ${attrs.material}`}
          </p>
        </Block>
      )}

      {cfg.blocks.includes('viewing') && listing.category === 'real-estate' && (
        <Block title="Viewing & move-in" icon={Key}>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-divar-text-secondary">
              <Calendar className="w-4 h-4 text-divar-red" /> Schedule viewing via chat
            </span>
            <span className="flex items-center gap-1.5 text-divar-text-secondary">
              <MapPin className="w-4 h-4 text-divar-red" /> {listing.neighborhood}, {listing.city}
            </span>
          </div>
        </Block>
      )}

      {listing.features?.length > 0 && (
        <Block title="Included & highlights" icon={BadgeCheck}>
          <div className="flex flex-wrap gap-2">
            {listing.features.map((f) => (
              <span key={f} className="text-xs font-semibold bg-divar-red-soft text-divar-red px-3 py-1.5 rounded-lg">
                {f}
              </span>
            ))}
          </div>
        </Block>
      )}

      {cfg.blocks.includes('location') && (
        <Block title="Location" icon={MapPin}>
          <div className="rounded-xl bg-divar-bg border border-divar-border-light h-32 flex items-center justify-center text-sm text-divar-muted">
            <MapPin className="w-5 h-5 text-divar-red mr-2" />
            {listing.neighborhood}, {listing.city} · BC
          </div>
        </Block>
      )}

      {onMessageSeller && (
        <div className="dv-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-divar-red-soft/40 border border-divar-red/20">
          <p className="text-sm text-divar-text">
            <strong>Questions about this {cat?.name?.toLowerCase() || 'listing'}?</strong> Chat with the seller from your Dashboard.
          </p>
          <button type="button" onClick={onMessageSeller} className="dv-btn-primary px-5 py-2.5 text-sm shrink-0">
            Message in Dashboard
          </button>
        </div>
      )}
    </section>
  )
}
