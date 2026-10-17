import { useState } from 'react'
import { Heart, Film } from 'lucide-react'
import HdImage from '../HdImage'
import { isVideoUrl } from '../../lib/imageCompress'
import GallerySideNav from '../GallerySideNav'

export default function FeedListingCard({
  title,
  priceLabel,
  image,
  media = [],
  timeLabel,
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
    <div className="feed-listing-card">
      <div className="feed-listing-image-wrap">
        <button type="button" className="feed-listing-card-hit" onClick={onClick}>
          {videoAsCover && current?.url ? (
            <video
              key={current.url}
              src={current.url}
              poster={current.poster || undefined}
              className="feed-listing-image"
              muted
              playsInline
              preload="metadata"
            />
          ) : current?.url ? (
            <HdImage src={current.url} alt="" className="feed-listing-image" />
          ) : (
            <div className="feed-listing-image feed-listing-image-empty" aria-hidden />
          )}
          {(hasVideo || videoAsCover) && (
            <span className="feed-listing-video-badge" aria-hidden>
              <Film className="w-3.5 h-3.5" />
            </span>
          )}
          {timeLabel ? <span className="feed-listing-time">{timeLabel}</span> : null}
          <div className="feed-listing-overlay">
            <p className="feed-listing-price">{priceLabel}</p>
            <p className="feed-listing-title">{title}</p>
          </div>
        </button>
        <GallerySideNav count={slides.length} index={index} onIndex={setIndex} />
      </div>
      {onToggleSave ? (
        <button
          type="button"
          className={`feed-listing-heart feed-listing-heart-btn ${isSaved ? 'is-saved' : ''}`}
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
        <span className="feed-listing-heart" aria-hidden>
          <Heart className="w-4 h-4 text-white" strokeWidth={2} />
        </span>
      )}
    </div>
  )
}
