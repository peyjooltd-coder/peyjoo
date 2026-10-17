import { useState } from 'react'
import {
  User, MapPin, Shield, Settings, Bell, HelpCircle, LogOut, FileText, BookOpen,
  BadgeCheck, Package, Trash2, ChevronLeft, ChevronRight, Heart, Languages, MessageCircle, Mail,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import SectionOrangeHeader from '../components/mobile/SectionOrangeHeader'
import EditProfileSheet from '../components/mobile/EditProfileSheet'
import EmailVerifySheet from '../components/mobile/EmailVerifySheet'
import MyLocationSheet from '../components/mobile/MyLocationSheet'
import NotificationsSheet from '../components/mobile/NotificationsSheet'
import PrivacySheet from '../components/mobile/PrivacySheet'
import HelpSheet from '../components/mobile/HelpSheet'
import { userAvatar } from '../lib/defaultAvatar'

export default function ProfilePage() {
  const {
    user, savedIds, myListings, setViewTab, openPostModal, logout, deleteAccount,
    chatUnreadCount, setActiveChatId, isAuthenticated, setPromptLogin,
  } = useApp()
  const { t, isRtl, lang, toggleLang, meta } = useI18n()
  const Chevron = isRtl ? ChevronLeft : ChevronRight

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const requireAuth = (fn) => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    fn()
  }

  const openMessenger = () => {
    requireAuth(() => {
      setActiveChatId(null)
      setViewTab('chat')
    })
  }

  const menuSections = [
    {
      title: t('account'),
      items: [
        {
          icon: MessageCircle,
          label: t('messages'),
          desc: chatUnreadCount > 0
            ? t('messagesUnreadHint').replace('{n}', String(chatUnreadCount))
            : t('messagesInboxHint'),
          action: 'chat',
          badge: chatUnreadCount > 0 ? (chatUnreadCount > 9 ? '9+' : String(chatUnreadCount)) : null,
          badgeTone: 'alert',
        },
        { icon: Package, label: t('myListings'), desc: `${myListings.length} ${t('activeAds')}`, action: 'my-ads' },
        { icon: Heart, label: t('savedItems'), desc: `${savedIds.size} ${t('items')}`, action: 'saved' },
        { icon: User, label: t('editProfile'), desc: t('editProfileDesc'), sheet: 'edit-profile' },
        {
          icon: Mail,
          label: t('email'),
          desc: user?.emailVerified
            ? (user.email || t('emailVerified'))
            : (user?.email ? t('emailPendingVerify') : t('emailNotSet')),
          sheet: 'email',
          badge: user?.emailVerified ? t('verified') : t('unverified'),
          badgeTone: user?.emailVerified ? 'ok' : 'alert',
          danger: !user?.emailVerified,
        },
        { icon: MapPin, label: t('myLocation'), desc: user?.city || t('location'), sheet: 'location' },
        {
          icon: Shield,
          label: t('verification'),
          desc: user?.verified ? t('verified') : t('pending'),
          badge: user?.verified ? t('verified') : null,
        },
      ],
    },
    {
      title: t('settings'),
      items: [
        {
          icon: Languages,
          label: t('language'),
          desc: lang === 'fa' ? 'English' : 'فارسی',
          onPress: toggleLang,
          trailing: meta.switchLabel,
        },
        { icon: Bell, label: t('notifications'), desc: `${t('chat')}, ${t('email')}`, sheet: 'notifications' },
        { icon: Settings, label: t('privacy'), desc: t('privacyDesc'), sheet: 'privacy' },
        { icon: FileText, label: t('termsTitle'), desc: t('termsDesc'), href: '/terms/' },
        { icon: Shield, label: t('privacyPolicyTitle'), desc: t('privacyPolicyDesc'), href: '/privacy/' },
        { icon: BookOpen, label: t('guidelinesTitle'), desc: t('guidelinesDesc'), href: '/guidelines/' },
        { icon: HelpCircle, label: t('helpSupport'), desc: t('helpDesc'), href: '/support/', sheet: 'help' },
      ],
    },
  ]

  const onMenuClick = (item) => {
    if (item.href && !item.sheet) {
      window.location.assign(item.href)
      return
    }
    if (item.onPress) {
      item.onPress()
      return
    }
    if (item.action === 'chat') {
      openMessenger()
      return
    }
    if (item.sheet === 'edit-profile') {
      requireAuth(() => setEditProfileOpen(true))
      return
    }
    if (item.sheet === 'email') {
      requireAuth(() => setEmailOpen(true))
      return
    }
    if (item.sheet === 'location') {
      requireAuth(() => setLocationOpen(true))
      return
    }
    if (item.sheet === 'notifications') {
      requireAuth(() => setNotificationsOpen(true))
      return
    }
    if (item.sheet === 'privacy') {
      requireAuth(() => setPrivacyOpen(true))
      return
    }
    if (item.sheet === 'help') {
      setHelpOpen(true)
      return
    }
    if (item.action) {
      requireAuth(() => setViewTab(item.action))
    }
  }

  return (
    <div className="mobile-page profile-page">
      <SectionOrangeHeader title={t('myPeyjo')} onBack={() => setViewTab('home')}>
        <div className="profile-header-actions">
          {!isAuthenticated && (
            <button
              type="button"
              className="section-orange-login-btn"
              onClick={() => setPromptLogin(true)}
            >
              {t('authSignIn')}
            </button>
          )}
          <button
            type="button"
            className="section-orange-icon relative"
            aria-label={t('messages')}
            onClick={openMessenger}
          >
            <MessageCircle className="w-5 h-5" />
            {chatUnreadCount > 0 && (
              <span className="profile-msg-badge">{chatUnreadCount > 9 ? '9+' : chatUnreadCount}</span>
            )}
          </button>
        </div>
      </SectionOrangeHeader>

      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <button
          type="button"
          className="profile-avatar-btn"
          onClick={() => requireAuth(() => setEditProfileOpen(true))}
          aria-label={t('editProfile')}
        >
          <img src={userAvatar(user?.avatar)} alt="" className="profile-avatar" />
        </button>
        <h1 className="profile-name">{user?.name || t('myPeyjo')}</h1>
        <p className="profile-city">
          <MapPin className="w-4 h-4" /> {user?.city || t('location')}, {t('britishColumbia')}
        </p>
        {user?.verified && (
          <span className="profile-verified">
            <BadgeCheck className="w-4 h-4" /> {t('verifiedAccount')}
          </span>
        )}
        {isAuthenticated && (
          <button
            type="button"
            className="home-btn-outline !w-auto !px-4 !py-2 text-xs mt-3"
            onClick={() => setEditProfileOpen(true)}
          >
            {t('editProfile')}
          </button>
        )}
      </div>

      {chatUnreadCount > 0 && (
        <button type="button" className="profile-msg-alert" onClick={openMessenger}>
          <MessageCircle className="w-4 h-4" />
          <span>{t('messagesUnreadHint').replace('{n}', String(chatUnreadCount))}</span>
          <Chevron className="w-4 h-4 shrink-0 opacity-70" />
        </button>
      )}

      <div className="profile-stats">
        {[
          { label: t('save'), value: savedIds.size, action: () => requireAuth(() => setViewTab('saved')) },
          { label: t('myAds'), value: myListings.length, action: () => requireAuth(() => setViewTab('my-ads')) },
          { label: t('sold'), value: myListings.filter((l) => l.status === 'sold').length },
        ].map((s) => (
          <button
            key={s.label}
            type="button"
            className="profile-stat"
            onClick={s.action}
            disabled={!s.action}
          >
            <p className="profile-stat-value">{s.value}</p>
            <p className="profile-stat-label">{s.label}</p>
          </button>
        ))}
      </div>

      {menuSections.map((section) => (
        <section key={section.title} className="mobile-section !pt-0">
          <p className="text-xs font-bold text-divar-muted mb-2">{section.title}</p>
          <div className="profile-menu">
            {section.items.map((item) => {
              const { icon: Icon, label, desc, badge, badgeTone, trailing, danger } = item
              return (
                <button
                  key={label}
                  type="button"
                  className={`profile-menu-item ${danger ? 'is-danger' : ''}`}
                  onClick={() => onMenuClick(item)}
                >
                  <div className="profile-menu-icon relative">
                    <Icon className={`w-5 h-5 ${danger ? 'text-divar-red' : 'text-divar-red'}`} />
                    {badgeTone === 'alert' && (item.sheet === 'email' || chatUnreadCount > 0) && (
                      <span className="profile-menu-dot" aria-hidden />
                    )}
                  </div>
                  <div className={`flex-1 min-width-0 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-2 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                      <p className={`text-sm font-semibold ${danger ? 'text-divar-red' : ''}`}>{label}</p>
                      {badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          badgeTone === 'alert'
                            ? 'bg-red-50 text-divar-red'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                        >
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${danger ? 'text-divar-red/80' : 'text-divar-muted'}`} dir={item.sheet === 'email' && user?.email ? 'ltr' : undefined}>
                      {desc}
                    </p>
                  </div>
                  {trailing ? (
                    <span className="profile-lang-value">{trailing}</span>
                  ) : (
                    <Chevron className={`w-4 h-4 shrink-0 ${danger ? 'text-divar-red' : 'text-divar-muted'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <div className="px-4 space-y-3 pb-8">
        <button type="button" onClick={openPostModal} className="post-submit-btn !w-full !mx-0">
          {t('freePostAd')}
        </button>
        <button
          type="button"
          onClick={async () => {
            setLoggingOut(true)
            try { await logout() } finally { setLoggingOut(false) }
          }}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 text-divar-red font-semibold py-3"
        >
          <LogOut className="w-4 h-4" /> {loggingOut ? t('loggingOut') : t('logout')}
        </button>

        <div className="profile-danger-box">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-divar-red" /> {t('deleteAccount')}
          </h3>
          <p className="text-xs text-divar-muted mt-2 leading-relaxed">
            {t('deleteAccountHint')}
          </p>
          {!showDeleteConfirm ? (
            <button type="button" className="home-btn-outline !w-full mt-3 text-sm" onClick={() => setShowDeleteConfirm(true)}>
              {t('deleteMyAccount')}
            </button>
          ) : (
            <div className="flex gap-2 mt-3">
              <button type="button" className="flex-1 home-btn-outline text-sm py-2" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                {t('cancel')}
              </button>
              <button
                type="button"
                className="flex-1 post-submit-btn !py-2 !text-sm"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true)
                  try { await deleteAccount() } catch (e) {
                    alert(e.message || t('deleteAccount'))
                    setDeleting(false)
                    setShowDeleteConfirm(false)
                  }
                }}
              >
                {deleting ? t('deleting') : t('confirmDelete')}
              </button>
            </div>
          )}
        </div>
      </div>

      <EditProfileSheet open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
      <EmailVerifySheet open={emailOpen} onClose={() => setEmailOpen(false)} />
      <MyLocationSheet open={locationOpen} onClose={() => setLocationOpen(false)} />
      <NotificationsSheet open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <PrivacySheet open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
