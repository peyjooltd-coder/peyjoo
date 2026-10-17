import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, CheckCheck, MessageCircle, Search, Send, X,
} from 'lucide-react'
import { useI18n } from '../../context/I18nContext'
import { apiClient } from '../../api/client'

function lastMessage(thread) {
  const msgs = thread.messages || []
  return msgs[msgs.length - 1] || null
}

export default function DatingMessenger({
  isAuthenticated,
  onNeedLogin,
  openThreadId,
  onOpenThreadConsumed,
}) {
  const { t, isRtl } = useI18n()
  const [threads, setThreads] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const listRef = useRef(null)

  const activeThread = useMemo(
    () => threads.find((th) => th.id === activeId) || null,
    [threads, activeId],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = [...threads]
    if (q) {
      list = list.filter(
        (th) =>
          (th.otherName || '').toLowerCase().includes(q) ||
          (lastMessage(th)?.text || '').toLowerCase().includes(q),
      )
    }
    list.sort((a, b) => {
      const ua = (a.unread || 0) > 0 ? 1 : 0
      const ub = (b.unread || 0) > 0 ? 1 : 0
      if (ub !== ua) return ub - ua
      return String(b.updated || '').localeCompare(String(a.updated || ''))
    })
    return list
  }, [threads, query])

  const unreadTotal = useMemo(
    () => threads.reduce((sum, th) => sum + (th.unread || 0), 0),
    [threads],
  )

  const refresh = async () => {
    if (!isAuthenticated) {
      setThreads([])
      setLoading(false)
      return
    }
    try {
      const { threads: next } = await apiClient.getDatingThreads()
      setThreads(next || [])
      setError(null)
    } catch (e) {
      setError(e.message || t('datingLoadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    if (!isAuthenticated) return undefined
    const id = setInterval(refresh, 8000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    if (!openThreadId) return
    setActiveId(openThreadId)
    setDraft('')
    apiClient.markDatingThreadRead(openThreadId).catch(() => {})
    setThreads((prev) =>
      prev.map((th) => (th.id === openThreadId ? { ...th, unread: 0 } : th)),
    )
    onOpenThreadConsumed?.()
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openThreadId])

  useEffect(() => {
    if (!activeId) return undefined
    apiClient.markDatingThreadRead(activeId).catch(() => {})
    setThreads((prev) =>
      prev.map((th) => (th.id === activeId ? { ...th, unread: 0 } : th)),
    )
    return undefined
  }, [activeId])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [activeThread?.messages?.length, activeId])

  const openThread = (id) => {
    setActiveId(id)
    setDraft('')
    setError(null)
  }

  const send = async () => {
    if (!activeId || !draft.trim() || sending) return
    const text = draft.trim()
    setDraft('')
    setSending(true)
    try {
      const { thread } = await apiClient.sendDatingMessage(activeId, text)
      setThreads((prev) => {
        const rest = prev.filter((th) => th.id !== thread.id)
        return [thread, ...rest]
      })
    } catch (e) {
      setError(e.message || t('sendFailed'))
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="dating-msg-panel dating-msg-empty">
        <MessageCircle className="w-10 h-10 text-divar-muted" />
        <h2>{t('datingMessenger')}</h2>
        <p>{t('datingMessengerLogin')}</p>
        <button type="button" className="home-btn-primary" onClick={onNeedLogin}>
          {t('loginRegister')}
        </button>
      </div>
    )
  }

  if (activeThread) {
    const messages = activeThread.messages || []
    return (
      <div className="dating-msg-panel dating-msg-conv">
        <header className="dating-msg-conv-head">
          <button
            type="button"
            className="tg-icon-btn"
            onClick={() => setActiveId(null)}
            aria-label={t('back')}
          >
            <ArrowRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
          </button>
          <div className="dating-msg-peer">
            <img
              src={activeThread.otherAvatar || `/logo.jpeg?v=5`}
              alt=""
            />
            <div>
              <strong>{activeThread.otherName}</strong>
              <span>{t('datingMessengerHint')}</span>
            </div>
          </div>
        </header>

        <div className="dating-msg-messages" ref={listRef}>
          {messages.length === 0 && (
            <div className="dating-msg-empty-thread">
              <p>{t('startConversation')}</p>
            </div>
          )}
          {messages.map((m) => {
            const mine = m.from === 'me'
            return (
              <div key={m.id} className={`dating-msg-bubble-row ${mine ? 'is-out' : 'is-in'}`}>
                <div className="dating-msg-bubble">
                  <p>{m.text}</p>
                  <span>
                    {m.time}
                    {mine && <CheckCheck className="w-3.5 h-3.5" />}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {error && <div className="dating-msg-error">{error}</div>}

        <form
          className="dating-msg-composer"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('messagePlaceholder')}
            dir={isRtl ? 'rtl' : 'ltr'}
            autoComplete="off"
          />
          <button type="submit" disabled={sending || !draft.trim()} aria-label={t('send')}>
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="dating-msg-panel">
      <div className="dating-msg-inbox-head">
        <h2>{t('datingMessenger')}</h2>
        {unreadTotal > 0 && <span className="dating-msg-badge">{unreadTotal}</span>}
      </div>
      <div className="dating-msg-search">
        <Search className="w-4 h-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchChats')}
          dir={isRtl ? 'rtl' : 'ltr'}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label={t('cancel')}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading && <p className="dating-list-empty">{t('loading')}</p>}
      {!loading && filtered.length === 0 && (
        <div className="dating-msg-empty">
          <MessageCircle className="w-9 h-9 text-divar-muted" />
          <p>{t('datingMessengerEmpty')}</p>
          <span>{t('datingMessengerEmptyHint')}</span>
        </div>
      )}

      <div className="dating-msg-thread-list">
        {filtered.map((th) => {
          const last = lastMessage(th)
          return (
            <button
              key={th.id}
              type="button"
              className="dating-msg-thread"
              onClick={() => openThread(th.id)}
            >
              <img
                src={th.otherAvatar || `/logo.jpeg?v=5`}
                alt=""
              />
              <div className="dating-msg-thread-meta">
                <div className="dating-msg-thread-top">
                  <strong>{th.otherName}</strong>
                  <span>{th.updated}</span>
                </div>
                <p className={(th.unread || 0) > 0 ? 'is-unread' : ''}>
                  {last?.from === 'me' ? `${t('you')}${last?.text || ''}` : (last?.text || '')}
                </p>
              </div>
              {(th.unread || 0) > 0 && <span className="dating-msg-dot">{th.unread}</span>}
            </button>
          )
        })}
      </div>
      {/* expose unread for parent via data attribute */}
      <span hidden data-dating-unread={unreadTotal} />
    </div>
  )
}

export function useDatingUnread(isAuthenticated) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0)
      return undefined
    }
    let cancelled = false
    const tick = async () => {
      try {
        const { threads } = await apiClient.getDatingThreads()
        if (cancelled) return
        setCount((threads || []).reduce((s, th) => s + (th.unread || 0), 0))
      } catch {
        /* ignore */
      }
    }
    tick()
    const id = setInterval(tick, 12000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [isAuthenticated])
  return count
}
