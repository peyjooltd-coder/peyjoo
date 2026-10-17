import { useState } from 'react'
import { Heart, Film } from 'lucide-react'
import HdImage from '../HdImage'
import { isVideoUrl } from '../../lib/imageCompress'
import GallerySideNav from '../GallerySideNav'

export default function FeaturedAdCard({
  title,
  priceLabel,
  image,
  media = [],
  onClick,
  hasVideo = false,
  isSaved = false,
  onToggleSave,
}) {
  const slides = media.length ? media : (image ? [{ url: image, type: isVideoUrl(image) ? 'video' : 'image' }] : [])
  const [index, setIndex] = useState(0)
  const current = slides[index] || slides[0]
  const videoAsCover = current?.type === 'video' || (current?.url && isVideoUrl(current.url))

  return (
    <div className="featured-ad-card">
      <div className="featured-ad-image-wrap">
        <button type="button" className="featured-ad-card-hit" onClick={onClick}>
          {videoAsCover && current?.url ? (
            <video
              key={current.url}
              src={current.url}
              poster={current.poster || undefined}
              className="featured-ad-image"
              muted
              playsInline
              preload="metadata"
            />
          ) : current?.url ? (
            <HdImage src={current.url} alt="" className="featured-ad-image" />
          ) : (
            <div className="featured-ad-image featured-ad-image-empty" aria-hidden />
          )}
          {(hasVideo || videoAsCover) && (
            <span className="feed-listing-video-badge" aria-hidden>
              <Film className="w-3.5 h-3.5" />
            </span>
          )}
        </button>
        <GallerySideNav count={slides.length} index={index} onIndex={setIndex} />
      </div>
      <button type="button" className="featured-ad-card-hit" onClick={onClick}>
        <p className="featured-ad-title">{title}</p>
        <p className="featured-ad-price">{priceLabel}</p>
      </button>
      {onToggleSave ? (
        <button
          type="button"
          className={`featured-ad-heart featured-ad-heart-btn ${isSaved ? 'is-saved' : ''}`}
          aria-label="save"
          aria-pressed={isSaved}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleSave()
          }}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-divar-red text-divar-red' : 'text-white'}`} strokeWidth={2} />
        </button>
      ) : (
        <span className="featured-ad-heart" aria-hidden>
          <Heart className="w-4 h-4 text-white" strokeWidth={2} />
        </span>
      )}
    </div>
  )
}
