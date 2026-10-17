import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, X, Bot, ChevronLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { ASSISTANT_QUICK_PROMPTS, resolveAssistantQuery } from '../lib/pejoAssistant'
import PejoAssistantMascot from './PejoAssistantMascot'

const MASCOT_SRC = '/assistant/pejo-assistant-mascot.jpeg?v=5'

function AssistantFace({ size = 'fab' }) {
  const [imgOk, setImgOk] = useState(true)
  if (imgOk) {
    return (
      <img
        src={MASCOT_SRC}
        alt=""
        className={`pejo-assistant-face pejo-assistant-face--${size}`}
        draggable={false}
        onError={() => setImgOk(false)}
      />
    )
  }
  return <PejoAssistantMascot className={`pejo-assistant-face pejo-assistant-face--${size} is-svg`} />
}

function nowLabel(lang) {
  try {
    return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-CA', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())
  } catch {
    return ''
  }
}

export default function PejoAssistant() {
  const {
    listings, setViewTab, openCategory, openPostModal, openListing, setActiveChatId,
  } = useApp()
  const { t, lang, isRtl } = useI18n()
  const isFa = lang === 'fa'

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState([])
  const listRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    if (messages.length) return
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        text: t('assistantWelcome'),
        time: nowLabel(lang),
      },
    ])
  }, [open, messages.length, t, lang])

  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open, busy])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 160)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const goIntent = (intent) => {
    if (!intent) return
    setOpen(false)
    if (intent.view === 'post') {
      openPostModal()
      return
    }
    if (intent.view === 'chat') {
      setActiveChatId?.(null)
      setViewTab('profile')
      setTimeout(() => setViewTab('chat'), 0)
      return
    }
    if (intent.category) {
      openCategory(intent.category)
      return
    }
    if (intent.view) setViewTab(intent.view)
  }

  const ask = async (raw) => {
    const text = String(raw || '').trim()
    if (!text || busy) return
    setDraft('')
    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      time: nowLabel(lang),
    }
    setMessages((prev) => [...prev, userMsg])
    setBusy(true)

    await new Promise((r) => setTimeout(r, 320))

    const result = resolveAssistantQuery(text, { listings, lang })
    const botMsg = {
      id: `b-${Date.now()}`,
      role: 'bot',
      text: result.reply,
      time: nowLabel(lang),
      intent: result.intent,
      listings: result.listings || [],
    }
    setMessages((prev) => [...prev, botMsg])
    setBusy(false)
  }

  const quick = ASSISTANT_QUICK_PROMPTS[isFa ? 'fa' : 'en']

  return (
    <>
      {!open && (
        <button
          type="button"
          className="pejo-assistant-fab"
          aria-label={t('assistant')}
          onClick={() => setOpen(true)}
        >
          <AssistantFace size="fab" />
          <span className="pejo-assistant-fab-ring" aria-hidden />
          <span className="pejo-assistant-fab-pulse" aria-hidden />
        </button>
      )}

      {open && (
        <div className="pejo-assistant-overlay" role="presentation">
          <div
            className="pejo-assistant-sheet pejo-assistant-sheet--fullscreen"
            role="dialog"
            aria-modal="true"
            aria-label={t('assistant')}
          >
            <header className="pejo-assistant-head">
              <button
                type="button"
                className="pejo-assistant-back"
                onClick={() => setOpen(false)}
                aria-label={t('cancel')}
              >
                <ChevronLeft className={`w-6 h-6${isRtl ? ' rotate-180' : ''}`} strokeWidth={2.4} />
              </button>
              <div className="pejo-assistant-brand">
                <span className="pejo-assistant-avatar pejo-assistant-avatar--lg">
                  <AssistantFace size="header" />
                </span>
                <div className="pejo-assistant-brand-copy">
                  <strong>{t('assistant')}</strong>
                  <p>
                    <span className="pejo-assistant-online" aria-hidden />
                    {t('assistantOnline')}
                  </p>
                </div>
              </div>
              <span className="pejo-assistant-ai-badge" title={t('assistantHint')}>
                <Bot className="w-3.5 h-3.5" strokeWidth={2.4} />
                AI
              </span>
            </header>

            <div className="pejo-assistant-hero">
              <Sparkles className="w-4 h-4" />
              <span>{t('assistantHint')}</span>
            </div>

            <div className="pejo-assistant-messages" ref={listRef}>
              {messages.map((m) => (
                <div key={m.id} className={`pejo-assistant-bubble-row is-${m.role}`}>
                  {m.role === 'bot' && (
                    <span className="pejo-assistant-msg-avatar" aria-hidden>
                      <AssistantFace size="header" />
                    </span>
                  )}
                  <div className="pejo-assistant-bubble">
                    <p>{m.text}</p>
                    {!!m.listings?.length && (
                      <div className="pejo-assistant-results">
                        {m.listings.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            className="pejo-assistant-listing"
                            onClick={() => {
                              setOpen(false)
                              openListing(l)
                            }}
                          >
                            <img src={l.image} alt="" />
                            <span>
                              <strong>{l.title}</strong>
                              <em>{l.priceLabel}</em>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {m.intent && (
                      <button
                        type="button"
                        className="pejo-assistant-cta"
                        onClick={() => goIntent(m.intent)}
                      >
                        <Sparkles className="w-4 h-4" />
                        {t('assistantGoTo').replace(
                          '{place}',
                          isFa ? (m.intent.titleFa || m.intent.titleEn) : (m.intent.titleEn || m.intent.titleFa),
                        )}
                      </button>
                    )}
                    <span className="pejo-assistant-time">{m.time}</span>
                  </div>
                </div>
              ))}
              {busy && (
                <div className="pejo-assistant-bubble-row is-bot">
                  <span className="pejo-assistant-msg-avatar" aria-hidden>
                    <AssistantFace size="header" />
                  </span>
                  <div className="pejo-assistant-bubble is-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
            </div>

            <div className="pejo-assistant-footer">
              <div className="pejo-assistant-quick">
                {quick.map((q) => (
                  <button key={q} type="button" onClick={() => ask(q)} disabled={busy}>
                    {q}
                  </button>
                ))}
              </div>

              <form
                className="pejo-assistant-composer"
                onSubmit={(e) => {
                  e.preventDefault()
                  ask(draft)
                }}
              >
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('assistantPlaceholder')}
                  disabled={busy}
                />
                <button type="submit" disabled={busy || !draft.trim()} aria-label={t('send')}>
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
