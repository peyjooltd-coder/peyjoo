import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { categories } from '../data/mockData'
import { getEmptyCategoryFilters } from '../data/categoryConfig'
import { analyzeSearchQuery, scoreListing, matchesCategoryFilters } from '../lib/smartSearch'
import { resolveApiCategory } from '../lib/categoryMap'
import { isPejoBrowseCategory, getPejoBrowseCategory } from '../data/pejoBrowseCatalog'
import { listingSortTs } from '../lib/listingTime'
import { listingMatchesCity } from '../data/canadaCities'
import { apiClient, getToken, setToken } from '../api/client'
import { userAvatar } from '../lib/defaultAvatar'
import { sendPhoneOtp } from '../lib/firebasePhoneAuth'
import {
  collectThemMessageIds,
  ensureChatNotifyPermission,
  findNewThemMessages,
  notifyNewChatMessage,
} from '../lib/chatNotify'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [user, setUser] = useState(null)

  const [view, setView] = useState('home')
  const [viewHistory, setViewHistory] = useState(['home'])

  const setViewTab = useCallback((tab) => {
    setViewHistory([tab])
    setView(tab)
    if (tab !== 'detail') {
      try {
        const url = new URL(window.location.href)
        if (url.searchParams.has('ad')) {
          url.searchParams.delete('ad')
          window.history.replaceState({}, '', url)
        }
      } catch {
        /* ignore */
      }
    }
  }, [])

  const pushView = useCallback((next) => {
    setViewHistory((h) => [...h, next])
    setView(next)
    // Leaving an ad must drop ?ad= so the deep-link effect does not yank the user back to detail
    if (next !== 'detail') {
      try {
        const url = new URL(window.location.href)
        if (url.searchParams.has('ad')) {
          url.searchParams.delete('ad')
          window.history.replaceState({}, '', url)
        }
      } catch {
        /* ignore */
      }
    }
  }, [])

  const goBack = useCallback((fallback = 'home') => {
    setViewHistory((h) => {
      if (h.length <= 1) {
        setView(fallback)
        try {
          const url = new URL(window.location.href)
          url.searchParams.delete('ad')
          window.history.replaceState({}, '', url)
        } catch {
          /* ignore */
        }
        return [fallback]
      }
      const next = h.slice(0, -1)
      const dest = next[next.length - 1]
      setView(dest)
      if (dest !== 'detail') {
        try {
          const url = new URL(window.location.href)
          url.searchParams.delete('ad')
          window.history.replaceState({}, '', url)
        } catch {
          /* ignore */
        }
      }
      return next
    })
  }, [])
  const [proTab, setProTab] = useState('overview')
  const [pulseTab, setPulseTab] = useState('pulse')
  const [dashboardTab, setDashboardTab] = useState('overview')
  const [selectedCategory, setSelectedCategoryState] = useState(null)
  const [selectedListing, setSelectedListing] = useState(null)
  const [handshakeListing, setHandshakeListing] = useState(null)
  const [showHandshakeModal, setShowHandshakeModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchIntent, setSearchIntent] = useState(null)
  const [applySmartCategory, setApplySmartCategory] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [savedIds, setSavedIds] = useState(new Set())
  const [compareIds, setCompareIds] = useState([])
  const [listings, setListings] = useState([])
  const [myListings, setMyListings] = useState([])
  const [wantSignals, setWantSignals] = useState([])
  const [handshakeOffers, setHandshakeOffers] = useState([])
  const [demandPulse, setDemandPulse] = useState([])
  const [pulseMatches, setPulseMatches] = useState([])
  const [showPostModal, setShowPostModal] = useState(false)
  const [promptLogin, setPromptLogin] = useState(false)
  const [authGateOpen, setAuthGateOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [categoryFilters, setCategoryFilters] = useState(getEmptyCategoryFilters(null))
  const [chatThreads, setChatThreads] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [realEstateSheetOpen, setRealEstateSheetOpen] = useState(false)
  const knownThemMsgsRef = useRef(null)
  const activeChatIdRef = useRef(null)
  const viewRef = useRef(view)

  useEffect(() => {
    activeChatIdRef.current = activeChatId
  }, [activeChatId])

  useEffect(() => {
    viewRef.current = view
  }, [view])

  const setSelectedCategory = useCallback((catId) => {
    setSelectedCategoryState(catId)
    setCategoryFilters(getEmptyCategoryFilters(catId))
  }, [])

  const loadPublicData = useCallback(async () => {
    const listingsRes = await apiClient.getListings()
    setListings(listingsRes.listings)
    // Secondary feeds — do not block first paint
    Promise.all([
      apiClient.getWantSignals(),
      apiClient.getPulseMatches(),
      apiClient.getDemandPulse(),
    ]).then(([wantsRes, matchesRes, demandRes]) => {
      setWantSignals(wantsRes.wantSignals)
      setPulseMatches(matchesRes.pulseMatches)
      setDemandPulse(demandRes.demandPulse)
    }).catch(() => {})
  }, [])

  const loadAuthenticatedData = useCallback(async () => {
    const [listingsRes, mineRes] = await Promise.all([
      apiClient.getListings(),
      apiClient.getMyListings().catch(() => ({ listings: [] })),
    ])
    setListings(listingsRes.listings || [])
    setMyListings(mineRes.listings || [])

    Promise.all([
      apiClient.getSaved(),
      apiClient.getCompare(),
      apiClient.getWantSignals(),
      apiClient.getPulseMatches(),
      apiClient.getDemandPulse(),
      apiClient.getHandshakes(),
      apiClient.getChatThreads(),
      apiClient.getAlerts(),
    ]).then(([
      savedRes,
      compareRes,
      wantsRes,
      matchesRes,
      demandRes,
      handshakesRes,
      chatRes,
      alertsRes,
    ]) => {
      setSavedIds(new Set((savedRes.savedIds || []).map(Number)))
      setCompareIds((compareRes.compareIds || []).map(Number))
      setWantSignals(wantsRes.wantSignals)
      setPulseMatches(matchesRes.pulseMatches)
      setDemandPulse(demandRes.demandPulse)
      setHandshakeOffers(handshakesRes.handshakeOffers)
      setChatThreads(chatRes.threads)
      knownThemMsgsRef.current = collectThemMessageIds(chatRes.threads || [])
      setActiveChatId(null)
      setAlerts(alertsRes.alerts)
      ensureChatNotifyPermission().catch(() => {})
    }).catch(() => {})
  }, [])

  const clearUserSession = useCallback(() => {
    setUser(null)
    setMyListings([])
    setSavedIds(new Set())
    setCompareIds([])
    setChatThreads([])
    knownThemMsgsRef.current = null
    setActiveChatId(null)
    setAlerts([])
    setHandshakeOffers([])
  }, [])

  const refreshData = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    try {
      await apiClient.health()
      if (getToken()) {
        try {
          const { user: u } = await apiClient.me()
          setUser(u)
          setIsAuthenticated(true)
          // Paint as soon as listings arrive; rest loads in same call but listings set early inside
          await loadAuthenticatedData()
        } catch (meErr) {
          // توکن قدیمی بعد از seed یا تغییر JWT — نه خطای سرور
          setToken(null)
          clearUserSession()
          setIsAuthenticated(false)
          await loadPublicData()
        }
      } else {
        setIsAuthenticated(false)
        clearUserSession()
        await loadPublicData()
      }
    } catch (err) {
      setApiError(err.message || 'اتصال به سرور برقرار نشد')
    } finally {
      setLoading(false)
    }
  }, [loadAuthenticatedData, loadPublicData, clearUserSession])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const login = useCallback(async (email, password) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const cleanEmail = String(email || '').trim().toLowerCase()
      const cleanPassword = String(password || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
      const { token, user: u } = await apiClient.login(cleanEmail, cleanPassword)
      setToken(token)
      setUser(u)
      setIsAuthenticated(true)
      await loadAuthenticatedData()
      setViewTab('home')
    } catch (err) {
      setAuthError(err.message || (document.documentElement.lang === 'fa' ? 'ورود ناموفق بود' : 'Sign-in failed'))
      throw err
    } finally {
      setAuthLoading(false)
    }
  }, [loadAuthenticatedData, setViewTab])

  const applyAuthSession = useCallback(async (result, fallbackPhone) => {
    if (result?.needsProfile) {
      return { needsProfile: true, phone: result.phone || fallbackPhone }
    }
    const { token, user: u } = result
    setToken(token)
    setUser(u)
    setIsAuthenticated(true)
    await loadAuthenticatedData()
    setViewTab('home')
    return { needsProfile: false, user: u }
  }, [loadAuthenticatedData, setViewTab])

  const loginWithOtp = useCallback(async (phone, code, profile = {}) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const result = await apiClient.verifyOtp(phone, code, profile)
      return await applyAuthSession(result, phone)
    } catch (err) {
      setAuthError(err.message || (document.documentElement.lang === 'fa' ? 'تأیید ناموفق بود' : 'Verification failed'))
      throw err
    } finally {
      setAuthLoading(false)
    }
  }, [applyAuthSession])

  const loginWithFirebase = useCallback(async (idToken, profile = {}) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const result = await apiClient.loginWithFirebase(idToken, profile)
      return await applyAuthSession(result)
    } catch (err) {
      setAuthError(err.message || (document.documentElement.lang === 'fa' ? 'تأیید ناموفق بود' : 'Verification failed'))
      throw err
    } finally {
      setAuthLoading(false)
    }
  }, [applyAuthSession])

  const checkPhone = useCallback(async (phone) => {
    setAuthError(null)
    return apiClient.checkPhone(phone)
  }, [])

  const sendOtp = useCallback(async (phone, lang = 'en') => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      return await sendPhoneOtp(phone, lang)
    } catch (err) {
      setAuthError(err.message || (document.documentElement.lang === 'fa' ? 'ارسال کد ناموفق بود' : 'Could not send the code'))
      throw err
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (patch) => {
    const { user: u } = await apiClient.updateProfile(patch)
    setUser(u)
    if (patch.name || patch.avatar) {
      setListings((prev) => prev.map((l) => (
        l.userId === u.id || l.isMine
          ? {
            ...l,
            seller: patch.name != null ? u.name : l.seller,
            sellerAvatar: patch.avatar != null ? u.avatar : l.sellerAvatar,
            sellerPhone: patch.phone != null ? (u.phone || '') : l.sellerPhone,
          }
          : l
      )))
      setSelectedListing((cur) => {
        if (!cur || !(cur.userId === u.id || cur.isMine)) return cur
        return {
          ...cur,
          seller: patch.name != null ? u.name : cur.seller,
          sellerAvatar: patch.avatar != null ? u.avatar : cur.sellerAvatar,
          sellerPhone: patch.phone != null ? (u.phone || '') : cur.sellerPhone,
        }
      })
    } else if (patch.phone != null) {
      setListings((prev) => prev.map((l) => (
        l.userId === u.id || l.isMine ? { ...l, sellerPhone: u.phone || '' } : l
      )))
      setSelectedListing((cur) => (
        cur && (cur.userId === u.id || cur.isMine)
          ? { ...cur, sellerPhone: u.phone || '' }
          : cur
      ))
    }
    return u
  }, [])

  const sendEmailOtp = useCallback(async (email) => {
    return apiClient.sendEmailOtp(email)
  }, [])

  const verifyEmailOtp = useCallback(async (email, code) => {
    const { user: u } = await apiClient.verifyEmailOtp(email, code)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (payload) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const body = {
        ...payload,
        email: String(payload.email || '').trim().toLowerCase(),
        password: String(payload.password || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim(),
        name: String(payload.name || '').trim(),
      }
      const { token, user: u } = await apiClient.register(body)
      setToken(token)
      setUser(u)
      setIsAuthenticated(true)
      await loadAuthenticatedData()
      setViewTab('home')
    } catch (err) {
      setAuthError(err.message || (document.documentElement.lang === 'fa' ? 'ثبت‌نام ناموفق بود' : 'Sign-up failed'))
      throw err
    } finally {
      setAuthLoading(false)
    }
  }, [loadAuthenticatedData, setViewTab])

  const logout = useCallback(async () => {
    try {
      if (getToken()) await apiClient.logout()
    } catch { /* ignore */ }
    setToken(null)
    clearUserSession()
    setIsAuthenticated(false)
    setAuthError(null)
    try {
      localStorage.removeItem('pejo_entered')
    } catch { /* ignore */ }
    try {
      await loadPublicData()
    } catch { /* ignore */ }
    setViewTab('home')
  }, [clearUserSession, loadPublicData, setViewTab])

  const deleteAccount = useCallback(async () => {
    await apiClient.deleteAccount()
    setToken(null)
    clearUserSession()
    setIsAuthenticated(false)
    setAuthError(null)
    try {
      localStorage.removeItem('pejo_entered')
    } catch { /* ignore */ }
    await loadPublicData()
    setViewTab('home')
  }, [clearUserSession, loadPublicData, setViewTab])

  const pendingOffers = handshakeOffers.filter((o) => o.status === 'pending' || o.status === 'counter').length
  const chatUnreadCount = useMemo(
    () => chatThreads.reduce((n, t) => n + (t.unread || 0), 0),
    [chatThreads]
  )

  const sendChatMessage = useCallback(async (threadId, text) => {
    const trimmed = text.trim()
    if (!trimmed || !threadId) return null

    const tempId = `tmp-${Date.now()}`
    const optimistic = {
      id: tempId,
      from: 'me',
      text: trimmed,
      time: new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      pending: true,
    }

    setChatThreads((prev) =>
      prev.map((t) =>
        String(t.id) === String(threadId)
          ? {
              ...t,
              messages: [...(t.messages || []), optimistic],
              updated: optimistic.time,
              unread: 0,
            }
          : t
      )
    )

    try {
      const { thread } = await apiClient.sendMessage(threadId, trimmed)
      setChatThreads((prev) => {
        const others = prev.filter((t) => String(t.id) !== String(threadId))
        return [thread, ...others]
      })
      return thread
    } catch (e) {
      setChatThreads((prev) =>
        prev.map((t) =>
          String(t.id) === String(threadId)
            ? {
                ...t,
                messages: (t.messages || []).map((m) =>
                  m.id === tempId ? { ...m, pending: false, failed: true } : m
                ),
              }
            : t
        )
      )
      throw e
    }
  }, [])

  const openChatFromNotify = useCallback((threadId) => {
    if (!threadId) return
    setActiveChatId(threadId)
    pushView('chat')
  }, [pushView])

  const refreshChatThreads = useCallback(async () => {
    try {
      const { threads } = await apiClient.getChatThreads()
      const next = threads || []

      if (knownThemMsgsRef.current == null) {
        knownThemMsgsRef.current = collectThemMessageIds(next)
      } else {
        const incoming = findNewThemMessages(knownThemMsgsRef.current, next)
        knownThemMsgsRef.current = collectThemMessageIds(next)
        for (const { thread, message } of incoming) {
          const viewingSame =
            viewRef.current === 'chat' &&
            String(activeChatIdRef.current) === String(thread.id) &&
            typeof document !== 'undefined' &&
            !document.hidden &&
            document.hasFocus()
          notifyNewChatMessage({
            listingTitle: thread.listingTitle,
            text: message.text,
            tag: `peyjoo-chat-${thread.id}`,
            showBanner: !viewingSame,
            onClick: () => openChatFromNotify(thread.id),
          })
        }
      }

      setChatThreads((prev) => {
        if (!prev?.length) return next
        return next.map((t) => {
          const old = prev.find((p) => String(p.id) === String(t.id))
          if (!old) return t
          const pending = (old.messages || []).filter((m) => m.pending)
          if (!pending.length) return t
          const serverMine = new Set(
            (t.messages || []).filter((m) => m.from === 'me').map((m) => m.text),
          )
          const keep = pending.filter((m) => !serverMine.has(m.text))
          if (!keep.length) return t
          return { ...t, messages: [...(t.messages || []), ...keep] }
        })
      })
      return next
    } catch {
      return null
    }
  }, [openChatFromNotify])

  const startChatForListing = useCallback(async (listing) => {
    if (!listing) return
    if (!isAuthenticated) {
      setPromptLogin(true)
      return
    }
    try {
      const { thread } = await apiClient.startChat(listing.id)
      if (!thread?.id) {
        throw new Error(document.documentElement.lang === 'fa' ? 'شروع گفتگو ناموفق بود' : 'Could not start chat')
      }
      // Navigate first so chat UI mounts immediately; then attach thread data
      setActiveChatId(thread.id)
      setChatThreads((prev) => {
        const exists = prev.find((t) => String(t.id) === String(thread.id))
        if (exists) {
          return [thread, ...prev.filter((t) => String(t.id) !== String(thread.id))]
        }
        return [thread, ...prev]
      })
      pushView('chat')
    } catch (e) {
      console.error(e)
      if (/401|auth|token|login|unauthorized/i.test(String(e?.message || ''))) {
        setPromptLogin(true)
        return
      }
      setApiError(e.message || (document.documentElement.lang === 'fa' ? 'شروع گفتگو ناموفق بود' : 'Could not start chat'))
    }
  }, [pushView, isAuthenticated])

  const markChatRead = useCallback(async (threadId) => {
    setChatThreads((prev) =>
      prev.map((t) => (String(t.id) === String(threadId) ? { ...t, unread: 0 } : t)),
    )
    try {
      await apiClient.markChatRead(threadId)
    } catch { /* ignore */ }
  }, [])

  // Background chat sync + notifications when logged in (even outside Chat page)
  useEffect(() => {
    if (!isAuthenticated) return undefined
    ensureChatNotifyPermission().catch(() => {})
    const tick = () => {
      // ChatPage already polls faster while open; keep a backup poll everywhere
      if (viewRef.current === 'chat') return
      refreshChatThreads()
    }
    const id = setInterval(tick, 5000)
    return () => clearInterval(id)
  }, [isAuthenticated, refreshChatThreads])

  const runSmartSearch = useCallback((query) => {
    const q = query.trim()
    setSearchQuery(query)
    const intent = analyzeSearchQuery(q, selectedCategory)
    setSearchIntent(q ? intent : null)

    if (q && applySmartCategory && intent.suggestedCategory && intent.categoryConfidence >= 0.35) {
      setSelectedCategoryState(intent.suggestedCategory)
      setCategoryFilters((prev) => ({
        ...getEmptyCategoryFilters(intent.suggestedCategory),
        ...intent.extractedFilters,
        verifiedOnly: prev.verifiedOnly ?? false,
        proOnly: prev.proOnly ?? false,
      }))
    } else if (q && intent.extractedFilters) {
      setCategoryFilters((prev) => ({ ...prev, ...intent.extractedFilters }))
    }
  }, [selectedCategory, applySmartCategory])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchIntent(null)
  }, [])

  const resetAllFilters = useCallback(() => {
    setCategoryFilters(getEmptyCategoryFilters(selectedCategory))
    setSortBy('newest')
  }, [selectedCategory])

  const openHandshake = useCallback((listing) => {
    setHandshakeListing(listing || null)
    setShowHandshakeModal(true)
  }, [])

  const submitHandshake = useCallback(async (offer) => {
    try {
      const { offer: created } = await apiClient.createHandshake({
        listingId: handshakeListing?.id,
        listingTitle: offer.listingTitle,
        listingImage: offer.listingImage,
        seller: offer.seller,
        offerPrice: offer.offerPrice,
        meetPoint: offer.meetPoint,
        timeSlot: offer.timeSlot,
        conditions: offer.conditions,
      })
      setHandshakeOffers((prev) => [created, ...prev])
    } catch {
      setHandshakeOffers((prev) => [
        {
          id: `o${Date.now()}`,
          from: 'You',
          to: offer.seller || 'Seller',
          status: 'pending',
          expires: '48h',
          created: 'Just now',
          ...offer,
        },
        ...prev,
      ])
    }
    setShowHandshakeModal(false)
    setHandshakeListing(null)
    setView('pulse')
    setPulseTab('handshakes')
  }, [handshakeListing])

  const toggleSave = useCallback(async (id) => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      try {
        sessionStorage.setItem('pejo_auth_reason', 'save')
      } catch {
        /* ignore */
      }
      return
    }
    const listingId = Number(id)
    if (!Number.isFinite(listingId)) return
    try {
      const { saved } = await apiClient.toggleSaved(listingId)
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (saved) next.add(listingId)
        else next.delete(listingId)
        return next
      })
      setListings((prev) =>
        prev.map((l) =>
          Number(l.id) === listingId
            ? { ...l, saves: Math.max(0, (l.saves || 0) + (saved ? 1 : -1)) }
            : l
        )
      )
      setSelectedListing((cur) => (
        cur && Number(cur.id) === listingId
          ? { ...cur, saves: Math.max(0, (cur.saves || 0) + (saved ? 1 : -1)) }
          : cur
      ))
    } catch (e) {
      console.error(e)
      if (/401|auth|token|login|unauthorized/i.test(String(e?.message || ''))) {
        setPromptLogin(true)
      }
    }
  }, [isAuthenticated])

  const toggleCompare = useCallback(async (id) => {
    try {
      const { compareIds: ids } = await apiClient.toggleCompare(id)
      setCompareIds(ids)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const openListing = useCallback((listing) => {
    const id = listing?.id
    if (id == null) return
    setSelectedListing(listing)
    pushView('detail')
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('ad', String(id))
      window.history.replaceState({}, '', url)
    } catch {
      /* ignore */
    }
    apiClient.getListing(id).then(({ listing: fresh }) => {
      if (!fresh || fresh.id == null) return
      setSelectedListing((cur) => (
        cur && Number(cur.id) !== Number(fresh.id) ? cur : fresh
      ))
      setListings((prev) => prev.map((l) => {
        if (Number(l.id) !== Number(fresh.id)) return l
        return {
          ...l,
          title: fresh.title,
          price: fresh.price,
          priceLabel: fresh.priceLabel,
          description: fresh.description,
          views: fresh.views,
          saves: fresh.saves,
          status: fresh.status,
          isMine: fresh.isMine,
          userId: fresh.userId,
          hasVideo: fresh.hasVideo ?? l.hasVideo,
          image: fresh.image || l.image,
        }
      }))
    }).catch(() => {})
  }, [pushView])

  // Open shared ad links (?ad=123) after data loads — never steal focus from chat/profile/etc.
  useEffect(() => {
    if (loading) return
    let adId = null
    try {
      adId = new URLSearchParams(window.location.search).get('ad')
    } catch {
      return
    }
    if (!adId) return
    if (selectedListing && String(selectedListing.id) === String(adId) && view === 'detail') return
    // User already left this ad (e.g. opened messenger) — do not force detail again
    if (
      view === 'chat'
      || view === 'profile'
      || view === 'my-ads'
      || view === 'saved'
      || view === 'dating'
      || view === 'hamyari'
    ) {
      return
    }

    const fromList = listings.find((l) => String(l.id) === String(adId))
    if (fromList) {
      openListing(fromList)
      return
    }
    apiClient.getListing(adId).then(({ listing }) => {
      if (listing) openListing(listing)
    }).catch(() => {})
  }, [loading, listings, openListing, selectedListing, view])

  const openCategory = useCallback((catId) => {
    if (catId === 'charity' || catId === 'hamyari') {
      setViewTab('hamyari')
      return
    }
    if (catId === 'favorites' || catId === 'saved') {
      if (!isAuthenticated) {
        setPromptLogin(true)
        try {
          sessionStorage.setItem('pejo_auth_reason', 'save')
        } catch {
          /* ignore */
        }
        return
      }
      setViewTab('saved')
      return
    }
    if (catId === 'dating') {
      setViewTab('dating')
      return
    }
    if (catId === 'real-estate') {
      setSelectedCategory('real-estate')
      setCategoryFilters(getEmptyCategoryFilters('real-estate'))
      setRealEstateSheetOpen(false)
      pushView('real-estate')
      return
    }
    // Pejo categories → FB-style browse (tiles from existing subcategories)
    if (isPejoBrowseCategory(catId) || catId === 'business' || catId === 'couriers' || catId === 'home-market' || catId === 'travel') {
      let browseId = catId
      if (catId === 'kitchen' || catId === 'home-appliances' || catId === 'tools-rental') {
        browseId = 'buy-sell'
      }
      if (catId === 'food') browseId = 'restaurant'
      if (catId === 'couriers') browseId = 'kolbaran'
      if (catId === 'travel') browseId = 'transport'
      if (catId === 'occupations') browseId = 'jobs'
      if (catId === 'repairs') browseId = 'services'
      const cat = getPejoBrowseCategory(browseId)
      if (cat) {
        setSelectedCategory(browseId)
        if (cat?.apiCategory) {
          setCategoryFilters(getEmptyCategoryFilters(cat.apiCategory))
        }
        pushView('marketplace')
        return
      }
    }
    const apiCat = resolveApiCategory(catId)
    setSelectedCategory(apiCat)
    pushView('explore')
  }, [setSelectedCategory, pushView, setViewTab, isAuthenticated])

  const browseRealEstate = useCallback(({ subcategory = 'all', propertyType = 'all' } = {}) => {
    setSelectedCategory('real-estate')
    setCategoryFilters({
      ...getEmptyCategoryFilters('real-estate'),
      realEstateSubcategory: subcategory || 'all',
      realEstatePropertyType: propertyType || 'all',
    })
    setRealEstateSheetOpen(false)
    setSearchQuery('')
    setSearchIntent(null)
    pushView('explore')
  }, [setSelectedCategory, pushView])

  const openNewestListings = useCallback(() => {
    setSearchQuery('')
    setSearchIntent(null)
    setSelectedCategory(null)
    setSelectedRegion('all')
    setSortBy('newest')
    setViewTab('explore')
  }, [setSelectedCategory, setViewTab])

  const openPostModal = useCallback(() => {
    if (!isAuthenticated) {
      setPromptLogin(true)
      try {
        sessionStorage.setItem('pejo_auth_reason', 'post')
      } catch {
        /* ignore */
      }
      return
    }
    setShowPostModal(true)
  }, [isAuthenticated])

  const openDashboard = useCallback((tab = 'overview') => {
    setDashboardTab(tab)
    setView('dashboard')
  }, [])

  const addListing = useCallback(async (newListing) => {
    const { listing } = await apiClient.createListing(newListing)
    setMyListings((prev) => [listing, ...prev.filter((l) => l.id !== listing.id)])
    if (listing?.status === 'active') {
      setListings((prev) => [listing, ...prev])
    }
    setShowPostModal(false)
    setViewTab('my-ads')
    return listing
  }, [setViewTab])

  const updateMyListing = useCallback(async (id, patch) => {
    const { listing } = await apiClient.updateListing(id, patch)
    setMyListings((prev) => prev.map((l) => (l.id === id ? listing : l)))
    setListings((prev) => {
      if (listing?.status === 'active') {
        return prev.some((l) => l.id === id)
          ? prev.map((l) => (l.id === id ? listing : l))
          : [listing, ...prev]
      }
      return prev.filter((l) => l.id !== id)
    })
    setSelectedListing((cur) => (cur && cur.id === id ? listing : cur))
    return listing
  }, [])

  const deleteMyListing = useCallback(async (id) => {
    try {
      await apiClient.deleteListing(id)
    } catch { /* ignore */ }
    setListings((prev) => prev.filter((l) => l.id !== id))
    setMyListings((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const addWantSignal = useCallback(async (signal) => {
    try {
      const { want } = await apiClient.createWantSignal(signal)
      setWantSignals((prev) => [want, ...prev])
    } catch {
      setWantSignals((prev) => [
        {
          id: `w${Date.now()}`,
          seekers: 1,
          matches: 0,
          posted: 'Just now',
          avatar: userAvatar(user?.avatar),
          verified: true,
          ...signal,
        },
        ...prev,
      ])
    }
    setPulseTab('wants')
  }, [user])

  const removeAlert = useCallback(async (id) => {
    try {
      await apiClient.deleteAlert(id)
    } catch { /* ignore */ }
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const filteredListings = useMemo(() => {
    let result = listings.filter((l) => l.status === 'active')
    if (selectedCategory) result = result.filter((l) => l.category === selectedCategory)
    result = result.filter((l) => listingMatchesCity(l.city, selectedRegion))
    result = result.filter((l) => matchesCategoryFilters(l, categoryFilters, selectedCategory))

    if (searchQuery.trim()) {
      const intent = searchIntent || analyzeSearchQuery(searchQuery, selectedCategory)
      const q = searchQuery.toLowerCase()
      result = result.filter((l) => {
        const text = [l.title, l.description, l.neighborhood, l.city, ...(l.features || [])].join(' ').toLowerCase()
        const tokenHit = intent.tokens.some((t) => text.includes(t)) || text.includes(q)
        return tokenHit || scoreListing(l, searchQuery, intent) >= 20
      })
      result.sort((a, b) => scoreListing(b, searchQuery, intent) - scoreListing(a, searchQuery, intent))
    } else {
      switch (sortBy) {
        case 'price-asc': result.sort((a, b) => a.price - b.price); break
        case 'price-desc': result.sort((a, b) => b.price - a.price); break
        case 'popular': result.sort((a, b) => b.views - a.views); break
        default:
          result.sort((a, b) => listingSortTs(b) - listingSortTs(a))
          break
      }
    }
    return result
  }, [listings, selectedCategory, selectedRegion, categoryFilters, searchQuery, searchIntent, sortBy])

  const savedListings = listings.filter((l) => savedIds.has(Number(l.id)))
  const compareListings = listings.filter((l) => compareIds.includes(Number(l.id)))
  const proListings = listings.filter((l) => l.isPro)

  return (
    <AppContext.Provider
      value={{
        loading, apiError, refreshData, user,
        isAuthenticated, authLoading, authError, setAuthError, login, register, loginWithOtp, loginWithFirebase, checkPhone, sendOtp, logout, deleteAccount,
        updateProfile,
        sendEmailOtp,
        verifyEmailOtp,
        view, setView: setViewTab, setViewTab, pushView, goBack, viewHistory,
        proTab, setProTab,
        pulseTab, setPulseTab,
        dashboardTab, setDashboardTab, openDashboard,
        selectedCategory, setSelectedCategory,
        selectedListing,
        handshakeListing, openHandshake, showHandshakeModal, setShowHandshakeModal, submitHandshake,
        searchQuery, setSearchQuery, searchIntent, runSmartSearch, clearSearch, applySmartCategory, setApplySmartCategory,
        selectedRegion, setSelectedRegion,
        savedIds, toggleSave,
        compareIds, toggleCompare, compareListings,
        listings, wantSignals, handshakeOffers, demandPulse, pulseMatches, pendingOffers, proListings,
        myListings, updateMyListing, deleteMyListing,
        showPostModal, setShowPostModal, openPostModal,
        promptLogin, setPromptLogin,
        authGateOpen, setAuthGateOpen,
        viewMode, setViewMode,
        sortBy, setSortBy,
        categoryFilters, setCategoryFilters, resetAllFilters,
        alerts, setAlerts, removeAlert,
        filteredListings, savedListings,
        openListing, openCategory, browseRealEstate, realEstateSheetOpen, setRealEstateSheetOpen,
        openNewestListings, addListing, addWantSignal,
        chatThreads, setChatThreads, activeChatId, setActiveChatId, sendChatMessage, startChatForListing, markChatRead, chatUnreadCount, refreshChatThreads,
        setApiError,
        categories,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
