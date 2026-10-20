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

export default function HamyariMessenger({
  isAuthenticated,
  onNeedLogin,
  openThreadId,
  onOpenThreadConsumed,
  onBackToMenu,
  onChatOpenChange,
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

  useEffect(() => {
    onChatOpenChange?.(Boolean(activeId))
  }, [activeId, onChatOpenChange])

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
    return list
  }, [threads, query])

  const refresh = async () => {
    if (!isAuthenticated) {
      setThreads([])
      setLoading(false)
      return
    }
    try {
      const { threads: next } = await apiClient.getHamyariThreads()
      setThreads(next || [])
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    if (!isAuthenticated) return undefined
    const id = setInterval(refresh, 10000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    if (!openThreadId) return
    setActiveId(openThreadId)
    onOpenThreadConsumed?.()
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openThreadId])

  useEffect(() => {
    if (!activeId) return
    apiClient.markHamyariThreadRead(activeId).catch(() => {})
    setThreads((prev) => prev.map((th) => (th.id === activeId ? { ...th, unread: 0 } : th)))
  }, [activeId])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [activeThread?.messages?.length, activeId])

  const send = async () => {
    if (!activeId || !draft.trim() || sending) return
    const text = draft.trim()
    setDraft('')
    setSending(true)
    try {
      const { thread } = await apiClient.sendHamyariMessage(activeId, text)
      setThreads((prev) => [thread, ...prev.filter((th) => th.id !== thread.id)])
    } catch (e) {
      setError(e.message || t('sendFailed'))
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="hamyari-msg-panel">
        <div className="hamyari-msg-inbox-head">
          <button type="button" className="hamyari-msg-back-menu" onClick={onBackToMenu}>
            <ArrowRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
            <span>{t('hamyariBackToMenu')}</span>
          </button>
          <h2>{t('hamyariMessenger')}</h2>
        </div>
        <div className="hamyari-msg-empty">
          <MessageCircle className="w-10 h-10 text-divar-muted" />
          <h2>{t('hamyariMessenger')}</h2>
          <p>{t('hamyariMessengerLogin')}</p>
          <button type="button" className="home-btn-primary" onClick={onNeedLogin}>
            {t('loginRegister')}
          </button>
        </div>
      </div>
    )
  }

  if (activeThread) {
    return (
      <div className="hamyari-msg-panel hamyari-msg-conv">
        <header className="hamyari-msg-conv-head">
          <button type="button" className="tg-icon-btn" onClick={() => setActiveId(null)} aria-label={t('back')}>
            <ArrowRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
          </button>
          <div className="hamyari-msg-peer">
            <img src={activeThread.otherAvatar || `/logo.jpeg?v=6`} alt="" />
            <div>
              <strong>{activeThread.otherName}</strong>
              <span>{t('hamyariMessengerHint')}</span>
            </div>
          </div>
        </header>
        <button type="button" className="hamyari-msg-back-bar" onClick={onBackToMenu}>
          <ArrowRight className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
          <span>{t('hamyariBackToMenu')}</span>
        </button>
        <div className="hamyari-msg-messages" ref={listRef}>
          {(activeThread.messages || []).map((m) => (
            <div key={m.id} className={`hamyari-msg-bubble-row ${m.from === 'me' ? 'is-out' : 'is-in'}`}>
              <div className="hamyari-msg-bubble">
                <p>{m.text}</p>
                <span>{m.time}{m.from === 'me' && <CheckCheck className="w-3.5 h-3.5" />}</span>
              </div>
            </div>
          ))}
        </div>
        {error && <div className="hamyari-msg-error">{error}</div>}
        <form
          className="hamyari-msg-composer"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('messagePlaceholder')}
            dir={isRtl ? 'rtl' : 'ltr'}
            autoComplete="off"
            enterKeyHint="send"
          />
          <button
            type="submit"
            className={`hamyari-msg-send ${draft.trim() ? 'is-ready' : ''}`}
            disabled={sending || !draft.trim()}
            aria-label={t('send')}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="hamyari-msg-panel">
      <div className="hamyari-msg-inbox-head">
        <button type="button" className="hamyari-msg-back-menu" onClick={onBackToMenu}>
          <ArrowRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
          <span>{t('hamyariBackToMenu')}</span>
        </button>
        <h2>{t('hamyariMessenger')}</h2>
      </div>
      <div className="hamyari-msg-search">
        <Search className="w-4 h-4" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchChats')} />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label={t('cancel')}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {loading && <p className="dating-list-empty">{t('loading')}</p>}
      {!loading && filtered.length === 0 && (
        <div className="hamyari-msg-empty">
          <MessageCircle className="w-9 h-9 text-divar-muted" />
          <p>{t('hamyariMessengerEmpty')}</p>
        </div>
      )}
      <div className="hamyari-msg-thread-list">
        {filtered.map((th) => {
          const last = lastMessage(th)
          return (
            <button key={th.id} type="button" className="hamyari-msg-thread" onClick={() => setActiveId(th.id)}>
              <img src={th.otherAvatar || `/logo.jpeg?v=6`} alt="" />
              <div className="hamyari-msg-thread-meta">
                <div className="hamyari-msg-thread-top">
                  <strong>{th.otherName}</strong>
                  <span>{th.updated}</span>
                </div>
                <p>{last?.from === 'me' ? `${t('you')}${last?.text || ''}` : (last?.text || '')}</p>
              </div>
              {(th.unread || 0) > 0 && <span className="hamyari-msg-dot">{th.unread}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function useHamyariUnread(isAuthenticated) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0)
      return undefined
    }
    let cancelled = false
    const tick = async () => {
      try {
        const { threads } = await apiClient.getHamyariThreads()
        if (!cancelled) {
          setCount((threads || []).reduce((s, th) => s + (th.unread || 0), 0))
        }
      } catch { /* ignore */ }
    }
    tick()
    const id = setInterval(tick, 15000)
    return () => { cancelled = true; clearInterval(id) }
  }, [isAuthenticated])
  return count
}
