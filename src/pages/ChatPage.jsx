import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, ArrowRight, Send, Check, CheckCheck, Image as ImageIcon, MoreVertical, X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import SectionOrangeHeader from '../components/mobile/SectionOrangeHeader'

function lastMessage(thread) {
  const msgs = thread.messages || []
  return msgs[msgs.length - 1] || null
}

function groupByDay(messages, todayLabel) {
  const groups = []
  let current = null
  for (const m of messages) {
    const day = m.day || todayLabel
    if (!current || current.day !== day) {
      current = { day, items: [] }
      groups.push(current)
    }
    current.items.push(m)
  }
  return groups
}

export default function ChatPage() {
  const {
    chatThreads,
    chatUnreadCount,
    activeChatId,
    setActiveChatId,
    sendChatMessage,
    markChatRead,
    refreshChatThreads,
    openListing,
    listings,
    goBack,
    viewHistory,
  } = useApp()
  const { t, isRtl } = useI18n()

  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const bottomRef = useRef(null)
  const listRef = useRef(null)

  const activeThread = useMemo(
    () => chatThreads.find((t) => String(t.id) === String(activeChatId)) || null,
    [chatThreads, activeChatId]
  )

  const filtered = useMemo(() => {
    let list = [...chatThreads]
    if (tab === 'unread') list = list.filter((t) => (t.unread || 0) > 0)
    const q = query.trim()
    if (q) {
      list = list.filter(
        (t) =>
          (t.otherName || '').includes(q) ||
          (t.listingTitle || '').includes(q) ||
          (lastMessage(t)?.text || '').includes(q)
      )
    }
    // Unread threads always first, then by updated time
    list.sort((a, b) => {
      const ua = (a.unread || 0) > 0 ? 1 : 0
      const ub = (b.unread || 0) > 0 ? 1 : 0
      if (ub !== ua) return ub - ua
      return String(b.updated || '').localeCompare(String(a.updated || ''))
    })
    return list
  }, [chatThreads, tab, query])

  // Live sync: fast while a conversation is open so both sides see messages + seen ticks
  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      if (cancelled) return
      await refreshChatThreads?.()
    }
    tick()
    const ms = activeChatId ? 1200 : 4000
    const id = setInterval(tick, ms)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [activeChatId, refreshChatThreads])

  // While viewing a thread, keep marking read so the peer gets "seen" ticks
  useEffect(() => {
    if (!activeChatId) return undefined
    markChatRead(activeChatId)
    const id = setInterval(() => {
      markChatRead(activeChatId)
    }, 1500)
    return () => clearInterval(id)
  }, [activeChatId, markChatRead])

  const lastMsgKey = activeThread?.messages?.length
    ? `${activeThread.messages.length}:${activeThread.messages[activeThread.messages.length - 1]?.id || ''}:${activeThread.messages.filter((m) => m.seen).length}`
    : '0'

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [lastMsgKey, activeChatId])

  const openThread = (id) => {
    setActiveChatId(id)
    setDraft('')
    setSendError(null)
    markChatRead(id)
  }

  const send = async () => {
    if (!activeChatId || !draft.trim() || sending) return
    const text = draft
    setDraft('')
    setSending(true)
    setSendError(null)
    try {
      await sendChatMessage(activeChatId, text)
      markChatRead(activeChatId)
    } catch (e) {
      setSendError(e.message || t('sendFailed'))
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  const openListingFromThread = () => {
    if (!activeThread?.listingId) return
    const listing =
      listings.find((l) => String(l.id) === String(activeThread.listingId)) || {
        id: activeThread.listingId,
        title: activeThread.listingTitle,
        image: activeThread.listingImage,
        category: activeThread.listingCategory,
      }
    openListing(listing)
  }

  /** Back from a thread: if chat was opened from an ad (or elsewhere), restore that screen. */
  const leaveConversation = () => {
    const prev = viewHistory.length >= 2 ? viewHistory[viewHistory.length - 2] : null
    setActiveChatId(null)
    if (prev && prev !== 'chat') {
      goBack('home')
    }
  }

  /* ── Conversation view ── */
  if (activeThread) {
    const messages = activeThread.messages || []
    const groups = groupByDay(
      messages.map((m) => ({
        ...m,
        day: t('today'),
        mine: m.from === 'me' || m.fromMe === true,
      })),
      t('today')
    )

    return (
      <div className="tg-page tg-conversation">
        <header className="tg-conv-header">
          <button type="button" className="tg-icon-btn" onClick={leaveConversation} aria-label={t('back')}>
            <ArrowRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
          </button>
          <button type="button" className="tg-peer" onClick={openListingFromThread}>
            <img
              src={activeThread.otherAvatar || activeThread.listingImage}
              alt=""
              className="tg-peer-avatar"
              onError={(e) => {
                e.currentTarget.src = activeThread.listingImage || '/logo.jpeg'
              }}
            />
            <span className="tg-peer-meta">
              <span className="tg-peer-name">{activeThread.otherName || t('seller')}</span>
              <span className="tg-peer-status">{t('onlineListing')}</span>
            </span>
          </button>
          <button type="button" className="tg-icon-btn" aria-label={t('options')}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </header>

        <button type="button" className="tg-listing-chip" onClick={openListingFromThread}>
          <img src={activeThread.listingImage} alt="" className="tg-listing-thumb" />
          <span className="tg-listing-title">{activeThread.listingTitle}</span>
        </button>

        <div className="tg-messages" ref={listRef}>
          {messages.length === 0 && (
            <div className="tg-empty-thread">
              <p>{t('startConversation')}</p>
              <span>{t('secureAboutListing')}</span>
            </div>
          )}
          {groups.map((g) => (
            <div key={g.day} className="tg-day-group">
              <div className="tg-day-sep">
                <span>{g.day}</span>
              </div>
              {g.items.map((m) => (
                <div
                  key={m.id}
                  className={`tg-bubble-row ${m.mine ? 'is-out' : 'is-in'} ${m.failed ? 'is-failed' : ''} ${m.pending ? 'is-pending' : ''}`}
                >
                  <div className="tg-bubble">
                    <p className="tg-bubble-text">{m.text}</p>
                    <span className="tg-bubble-meta">
                      <span>{m.time}</span>
                      {m.mine && (
                        m.failed ? (
                          <span className="tg-fail-mark">!</span>
                        ) : m.pending ? (
                          <Check className="w-3.5 h-3.5 opacity-70" />
                        ) : (
                          <CheckCheck
                            className={`w-3.5 h-3.5 tg-checks ${m.seen ? 'is-seen' : ''}`}
                          />
                        )
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {sendError && <div className="tg-send-error">{sendError}</div>}

        <form
          className="tg-composer"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <button type="button" className="tg-icon-btn tg-attach" aria-label={t('attach')} disabled>
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            className="tg-input"
            placeholder={t('messagePlaceholder')}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            dir={isRtl ? 'rtl' : 'ltr'}
            autoComplete="off"
            disabled={sending}
          />
          <button
            type="submit"
            className={`tg-send ${draft.trim() ? 'is-ready' : ''}`}
            disabled={!draft.trim() || sending}
            aria-label={t('send')}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    )
  }

  /* ── Inbox list ── */
  return (
    <div className="tg-page tg-inbox">
      <SectionOrangeHeader title={t('messages')} onBack={() => goBack('profile')}>
        {chatUnreadCount > 0 && <span className="tg-inbox-badge !static">{chatUnreadCount}</span>}
        <button
          type="button"
          className="section-orange-icon"
          aria-label={t('search')}
          onClick={() => setShowSearch((v) => !v)}
        >
          {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
      </SectionOrangeHeader>
      {showSearch && (
        <div className="tg-search-wrap mx-3 mt-2">
          <Search className="w-4 h-4 text-divar-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchChats')}
            className="tg-search-input"
            dir={isRtl ? 'rtl' : 'ltr'}
            autoFocus
          />
        </div>
      )}

      {/* rest of inbox continues below - remove old header only */}
        <div className="tg-filters">
          {[
            { id: 'all', label: t('all') },
            { id: 'unread', label: t('unread') },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`tg-filter ${tab === f.id ? 'is-active' : ''}`}
              onClick={() => setTab(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

      <ul className="tg-thread-list">
        {filtered.length === 0 && (
          <li className="tg-empty-inbox">
            <p>{t('noChats')}</p>
            <span>{t('noChatsHint')}</span>
          </li>
        )}
        {filtered.map((thread) => {
          const last = lastMessage(thread)
          const preview = last?.text || '—'
          const mine = last?.from === 'me'
          return (
            <li key={thread.id}>
              <button type="button" className="tg-thread-row" onClick={() => openThread(thread.id)}>
                <div className="tg-thread-avatar-wrap">
                  <img
                    src={thread.otherAvatar || thread.listingImage}
                    alt=""
                    className="tg-thread-avatar"
                    onError={(e) => {
                      e.currentTarget.src = thread.listingImage || '/logo.jpeg'
                    }}
                  />
                </div>
                <div className="tg-thread-body">
                  <div className="tg-thread-top">
                    <span className="tg-thread-name">{thread.otherName || t('seller')}</span>
                    <span className="tg-thread-time">{thread.updated || last?.time}</span>
                  </div>
                  <div className="tg-thread-bottom">
                    <p className="tg-thread-preview">
                      {mine && <span className="tg-you">{t('you')}</span>}
                      {preview}
                    </p>
                    {(thread.unread || 0) > 0 && <span className="tg-unread">{thread.unread}</span>}
                  </div>
                  <p className="tg-thread-listing">{thread.listingTitle}</p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
