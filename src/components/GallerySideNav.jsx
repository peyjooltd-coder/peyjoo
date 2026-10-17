import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Left = previous, right = next. Stays on the physical sides of the media. */
export default function GallerySideNav({
  count,
  index,
  onIndex,
  prevLabel = 'Previous',
  nextLabel = 'Next',
}) {
  if (!count || count < 2) return null
  const go = (dir, event) => {
    event.preventDefault()
    event.stopPropagation()
    const next = (index + dir + count) % count
    onIndex(next)
  }
  return (
    <>
      <button
        type="button"
        className="media-side-nav media-side-nav-prev"
        aria-label={prevLabel}
        onClick={(event) => go(-1, event)}
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2.4} />
      </button>
      <button
        type="button"
        className="media-side-nav media-side-nav-next"
        aria-label={nextLabel}
        onClick={(event) => go(1, event)}
      >
        <ChevronRight className="w-5 h-5" strokeWidth={2.4} />
      </button>
    </>
  )
}
