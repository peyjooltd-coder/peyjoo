import { useState } from 'react'
import {
  Globe2, Heart, MessageCircle, Pencil, Play, Send, ThumbsUp, Trash2,
} from 'lucide-react'
import { postMediaList } from '../MediaSlide'
import GallerySideNav from '../GallerySideNav'

function formatRelative(value, isFa) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return isFa ? 'الان' : 'now'
  if (mins < 60) return isFa ? `${mins} د` : `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return isFa ? `${hrs} س` : `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return isFa ? `${days} روز` : `${days}d`
  try {
    return new Intl.DateTimeFormat(isFa ? 'fa-IR' : 'en-CA', {
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return String(value).slice(0, 10)
  }
}

function HamyariMedia({ post }) {
  const media = postMediaList(post)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const current = media[index] || media[0]

  if (!current) return null

  const nav = (
    <GallerySideNav
      count={media.length}
      index={index}
      onIndex={(next) => {
        setPlaying(false)
        setIndex(next)
      }}
    />
  )

  if (current.type === 'video') {
    return (
      <div className="li-news-media li-news-media--video">
        {playing ? (
          <video
            key={current.url}
            src={current.url}
            poster={current.poster || undefined}
            controls
            playsInline
            autoPlay
            className="li-news-media-el"
          />
        ) : (
          <button type="button" className="li-news-video-cover" onClick={() => setPlaying(true)}>
            {(current.poster || current.url) && (
              <img src={current.poster || current.url} alt="" />
            )}
            <span className="li-news-play" aria-hidden>
              <Play className="w-7 h-7 fill-white" />
            </span>
          </button>
        )}
        {nav}
      </div>
    )
  }

  return (
    <div className="li-news-media">
      <img src={current.url} alt="" className="li-news-media-el" loading="lazy" />
      {nav}
    </div>
  )
}

export default function HamyariFeedCard({
  post, t, lang, isOwn = false, onOpen, onLike, onComment, onMessage, onEdit, onDelete,
}) {
  const isFa = lang === 'fa'
  const title = (post.title || '').trim()
  const body = (post.body || '').trim()
  const likes = post.likesCount || 0
  const comments = post.commentsCount || 0
  const liked = !!post.likedByMe

  return (
    <article className="li-news-card">
      <header className="li-news-head">
        <button type="button" className="li-news-author-btn" onClick={onOpen}>
          <img
            src={post.authorAvatar || `/logo.jpeg?v=5`}
            alt=""
            className="li-news-avatar"
          />
          <div className="li-news-meta">
            <strong>{post.authorName || t('hamyari')}</strong>
            <span className="li-news-time">
              {formatRelative(post.createdAt, isFa)}
              {' · '}
              <Globe2 className="w-3 h-3 inline" />
            </span>
          </div>
        </button>
        {isOwn && (onEdit || onDelete) ? (
          <div className="hamyari-feed-owner-actions">
            {onEdit ? (
              <button type="button" onClick={onEdit} aria-label={t('hamyariEditPost')} title={t('hamyariEditPost')}>
                <Pencil className="w-4 h-4" />
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                className="is-danger"
                onClick={onDelete}
                aria-label={t('hamyariDeletePost')}
                title={t('hamyariDeletePost')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      <button type="button" className="li-news-copy" onClick={onOpen}>
        {title ? <h2>{title}</h2> : null}
        {body ? <p>{body}</p> : null}
      </button>

      <HamyariMedia post={post} />

      <div className="li-news-stats">
        <span>
          <ThumbsUp className="w-3.5 h-3.5" />
          {likes.toLocaleString(isFa ? 'fa-IR' : 'en-CA')}
        </span>
        <button type="button" className="li-news-stats-link" onClick={onComment}>
          {comments.toLocaleString(isFa ? 'fa-IR' : 'en-CA')} {t('newsComments')}
        </button>
      </div>

      <div className="li-news-actions">
        <button type="button" className={liked ? 'is-on' : ''} onClick={() => onLike(post)}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {t('newsLike')}
        </button>
        <button type="button" onClick={onComment}>
          <MessageCircle className="w-4 h-4" />
          {t('newsComment')}
        </button>
        <button type="button" onClick={onMessage}>
          <Send className="w-4 h-4" />
          {t('newsSend')}
        </button>
      </div>
    </article>
  )
}
