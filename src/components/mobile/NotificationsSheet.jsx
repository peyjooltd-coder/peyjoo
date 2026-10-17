import { useEffect, useState } from 'react'
import { Bell, Mail, MessageCircle } from 'lucide-react'
import MobileBottomSheet from './MobileBottomSheet'
import { useI18n } from '../../context/I18nContext'
import { ensureChatNotifyPermission } from '../../lib/chatNotify'

const STORAGE_KEY = 'pejo_notif_prefs'

const DEFAULTS = {
  chat: true,
  email: true,
  news: true,
  marketing: false,
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export default function NotificationsSheet({ open, onClose }) {
  const { t } = useI18n()
  const [prefs, setPrefs] = useState(DEFAULTS)

  useEffect(() => {
    if (open) setPrefs(loadPrefs())
  }, [open])

  const toggle = (key) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      if (key === 'chat' && next.chat) {
        ensureChatNotifyPermission().catch(() => {})
      }
      return next
    })
  }

  const rows = [
    { key: 'chat', icon: MessageCircle, label: t('notifChat'), desc: t('notifChatDesc') },
    { key: 'email', icon: Mail, label: t('notifEmail'), desc: t('notifEmailDesc') },
    { key: 'news', icon: Bell, label: t('notifNews'), desc: t('notifNewsDesc') },
  ]

  return (
    <MobileBottomSheet open={open} title={t('notifications')} onClose={onClose}>
      <div className="mobile-sheet-filters space-y-2">
        <p className="text-xs text-divar-muted mb-2">{t('notifHint')}</p>
        {rows.map(({ key, icon: Icon, label, desc }) => (
          <button
            key={key}
            type="button"
            className="profile-toggle-row"
            onClick={() => toggle(key)}
          >
            <span className="profile-menu-icon">
              <Icon className="w-5 h-5 text-divar-red" />
            </span>
            <span className="flex-1 min-w-0 text-start">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="block text-xs text-divar-muted">{desc}</span>
            </span>
            <span className={`profile-toggle ${prefs[key] ? 'is-on' : ''}`} aria-hidden />
          </button>
        ))}
        <button type="button" className="post-submit-btn !mt-4" onClick={onClose}>
          {t('done')}
        </button>
      </div>
    </MobileBottomSheet>
  )
}
