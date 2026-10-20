import { useCallback, useRef, useState } from 'react'
import { Heart, MapPin, X } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'

function photoOf(person) {
  if (person?.photos?.[0]) return person.photos[0]
  if (person?.avatar) return person.avatar
  return `/logo.jpeg?v=6`
}

/**
 * Facebook Dating Discover — full-bleed card + X / Heart + swipe.
 */
export default function DatingDiscoverDeck({
  people,
  acting,
  loading,
  emptyLabel,
  onLike,
  onPass,
  onOpenProfile,
}) {
  const { t } = useI18n()
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const start = useRef({ x: 0, y: 0 })
  const person = people[0]

  const resetDrag = () => setDrag({ x: 0, y: 0, active: false })

  const finishSwipe = useCallback(
    async (dir) => {
      if (!person || acting) return
      setDrag({ x: dir === 'like' ? 420 : -420, y: 0, active: false })
      try {
        if (dir === 'like') await onLike(person)
        else await onPass(person)
      } finally {
        resetDrag()
      }
    },
    [person, acting, onLike, onPass],
  )

  const onPointerDown = (e) => {
    if (acting || !person) return
    start.current = { x: e.clientX, y: e.clientY }
    setDrag({ x: 0, y: 0, active: true })
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!drag.active) return
    setDrag({
      x: e.clientX - start.current.x,
      y: (e.clientY - start.current.y) * 0.25,
      active: true,
    })
  }

  const onPointerUp = () => {
    if (!drag.active) return
    if (drag.x > 110) finishSwipe('like')
    else if (drag.x < -110) finishSwipe('pass')
    else resetDrag()
  }

  if (loading && !person) {
    return <div className="fb-discover-empty">{t('loading')}</div>
  }

  if (!person) {
    return <div className="fb-discover-empty">{emptyLabel}</div>
  }

  const rot = drag.x / 28
  const likeOpacity = Math.min(1, Math.max(0, drag.x / 90))
  const passOpacity = Math.min(1, Math.max(0, -drag.x / 90))
  const next = people[1]

  return (
    <div className="fb-discover">
      <div className="fb-discover-stack">
        {next && (
          <div className="fb-discover-card is-next" aria-hidden>
            <img src={photoOf(next)} alt="" />
          </div>
        )}
        <div
          className={`fb-discover-card is-top ${drag.active ? 'is-dragging' : ''}`}
          style={{
            transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${rot}deg)`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={resetDrag}
          onClick={() => {
            if (Math.abs(drag.x) < 8) onOpenProfile(person)
          }}
        >
          <img src={photoOf(person)} alt="" draggable={false} />
          <div className="fb-discover-stamp is-like" style={{ opacity: likeOpacity }}>
            {t('datingLike')}
          </div>
          <div className="fb-discover-stamp is-pass" style={{ opacity: passOpacity }}>
            {t('datingPass')}
          </div>
          <div className="fb-discover-meta">
            <h2>
              {person.displayName}
              {person.age ? `, ${person.age}` : ''}
            </h2>
            <p>
              <MapPin className="w-3.5 h-3.5" />
              {person.neighborhood || `${person.distanceKm} ${t('datingKm')}`}
            </p>
            {person.bio && <p className="fb-discover-bio">{person.bio}</p>}
          </div>
        </div>
      </div>

      <div className="fb-discover-actions">
        <button
          type="button"
          className="fb-discover-pass"
          disabled={acting}
          onClick={() => finishSwipe('pass')}
          aria-label={t('datingPass')}
        >
          <X className="w-8 h-8" strokeWidth={2.75} />
        </button>
        <button
          type="button"
          className="fb-discover-like"
          disabled={acting}
          onClick={() => finishSwipe('like')}
          aria-label={t('datingLike')}
        >
          <Heart className="w-8 h-8" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  )
}
