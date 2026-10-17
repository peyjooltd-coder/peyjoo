import {
  Home, Newspaper, User, Plus, Heart, HeartHandshake,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useI18n } from '../../context/I18nContext'

export default function MobileBottomNav() {
  const { view, setViewTab, openPostModal, chatUnreadCount, setActiveChatId } = useApp()
  const { t } = useI18n()

  const navHome = [
    { id: 'hamyari', label: t('hamyari'), icon: HeartHandshake },
    { id: 'news', label: t('news'), icon: Newspaper },
    { id: 'home', label: t('home'), icon: Home },
    { id: 'dating', label: t('dating'), icon: Heart },
    { id: 'profile', label: t('myPeyjo'), icon: User },
  ]

  const navStandard = [
    { id: 'profile', label: t('myPeyjo'), icon: User },
    { id: 'dating', label: t('dating'), icon: Heart },
    { id: 'post', label: t('postAd'), fab: true },
    { id: 'news', label: t('news'), icon: Newspaper },
    { id: 'home', label: t('home'), icon: Home },
  ]

  const navNews = [
    { id: 'profile', label: t('myPeyjo'), icon: User },
    { id: 'news', label: t('news'), icon: Newspaper },
    { id: 'post', label: t('postAd'), fab: true },
    { id: 'dating', label: t('dating'), icon: Heart },
    { id: 'home', label: t('home'), icon: Home },
  ]

  const items =
    view === 'home' ? navHome : view === 'news' ? navNews : navStandard

  return (
    <nav className="mobile-bottom-nav-persian" aria-label={t('home')}>
      <div className="mobile-bottom-nav-inner">
        {items.map(({ id, label, icon: Icon, fab }) => {
          if (fab) {
            return (
              <button
                key={id}
                type="button"
                className="mobile-nav-fab-wrap"
                onClick={openPostModal}
                aria-label={label}
              >
                <span className="mobile-fab-circle">
                  <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                </span>
                <span className="mobile-nav-fab-label">{label}</span>
              </button>
            )
          }

          const isActive =
            view === id
            || (id === 'explore' && view === 'category')
            || (id === 'profile' && (view === 'chat' || view === 'my-ads' || view === 'profile'))

          return (
            <button
              key={id}
              type="button"
              className={`mobile-nav-tab ${isActive ? 'mobile-nav-tab-active' : ''}`}
              onClick={() => {
                if (id === 'profile') {
                  setActiveChatId?.(null)
                }
                setViewTab(id)
              }}
            >
              <span className="mobile-nav-icon-wrap">
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.25 : 2} />
                {id === 'profile' && chatUnreadCount > 0 && (
                  <span className="mobile-nav-unread" aria-label={t('messages')}>
                    {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                  </span>
                )}
              </span>
              <span className="mobile-nav-tab-label">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
