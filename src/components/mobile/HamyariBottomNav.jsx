import { Home, HeartHandshake, MessageCircle, PlusCircle, UserRound } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'

export default function HamyariBottomNav({ tab, onTab, onHome, unread = 0 }) {
  const { t } = useI18n()

  const items = [
    { id: 'home', label: t('home'), icon: Home, action: 'home' },
    { id: 'feed', label: t('hamyariFeed'), icon: HeartHandshake },
    { id: 'messages', label: t('hamyariMessenger'), icon: MessageCircle },
    { id: 'compose', label: t('hamyariPost'), icon: PlusCircle },
    { id: 'profile', label: t('hamyariMyProfile'), icon: UserRound },
  ]

  return (
    <nav className="hamyari-bottom-nav" aria-label={t('hamyari')}>
      <div className="hamyari-bottom-nav-inner">
        {items.map(({ id, label, icon: Icon, action }) => {
          const isActive = action !== 'home' && tab === id
          return (
            <button
              key={id}
              type="button"
              className={`hamyari-nav-tab ${isActive ? 'is-active' : ''}`}
              onClick={() => {
                if (action === 'home') onHome()
                else onTab(id)
              }}
            >
              <span className="hamyari-nav-icon-wrap">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.35 : 2} />
                {id === 'messages' && unread > 0 && (
                  <span className="hamyari-nav-badge">{unread > 9 ? '9+' : unread}</span>
                )}
              </span>
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
