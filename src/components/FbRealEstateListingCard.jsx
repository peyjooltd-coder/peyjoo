import { useState } from 'react'
import { Heart, MapPin, Bed, Bath, Ruler } from 'lucide-react'
import HdImage from './HdImage'
import { listingCoverUrl, isVideoUrl } from '../lib/imageCompress'
import { listingMediaList } from './MediaSlide'
import GallerySideNav from './GallerySideNav'
import { useI18n } from '../context/I18nContext'
import { cityLabel } from '../data/canadaCities'
import { inferBeds, inferBaths, inferIsRent } from '../data/fbMarketplaceRealEstate'
import { listingTitle, listingPriceLabel } from '../lib/localizeListing'

/**
 * Facebook Marketplace-style real-estate card:
 *   - Big square cover with floating heart
 *   - Bold price on top of body (+ /mo when rent)
 *   - Second line: 🛏 X · 🛁 Y · sqft
 *   - Third line: city · neighborhood in muted grey
 */
export default function FbRealEstateListingCard({ listing, isSaved, onSave, onClick }) {
  const { t, lang } = useI18n()
  const slides = listingMediaList(listing)
  const [index, setIndex] = useState(0)
  const current = slides[index]
  const cover = current?.url || listingCoverUrl(listing) || listing.image
  const videoAsCover = current?.type === 'video' || (cover && isVideoUrl(cover))
  const beds = inferBeds(listing)
  const baths = inferBaths(listing)
  const attrs = listing.attributes || {}
  const area = attrs.area ? `${attrs.area} m²` : ''
  const isRent = inferIsRent(listing)
  const title = listingTitle(listing, lang)
  const label = listingPriceLabel(listing, lang, t) || ''
  const alreadyHasRentHint = /اجاره|rent|\/\s*mo|\/\s*ماه|ودیعه|deposit/i.test(label)
  const priceSuffix = isRent && !alreadyHasRentHint ? (lang === 'fa' ? ' / ماه' : ' /mo') : ''
  const priceLine = `${label}${priceSuffix}`

  const location = [cityLabel(listing.city, lang), listing.neighborhood].filter(Boolean).join(' · ')

  return (
    <div className="fb-re-card">
      <div className="fb-re-card-img-wrap">
        <button type="button" className="fb-re-card-hit" onClick={onClick}>
          {videoAsCover ? (
            <video key={cover} src={cover} poster={current?.poster || undefined} className="fb-re-card-img" muted playsInline preload="metadata" />
          ) : cover ? (
            <HdImage src={cover} alt={title || ''} className="fb-re-card-img" />
          ) : (
            <div className="fb-re-card-img fb-re-card-img-empty" aria-hidden />
          )}
        </button>
        <GallerySideNav count={slides.length} index={index} onIndex={setIndex} prevLabel={t('prev')} nextLabel={t('next')} />
      </div>
      <button type="button" className="fb-re-card-hit" onClick={onClick}>
        <div className="fb-re-card-body">
          <p className="fb-re-card-price">{priceLine}</p>
          {(beds != null || baths != null || area) && (
            <p className="fb-re-card-meta">
              {beds != null && (
                <span className="fb-re-card-meta-part">
                  <Bed className="w-3.5 h-3.5" />
                  {beds === 0 ? (lang === 'fa' ? 'سوئیت' : 'Studio') : `${beds}${lang === 'fa' ? ' خواب' : ' bd'}`}
                </span>
              )}
              {baths != null && (
                <span className="fb-re-card-meta-part">
                  <Bath className="w-3.5 h-3.5" />
                  {`${baths}${lang === 'fa' ? ' حمام' : ' ba'}`}
                </span>
              )}
              {area && (
                <span className="fb-re-card-meta-part">
                  <Ruler className="w-3.5 h-3.5" />
                  {area}
                </span>
              )}
            </p>
          )}
          {title ? (
            <p className="fb-re-card-title" dir="auto">{title}</p>
          ) : null}
          {location && (
            <p className="fb-re-card-location">
              <MapPin className="w-3.5 h-3.5" />
              <span>{location}</span>
            </p>
          )}
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
