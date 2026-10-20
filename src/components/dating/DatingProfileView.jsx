import {
  Ban, ChevronLeft, Cigarette, Heart,
  Ruler, Sparkles, Users, X, Baby, MessageCircle,
} from 'lucide-react'
import { useI18n } from '../../context/I18nContext'

function ActionButtons({ onPass, onLike, disabled, likedByMe }) {
  return (
    <div className="fb-dating-actions">
      <button
        type="button"
        className="fb-dating-pass"
        disabled={disabled}
        onClick={onPass}
        aria-label="Pass"
      >
        <X className="w-7 h-7" strokeWidth={2.75} />
      </button>
      <button
        type="button"
        className={`fb-dating-like ${likedByMe ? 'is-liked' : ''}`}
        disabled={disabled}
        onClick={onLike}
        aria-label="Like"
      >
        <Heart className={`w-7 h-7 ${likedByMe ? 'fill-white' : ''}`} strokeWidth={2.25} />
      </button>
    </div>
  )
}

/** Keep only this profile's gallery (dedupe + drop empty). */
function profilePhotos(person) {
  const raw = Array.isArray(person.photos) && person.photos.length
    ? person.photos
    : [person.avatar].filter(Boolean)
  const seen = new Set()
  const out = []
  for (const src of raw) {
    if (!src || seen.has(src)) continue
    seen.add(src)
    out.push(src)
  }
  if (!out.length) out.push(`/logo.jpeg?v=6`)
  return out
}

export default function DatingProfileView({
  person,
  acting,
  onBack,
  onLike,
  onPass,
  onMessage,
  onBlock,
}) {
  const { t } = useI18n()
  if (!person) return null

  const photos = profilePhotos(person)

  const intentLabel = {
    'long-term': t('datingIntentLongTerm'),
    friends: t('datingIntentFriends'),
    open: t('datingIntentOpen'),
  }[person.relationshipIntent] || t(`datingLooking.${person.lookingFor || 'dating'}`)

  const smokingLabel = {
    never: t('datingSmokeNever'),
    sometimes: t('datingSmokeSometimes'),
    regularly: t('datingSmokeYes'),
  }[person.smoking] || person.smoking

  const kidsLabel = {
    none: t('datingKidsNone'),
    has: t('datingKidsHas'),
    want: t('datingKidsWant'),
  }[person.kids] || person.kids

  return (
    <div className="fb-dating-profile">
      <div className="fb-dating-topbar">
        <button type="button" className="fb-dating-chip-btn" onClick={onBack} aria-label={t('back')}>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="fb-dating-scroll">
        <div className="fb-dating-hero">
          <img src={photos[0]} alt="" className="fb-dating-photo" />
          {!person.isMine && (
            <ActionButtons
              onPass={onPass}
              onLike={onLike}
              disabled={acting}
              likedByMe={person.likedByMe}
            />
          )}
        </div>

        <div className="fb-dating-info">
          <h1 className="fb-dating-name">
            {person.displayName}
            {person.age ? `, ${person.age}` : ''}
          </h1>

          {person.commonNote && (
            <div className="fb-dating-common">
              <Sparkles className="w-4 h-4" />
              <div>
                <strong>{t('datingThingsInCommon')}</strong>
                <p>{person.commonNote}</p>
              </div>
            </div>
          )}

          <ul className="fb-dating-facts">
            <li>
              <Heart className="w-4 h-4" />
              <span>{intentLabel}</span>
            </li>
            {person.height && (
              <li>
                <Ruler className="w-4 h-4" />
                <span>{person.height}</span>
              </li>
            )}
            {smokingLabel && (
              <li>
                <Cigarette className="w-4 h-4" />
                <span>{smokingLabel}</span>
              </li>
            )}
            {kidsLabel && (
              <li>
                <Baby className="w-4 h-4" />
                <span>{kidsLabel}</span>
              </li>
            )}
            {person.bio && (
              <li>
                <Users className="w-4 h-4" />
                <span>{person.bio}</span>
              </li>
            )}
          </ul>

          {!!person.interests?.length && (
            <div className="fb-dating-tags">
              {person.interests.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          {person.matched && (
            <button
              type="button"
              className="fb-dating-chat-btn"
              disabled={acting}
              onClick={onMessage}
            >
              <MessageCircle className="w-4 h-4" />
              {t('datingMessage')}
            </button>
          )}

          {!person.matched && person.likedByMe && (
            <p className="fb-dating-wait-hint">{t('datingWaitingMatch')}</p>
          )}

          {!person.isMine && (
            <button
              type="button"
              className="fb-dating-block-link"
              disabled={acting}
              onClick={onBlock}
            >
              <Ban className="w-3.5 h-3.5" />
              {t('datingBlock')}
            </button>
          )}
        </div>

        {photos.slice(1).map((src, i) => (
          <div key={`photo-${i}-${src}`} className="fb-dating-hero fb-dating-hero-more">
            <img src={src} alt="" className="fb-dating-photo" />
            {!person.isMine && i === photos.length - 2 && (
              <ActionButtons
                onPass={onPass}
                onLike={onLike}
                disabled={acting}
                likedByMe={person.likedByMe}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
