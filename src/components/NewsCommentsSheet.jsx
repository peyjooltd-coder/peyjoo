import { useEffect, useState } from 'react'
import { Send, Trash2, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { PEJO_DEFAULT_AVATAR, userAvatar } from '../lib/defaultAvatar'

const STORAGE_KEY = 'pejo_news_comments'

const SEED = {
  n1: [
    { id: 'c1', name: 'سارا', nameEn: 'Sara', avatar: PEJO_DEFAULT_AVATAR, textFa: 'عالی بود، ممنون از آپدیت بازار!', textEn: 'Great update on the market!', timeFa: '۱ س', timeEn: '1h', mine: false },
    { id: 'c2', name: 'رضا', nameEn: 'Reza', avatar: PEJO_DEFAULT_AVATAR, textFa: 'آگهی خودروها امروز خیلی خوبه.', textEn: 'Car listings look strong today.', timeFa: '۴۰ د', timeEn: '40m', mine: false },
  ],
  n2: [
    { id: 'c3', name: 'مینا', nameEn: 'Mina', avatar: PEJO_DEFAULT_AVATAR, textFa: 'برای رستوران هنوز نیرو می‌خواید؟', textEn: 'Still hiring for restaurants?', timeFa: '۲ س', timeEn: '2h', mine: false },
  ],
  n3: [
    { id: 'c4', name: 'امیر', nameEn: 'Amir', avatar: PEJO_DEFAULT_AVATAR, textFa: 'ویدیو خیلی قشنگ بود 👏', textEn: 'Loved the video 👏', timeFa: '۵ س', timeEn: '5h', mine: false },
  ],
  n4: [
    { id: 'c5', name: 'لیلا', nameEn: 'Leila', avatar: PEJO_DEFAULT_AVATAR, textFa: 'همیاری این هفته عالی پیش رفته.', textEn: 'Mutual Aid looks strong this week.', timeFa: '۱ روز', timeEn: '1d', mine: false },
  ],
  n5: [
    { id: 'c6', name: 'نیما', nameEn: 'Nima', avatar: PEJO_DEFAULT_AVATAR, textFa: 'نکته پارکینگ خیلی مهمه 👍', textEn: 'Parking tip is so important 👍', timeFa: '۶ س', timeEn: '6h', mine: false },
  ],
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...SEED }
    const parsed = JSON.parse(raw)
    return { ...SEED, ...parsed }
  } catch {
    return { ...SEED }
  }
}

function saveAll(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch { /* ignore */ }
}

export default function NewsCommentsSheet({ post, open, onClose, onCountChange }) {
  const { t, lang } = useI18n()
  const { user, isAuthenticated, setPromptLogin } = useApp()
  const isFa = lang === 'fa'
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    if (!open || !post) return
    const all = loadAll()
    const list = all[post.id] || []
    setComments(list)
    setText('')
    onCountChange?.(post.id, list.length)
  }, [open, post])

  if (!open || !post) return null

  const persist = (next) => {
    setComments(next)
    const all = loadAll()
    all[post.id] = next
    saveAll(all)
    onCountChange?.(post.id, next.length)
  }

  const submit = () => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    const trimmed = text.trim()
    if (!trimmed) return
    const entry = {
      id: `c-${Date.now()}`,
      name: user?.name || (isFa ? 'من' : 'Me'),
      nameEn: user?.name || 'Me',
      avatar: userAvatar(user?.avatar),
      textFa: trimmed,
      textEn: trimmed,
      timeFa: 'الان',
      timeEn: 'now',
      mine: true,
    }
    persist([entry, ...comments])
    setText('')
  }

  return (
    <div className="news-comments-backdrop" onClick={onClose} role="presentation">
      <div
        className="news-comments-panel"
        role="dialog"
        aria-label={t('newsCommentsTitle')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="news-comments-head">
          <h3>{t('newsCommentsTitle')}</h3>
          <button type="button" className="tg-icon-btn" onClick={onClose} aria-label={t('cancel')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="news-comments-list">
          {comments.length === 0 ? (
            <p className="text-sm text-divar-muted text-center py-10">{t('newsNoComments')}</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="news-comment-row">
                <img src={c.avatar} alt="" />
                <div className="flex-1 min-w-0">
                  <div className="news-comment-top">
                    <strong>{isFa ? c.name : (c.nameEn || c.name)}</strong>
                    <span>{isFa ? c.timeFa : c.timeEn}</span>
                  </div>
                  <p>{isFa ? c.textFa : c.textEn}</p>
                </div>
                {c.mine && (
                  <button
                    type="button"
                    className="news-comment-del"
                    onClick={() => persist(comments.filter((x) => x.id !== c.id))}
                    aria-label={t('hamyariDeleteComment')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="news-comment-compose">
          <img
            src={userAvatar(user?.avatar)}
            alt=""
            className="news-comment-me"
          />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isAuthenticated ? t('newsWriteComment') : t('newsCommentLoginHint')}
            dir="auto"
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
            disabled={!text.trim()}
            aria-label={t('send')}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
