import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Film, ImagePlus, Images, MapPin, MessageCircle, Pencil, Plus, Send, Trash2, UserRound, X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { apiClient } from '../api/client'
import {
  fileToMediaItem, MAX_MEDIA_ITEMS, MAX_VIDEO_ITEMS, normalizeMedia, extractVideoPoster,
} from '../lib/imageCompress'
import VideoCoverPicker from '../components/VideoCoverPicker'
import MediaUploadProgress from '../components/MediaUploadProgress'
import HamyariBottomNav from '../components/mobile/HamyariBottomNav'
import AppleBackButton from '../components/mobile/AppleBackButton'
import SectionOrangeHeader from '../components/mobile/SectionOrangeHeader'
import HamyariMessenger, { useHamyariUnread } from '../components/hamyari/HamyariMessenger'
import HamyariFeedCard from '../components/hamyari/HamyariFeedCard'
import HamyariCommentsSheet from '../components/hamyari/HamyariCommentsSheet'
import MediaSlide, { postMediaList } from '../components/MediaSlide'
import GallerySideNav from '../components/GallerySideNav'
import { useSwipeGallery } from '../hooks/useSwipeGallery'

function formatPostDate(value, lang) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 16)
  try {
    return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-CA', {
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return String(value).slice(0, 10)
  }
}

function postHeadline(post) {
  return (post.title || post.body || '').trim()
}

function AdDetailView({
  post,
  t,
  lang,
  comments,
  commentDraft,
  onCommentDraft,
  onSendComment,
  onDeleteComment,
  onMessage,
  onEdit,
  onDelete,
  commenting,
  onBack,
  onLike,
  currentUserId,
}) {
  const media = postMediaList(post)
  const [imgIndex, setImgIndex] = useState(0)
  const galleryRef = useRef(null)
  const title = postHeadline(post)
  const isPostOwner = currentUserId && Number(currentUserId) === Number(post.userId)

  useEffect(() => {
    setImgIndex(0)
  }, [post.id])

  useSwipeGallery(galleryRef, {
    enabled: media.length > 1,
    count: media.length,
    onIndex: setImgIndex,
  })

  return (
    <div className="hamyari-detail">
      <div className="hamyari-detail-top">
        <AppleBackButton label={t('back')} onClick={onBack} variant="default" />
        <h1 className="hamyari-detail-top-title">{title}</h1>
        <span className="hamyari-detail-top-spacer" aria-hidden />
      </div>

      <div className="hamyari-detail-scroll">
        <div className="hamyari-detail-gallery" ref={galleryRef}>
          {media.length > 0 ? (
            <>
              <MediaSlide item={media[imgIndex]} className="hamyari-detail-hero" eager />
              <GallerySideNav
                count={media.length}
                index={imgIndex}
                onIndex={setImgIndex}
                prevLabel={t('prev')}
                nextLabel={t('next')}
              />
              {media.length > 1 && (
                <span className="hamyari-detail-counter">{imgIndex + 1} / {media.length}</span>
              )}
            </>
          ) : (
            <div className="hamyari-detail-hero is-empty">{t('hamyariNoPhoto')}</div>
          )}
        </div>

        <div className="hamyari-detail-body">
          <h2 className="hamyari-detail-title">{title}</h2>
          <p className="hamyari-detail-meta">
            <MapPin className="w-4 h-4" />
            {post.authorName || t('hamyari')}
            <span>·</span>
            {formatPostDate(post.createdAt, lang)}
          </p>

          <section className="hamyari-detail-section">
            <h3>{t('description')}</h3>
            <p>{post.body}</p>
          </section>

          <div className="hamyari-detail-seller">
            <div className="hamyari-detail-seller-text">
              <strong>{post.authorName}</strong>
              <span>{t('hamyariAdvertiser')}</span>
            </div>
            <img
              src={post.authorAvatar || `/logo.jpeg?v=5`}
              alt=""
              className="hamyari-detail-seller-avatar"
            />
          </div>

          <div className="hamyari-detail-stats">
            <button type="button" onClick={() => onLike(post)}>
              {t('hamyariLike')} · {post.likesCount || 0}
            </button>
            <span>{t('hamyariCommentsCount').replace('{n}', String(post.commentsCount || 0))}</span>
          </div>

          <section className="hamyari-detail-section">
            <h3>{t('hamyariComments')}</h3>
            <div className="hamyari-detail-comments">
              {(comments || []).length === 0 && (
                <p className="hamyari-detail-comments-empty">{t('hamyariNoComments')}</p>
              )}
              {(comments || []).map((c) => {
                const canDelete = currentUserId && (
                  Number(currentUserId) === Number(c.userId) || isPostOwner
                )
                return (
                  <div key={c.id} className="hamyari-comment">
                    <img src={c.authorAvatar || `/logo.jpeg?v=5`} alt="" />
                    <div className="hamyari-comment-col">
                      <div className="hamyari-comment-bubble">
                        <div className="hamyari-comment-bubble-top">
                          <strong>{c.authorName}</strong>
                          {canDelete && (
                            <button
                              type="button"
                              className="hamyari-comment-delete"
                              onClick={() => onDeleteComment(post, c)}
                              aria-label={t('hamyariDeleteComment')}
                              title={t('hamyariDeleteComment')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p>{c.body}</p>
                      </div>
                      {c.time ? <span className="hamyari-comment-time">{c.time}</span> : null}
                    </div>
                  </div>
                )
              })}
              <form
                className="hamyari-comment-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  onSendComment(post)
                }}
              >
                <input
                  value={commentDraft}
                  onChange={(e) => onCommentDraft(e.target.value)}
                  placeholder={t('hamyariWriteComment')}
                />
                <button type="submit" disabled={commenting || !commentDraft.trim()} aria-label={t('send')}>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>

      <div className="hamyari-detail-sticky">
        {isPostOwner ? (
          <div className="hamyari-detail-owner-actions">
            <button type="button" className="hamyari-detail-msg-btn" onClick={() => onEdit?.(post)}>
              <Pencil className="w-5 h-5" />
              {t('hamyariEditPost')}
            </button>
            <button
              type="button"
              className="hamyari-detail-msg-btn is-danger"
              onClick={() => onDelete?.(post)}
            >
              <Trash2 className="w-5 h-5" />
              {t('hamyariDeletePost')}
            </button>
          </div>
        ) : (
          <button type="button" className="hamyari-detail-msg-btn" onClick={() => onMessage(post)}>
            <MessageCircle className="w-5 h-5" />
            {t('hamyariSendMessage')}
          </button>
        )}
      </div>
    </div>
  )
}

export default function HamyariPage() {
  const {
    setViewTab, isAuthenticated, user, setPromptLogin,
  } = useApp()
  const { t, lang } = useI18n()
  const msgUnread = useHamyariUnread(isAuthenticated)

  const [tab, setTab] = useState('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [myStatusTab, setMyStatusTab] = useState('all')
  const [editingPostId, setEditingPostId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [infoMsg, setInfoMsg] = useState(null)
  const [showComposer, setShowComposer] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [compose, setCompose] = useState({ title: '', body: '', media: [] })
  const [saving, setSaving] = useState(false)
  const [coverPickerIdx, setCoverPickerIdx] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(null)
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [commentSheetPost, setCommentSheetPost] = useState(null)
  const [commentsMap, setCommentsMap] = useState({})
  const [commentDraft, setCommentDraft] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [openThreadId, setOpenThreadId] = useState(null)
  const [msgInChat, setMsgInChat] = useState(false)

  const loadFeed = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { posts: next } = await apiClient.getHamyariFeed('')
      setPosts(next || [])
    } catch (e) {
      setError(e.message || t('hamyariLoadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadFeed()
  }, [loadFeed])

  const loadMyPosts = useCallback(async () => {
    if (!isAuthenticated) {
      setMyPosts([])
      return
    }
    try {
      const r = await apiClient.getHamyariMyPosts()
      setMyPosts(r.posts || [])
    } catch {
      setMyPosts([])
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (tab !== 'profile' || !isAuthenticated) return
    loadMyPosts()
  }, [tab, isAuthenticated, loadMyPosts])

  const myFilteredPosts = useMemo(() => {
    if (myStatusTab === 'all') return myPosts
    return myPosts.filter((p) => (p.status || 'pending') === myStatusTab)
  }, [myPosts, myStatusTab])

  const statusLabel = (status) => {
    if (status === 'active') return t('hamyariStatusActive')
    if (status === 'rejected') return t('hamyariStatusRejected')
    return t('hamyariStatusPending')
  }

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) => {
      const hay = `${p.title || ''} ${p.body || ''} ${p.authorName || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [posts, searchQuery])

  const needAuth = () => {
    setPromptLogin(true)
  }

  const openHamyariComposer = () => {
    if (!isAuthenticated) return needAuth()
    setEditingPostId(null)
    setCompose({ title: '', body: '', media: [] })
    setShowComposer(true)
  }

  const openEditPost = (post) => {
    if (!isAuthenticated) return needAuth()
    setEditingPostId(post.id)
    setCompose({
      title: post.title || '',
      body: post.body || '',
      media: normalizeMedia(post.media || post.images || []),
    })
    setShowComposer(true)
  }

  const deletePost = async (post) => {
    if (!isAuthenticated) return needAuth()
    if (!window.confirm(t('hamyariDeleteConfirm'))) return
    try {
      await apiClient.deleteHamyariPost(post.id)
      setMyPosts((prev) => prev.filter((p) => p.id !== post.id))
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      if (selectedPost?.id === post.id) setSelectedPost(null)
    } catch (e) {
      setError(e.message || t('hamyariPostError'))
    }
  }

  const loadComments = async (post) => {
    if (!post?.id) return
    try {
      const { comments } = await apiClient.getHamyariComments(post.id)
      setCommentsMap((m) => ({ ...m, [post.id]: comments || [] }))
    } catch {
      setCommentsMap((m) => ({ ...m, [post.id]: [] }))
    }
  }

  const openPost = async (post) => {
    setSelectedPost(post)
    setCommentDraft('')
    setCommentSheetPost(null)
    setTab('feed')
    await loadComments(post)
  }

  const openComments = async (post) => {
    setCommentSheetPost(post)
    await loadComments(post)
  }

  const likePost = async (post) => {
    if (!isAuthenticated) return needAuth()
    try {
      const { liked, likesCount } = await apiClient.toggleHamyariLike(post.id)
      const patch = (p) => (p.id === post.id ? { ...p, likedByMe: liked, likesCount } : p)
      setPosts((prev) => prev.map(patch))
      setMyPosts((prev) => prev.map(patch))
      setSelectedPost((cur) => (cur && cur.id === post.id ? { ...cur, likedByMe: liked, likesCount } : cur))
      setCommentSheetPost((cur) => (cur && cur.id === post.id ? { ...cur, likedByMe: liked, likesCount } : cur))
    } catch (e) {
      setError(e.message)
    }
  }

  const sendComment = async (post, textOverride) => {
    if (!isAuthenticated) return needAuth()
    const text = String(textOverride ?? commentDraft).trim()
    if (!text) return
    setCommenting(true)
    try {
      const { comment } = await apiClient.addHamyariComment(post.id, text)
      setCommentsMap((m) => ({
        ...m,
        [post.id]: [...(m[post.id] || []), comment],
      }))
      const bump = (p) =>
        (p.id === post.id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p)
      setPosts((prev) => prev.map(bump))
      setMyPosts((prev) => prev.map(bump))
      setSelectedPost((cur) => (cur && cur.id === post.id ? bump(cur) : cur))
      setCommentSheetPost((cur) => (cur && cur.id === post.id ? bump(cur) : cur))
      setCommentDraft('')
    } catch (e) {
      setError(e.message)
    } finally {
      setCommenting(false)
    }
  }

  const deleteComment = async (post, comment) => {
    if (!isAuthenticated) return needAuth()
    if (!window.confirm(t('hamyariDeleteCommentConfirm'))) return
    try {
      await apiClient.deleteHamyariComment(comment.id)
      setCommentsMap((m) => ({
        ...m,
        [post.id]: (m[post.id] || []).filter((c) => c.id !== comment.id),
      }))
      const bump = (p) => (p.id === post.id
        ? { ...p, commentsCount: Math.max(0, (p.commentsCount || 0) - 1) }
        : p)
      setPosts((prev) => prev.map(bump))
      setMyPosts((prev) => prev.map(bump))
      setSelectedPost((cur) => (cur && cur.id === post.id ? bump(cur) : cur))
    } catch (e) {
      setError(e.message)
    }
  }

  const messageAuthor = async (post) => {
    if (!isAuthenticated) return needAuth()
    if (user?.id && Number(user.id) === Number(post.userId)) return
    try {
      const { thread } = await apiClient.messageHamyariUser(post.userId)
      setSelectedPost(null)
      setOpenThreadId(thread.id)
      setTab('messages')
    } catch (e) {
      setError(e.message)
    }
  }

  const createPost = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return needAuth()
    setSaving(true)
    try {
      let mediaList = [...compose.media]
      for (let i = 0; i < mediaList.length; i += 1) {
        const m = mediaList[i]
        if (m.type === 'video' && !m.poster && m.url) {
          try {
            // eslint-disable-next-line no-await-in-loop
            mediaList[i] = { ...m, poster: await extractVideoPoster(m.url) }
          } catch {
            /* keep */
          }
        }
      }
      const media = normalizeMedia(mediaList)
      const wasEdit = Boolean(editingPostId)
      let post
      if (wasEdit) {
        const res = await apiClient.updateHamyariPost(editingPostId, {
          title: compose.title,
          body: compose.body,
          category: 'general',
          media,
          images: media,
        })
        post = res.post
        setInfoMsg(t('hamyariAfterEditHint'))
        setPosts((prev) => prev.filter((p) => p.id !== post.id))
      } else {
        const res = await apiClient.createHamyariPost({
          title: compose.title,
          body: compose.body,
          category: 'general',
          media,
          images: media,
        })
        post = res.post
        setInfoMsg(t('hamyariPendingHint'))
      }
      setCompose({ title: '', body: '', media: [] })
      setCoverPickerIdx(null)
      setEditingPostId(null)
      setShowComposer(false)
      setMyStatusTab(wasEdit ? 'pending' : 'all')
      setTab('profile')
      setSelectedPost(null)
      await loadMyPosts()
      if (post) {
        setMyPosts((prev) => {
          const rest = prev.filter((p) => p.id !== post.id)
          return [post, ...rest]
        })
      }
    } catch (err) {
      setError(err.message || t('hamyariPostError'))
    } finally {
      setSaving(false)
    }
  }

  const onPickMedia = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length || uploadProgress) return
    const queue = files.slice(0, Math.max(0, MAX_MEDIA_ITEMS - compose.media.length))
    if (!queue.length) return
    try {
      const next = [...compose.media]
      for (let i = 0; i < queue.length; i += 1) {
        const file = queue[i]
        const kind = file.type?.startsWith('video/') ? 'video' : 'image'
        setUploadProgress({ percent: 0, current: i + 1, total: queue.length, kind })
        // eslint-disable-next-line no-await-in-loop
        const item = await fileToMediaItem(file, {
          onProgress: (percent) => {
            setUploadProgress((prev) => (prev ? { ...prev, percent } : prev))
          },
        })
        if (item.type === 'video' && next.filter((m) => m.type === 'video').length >= MAX_VIDEO_ITEMS) {
          continue
        }
        if (item.type === 'video' && !item.poster) {
          try {
            // eslint-disable-next-line no-await-in-loop
            item.poster = await extractVideoPoster(item.url)
          } catch {
            /* optional */
          }
        }
        next.push(item)
        setCompose((c) => ({ ...c, media: next.slice(0, MAX_MEDIA_ITEMS) }))
      }
    } catch (err) {
      setError(err.message || t('hamyariPostError'))
    } finally {
      setUploadProgress(null)
    }
  }

  const removeMedia = (idx) => {
    setCompose((c) => ({ ...c, media: c.media.filter((_, i) => i !== idx) }))
    setCoverPickerIdx((cur) => {
      if (cur == null) return null
      if (cur === idx) return null
      return cur > idx ? cur - 1 : cur
    })
  }

  const openCoverPicker = (idx) => {
    const target = typeof idx === 'number'
      ? idx
      : compose.media.findIndex((m) => m.type === 'video')
    if (target < 0 || !compose.media[target] || compose.media[target].type !== 'video') {
      setError(lang === 'fa' ? 'اول یک ویدیو اضافه کنید، بعد کاور را انتخاب کنید' : 'Add a video first, then choose a cover')
      return
    }
    setCoverPickerIdx(target)
    setError(null)
  }

  const applyVideoCover = (poster) => {
    if (coverPickerIdx == null) return
    setCompose((c) => ({
      ...c,
      media: c.media.map((m, i) => (i === coverPickerIdx ? { ...m, poster } : m)),
    }))
    setCoverPickerIdx(null)
  }

  const cancelVideoCover = () => {
    const idx = coverPickerIdx
    const video = idx != null ? compose.media[idx] : null
    setCoverPickerIdx(null)
    if (!video || video.type !== 'video' || video.poster || !video.url) return
    extractVideoPoster(video.url)
      .then((poster) => {
        setCompose((c) => ({
          ...c,
          media: c.media.map((m, i) => (
            i === idx && m.type === 'video' && !m.poster ? { ...m, poster } : m
          )),
        }))
      })
      .catch(() => {})
  }

  const onNavTab = (next) => {
    if (next === 'compose') {
      openHamyariComposer()
      return
    }
    setSelectedPost(null)
    setCommentSheetPost(null)
    setMsgInChat(false)
    setTab(next)
  }

  const showingDetail = Boolean(selectedPost)
  const hideBottomNav = showingDetail || (tab === 'messages' && msgInChat)

  return (
    <div className={`hamyari-page hamyari-page--news${hideBottomNav ? ' is-messenger' : ''}`}>
      {showingDetail && (
        <AdDetailView
          post={selectedPost}
          t={t}
          lang={lang}
          comments={commentsMap[selectedPost.id]}
          commentDraft={commentDraft}
          onCommentDraft={setCommentDraft}
          onSendComment={sendComment}
          onDeleteComment={deleteComment}
          onMessage={messageAuthor}
          onEdit={openEditPost}
          onDelete={deletePost}
          commenting={commenting}
          onBack={() => setSelectedPost(null)}
          onLike={likePost}
          currentUserId={user?.id}
        />
      )}

      {!showingDetail && tab === 'feed' && (
        <div className="mobile-page news-page li-news-page hamyari-news-feed">
          <SectionOrangeHeader title={t('hamyari')} onBack={() => setViewTab('home')} />

          <div
            className="li-news-composer"
            onClick={openHamyariComposer}
            onKeyDown={(e) => { if (e.key === 'Enter') openHamyariComposer() }}
            role="button"
            tabIndex={0}
          >
            <img src={user?.avatar || '/logo.jpeg?v=5'} alt="" />
            <div className="li-news-composer-input">{t('hamyariWhatsOnMind')}</div>
            <Plus className="w-4 h-4 text-divar-muted" />
          </div>

          <div className="li-news-feed">
            {loading && <p className="dating-list-empty">{t('loading')}</p>}
            {error && !loading && <p className="dating-list-empty is-error">{error}</p>}
            {!loading && filteredPosts.length === 0 && (
              <div className="hamyari-empty hamyari-empty--news">
                <span className="hamyari-empty-emoji" aria-hidden>🤝</span>
                <p>{t('hamyariEmpty')}</p>
                <button type="button" className="home-btn-primary" onClick={openHamyariComposer}>
                  {t('hamyariPostAd')}
                </button>
              </div>
            )}
            {!loading && filteredPosts.map((post) => (
              <HamyariFeedCard
                key={post.id}
                post={post}
                t={t}
                lang={lang}
                isOwn={isAuthenticated && Number(user?.id) === Number(post.userId)}
                onOpen={() => openPost(post)}
                onLike={likePost}
                onComment={() => openComments(post)}
                onMessage={() => messageAuthor(post)}
                onEdit={() => openEditPost(post)}
                onDelete={() => deletePost(post)}
              />
            ))}
          </div>
        </div>
      )}

      {!showingDetail && tab === 'messages' && (
        <HamyariMessenger
          isAuthenticated={isAuthenticated}
          onNeedLogin={needAuth}
          openThreadId={openThreadId}
          onOpenThreadConsumed={() => setOpenThreadId(null)}
          onChatOpenChange={setMsgInChat}
          onBackToMenu={() => {
            setMsgInChat(false)
            setOpenThreadId(null)
            setTab('feed')
          }}
        />
      )}

      {!showingDetail && tab === 'profile' && (
        <div className="hamyari-profile-panel">
          {isAuthenticated ? (
            <>
              <div className="hamyari-profile-card">
                <img
                  src={user?.avatar || `/logo.jpeg?v=5`}
                  alt=""
                  className="hamyari-profile-avatar"
                />
                <h2>{user?.name || t('hamyariMyProfile')}</h2>
                <p>{t('hamyariProfileHint')}</p>
                <button type="button" className="home-btn-outline !w-full" onClick={() => setViewTab('profile')}>
                  {t('myPeyjo')}
                </button>
                <button
                  type="button"
                  className="home-btn-primary !w-full mt-2"
                  onClick={openHamyariComposer}
                >
                  {t('hamyariPostAd')}
                </button>
              </div>
              <h3 className="hamyari-section-title">{t('hamyariMyPosts')}</h3>
              {infoMsg && (
                <p className="hamyari-status-banner is-pending mb-3">{infoMsg}</p>
              )}
              <div className="chat-tabs mb-3">
                {[
                  { id: 'pending', label: t('hamyariStatusPending') },
                  { id: 'active', label: t('hamyariStatusActive') },
                  { id: 'rejected', label: t('hamyariStatusRejected') },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={`chat-tab ${myStatusTab === id ? 'chat-tab-active' : ''}`}
                    onClick={() => setMyStatusTab(id)}
                  >
                    {label}
                    <span className="ms-1 opacity-70">
                      ({myPosts.filter((p) => (p.status || 'pending') === id).length})
                    </span>
                  </button>
                ))}
              </div>
              {myStatusTab === 'pending' && (
                <p className="text-xs text-divar-muted mb-2 px-1">{t('hamyariPendingHint')}</p>
              )}
              {myStatusTab === 'rejected' && (
                <p className="text-xs text-divar-muted mb-2 px-1">{t('hamyariRejectedHint')}</p>
              )}
              <div className="li-news-feed hamyari-profile-feed">
                {myFilteredPosts.length === 0 && <p className="dating-list-empty">{t('hamyariEmpty')}</p>}
                {myFilteredPosts.map((post) => (
                  <div key={post.id} className="hamyari-my-post-wrap">
                    <div className="hamyari-my-post-bar">
                      <span className={`hamyari-status-pill is-${post.status || 'pending'}`}>
                        {statusLabel(post.status)}
                      </span>
                      <div className="hamyari-my-post-actions">
                        <button type="button" onClick={() => openEditPost(post)} aria-label={t('hamyariEditPost')}>
                          <Pencil className="w-4 h-4" />
                          <span>{t('hamyariEditPost')}</span>
                        </button>
                        <button type="button" className="is-danger" onClick={() => deletePost(post)} aria-label={t('hamyariDeletePost')}>
                          <Trash2 className="w-4 h-4" />
                          <span>{t('hamyariDeletePost')}</span>
                        </button>
                      </div>
                    </div>
                    <HamyariFeedCard
                      post={post}
                      t={t}
                      lang={lang}
                      isOwn
                      onOpen={() => openPost(post)}
                      onLike={likePost}
                      onComment={() => openComments(post)}
                      onMessage={() => messageAuthor(post)}
                      onEdit={() => openEditPost(post)}
                      onDelete={() => deletePost(post)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="hamyari-empty">
              <UserRound className="w-10 h-10 text-divar-muted" />
              <p>{t('hamyariMessengerLogin')}</p>
              <button type="button" className="home-btn-primary" onClick={needAuth}>
                {t('loginRegister')}
              </button>
            </div>
          )}
        </div>
      )}

      {showComposer && (
        <div className="hamyari-composer-backdrop">
          <form className="hamyari-composer" onSubmit={createPost}>
            <div className="hamyari-composer-head">
              <h2>{editingPostId ? t('hamyariEditTitle') : t('hamyariComposeTitle')}</h2>
              <button
                type="button"
                className="tg-icon-btn"
                onClick={() => {
                  setShowComposer(false)
                  setEditingPostId(null)
                }}
                aria-label={t('cancel')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="hamyari-photo-block">
              <p className="hamyari-photo-label">{t('hamyariAddPhoto')}</p>
              <p className="hamyari-hint">{t('hamyariPhotoHint')}</p>
              {compose.media.length > 0 && (
                <div className="hamyari-compose-previews">
                  {compose.media.map((item, i) => (
                    <div key={`prev-${i}`} className="hamyari-compose-preview">
                      {item.type === 'video' ? (
                        item.poster ? <img src={item.poster} alt="" /> : (
                          <video src={item.url} muted playsInline preload="metadata" />
                        )
                      ) : (
                        <img src={item.url} alt="" />
                      )}
                      {item.type === 'video' && (
                        <span className="post-media-badge"><Film className="w-3 h-3" /></span>
                      )}
                      {item.type === 'video' && (
                        <button
                          type="button"
                          className="post-photo-cover-btn"
                          onClick={() => openCoverPicker(i)}
                        >
                          {lang === 'fa' ? 'تغییر کاور' : 'Change cover'}
                        </button>
                      )}
                      <button type="button" onClick={() => removeMedia(i)} aria-label={t('hamyariRemovePhoto')}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="hamyari-hint">
                {t('hamyariPhotoCount').replace('{n}', String(compose.media.length))}
              </p>
              {compose.media.length < MAX_MEDIA_ITEMS && (
                <div className="hamyari-media-btns">
                  <button
                    type="button"
                    className="hamyari-add-photo-btn"
                    onClick={() => fileRef.current?.click()}
                    disabled={!!uploadProgress}
                  >
                    <ImagePlus className="w-5 h-5" />
                    {t('hamyariAddImage')}
                  </button>
                  <button
                    type="button"
                    className="hamyari-add-photo-btn is-video"
                    onClick={() => videoRef.current?.click()}
                    disabled={!!uploadProgress}
                  >
                    <Film className="w-5 h-5" />
                    {t('hamyariAddVideo')}
                  </button>
                  <button
                    type="button"
                    className="hamyari-add-photo-btn"
                    onClick={() => openCoverPicker()}
                    disabled={!compose.media.some((m) => m.type === 'video') || !!uploadProgress}
                  >
                    <Images className="w-5 h-5" />
                    {lang === 'fa' ? 'کاور' : 'Cover'}
                  </button>
                </div>
              )}
              {compose.media.length >= MAX_MEDIA_ITEMS && compose.media.some((m) => m.type === 'video') && (
                <div className="hamyari-media-btns">
                  <button
                    type="button"
                    className="hamyari-add-photo-btn"
                    onClick={() => openCoverPicker()}
                    disabled={!!uploadProgress}
                  >
                    <Images className="w-5 h-5" />
                    {lang === 'fa' ? 'کاور' : 'Cover'}
                  </button>
                </div>
              )}
              <MediaUploadProgress progress={uploadProgress} />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onPickMedia}
              />
              <input
                ref={videoRef}
                type="file"
                accept="video/*,.mp4,.mov,.webm,.m4v"
                multiple
                hidden
                onChange={onPickMedia}
              />
            </div>

            <label>
              {t('hamyariPostTitle')}
              <input
                value={compose.title}
                onChange={(e) => setCompose({ ...compose, title: e.target.value })}
                placeholder={t('hamyariPostTitleHint')}
              />
            </label>
            <label>
              {t('hamyariPostBody')}
              <textarea
                required
                rows={5}
                value={compose.body}
                onChange={(e) => setCompose({ ...compose, body: e.target.value })}
                placeholder={t('hamyariWritePost')}
              />
            </label>
            <button type="submit" className="post-submit-btn !w-full !mx-0" disabled={saving}>
              {saving ? t('pleaseWait') : (editingPostId ? t('hamyariSaveEdit') : t('hamyariPublish'))}
            </button>
          </form>
        </div>
      )}

      <VideoCoverPicker
        open={coverPickerIdx != null && !!compose.media[coverPickerIdx]?.url}
        videoUrl={coverPickerIdx != null ? compose.media[coverPickerIdx]?.url : ''}
        initialPoster={coverPickerIdx != null ? (compose.media[coverPickerIdx]?.poster || '') : ''}
        onConfirm={applyVideoCover}
        onCancel={cancelVideoCover}
      />

      {showNotifs && (
        <div className="hamyari-composer-backdrop" onClick={() => setShowNotifs(false)}>
          <div className="hamyari-notif-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="hamyari-composer-head">
              <h2>{t('notifications')}</h2>
              <button type="button" className="tg-icon-btn" onClick={() => setShowNotifs(false)} aria-label={t('cancel')}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {notifs.length === 0 && <p className="dating-list-empty">{t('hamyariNoNotifs')}</p>}
            <div className="hamyari-notif-list">
              {notifs.map((n) => (
                <div key={n.id} className="hamyari-notif-item">
                  <strong>{n.actorName || t('hamyari')}</strong>
                  <p>{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <HamyariCommentsSheet
        post={commentSheetPost}
        open={!!commentSheetPost}
        onClose={() => setCommentSheetPost(null)}
        comments={commentSheetPost ? (commentsMap[commentSheetPost.id] || []) : []}
        onReload={loadComments}
        onAdd={sendComment}
        onDelete={deleteComment}
        commenting={commenting}
      />

      {!hideBottomNav && (
        <HamyariBottomNav
          tab={tab}
          unread={msgUnread}
          onTab={onNavTab}
          onHome={() => setViewTab('home')}
        />
      )}
    </div>
  )
}

