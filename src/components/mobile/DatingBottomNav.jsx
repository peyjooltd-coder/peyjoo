import { Heart, Home, MapPin, MessageCircle, Sparkles, UserRound } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'

/** Dating bottom bar: Home · Profile · Liked You · Discover · Map · Matches */
export default function DatingBottomNav({
  tab,
  onTab,
  onHome,
  unread = 0,
  likesCount = 0,
}) {
  const { t } = useI18n()

  const items = [
    { id: 'home', label: t('home'), icon: Home, action: 'home' },
    { id: 'profile', label: t('datingMyProfile'), icon: UserRound },
    { id: 'likes', label: t('datingLikedYou'), icon: Heart, badge: likesCount },
    { id: 'discover', label: t('datingDiscover'), icon: Sparkles },
    { id: 'map', label: t('datingMap'), icon: MapPin },
    { id: 'matches', label: t('datingMatches'), icon: MessageCircle, badge: unread },
  ]

  return (
    <nav className="fb-dating-chrome fb-dating-chrome--bottom" aria-label={t('dating')}>
      <div className="fb-dating-chrome-tabs">
        {items.map(({ id, label, icon: Icon, badge, action }) => {
          const isActive = action !== 'home' && tab === id
          return (
            <button
              key={id}
              type="button"
              className={`fb-dating-chrome-tab ${isActive ? 'is-active' : ''}`}
              onClick={() => {
                if (action === 'home') onHome()
                else onTab(id)
              }}
            >
              <span className="fb-dating-chrome-icon">
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.4 : 2}
                  fill={isActive && id === 'likes' ? 'currentColor' : 'none'}
                />
                {badge > 0 && (
                  <span className="fb-dating-chrome-badge">{badge > 9 ? '9+' : badge}</span>
                )}
              </span>
              <span className="fb-dating-chrome-label">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
