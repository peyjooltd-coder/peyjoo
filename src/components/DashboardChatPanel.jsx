import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, ChevronLeft, ExternalLink } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { categories } from '../data/mockData'

export default function DashboardChatPanel() {
  const {
    chatThreads, activeChatId, setActiveChatId, sendChatMessage, markChatRead,
    openListing, listings,
  } = useApp()

  const [draft, setDraft] = useState('')
  const listRef = useRef(null)

  const active = chatThreads.find((t) => t.id === activeChatId) || chatThreads[0]
  const cat = active ? categories.find((c) => c.id === active.listingCategory) : null

  useEffect(() => {
    if (active?.id) markChatRead(active.id)
  }, [active?.id, markChatRead])

  useEffect(() => {
    if (!activeChatId && chatThreads[0]) setActiveChatId(chatThreads[0].id)
  }, [activeChatId, chatThreads, setActiveChatId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [active?.messages?.length])

  const openAd = () => {
    const listing = listings.find((l) => l.id === active?.listingId)
    if (listing) openListing(listing)
  }

  if (chatThreads.length === 0) {
    return (
      <div className="dv-card p-12 text-center">
        <MessageCircle className="w-12 h-12 text-divar-muted mx-auto mb-3" />
        <p className="font-bold text-divar-text">No messages yet</p>
        <p className="text-sm text-divar-muted mt-2">Open any listing and tap Message in Dashboard</p>
      </div>
    )
  }

  return (
    <div className="dv-card overflow-hidden flex flex-col lg:flex-row min-h-[420px] lg:min-h-[520px]">
      {/* Thread list */}
      <div className={`w-full lg:w-[300px] border-b lg:border-b-0 lg:border-r border-divar-border-light flex flex-col ${activeChatId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="px-4 py-3 border-b border-divar-border-light bg-divar-surface-2">
          <p className="font-bold text-divar-text text-sm">Inbox</p>
          <p className="text-[11px] text-divar-muted">Chats stay in Dashboard only</p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {chatThreads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveChatId(t.id)}
              className={`w-full flex gap-3 px-4 py-3 text-left border-b border-divar-border-light hover:bg-divar-bg transition-colors ${
                active?.id === t.id ? 'bg-divar-red-soft' : ''
              }`}
            >
              <img src={t.listingImage} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-1">
                  <p className="text-sm font-semibold text-divar-text truncate">{t.otherName}</p>
                  {t.unread > 0 && (
                    <span className="min-w-[18px] h-[18px] bg-divar-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {t.unread}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-divar-muted truncate">{t.listingTitle}</p>
                <p className="text-[10px] text-divar-muted mt-0.5">{t.updated}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active chat */}
      {active && (
        <div className={`flex-1 flex flex-col min-w-0 ${!activeChatId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="px-4 py-3 border-b border-divar-border-light flex items-center gap-3 bg-divar-surface-2">
            <button type="button" onClick={() => setActiveChatId(null)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-divar-bg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <img src={active.otherAvatar} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-divar-border-light" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-divar-text truncate">{active.otherName}</p>
              <p className="text-[11px] text-divar-muted truncate flex items-center gap-1">
                {cat?.icon} {cat?.name} · {active.listingTitle}
              </p>
            </div>
            <button type="button" onClick={openAd} className="text-xs font-bold text-divar-red flex items-center gap-1 shrink-0 hover:underline">
              View ad <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-divar-bg/40 scrollbar-thin">
            <div className="text-center">
              <span className="text-[10px] font-semibold text-divar-muted bg-white px-3 py-1 rounded-full border border-divar-border-light">
                Thread for this listing only · {cat?.name}
              </span>
            </div>
            {active.messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    m.from === 'me'
                      ? 'bg-divar-red text-white rounded-br-md'
                      : 'bg-white border border-divar-border-light text-divar-text rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-white/70' : 'text-divar-muted'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="p-3 border-t border-divar-border-light flex gap-2 bg-white"
            onSubmit={(e) => {
              e.preventDefault()
              sendChatMessage(active.id, draft)
              setDraft('')
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              className="dv-search flex-1 py-2.5 px-4 text-sm"
            />
            <button type="submit" disabled={!draft.trim()} className="dv-btn-primary px-4 py-2.5 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
