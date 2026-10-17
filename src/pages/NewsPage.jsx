import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ExternalLink, Globe2, Heart, MessageCircle, MoreHorizontal, Play, Repeat2, Send, ThumbsUp,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { apiClient } from '../api/client'
import SectionOrangeHeader from '../components/mobile/SectionOrangeHeader'
import NewsShareSheet from '../components/NewsShareSheet'
import NewsCommentsSheet from '../components/NewsCommentsSheet'
import NewsAuthorSheet from '../components/NewsAuthorSheet'

const LIKES_KEY = 'pejo_news_likes'
const REPOSTS_KEY = 'pejo_news_reposts'
const COMMENT_COUNTS_KEY = 'pejo_news_comment_counts'

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function formatNewsTime(value, isFa) {
  if (!value) return ''
  const d = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 16)
  try {
    return new Intl.DateTimeFormat(isFa ? 'fa-IR' : 'en-CA', {
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return String(value).slice(0, 10)
  }
}

function NewsMedia({ item }) {
  const [playing, setPlaying] = useState(false)

  if (item.mediaType === 'video' && item.mediaUrl) {
    return (
      <div className="li-news-media li-news-media--video">
        {playing ? (
          <video
            src={item.mediaUrl}
            poster={item.poster || undefined}
            controls
            playsInline
            autoPlay
            className="li-news-media-el"
          />
        ) : (
          <button type="button" className="li-news-video-cover" onClick={() => setPlaying(true)}>
            <img src={item.poster || item.mediaUrl} alt="" />
            <span className="li-news-play" aria-hidden>
              <Play className="w-7 h-7 fill-white" />
            </span>
          </button>
        )}
      </div>
    )
  }

  if (item.mediaType === 'image' && item.mediaUrl) {
    return (
      <div className="li-news-media">
        <img src={item.mediaUrl} alt="" className="li-news-media-el" loading="lazy" />
      </div>
    )
  }

  return null
}

function NewsSponsorCard({ sponsor, isFa, onOpen, compact = false }) {
  const title = isFa ? sponsor.titleFa : sponsor.titleEn
  const body = isFa ? sponsor.bodyFa : sponsor.bodyEn
  const cta = isFa ? sponsor.ctaFa : sponsor.ctaEn

  return (
    <button
      type="button"
      className={`news-sponsor-card ${compact ? 'is-compact' : ''} is-${sponsor.placement || 'inline'}`}
      onClick={() => onOpen(sponsor)}
    >
      <span className="news-sponsor-badge">{isFa ? 'اسپانسر' : 'Sponsored'}</span>
      <div className="news-sponsor-body">
        {sponsor.imageUrl ? (
          <img src={sponsor.imageUrl} alt="" className="news-sponsor-img" />
        ) : null}
        <div className="news-sponsor-copy">
          <strong>{title}</strong>
          {body ? <p>{body}</p> : null}
          <span className="news-sponsor-cta">
            {cta}
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </button>
  )
}

function NewsPostCard({
  item, isFa, t, liked, reposted, commentCount, shareCount,
  onToggleLike, onComment, onRepost, onShare, onOpen, onOpenAuthor,
}) {
  const likes = (item.likes || 0) + (liked ? 1 : 0)
  const comments = commentCount ?? item.comments
  const shares = shareCount ?? item.shares

  return (
    <article className={`li-news-card ${reposted ? 'is-reposted' : ''}`}>
      {reposted && (
        <p className="li-news-repost-label">
          <Repeat2 className="w-3.5 h-3.5" />
          {t('newsYouReposted')}
        </p>
      )}
      <header className="li-news-head">
        <button type="button" className="li-news-author-btn" onClick={onOpenAuthor}>
          <img src={item.avatar || '/logo.jpeg'} alt="" className="li-news-avatar" />
          <div className="li-news-meta">
            <strong>{isFa ? item.authorFa : item.authorEn}</strong>
            <span>{isFa ? item.roleFa : item.roleEn}</span>
            <span className="li-news-time">
              {formatNewsTime(item.createdAt || item.timeFa || item.timeEn, isFa)}
              {' · '}
              <Globe2 className="w-3 h-3 inline" />
            </span>
          </div>
        </button>
        <button type="button" className="li-news-more" aria-label={t('more')} onClick={onShare}>
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      <button type="button" className="li-news-copy" onClick={onOpen}>
        <h2>{isFa ? item.titleFa : item.titleEn}</h2>
        <p>{isFa ? item.bodyFa : item.bodyEn}</p>
      </button>

      <NewsMedia item={item} />

      <div className="li-news-stats">
        <span>
          <ThumbsUp className="w-3.5 h-3.5" />
          {likes.toLocaleString(isFa ? 'fa-IR' : 'en-CA')}
        </span>
        <button type="button" className="li-news-stats-link" onClick={onComment}>
          {(comments || 0).toLocaleString(isFa ? 'fa-IR' : 'en-CA')} {t('newsComments')}
          {' · '}
          {(shares || 0).toLocaleString(isFa ? 'fa-IR' : 'en-CA')} {t('newsShares')}
        </button>
      </div>

      <div className="li-news-actions">
        <button type="button" className={liked ? 'is-on' : ''} onClick={onToggleLike}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {t('newsLike')}
        </button>
        <button type="button" onClick={onComment}>
          <MessageCircle className="w-4 h-4" />
          {t('newsComment')}
        </button>
        <button type="button" className={reposted ? 'is-on' : ''} onClick={onRepost}>
          <Repeat2 className="w-4 h-4" />
          {t('newsRepost')}
        </button>
        <button type="button" onClick={onShare}>
          <Send className="w-4 h-4" />
          {t('share')}
        </button>
      </div>
    </article>
  )
}

export default function NewsPage() {
  const { setViewTab, openCategory, isAuthenticated, setPromptLogin } = useApp()
  const { t, lang } = useI18n()
  const isFa = lang === 'fa'
  const [posts, setPosts] = useState([])
  const [heroSponsors, setHeroSponsors] = useState([])
  const [inlineSponsors, setInlineSponsors] = useState([])
  const [footerSponsors, setFooterSponsors] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedMap, setLikedMap] = useState(() => loadJson(LIKES_KEY, {}))
  const [repostedMap, setRepostedMap] = useState(() => loadJson(REPOSTS_KEY, {}))
  const [commentCounts, setCommentCounts] = useState(() => loadJson(COMMENT_COUNTS_KEY, {}))
  const [shareBump, setShareBump] = useState({})
  const [commentPost, setCommentPost] = useState(null)
  const [sharePost, setSharePost] = useState(null)
  const [authorPost, setAuthorPost] = useState(null)
  const [toast, setToast] = useState('')

  const loadFeed = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.getNewsFeed()
      setPosts(data.posts || [])
      setHeroSponsors(data.heroSponsors || [])
      setInlineSponsors(data.inlineSponsors || [])
      setFooterSponsors(data.footerSponsors || [])
    } catch {
      setPosts([])
      setHeroSponsors([])
      setInlineSponsors([])
      setFooterSponsors([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFeed()
  }, [loadFeed])

  useEffect(() => {
    try { localStorage.setItem(LIKES_KEY, JSON.stringify(likedMap)) } catch { /* ignore */ }
  }, [likedMap])

  useEffect(() => {
    try { localStorage.setItem(REPOSTS_KEY, JSON.stringify(repostedMap)) } catch { /* ignore */ }
  }, [repostedMap])

  useEffect(() => {
    try { localStorage.setItem(COMMENT_COUNTS_KEY, JSON.stringify(commentCounts)) } catch { /* ignore */ }
  }, [commentCounts])

  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(id)
  }, [toast])

  const openRelated = (tag) => {
    if (!tag) return
    if (tag === 'hamyari') setViewTab('hamyari')
    else if (tag === 'jobs') openCategory('jobs')
    else if (tag === 'real-estate') openCategory('real-estate')
    else if (tag === 'dating') setViewTab('dating')
    else setViewTab('explore')
  }

  const openSponsor = (sponsor) => {
    if (sponsor.linkUrl) {
      window.open(sponsor.linkUrl, '_blank', 'noopener,noreferrer')
      return
    }
    openRelated(sponsor.linkTag)
  }

  const requireAuth = (fn) => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    fn()
  }

  const toggleRepost = (item) => {
    requireAuth(() => {
      setRepostedMap((m) => {
        const nextOn = !m[item.id]
        setShareBump((b) => ({ ...b, [item.id]: (b[item.id] || 0) + (nextOn ? 1 : -1) }))
        setToast(nextOn ? t('newsReposted') : t('newsRepostRemoved'))
        return { ...m, [item.id]: nextOn }
      })
    })
  }

  const feedBlocks = useMemo(() => {
    const blocks = []
    posts.forEach((post, index) => {
      blocks.push({ type: 'post', post })
      if (inlineSponsors.length && (index + 1) % 2 === 0) {
        const sponsor = inlineSponsors[Math.floor(index / 2) % inlineSponsors.length]
        if (sponsor) blocks.push({ type: 'sponsor', sponsor })
      }
    })
    return blocks
  }, [posts, inlineSponsors])

  return (
    <div className="mobile-page news-page li-news-page">
      <SectionOrangeHeader title={t('news')} onBack={() => setViewTab('home')} />

      <div className="li-news-feed">
        {heroSponsors.map((sponsor) => (
          <NewsSponsorCard
            key={`hero-${sponsor.id}`}
            sponsor={sponsor}
            isFa={isFa}
            onOpen={openSponsor}
          />
        ))}

        {loading && <p className="dating-list-empty">{t('pleaseWait')}</p>}
        {!loading && posts.length === 0 && (
          <p className="dating-list-empty">{t('newsEmpty')}</p>
        )}

        {feedBlocks.map((block) => (
          block.type === 'sponsor' ? (
            <NewsSponsorCard
              key={`inline-${block.sponsor.id}-${block.sponsor.sortOrder}`}
              sponsor={block.sponsor}
              isFa={isFa}
              onOpen={openSponsor}
              compact
            />
          ) : (
            <NewsPostCard
              key={block.post.id}
              item={block.post}
              isFa={isFa}
              t={t}
              liked={!!likedMap[block.post.id]}
              reposted={!!repostedMap[block.post.id]}
              commentCount={commentCounts[block.post.id] ?? block.post.comments}
              shareCount={Math.max(0, (block.post.shares || 0) + (shareBump[block.post.id] || 0))}
              onToggleLike={() => setLikedMap((m) => ({ ...m, [block.post.id]: !m[block.post.id] }))}
              onComment={() => setCommentPost(block.post)}
              onRepost={() => toggleRepost(block.post)}
              onShare={() => setSharePost(block.post)}
              onOpenAuthor={() => setAuthorPost(block.post)}
              onOpen={() => openRelated(block.post.tag)}
            />
          )
        ))}

        {footerSponsors.length > 0 && (
          <div className="news-sponsor-footer">
            <p className="news-sponsor-footer-title">{isFa ? 'بخش اسپانسر' : 'Sponsored'}</p>
            {footerSponsors.map((sponsor) => (
              <NewsSponsorCard
                key={`footer-${sponsor.id}`}
                sponsor={sponsor}
                isFa={isFa}
                onOpen={openSponsor}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {toast ? <div className="news-toast">{toast}</div> : null}

      <NewsCommentsSheet
        post={commentPost}
        open={!!commentPost}
        onClose={() => setCommentPost(null)}
        onCountChange={(id, count) => setCommentCounts((m) => ({ ...m, [id]: count }))}
      />
      <NewsShareSheet
        post={sharePost}
        open={!!sharePost}
        onClose={() => setSharePost(null)}
        onShared={(kind) => {
          if (!sharePost) return
          setShareBump((b) => ({ ...b, [sharePost.id]: (b[sharePost.id] || 0) + 1 }))
          if (kind === 'inapp') setToast(t('shareSent'))
        }}
      />
      <NewsAuthorSheet
        post={authorPost}
        open={!!authorPost}
        onClose={() => setAuthorPost(null)}
      />
    </div>
  )
}
