import { useMemo, useState } from 'react'
import {
  Check, Copy, Link2, MessageCircle, Search, Send, Share2, Users, X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { apiClient } from '../api/client'
import {
  copyShareText,
  openTelegramShare,
  openWhatsAppShare,
} from '../lib/shareListing'
import {
  newsSharePayload,
  openFacebookShare,
  shareNewsViaSystem,
} from '../lib/shareNews'

function buildContacts(chatThreads, listings) {
  const map = new Map()

  for (const th of chatThreads || []) {
    if (!th?.otherName) continue
    const key = `thread:${th.id}`
    map.set(key, {
      key,
      name: th.otherName,
      avatar: th.otherAvatar || `/logo.jpeg?v=5`,
      threadId: th.id,
      listingId: th.listingId,
    })
  }

  for (const l of listings || []) {
    if (!l?.seller || l.isMine) continue
    const key = `seller:${l.userId || l.seller}`
    if (map.has(key)) continue
    // Prefer contacts already covered by a thread with same name
    const exists = [...map.values()].some((c) => c.name === l.seller)
    if (exists) continue
    map.set(key, {
      key,
      name: l.seller,
      avatar: l.sellerAvatar || `/logo.jpeg?v=5`,
      listingId: l.id,
    })
  }

  return [...map.values()].slice(0, 24)
}

export default function NewsShareSheet({ post, open, onClose, onShared }) {
  const { t, lang } = useI18n()
  const {
    chatThreads, listings, sendChatMessage, setChatThreads,
    isAuthenticated, setPromptLogin,
  } = useApp()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [sending, setSending] = useState(false)
  const [sentFlash, setSentFlash] = useState(false)

  const contacts = useMemo(
    () => buildContacts(chatThreads, listings),
    [chatThreads, listings],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter((c) => c.name.toLowerCase().includes(q))
  }, [contacts, query])

  if (!open || !post) return null

  const payload = newsSharePayload(post, lang)
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  const selectedList = contacts.filter((c) => selected.has(c.key))

  const toggle = (key) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const runExternal = async (fn) => {
    try {
      await fn()
      onShared?.('external')
      onClose?.()
    } catch {
      window.alert(t('shareFailed'))
    }
  }

  const sendToSelected = async () => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    if (!selectedList.length) return
    setSending(true)
    try {
      const message = payload.full
      for (const contact of selectedList) {
        if (contact.threadId) {
          await sendChatMessage(contact.threadId, message)
        } else if (contact.listingId) {
          const { thread } = await apiClient.startChat(contact.listingId, message)
          setChatThreads((prev) => {
            const exists = prev.find((t) => t.id === thread.id)
            if (exists) return [thread, ...prev.filter((t) => t.id !== thread.id)]
            return [thread, ...prev]
          })
        }
      }
      setSentFlash(true)
      onShared?.('inapp')
      setTimeout(() => {
        setSentFlash(false)
        setSelected(new Set())
        onClose?.()
      }, 700)
    } catch (e) {
      window.alert(e.message || t('shareFailed'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="ig-share-backdrop" onClick={onClose} role="presentation">
      <div
        className="ig-share-sheet"
        role="dialog"
        aria-label={t('newsSend')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ig-share-handle" />
        <div className="ig-share-search-row">
          <label className="ig-share-search">
            <Search className="w-4 h-4" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('shareSearch')}
              dir="auto"
            />
          </label>
          <button type="button" className="ig-share-group-btn" aria-label={t('shareCreateGroup')} title={t('shareCreateGroup')}>
            <Users className="w-5 h-5" />
          </button>
          <button type="button" className="ig-share-close" onClick={onClose} aria-label={t('cancel')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="ig-share-preview">{lang === 'fa' ? post.titleFa : post.titleEn}</p>

        <div className="ig-share-contacts">
          {filtered.length === 0 ? (
            <p className="ig-share-empty">{t('shareNoContacts')}</p>
          ) : (
            filtered.map((c) => {
              const on = selected.has(c.key)
              return (
                <button
                  key={c.key}
                  type="button"
                  className={`ig-share-contact ${on ? 'is-on' : ''}`}
                  onClick={() => toggle(c.key)}
                >
                  <span className="ig-share-avatar-wrap">
                    <img src={c.avatar} alt="" />
                    {on && (
                      <span className="ig-share-check"><Check className="w-3 h-3" /></span>
                    )}
                  </span>
                  <span className="ig-share-name">{c.name}</span>
                </button>
              )
            })
          )}
        </div>

        {selectedList.length > 0 && (
          <button
            type="button"
            className="ig-share-send-btn"
            disabled={sending}
            onClick={sendToSelected}
          >
            {sentFlash
              ? t('shareSent')
              : sending
                ? t('sending')
                : `${t('shareSendTo')} (${selectedList.length})`}
          </button>
        )}

        <div className="ig-share-external">
          <button
            type="button"
            className="ig-share-ext"
            onClick={() => runExternal(async () => {
              await copyShareText(payload.url)
              window.alert(t('shareLinkCopiedShort'))
            })}
          >
            <span className="ig-share-ext-icon"><Link2 className="w-5 h-5" /></span>
            <span>{t('shareCopyLink')}</span>
          </button>
          <button
            type="button"
            className="ig-share-ext"
            onClick={() => runExternal(async () => openWhatsAppShare(payload.full))}
          >
            <span className="ig-share-ext-icon is-wa"><MessageCircle className="w-5 h-5" /></span>
            <span>{t('shareWhatsApp')}</span>
          </button>
          <button
            type="button"
            className="ig-share-ext"
            onClick={() => runExternal(async () => openTelegramShare(payload.url, payload.text))}
          >
            <span className="ig-share-ext-icon is-tg"><Send className="w-5 h-5" /></span>
            <span>{t('shareTelegram')}</span>
          </button>
          <button
            type="button"
            className="ig-share-ext"
            onClick={() => runExternal(async () => openFacebookShare(payload.url))}
          >
            <span className="ig-share-ext-icon is-fb">f</span>
            <span>Facebook</span>
          </button>
          {canNative && (
            <button
              type="button"
              className="ig-share-ext"
              onClick={() => runExternal(async () => {
                const r = await shareNewsViaSystem(post, lang)
                if (r === 'unsupported') throw new Error('unsupported')
              })}
            >
              <span className="ig-share-ext-icon"><Share2 className="w-5 h-5" /></span>
              <span>{t('shareSystemShort')}</span>
            </button>
          )}
          <button
            type="button"
            className="ig-share-ext"
            onClick={() => runExternal(async () => {
              await copyShareText(payload.full)
              window.alert(t('shareLinkCopiedShort'))
            })}
          >
            <span className="ig-share-ext-icon"><Copy className="w-5 h-5" /></span>
            <span>{t('shareCopy')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
