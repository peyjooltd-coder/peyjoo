import { useState } from 'react'
import { Heart, MapPin } from 'lucide-react'
import HdImage from './HdImage'
import { listingCoverUrl, isVideoUrl } from '../lib/imageCompress'
import { listingMediaList } from './MediaSlide'
import GallerySideNav from './GallerySideNav'
import { useI18n } from '../context/I18nContext'

/**
 * Facebook Marketplace-style listing card (items / vehicles / jobs).
 */
export default function FbMarketplaceListingCard({ listing, isSaved, onSave, onClick }) {
  const { t } = useI18n()
  const slides = listingMediaList(listing)
  const [index, setIndex] = useState(0)
  const current = slides[index]
  const cover = current?.url || listingCoverUrl(listing) || listing.image
  const videoAsCover = current?.type === 'video' || (cover && isVideoUrl(cover))
  const location = [listing.city, listing.neighborhood].filter(Boolean).join(' · ')
  const price = listing.priceLabel
    || (listing.price === 0 ? (t('cats.free-stuff') === 'Free stuff' ? 'Free' : 'رایگان') : '')

  return (
    <div className="fb-re-card">
      <div className="fb-re-card-img-wrap">
        <button type="button" className="fb-re-card-hit" onClick={onClick}>
          {videoAsCover ? (
            <video key={cover} src={cover} poster={current?.poster || undefined} className="fb-re-card-img" muted playsInline preload="metadata" />
          ) : cover ? (
            <HdImage src={cover} alt={listing.title || ''} className="fb-re-card-img" />
          ) : (
            <div className="fb-re-card-img fb-re-card-img-empty" aria-hidden />
          )}
        </button>
        <GallerySideNav count={slides.length} index={index} onIndex={setIndex} prevLabel={t('prev')} nextLabel={t('next')} />
      </div>
      <button type="button" className="fb-re-card-hit" onClick={onClick}>
        <div className="fb-re-card-body">
          {price ? <p className="fb-re-card-price">{price}</p> : null}
          {listing.title ? <p className="fb-re-card-title">{listing.title}</p> : null}
          {location ? (
            <p className="fb-re-card-location">
              <MapPin className="w-3.5 h-3.5" />
              <span>{location}</span>
            </p>
          ) : null}
        </div>
      </button>
      <button
        type="button"
        className={`fb-re-card-heart ${isSaved ? 'is-saved' : ''}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onSave?.()
        }}
        aria-label={t('save')}
        aria-pressed={isSaved}
      >
        <Heart
          className={`w-5 h-5 ${isSaved ? 'fill-current text-divar-red' : 'text-white'}`}
          strokeWidth={2}
        />
      </button>
    </div>
  )
}
