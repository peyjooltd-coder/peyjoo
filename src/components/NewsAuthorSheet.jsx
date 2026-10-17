import { MessageCircle, BadgeCheck, X } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useApp } from '../context/AppContext'
import { apiClient } from '../api/client'
import { newsShareUrl } from '../lib/shareNews'

function resolveContactListing(authorPost, listings) {
  if (!listings?.length) return null
  const nameFa = authorPost.authorFa
  const nameEn = authorPost.authorEn
  const byName = listings.find((l) => l.seller === nameFa || l.seller === nameEn)
  if (byName) return byName

  const tagToCategory = {
    jobs: 'jobs',
    'real-estate': 'real-estate',
    explore: 'electronics',
    community: 'services',
    hamyari: 'services',
  }
  const cat = tagToCategory[authorPost.tag]
  if (cat) {
    const hit = listings.find((l) => l.category === cat && !l.isMine)
    if (hit) return hit
  }
  return listings.find((l) => !l.isMine) || listings[0] || null
}

export default function NewsAuthorSheet({ post, open, onClose }) {
  const { t, lang } = useI18n()
  const {
    listings, isAuthenticated, setPromptLogin, setChatThreads,
    setActiveChatId, pushView,
  } = useApp()
  const isFa = lang === 'fa'

  if (!open || !post) return null

  const name = isFa ? post.authorFa : post.authorEn
  const role = isFa ? post.roleFa : post.roleEn
  const title = isFa ? post.titleFa : post.titleEn

  const messageAuthor = async () => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    const listing = resolveContactListing(post, listings)
    if (!listing) {
      window.alert(t('newsAuthorNoChat'))
      return
    }
    const intro = isFa
      ? `سلام، درباره خبر «${title}» پیام می‌دهم.\n${newsShareUrl(post.id)}`
      : `Hi — messaging about your news «${title}».\n${newsShareUrl(post.id)}`
    try {
      const { thread } = await apiClient.startChat(listing.id, intro)
      setChatThreads((prev) => {
        const exists = prev.find((x) => x.id === thread.id)
        if (exists) return [thread, ...prev.filter((x) => x.id !== thread.id)]
        return [thread, ...prev]
      })
      setActiveChatId(thread.id)
      onClose?.()
      pushView('chat')
    } catch (e) {
      window.alert(e.message || t('sendFailed'))
    }
  }

  return (
    <div className="ig-share-backdrop" onClick={onClose} role="presentation">
      <div
        className="news-author-sheet"
        role="dialog"
        aria-label={name}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ig-share-handle" />
        <button type="button" className="news-author-close" onClick={onClose} aria-label={t('cancel')}>
          <X className="w-5 h-5" />
        </button>
        <img src={post.avatar} alt="" className="news-author-avatar" />
        <h3 className="news-author-name">
          {name}
          <BadgeCheck className="w-4 h-4 text-divar-red inline ms-1" />
        </h3>
        <p className="news-author-role">{role}</p>
        <p className="news-author-bio">{t('newsAuthorBio')}</p>
        <div className="news-author-post-preview">
          <p className="news-author-post-label">{t('newsLatestPost')}</p>
          <p className="news-author-post-title">{title}</p>
        </div>
        <button type="button" className="post-submit-btn !w-full !mx-0" onClick={messageAuthor}>
          <MessageCircle className="w-4 h-4 inline me-1" />
          {t('newsMessageAuthor')}
        </button>
      </div>
    </div>
  )
}
