import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import Layout from './components/Layout'
import { useApp } from './context/AppContext'
import { useI18n } from './context/I18nContext'
import ApiLoading from './components/ApiLoading'
import CategoriesPage from './pages/CategoriesPage'

const PostListingWizard = lazy(() => import('./components/PostListingWizard'))
const HandshakeModal = lazy(() => import('./components/HandshakeModal'))
const HomePage = lazy(() => import('./pages/HomePage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const chatPageImport = () => import('./pages/ChatPage')
const ChatPage = lazy(chatPageImport)
/** Prefetch chat chunk so opening messenger from an ad feels instant. */
if (typeof window !== 'undefined') {
  window.requestIdleCallback?.(chatPageImport) || setTimeout(chatPageImport, 1200)
}
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const MyAdsPage = lazy(() => import('./pages/MyAdsPage'))
const SavedPage = lazy(() => import('./pages/SavedPage'))
const DatingPage = lazy(() => import('./pages/DatingPage'))
const HamyariPage = lazy(() => import('./pages/HamyariPage'))
const NewsPage = lazy(() => import('./pages/NewsPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const RealEstateBrowsePage = lazy(() => import('./pages/RealEstateBrowsePage'))
const MarketplaceBrowsePage = lazy(() => import('./pages/MarketplaceBrowsePage'))

const pages = {
  home: HomePage,
  explore: ExplorePage,
  category: ExplorePage,
  categories: CategoriesPage,
  news: NewsPage,
  chat: ChatPage,
  dating: DatingPage,
  hamyari: HamyariPage,
  detail: ListingDetailPage,
  profile: ProfilePage,
  'my-ads': MyAdsPage,
  saved: SavedPage,
  'real-estate': RealEstateBrowsePage,
  marketplace: MarketplaceBrowsePage,
}

/** Views that require sign-in (open auth overlay instead of blanking the app). */
const AUTH_VIEWS = new Set(['my-ads', 'chat', 'saved', 'profile'])

function PageFallback() {
  return <div className="page-lazy-fallback" aria-hidden="true" />
}

function AppContent() {
  const {
    view, loading, apiError, refreshData, isAuthenticated, setViewTab,
    promptLogin, setPromptLogin, setShowPostModal, setAuthGateOpen,
  } = useApp()
  const { t, isRtl } = useI18n()
  const [showAuth, setShowAuth] = useState(false)
  const [authIntent, setAuthIntent] = useState('default')
  const pendingPostRef = useRef(false)
  const wasAuthRef = useRef(isAuthenticated)

  useEffect(() => {
    setAuthGateOpen(Boolean(!isAuthenticated && showAuth))
  }, [isAuthenticated, showAuth, setAuthGateOpen])

  useEffect(() => {
    if (!isAuthenticated && AUTH_VIEWS.has(view)) {
      setAuthIntent(view === 'profile' ? 'signup' : 'default')
      setShowAuth(true)
    }
  }, [view, isAuthenticated])

  useEffect(() => {
    if (!promptLogin) return
    try {
      pendingPostRef.current = sessionStorage.getItem('pejo_auth_reason') === 'post'
    } catch {
      pendingPostRef.current = false
    }
    setAuthIntent(pendingPostRef.current ? 'post' : 'default')
    setShowAuth(true)
  }, [promptLogin])

  useEffect(() => {
    const justLoggedIn = isAuthenticated && !wasAuthRef.current
    wasAuthRef.current = isAuthenticated
    if (!justLoggedIn) return

    setShowAuth(false)
    setPromptLogin(false)
    try {
      sessionStorage.removeItem('pejo_auth_reason')
    } catch {
      /* ignore */
    }
    if (pendingPostRef.current) {
      pendingPostRef.current = false
      setShowPostModal(true)
    }
  }, [isAuthenticated, setPromptLogin, setShowPostModal])

  const closeAuth = () => {
    setShowAuth(false)
    setPromptLogin(false)
    setAuthIntent('default')
    pendingPostRef.current = false
    try {
      sessionStorage.removeItem('pejo_auth_reason')
    } catch {
      /* ignore */
    }
    if (AUTH_VIEWS.has(view)) setViewTab('home')
  }

  if (loading) {
    return <ApiLoading error={null} onRetry={refreshData} />
  }

  if (apiError) {
    return <ApiLoading error={apiError} onRetry={refreshData} />
  }

  const Page = pages[view] || HomePage

  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Page />
        <PostListingWizard />
        <HandshakeModal />

        {!isAuthenticated && showAuth && createPortal(
          <div className="auth-gate-overlay" dir={isRtl ? 'rtl' : 'ltr'}>
            <button
              type="button"
              className="auth-gate-close"
              onClick={(e) => {
                e.stopPropagation()
                closeAuth()
              }}
              aria-label={t('cancel')}
            >
              ×
            </button>
            <AuthPage intent={authIntent} />
          </div>,
          document.body,
        )}
      </Suspense>
    </Layout>
  )
}

export default function App() {
  return <AppContent />
}
