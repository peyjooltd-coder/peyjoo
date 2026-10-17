import { Bookmark, MapPin, Eye, BadgeCheck, Scale, Clock, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { listingCoverUrl } from '../lib/imageCompress'
import { userAvatar } from '../lib/defaultAvatar'

function ListingBadges({ badges }) {
  if (!badges?.length) return null
  return (
    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
      {badges.slice(0, 2).map((b) => {
        if (b.includes('Ladder') || b === 'Featured' || b === 'Bundle Deal') {
          return <span key={b} className="dv-badge-featured">{b}</span>
        }
        if (b === 'Urgent' || b.includes('Price Drop') || b === 'New Listing') {
          return <span key={b} className="dv-badge-urgent">{b}</span>
        }
        return (
          <span key={b} className="text-[10px] font-semibold bg-white/95 text-divar-text-secondary px-2 py-0.5 rounded shadow-sm backdrop-blur-sm">
            {b}
          </span>
        )
      })}
    </div>
  )
}

export default function ListingCard({ listing, layout = 'grid', premium = false }) {
  const { savedIds, toggleSave, openListing, compareIds, toggleCompare } = useApp()
  const isSaved = savedIds.has(Number(listing.id))
  const inCompare = compareIds.includes(Number(listing.id))
  const cover = listingCoverUrl(listing) || listing.image

  if (layout === 'list') {
    return (
      <article
        onClick={() => openListing(listing)}
        className="dv-card dv-card-interactive flex gap-4 p-4 cursor-pointer group"
      >
        <div className="relative w-[160px] h-[120px] shrink-0 rounded-xl overflow-hidden bg-divar-bg ring-1 ring-divar-border-light">
          <img src={cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <ListingBadges badges={listing.badges} />
          {listing.isPro && <span className="absolute bottom-2 left-2 dv-badge-pro">PRO</span>}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <p className="text-divar-red font-extrabold text-xl tracking-tight">{listing.priceLabel}</p>
            <h3 className="font-semibold text-divar-text text-[15px] mt-2 line-clamp-2 leading-snug group-hover:text-divar-red transition-colors">
              {listing.title}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-divar-muted flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-divar-red/70" />
              {listing.neighborhood} · {listing.time}
            </p>
            <div className="flex items-center gap-2">
              {listing.sellerVerified && <BadgeCheck className="w-4 h-4 text-divar-red" />}
              <ChevronRight className="w-4 h-4 text-divar-border group-hover:text-divar-red transition-colors" />
            </div>
          </div>
        </div>
        <CardActions isSaved={isSaved} inCompare={inCompare} listing={listing} toggleSave={toggleSave} toggleCompare={toggleCompare} />
      </article>
    )
  }

  return (
    <article
      onClick={() => openListing(listing)}
      className={`dv-card dv-card-interactive overflow-hidden cursor-pointer group ${premium ? 'ring-1 ring-divar-red/20' : ''}`}
    >
      <div className="relative aspect-[4/3] bg-divar-bg overflow-hidden">
        <img
          src={cover}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <ListingBadges badges={listing.badges} />
        {listing.isPro && (
          <span className="absolute top-2.5 right-2.5 dv-badge-pro z-10 shadow-sm">PRO</span>
        )}

        <div
          className="listing-card-actions absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {!listing.isPro && (
            <button
              onClick={() => toggleSave(listing.id)}
              className="p-2.5 bg-white/95 backdrop-blur rounded-xl shadow-md hover:scale-105 transition-transform"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-divar-red text-divar-red' : 'text-divar-muted'}`} />
            </button>
          )}
          <button
            onClick={() => toggleCompare(listing.id)}
            className={`p-2.5 rounded-xl shadow-md backdrop-blur transition-transform hover:scale-105 ${
              inCompare ? 'bg-divar-red text-white' : 'bg-white/95'
            }`}
          >
            <Scale className={`w-4 h-4 ${inCompare ? 'text-white' : 'text-divar-muted'}`} />
          </button>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-3 pt-8 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-white font-extrabold text-lg tracking-tight drop-shadow-sm">{listing.priceLabel}</p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-divar-text text-[14px] line-clamp-2 leading-snug min-h-[2.75rem] group-hover:text-divar-red transition-colors">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-divar-border-light">
          <div className="flex items-center gap-2 min-w-0">
            <img src={userAvatar(listing.sellerAvatar)} alt="" className="w-7 h-7 rounded-lg ring-1 ring-divar-border-light object-cover" />
            <span className="text-[12px] text-divar-text-secondary truncate font-medium max-w-[90px]">{listing.seller}</span>
            {listing.sellerVerified && <BadgeCheck className="w-3.5 h-3.5 text-divar-red shrink-0" />}
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-divar-muted font-medium shrink-0">
            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{listing.city}</span>
            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{listing.views > 999 ? `${(listing.views / 1000).toFixed(1)}k` : listing.views}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function CardActions({ isSaved, inCompare, listing, toggleSave, toggleCompare }) {
  return (
    <div className="flex flex-col justify-center gap-1 px-2 border-l border-divar-border-light" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => toggleSave(listing.id)} className="p-3 hover:bg-divar-bg rounded-xl transition-colors">
        <Bookmark className={`w-[18px] h-[18px] ${isSaved ? 'fill-divar-red text-divar-red' : 'text-divar-muted'}`} />
      </button>
      <button onClick={() => toggleCompare(listing.id)} className={`p-3 rounded-xl transition-colors ${inCompare ? 'bg-divar-red-soft' : 'hover:bg-divar-bg'}`}>
        <Scale className={`w-[18px] h-[18px] ${inCompare ? 'text-divar-red' : 'text-divar-muted'}`} />
      </button>
    </div>
  )
}
