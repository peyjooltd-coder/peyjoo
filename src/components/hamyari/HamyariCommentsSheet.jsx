import { useEffect, useState } from 'react'
import { Send, Trash2, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useI18n } from '../../context/I18nContext'

export default function HamyariCommentsSheet({
  post, open, onClose, comments = [], onReload, onAdd, onDelete, commenting,
}) {
  const { t, lang } = useI18n()
  const { user, isAuthenticated, setPromptLogin } = useApp()
  const isFa = lang === 'fa'
  const [text, setText] = useState('')

  useEffect(() => {
    if (!open || !post) return
    setText('')
    onReload?.(post)
  }, [open, post?.id])

  if (!open || !post) return null

  const submit = async () => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    const trimmed = text.trim()
    if (!trimmed || commenting) return
    await onAdd?.(post, trimmed)
    setText('')
  }

  const isPostOwner = user?.id && Number(user.id) === Number(post.userId)

  return (
    <div className="news-comments-backdrop" onClick={onClose} role="presentation">
      <div
        className="news-comments-panel"
        role="dialog"
        aria-label={t('hamyariComments')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="news-comments-head">
          <h3>{t('hamyariComments')}</h3>
          <button type="button" className="tg-icon-btn" onClick={onClose} aria-label={t('cancel')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="news-comments-list">
          {(comments || []).length === 0 ? (
            <p className="text-sm text-divar-muted text-center py-10">{t('hamyariNoComments')}</p>
          ) : (
            (comments || []).map((c) => {
              const canDelete = user?.id && (
                Number(user.id) === Number(c.userId) || isPostOwner
              )
              return (
                <div key={c.id} className="news-comment-row">
                  <img
                    src={c.authorAvatar || `/logo.jpeg?v=5`}
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="news-comment-top">
                      <strong>{c.authorName || (isFa ? 'کاربر' : 'User')}</strong>
                    </div>
                    <p>{c.body || c.text || ''}</p>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      className="news-comment-del"
                      onClick={() => onDelete?.(post, c)}
                      aria-label={t('hamyariDeleteComment')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="news-comment-compose">
          <img
            src={user?.avatar || '/logo.jpeg?v=5'}
            alt=""
            className="news-comment-me"
          />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isAuthenticated ? t('hamyariCommentPlaceholder') : t('newsCommentLoginHint')}
            dir="auto"
            disabled={commenting}
            onFocus={() => {
              if (!isAuthenticated) setPromptLogin(true)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
          />
          <button
            type="button"
            className="news-comment-send"
            onClick={submit}
            disabled={commenting || !text.trim()}
            aria-label={t('send')}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
