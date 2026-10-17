import HdImage from './HdImage'
import { normalizeMedia } from '../lib/imageCompress'

/** Render one image or video slide from a media item or URL string. */
export default function MediaSlide({
  item,
  className = '',
  eager = false,
  controls = true,
  muted = false,
}) {
  const media = normalizeMedia([item])[0]
  if (!media?.url) return null

  if (media.type === 'video') {
    return (
      <video
        src={media.url}
        poster={media.poster || undefined}
        className={`${className} is-video`.trim()}
        controls={controls}
        muted={muted}
        playsInline
        preload="metadata"
      />
    )
  }

  return <HdImage src={media.url} alt="" className={className} eager={eager} />
}

export function listingMediaList(listing) {
  if (!listing) return []
  if (Array.isArray(listing.media) && listing.media.length) {
    return normalizeMedia(listing.media)
  }
  if (Array.isArray(listing.images) && listing.images.length) {
    return normalizeMedia(listing.images)
  }
  if (listing.image) return normalizeMedia([listing.image])
  return []
}

export function postMediaList(post) {
  if (!post) return []
  if (Array.isArray(post.media) && post.media.length) {
    return normalizeMedia(post.media)
  }
  if (Array.isArray(post.images) && post.images.length) {
    return normalizeMedia(post.images)
  }
  return []
}
