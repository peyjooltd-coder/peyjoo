import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Heart, MessageCircle, Plus, Sparkles, UserRound, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { apiClient } from '../api/client'
import { fileToCompressedDataUrl } from '../lib/imageCompress'
import { uploadOrKeep } from '../lib/firebaseStorage'
import DatingBottomNav from '../components/mobile/DatingBottomNav'
import DatingDiscoverDeck from '../components/dating/DatingDiscoverDeck'
import DatingMap, { RADIUS_OPTIONS } from '../components/dating/DatingMap'
import DatingMessenger, { useDatingUnread } from '../components/dating/DatingMessenger'
import DatingProfileView from '../components/dating/DatingProfileView'

const MAX_DATING_PHOTOS = 6

const REGIONS = [
  { id: 'vancouver', lat: 49.2827, lng: -123.1207 },
  { id: 'burnaby', lat: 49.2488, lng: -122.9805 },
  { id: 'surrey', lat: 49.1913, lng: -122.849 },
  { id: 'richmond', lat: 49.1666, lng: -123.1336 },
  { id: 'nvan', lat: 49.32, lng: -123.0724 },
  { id: 'coquitlam', lat: 49.2838, lng: -122.7932 },
]

export default function DatingPage() {
  const { setViewTab, isAuthenticated, user, setPromptLogin, updateProfile } = useApp()
  const { t } = useI18n()
  const [adultOk, setAdultOk] = useState(() => {
    try { return localStorage.getItem('peyjoo_adult_19') === '1' } catch { return false }
  })
  const [adultChecked, setAdultChecked] = useState(false)
  const msgUnread = useDatingUnread(isAuthenticated)

  const [tab, setTab] = useState('discover')
  const [center, setCenter] = useState(REGIONS[0])
  const [regionId, setRegionId] = useState('vancouver')
  const [radiusKm, setRadiusKm] = useState(10)
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [mapPeople, setMapPeople] = useState([])
  const [mapLoading, setMapLoading] = useState(false)
  const [people, setPeople] = useState([])
  const [likedYou, setLikedYou] = useState([])
  const [crushIds, setCrushIds] = useState([])
  const [showCrush, setShowCrush] = useState(false)
  const [myProfile, setMyProfile] = useState(null)
  const [selected, setSelected] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [saving, setSaving] = useState(false)
  const [acting, setActing] = useState(false)
  const [openThreadId, setOpenThreadId] = useState(null)
  const [matchModal, setMatchModal] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const avatarInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    age: '',
    gender: 'woman',
    lookingFor: 'friendship',
    interests: '',
    avatar: '',
    photos: [],
  })

  const deck = useMemo(
    () => people.filter((p) => !p.isMine && !p.likedByMe && !p.matched),
    [people],
  )

  const syncFormFromProfile = (profile) => {
    if (!profile) return
    setForm({
      displayName: profile.displayName || '',
      bio: profile.bio || '',
      age: profile.age || '',
      gender: profile.gender || 'woman',
      lookingFor: profile.lookingFor || 'friendship',
      interests: (profile.interests || []).join(', '),
      avatar: profile.avatar || '',
      photos: Array.isArray(profile.photos) ? profile.photos.filter(Boolean).slice(0, MAX_DATING_PHOTOS) : [],
    })
  }

  const loadLikedYou = useCallback(async () => {
    if (!isAuthenticated) {
      setLikedYou([])
      return
    }
    try {
      const res = await apiClient.getDatingLikedMe()
      setLikedYou(res.people || [])
    } catch {
      setLikedYou([])
    }
  }, [isAuthenticated])

  const loadCrushes = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await apiClient.getDatingSecretCrush()
      setCrushIds(res.crushIds || [])
    } catch {
      setCrushIds([])
    }
  }, [isAuthenticated])

  const load = async (lat, lng) => {
    setLoading(true)
    setError(null)
    try {
      const nearby = await apiClient.getDatingNearby(lat, lng, 50)
      setPeople(nearby.people || [])
      setCenter(nearby.center || { lat, lng })

      if (isAuthenticated) {
        try {
          const me = await apiClient.getDatingProfile()
          setMyProfile(me.profile)
          if (me.profile) syncFormFromProfile(me.profile)
          else if (user?.name) setForm((f) => ({ ...f, displayName: user.name.split(' ')[0] }))
          if (me.profile) apiClient.datingHeartbeat(lat, lng).catch(() => {})
        } catch {
          setMyProfile(null)
        }
        await Promise.all([loadLikedYou(), loadCrushes()])
      } else {
        setMyProfile(null)
        setLikedYou([])
      }
    } catch (e) {
      setError(e.message || t('datingLoadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      let lat = REGIONS[0].lat
      let lng = REGIONS[0].lng
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 60000,
            })
          })
          lat = pos.coords.latitude
          lng = pos.coords.longitude
        } catch {
          /* default */
        }
      }
      if (!cancelled) {
        setCenter({ lat, lng })
        await load(lat, lng)
      }
    }
    boot()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !myProfile) return undefined
    const id = setInterval(() => {
      apiClient.datingHeartbeat(center.lat, center.lng).catch(() => {})
    }, 45000)
    return () => clearInterval(id)
  }, [isAuthenticated, myProfile, center.lat, center.lng])

  useEffect(() => {
    if (tab === 'likes') loadLikedYou()
  }, [tab, loadLikedYou])

  const loadMapPeople = useCallback(async (lat, lng, km) => {
    setMapLoading(true)
    try {
      const nearby = await apiClient.getDatingNearby(lat, lng, km)
      setMapPeople((nearby.people || []).filter((p) => !p.isMine))
    } catch {
      setMapPeople([])
    } finally {
      setMapLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab !== 'map') return
    loadMapPeople(center.lat, center.lng, radiusKm)
  }, [tab, radiusKm, center.lat, center.lng, loadMapPeople])

  const visibleMapPeople = useMemo(() => {
    const list = onlineOnly ? mapPeople.filter((p) => p.online) : mapPeople
    return list.filter((p) => p.distanceKm == null || p.distanceKm <= radiusKm)
  }, [mapPeople, onlineOnly, radiusKm])

  const onPickRegion = (id) => {
    const region = REGIONS.find((r) => r.id === id) || REGIONS[0]
    setRegionId(region.id)
    setCenter({ lat: region.lat, lng: region.lng })
  }

  const patchPerson = (userId, patch) => {
    const apply = (p) => (p.userId === userId ? { ...p, ...patch } : p)
    setPeople((prev) => prev.map(apply))
    setMapPeople((prev) => prev.map(apply))
    setLikedYou((prev) => prev.map(apply))
    setSelected((cur) => (cur && cur.userId === userId ? { ...cur, ...patch } : cur))
  }

  const removePerson = (userId) => {
    setPeople((prev) => prev.filter((p) => p.userId !== userId))
    setMapPeople((prev) => prev.filter((p) => p.userId !== userId))
    setLikedYou((prev) => prev.filter((p) => p.userId !== userId))
  }

  const openEditor = () => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    const seedAvatar = form.avatar || myProfile?.avatar || user?.avatar || ''
    const seedPhotos = form.photos?.length
      ? form.photos
      : (Array.isArray(myProfile?.photos) && myProfile.photos.length
        ? myProfile.photos.filter(Boolean).slice(0, MAX_DATING_PHOTOS)
        : (seedAvatar ? [seedAvatar] : []))
    setForm((prev) => ({
      ...prev,
      avatar: prev.avatar || seedAvatar,
      photos: prev.photos?.length ? prev.photos : seedPhotos,
    }))
    setPhotoError('')
    setShowEditor(true)
  }

  const uploadDatingImage = async (file) => {
    const local = await fileToCompressedDataUrl(file)
    const url = await uploadOrKeep(local, 'dating')
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
      throw new Error(t('datingPhotoError'))
    }
    return url
  }

  const onAvatarFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setPhotoError('')
    try {
      const url = await uploadDatingImage(file)
      setForm((prev) => ({
        ...prev,
        avatar: url,
        photos: [url, ...prev.photos.filter((p) => p !== url)].slice(0, MAX_DATING_PHOTOS),
      }))
    } catch (err) {
      setPhotoError(err.message || t('datingPhotoError'))
    } finally {
      setUploading(false)
    }
  }

  const onGalleryFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setUploading(true)
    setPhotoError('')
    try {
      const uploaded = []
      for (const file of files) {
        uploaded.push(await uploadDatingImage(file))
      }
      setForm((prev) => {
        const photos = [...prev.photos]
        for (const url of uploaded) {
          if (!photos.includes(url) && photos.length < MAX_DATING_PHOTOS) photos.push(url)
        }
        return {
          ...prev,
          photos,
          avatar: prev.avatar || photos[0] || '',
        }
      })
    } catch (err) {
      setPhotoError(err.message || t('datingPhotoError'))
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (index) => {
    setForm((prev) => {
      const photos = prev.photos.filter((_, i) => i !== index)
      const avatar = photos.includes(prev.avatar) ? prev.avatar : (photos[0] || '')
      return { ...prev, photos, avatar }
    })
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    setSaving(true)
    try {
      const { profile } = await apiClient.saveDatingProfile({
        displayName: form.displayName,
        bio: form.bio,
        age: form.age ? Number(form.age) : null,
        gender: form.gender,
        lookingFor: form.lookingFor,
        avatar: form.avatar || user?.avatar || '',
        photos: form.photos,
        lat: center.lat,
        lng: center.lng,
        interests: form.interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        active: true,
      })
      setMyProfile(profile)
      syncFormFromProfile(profile)
      if (profile?.avatar && profile.avatar !== user?.avatar && !String(profile.avatar).includes('logo.jpeg')) {
        try { await updateProfile({ avatar: profile.avatar }) } catch { /* dating profile is already saved */ }
      }
      setShowEditor(false)
      await load(center.lat, center.lng)
    } catch (err) {
      setError(err.message || t('datingSaveError'))
    } finally {
      setSaving(false)
    }
  }

  const messagePerson = async (person) => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    if (!person?.userId || person.isMine) return
    if (!person.matched) {
      setError(t('datingMatchRequired'))
      return
    }
    setActing(true)
    try {
      const { thread } = await apiClient.messageDatingUser(person.userId)
      setSelected(null)
      setProfileOpen(false)
      setMatchModal(null)
      setOpenThreadId(thread.id)
      setTab('matches')
    } catch (err) {
      setError(err.message || t('datingMessageError'))
    } finally {
      setActing(false)
    }
  }

  const likePerson = async (person) => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    if (!person?.userId || person.isMine) return
    setActing(true)
    setError(null)
    try {
      const res = await apiClient.likeDatingUser(person.userId)
      const next = res.person || {
        ...person,
        likedByMe: true,
        likedMe: res.likedMe,
        matched: res.matched,
      }
      removePerson(person.userId)
      setSelected(null)
      setProfileOpen(false)
      if (res.matched) {
        setMatchModal({ person: next, thread: res.thread })
      }
      loadLikedYou()
    } catch (err) {
      setError(err.message || t('datingLikeError'))
    } finally {
      setActing(false)
    }
  }

  const passPerson = async (person) => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    if (!person?.userId || person.isMine) return
    setActing(true)
    setError(null)
    try {
      await apiClient.passDatingUser(person.userId)
      removePerson(person.userId)
      setSelected(null)
      setProfileOpen(false)
    } catch (err) {
      setError(err.message || t('datingPassError'))
    } finally {
      setActing(false)
    }
  }

  const blockPerson = async (person) => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    if (!person?.userId || person.isMine) return
    if (!window.confirm(t('datingBlockConfirm'))) return
    setActing(true)
    try {
      await apiClient.blockDatingUser(person.userId)
      setSelected(null)
      setProfileOpen(false)
      removePerson(person.userId)
    } catch (err) {
      setError(err.message || t('datingBlocked'))
    } finally {
      setActing(false)
    }
  }

  const toggleCrush = async (userId) => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    let next = crushIds.includes(userId)
      ? crushIds.filter((id) => id !== userId)
      : crushIds.length >= 9
        ? crushIds
        : [...crushIds, userId]
    setCrushIds(next)
    try {
      const res = await apiClient.saveDatingSecretCrush(next)
      setCrushIds(res.crushIds || next)
      if (res.mutualIds?.length) {
        await load(center.lat, center.lng)
      }
    } catch {
      /* keep optimistic */
    }
  }

  const hideChrome = profileOpen

  if (!adultOk) {
    return (
      <div className="dating-page dating-adult-gate">
        <h1>{t('datingAdultTitle')}</h1>
        <p>{t('datingAdultBody')}</p>
        <p>
          <a href="/terms/">{t('termsTitle')}</a>
          {' · '}
          <a href="/guidelines/">{t('guidelinesTitle')}</a>
        </p>
        <label>
          <input type="checkbox" checked={adultChecked} onChange={(e) => setAdultChecked(e.target.checked)} />
          <span>{t('datingAdultConfirm')}</span>
        </label>
        <button
          type="button"
          className="post-submit-btn"
          disabled={!adultChecked}
          onClick={() => {
            try { localStorage.setItem('peyjoo_adult_19', '1') } catch { /* ignore */ }
            setAdultOk(true)
          }}
        >
          {t('datingAdultEnter')}
        </button>
        <button type="button" className="home-btn-outline" onClick={() => setViewTab('home')}>
          {t('datingAdultLeave')}
        </button>
      </div>
    )
  }

  return (
    <div className={`dating-page fb-dating-app ${tab === 'matches' ? 'is-messenger' : ''}`}>
      <div className="dating-body fb-dating-body">
        {error && tab === 'discover' && !loading && (
          <div className="fb-dating-toast is-error">{error}</div>
        )}

        {tab === 'discover' && !profileOpen && (
          <div className="fb-dating-discover-pane">
            <DatingDiscoverDeck
              people={deck}
              acting={acting}
              loading={loading}
              emptyLabel={t('datingDiscoverEmpty')}
              onLike={likePerson}
              onPass={passPerson}
              onOpenProfile={(person) => {
                setSelected(person)
                setProfileOpen(true)
              }}
            />
            <button
              type="button"
              className="fb-dating-more-explore"
              onClick={() => setShowCrush(true)}
            >
              <Sparkles className="w-4 h-4" />
              {t('datingSecretCrush')}
              <span>{crushIds.length}/9</span>
            </button>
          </div>
        )}

        {tab === 'likes' && (
          <div className="fb-dating-likes">
            <header className="fb-dating-section-head">
              <h1>{t('datingLikedYou')}</h1>
              <p>{t('datingLikedYouHint')}</p>
            </header>
            {likedYou.length === 0 ? (
              <p className="fb-dating-empty">{t('datingLikedYouEmpty')}</p>
            ) : (
              <div className="fb-dating-likes-grid">
                {likedYou.map((p) => (
                  <div key={p.userId} className="fb-dating-like-card">
                    <button
                      type="button"
                      className="fb-dating-like-card-main"
                      onClick={() => {
                        setSelected(p)
                        setProfileOpen(true)
                      }}
                    >
                      <img
                        src={p.photos?.[0] || p.avatar || `/logo.jpeg?v=6`}
                        alt=""
                      />
                      <span>
                        {p.displayName}
                        {p.age ? `, ${p.age}` : ''}
                      </span>
                    </button>
                    <div className="fb-dating-like-card-actions">
                      <button
                        type="button"
                        className="fb-discover-pass is-sm"
                        disabled={acting}
                        onClick={() => passPerson(p)}
                        aria-label={t('datingPass')}
                      >
                        <X className="w-5 h-5" strokeWidth={2.75} />
                      </button>
                      <button
                        type="button"
                        className="fb-discover-like is-sm"
                        disabled={acting}
                        onClick={() => likePerson(p)}
                        aria-label={t('datingLike')}
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'map' && !profileOpen && (
          <div className="dating-map-pane">
            <div className="dating-map-toolbar">
              <div className="dating-map-toolbar-row">
                <label className="dating-map-field">
                  <span>{t('datingRegion')}</span>
                  <select
                    value={regionId}
                    onChange={(e) => onPickRegion(e.target.value)}
                  >
                    {REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {t(`datingRegions.${r.id}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="dating-map-field">
                  <span>{t('datingRadius')}</span>
                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                  >
                    {RADIUS_OPTIONS.map((km) => (
                      <option key={km} value={km}>{km} km</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="dating-map-chips">
                <button
                  type="button"
                  className={`dating-map-chip ${onlineOnly ? 'is-active' : ''}`}
                  onClick={() => setOnlineOnly(true)}
                >
                  {t('datingShowOnlineOnly')}
                </button>
                <button
                  type="button"
                  className={`dating-map-chip ${!onlineOnly ? 'is-active' : ''}`}
                  onClick={() => setOnlineOnly(false)}
                >
                  {t('datingShowAllNearby')}
                </button>
              </div>
              <p className="dating-map-status-line">
                {mapLoading
                  ? t('loading')
                  : t('datingOnlineInRadius')
                    .replace('{n}', String(visibleMapPeople.length))
                    .replace('{km}', String(radiusKm))}
              </p>
              <p className="dating-map-hint">{t('datingMapHint')}</p>
            </div>
            <div className="dating-map-wrap dating-map-wrap-pro">
              <DatingMap
                center={center}
                radiusKm={radiusKm}
                people={visibleMapPeople}
                myProfile={myProfile}
                userAvatar={user?.avatar}
                active={tab === 'map'}
                onSelect={(person) => {
                  if (person?.isMine) {
                    setTab('profile')
                    return
                  }
                  setSelected(person)
                  setProfileOpen(true)
                }}
              />
              {!mapLoading && visibleMapPeople.length === 0 && (
                <div className="dating-map-empty">
                  <p>{onlineOnly ? t('datingOnlineEmpty') : t('datingDiscoverEmpty')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'matches' && (
          <DatingMessenger
            isAuthenticated={isAuthenticated}
            onNeedLogin={() => setPromptLogin(true)}
            openThreadId={openThreadId}
            onOpenThreadConsumed={() => setOpenThreadId(null)}
          />
        )}

        {tab === 'profile' && (
          <div
            className={`dating-profile-panel fb-dating-my-profile${myProfile ? '' : ' is-empty'}`}
            style={myProfile ? undefined : {
              position: 'relative',
              flex: 1,
              minHeight: 0,
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 14px',
            }}
          >
            {myProfile ? (
              <div className="dating-profile-card">
                <img
                  src={myProfile.avatar || user?.avatar || '/logo.jpeg?v=6'}
                  alt=""
                  className="dating-profile-avatar"
                />
                <h2>
                  {myProfile.displayName}
                  {myProfile.age ? `, ${myProfile.age}` : ''}
                </h2>
                <p className="dating-sheet-dist">
                  {t('datingYou')}
                  {myProfile.lookingFor ? ` · ${t(`datingLooking.${myProfile.lookingFor}`)}` : ''}
                </p>
                {myProfile.bio && <p className="dating-sheet-bio">{myProfile.bio}</p>}
                {!!myProfile.interests?.length && (
                  <div className="dating-tags">
                    {myProfile.interests.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
                <div className="dating-gallery">
                  <h3>{t('datingGallery')}</h3>
                  {myProfile.photos?.length ? (
                    <div className="dating-gallery-grid">
                      {myProfile.photos.map((src, i) => (
                        <div key={`${src}-${i}`} className="dating-gallery-tile">
                          <img src={src} alt="" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="dating-gallery-empty">{t('datingGalleryEmpty')}</p>
                  )}
                </div>
                <button type="button" className="home-btn-primary !w-full mt-4" onClick={openEditor}>
                  {t('datingEditProfile')}
                </button>
              </div>
            ) : (
              <div
                className="dating-profile-empty"
                style={{
                  width: '100%',
                  maxWidth: 360,
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                <UserRound className="w-10 h-10 text-divar-muted" />
                <h2>{t('datingNoProfileYet')}</h2>
                <p>{t('datingProfileHint')}</p>
                <button type="button" className="home-btn-primary" onClick={openEditor}>
                  {t('datingCreateCta')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!hideChrome && (
        <DatingBottomNav
          tab={tab}
          unread={msgUnread}
          likesCount={likedYou.length}
          onTab={(next) => {
            setSelected(null)
            setProfileOpen(false)
            setTab(next)
          }}
          onHome={() => setViewTab('home')}
        />
      )}

      {showEditor && (
        <div className="dating-editor-backdrop">
          <form className="dating-editor" onSubmit={saveProfile}>
            <div className="dating-editor-head">
              <h2>{myProfile ? t('datingEditProfile') : t('datingCreateProfile')}</h2>
              <button type="button" className="tg-icon-btn" onClick={() => setShowEditor(false)} aria-label={t('cancel')}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="dating-editor-hint">{t('datingProfileHint')}</p>
            <div className="dating-photo-editor">
              <span className="dating-photo-label">{t('datingProfilePhoto')}</span>
              <button type="button" className="dating-avatar-pick" onClick={() => avatarInputRef.current?.click()}>
                <img src={form.avatar || '/logo.jpeg?v=6'} alt="" />
                <span>{t('datingChangePhoto')}</span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onAvatarFile}
              />
              <span className="dating-photo-label">{t('datingGallery')}</span>
              <p className="dating-editor-hint">{t('datingGalleryHint')}</p>
              <div className="dating-gallery-grid">
                {form.photos.map((src, i) => (
                  <div key={`${src}-${i}`} className="dating-gallery-tile">
                    <img src={src} alt="" />
                    <button type="button" onClick={() => removePhoto(i)} aria-label={t('datingRemovePhoto')}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {form.photos.length < MAX_DATING_PHOTOS && (
                  <button type="button" className="dating-gallery-add" onClick={() => galleryInputRef.current?.click()}>
                    <Plus className="w-5 h-5" />
                    {t('datingAddPhoto')}
                  </button>
                )}
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onGalleryFiles}
              />
              {photoError && <p className="dating-photo-error">{photoError}</p>}
            </div>
            <label>
              {t('datingDisplayName')}
              <input
                required
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </label>
            <label>
              {t('datingAge')}
              <input
                type="number"
                min="19"
                max="99"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </label>
            <label>
              {t('datingGender')}
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="woman">{t('datingGenderWoman')}</option>
                <option value="man">{t('datingGenderMan')}</option>
                <option value="nonbinary">{t('datingGenderNb')}</option>
              </select>
            </label>
            <label>
              {t('datingLookingFor')}
              <select value={form.lookingFor} onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}>
                <option value="friendship">{t('datingLooking.friendship')}</option>
                <option value="dating">{t('datingLooking.dating')}</option>
                <option value="both">{t('datingLooking.both')}</option>
              </select>
            </label>
            <label>
              {t('datingBio')}
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </label>
            <label>
              {t('datingInterests')}
              <input
                placeholder={t('datingInterestsHint')}
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
              />
            </label>
            <button type="submit" className="post-submit-btn !w-full !mx-0" disabled={saving || uploading}>
              <Heart className="w-4 h-4 inline mr-1" />
              {saving || uploading ? t('pleaseWait') : t('datingSaveProfile')}
            </button>
          </form>
        </div>
      )}

      {showCrush && (
        <div className="fb-crush-sheet">
          <div className="fb-crush-card">
            <div className="fb-crush-head">
              <h2>{t('datingSecretCrush')}</h2>
              <button type="button" className="tg-icon-btn" onClick={() => setShowCrush(false)} aria-label={t('cancel')}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p>{t('datingSecretCrushHint')}</p>
            <div className="fb-crush-grid">
              {people.slice(0, 18).map((p) => {
                const on = crushIds.includes(p.userId)
                return (
                  <button
                    key={p.userId}
                    type="button"
                    className={`fb-crush-pick ${on ? 'is-on' : ''}`}
                    onClick={() => toggleCrush(p.userId)}
                  >
                    <img
                      src={p.avatar || `/logo.jpeg?v=6`}
                      alt=""
                    />
                    <span>{p.displayName}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {selected && profileOpen && (
        <DatingProfileView
          person={selected}
          acting={acting}
          onBack={() => {
            setProfileOpen(false)
            setSelected(null)
          }}
          onLike={() => likePerson(selected)}
          onPass={() => passPerson(selected)}
          onMessage={() => messagePerson(selected)}
          onBlock={() => blockPerson(selected)}
        />
      )}

      {matchModal && (
        <div className="fb-dating-match-modal">
          <div className="fb-dating-match-card">
            <p className="fb-dating-match-kicker">{t('datingItsAMatch')}</p>
            <div className="fb-dating-match-avatars">
              <img
                src={myProfile?.avatar || user?.avatar || '/logo.jpeg?v=6'}
                alt=""
              />
              <img
                src={matchModal.person.avatar || `/logo.jpeg?v=6`}
                alt=""
              />
            </div>
            <h2>
              {matchModal.person.displayName}
              {matchModal.person.age ? `, ${matchModal.person.age}` : ''}
            </h2>
            <p>{t('datingMatchHint')}</p>
            <button
              type="button"
              className="home-btn-primary !w-full"
              disabled={acting}
              onClick={() => messagePerson({ ...matchModal.person, matched: true })}
            >
              <MessageCircle className="w-4 h-4 inline mr-1" />
              {t('datingMessage')}
            </button>
            <button
              type="button"
              className="fb-dating-match-later"
              onClick={() => setMatchModal(null)}
            >
              {t('datingKeepBrowsing')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
