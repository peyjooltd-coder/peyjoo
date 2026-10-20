import { useEffect, useRef, useState } from 'react'
import {
  Bookmark, Share2, MapPin, Eye, MessageCircle,
  Flag, Pencil,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import MobileBackButton from '../components/mobile/MobileBackButton'
import FeedListingCard from '../components/mobile/FeedListingCard'
import EditListingSheet from '../components/mobile/EditListingSheet'
import ListingShareSheet from '../components/ListingShareSheet'
import ReportListingSheet from '../components/ReportListingSheet'
import RealEstateListingDetails from '../components/RealEstateListingDetails'
import RealEstateAgencySlider from '../components/RealEstateAgencySlider'
import { RE_AGENCIES } from '../data/realEstateAgencyBanners'
import { cityLabel } from '../data/canadaCities'
import KolbaranListingDetails from '../components/KolbaranListingDetails'
import ExchangeListingDetails from '../components/ExchangeListingDetails'
import MediaSlide, { listingMediaList } from '../components/MediaSlide'
import GallerySideNav from '../components/GallerySideNav'
import MobileBottomSheet from '../components/mobile/MobileBottomSheet'
import { listingCoverUrl, normalizeMedia } from '../lib/imageCompress'
import { useSwipeGallery } from '../hooks/useSwipeGallery'
import { scrollAppToTop } from '../lib/shareListing'
import {
  listingTitle,
  listingDescription,
  listingPriceLabel,
  listingCondition,
  listingTimeLabel,
} from '../lib/localizeListing'

export default function ListingDetailPage() {
  const {
    selectedListing, savedIds, toggleSave, listings, openListing,
    startChatForListing, user, isAuthenticated, setPromptLogin,
  } = useApp()
  const { t, lang } = useI18n()
  const [imgIndex, setImgIndex] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const galleryRef = useRef(null)
  const scrollRef = useRef(null)

  const media = listingMediaList(selectedListing)

  useEffect(() => {
    setImgIndex(0)
    setShareOpen(false)
    setEditOpen(false)
    setSafetyOpen(false)
    setReportOpen(false)
    scrollAppToTop({ smooth: false })
    const el = scrollRef.current
    if (el) el.scrollTop = 0
  }, [selectedListing?.id])

  useSwipeGallery(galleryRef, {
    enabled: media.length > 1,
    count: media.length,
    onIndex: setImgIndex,
  })

  if (!selectedListing) {
    return (
      <div className="mobile-page detail-page p-4">
        <MobileBackButton label={t('back')} fallback="explore" />
        <p className="text-sm text-divar-muted mt-6 text-center">
          {lang === 'fa' ? 'این آگهی پیدا نشد.' : 'This listing could not be opened.'}
        </p>
      </div>
    )
  }

  const isSaved = savedIds.has(Number(selectedListing.id))
  const isOwner = Boolean(
    isAuthenticated && user?.id && Number(user.id) === Number(selectedListing.userId),
  )
  const isRealEstate = selectedListing.category === 'real-estate'
  const isKolbaran = selectedListing.category === 'kolbaran'
  const isExchange = selectedListing.category === 'exchange'
  const catKey = `cats.${selectedListing.category}`
  const catLabel = t(catKey)
  const headerTitle = catLabel === catKey ? selectedListing.title : catLabel
  const placeParts = [selectedListing.neighborhood, selectedListing.city]
    .map((x) => String(x || '').trim())
    .filter(Boolean)
  const placeLabel = [...new Set(placeParts.map((p) => p.toLowerCase()))]
    .map((key) => placeParts.find((p) => p.toLowerCase() === key))
    .map((p) => cityLabel(p, lang))
    .join(lang === 'fa' ? '، ' : ', ')
  const similar = listings
    .filter((l) => (
      l.category === selectedListing.category
      && l.id !== selectedListing.id
      && l.status === 'active'
    ))
    .slice(0, 4)
  const locale = lang === 'fa' ? 'fa-IR' : 'en-CA'
  const current = media[imgIndex] || media[0]
  const isVideoSlide = current?.type === 'video'

  return (
    <div className={`mobile-page detail-page detail-page-sticky ${isRealEstate ? 'detail-page-re' : ''}`}>
      <header className="cat-browse-header detail-listing-header">
        <div className="cat-browse-header-row">
          <MobileBackButton
            label={t('back')}
            fallback="explore"
            variant="onOrange"
            className="cat-browse-back"
          />
          <p className="cat-browse-cat-title detail-listing-header-title">{headerTitle}</p>
          <div className="detail-listing-header-actions">
            {isOwner && (
              <button
                type="button"
                className="detail-listing-header-btn"
                onClick={() => setEditOpen(true)}
                aria-label={t('editAd')}
                title={t('editAd')}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              className="detail-listing-header-btn"
              onClick={() => toggleSave(selectedListing.id)}
              aria-label={t('save')}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>
            <button
              type="button"
              className="detail-listing-header-btn"
              onClick={() => setShareOpen(true)}
              aria-label={t('share')}
              title={t('share')}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {isOwner && (
        <div className="detail-status-bar">
          <span>
            {selectedListing.status === 'rejected'
              ? (lang === 'fa' ? 'تأیید نشده' : 'Not approved')
              : selectedListing.status === 'pending'
                ? (lang === 'fa' ? 'منتظر تأیید' : 'Waiting for approval')
                : (lang === 'fa' ? 'در حال انتشار' : 'Published')}
          </span>
          <button type="button" onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4" />
            {lang === 'fa' ? 'ویرایش' : 'Edit'}
          </button>
        </div>
      )}

      <div className="detail-scroll" ref={scrollRef}>
        <div className={`detail-gallery ${isVideoSlide ? 'is-video-slide' : ''}`} ref={galleryRef}>
          {current ? (
            <MediaSlide item={current} className="detail-main-image" eager />
          ) : null}
          <GallerySideNav
            count={media.length}
            index={imgIndex}
            onIndex={setImgIndex}
            prevLabel={t('prev')}
            nextLabel={t('next')}
          />
          {selectedListing.isPro && <span className="detail-pro-badge">{t('proSeller')}</span>}
        </div>
        {media.length > 1 && (
          <div className="detail-gallery-meta">
            <div className="detail-gallery-dots" aria-hidden>
              {media.map((_, i) => (
                <span key={i} className={i === imgIndex ? 'is-active' : ''} />
              ))}
            </div>
            <span className="detail-img-counter">{imgIndex + 1}/{media.length}</span>
          </div>
        )}

        <div className="detail-body">
          {!isRealEstate && (
            <p className="detail-price">{listingPriceLabel(selectedListing, lang, t)}</p>
          )}
          <h1 className="detail-title" dir="auto">{listingTitle(selectedListing, lang)}</h1>

          {!isRealEstate && (
            <div className="detail-meta-row">
              <span>
                <MapPin className="w-4 h-4" />
                {listingTimeLabel(selectedListing, lang, t)}
                {placeLabel ? ` · ${placeLabel}` : ''}
              </span>
              <span>
                <Eye className="w-4 h-4" />
                {(selectedListing.views || 0).toLocaleString(locale)} {t('views')}
              </span>
            </div>
          )}

          {isRealEstate && (
            <RealEstateListingDetails
              listing={selectedListing}
              onOpenSafety={() => setSafetyOpen(true)}
            />
          )}

          {isKolbaran && (
            <KolbaranListingDetails listing={selectedListing} />
          )}

          {isExchange && (
            <ExchangeListingDetails listing={selectedListing} />
          )}

          <section className="detail-section">
            <h2>{t('description')}</h2>
            <p className="detail-description-text" dir="auto">{listingDescription(selectedListing, lang)}</p>
          </section>

          {isOwner && (
            <button type="button" className="detail-edit-btn" onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4" />
              {t('editAd')}
            </button>
          )}

          {!isRealEstate && (
            <div className="detail-facts">
              {[
                { label: t('condition'), value: listingCondition(selectedListing, lang, t) },
                { label: t('category'), value: t(`cats.${selectedListing.category}`) },
              ].map(({ label, value }) => (
                <div key={label} className="detail-fact">
                  <span className="detail-fact-label">{label}</span>
                  <span className="detail-fact-value">{value}</span>
                </div>
              ))}
            </div>
          )}

          {!isOwner && (
            <button
              type="button"
              className="detail-report"
              onClick={() => {
                if (!isAuthenticated) {
                  setPromptLogin(true)
                  return
                }
                setReportOpen(true)
              }}
            >
              <Flag className="w-3.5 h-3.5" /> {t('reportAd')}
            </button>
          )}
        </div>

        {isRealEstate && (
          <section className="mobile-section detail-re-banner">
            <RealEstateAgencySlider
              agency={RE_AGENCIES[Number(selectedListing.id) % RE_AGENCIES.length]}
            />
          </section>
        )}

        {similar.length > 0 && (
          <section className="mobile-section">
            <div className="mobile-section-head">
              <h3>{t('similarAds')}</h3>
            </div>
            <div className="feed-grid">
              {similar.map((l) => (
                <FeedListingCard
                  key={l.id}
                  title={listingTitle(l, lang)}
                  priceLabel={listingPriceLabel(l, lang, t)}
                  image={listingCoverUrl(l) || l.image}
                  media={normalizeMedia(l.media?.length ? l.media : l.images)}
                  hasVideo={l.hasVideo || (l.media || []).some((m) => m.type === 'video')}
                  onClick={() => openListing(l)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Always show chat CTA for buyers — do not hide when Similar ads are on-screen. */}
      {!isOwner && (
        <div className="detail-sticky-bar detail-sticky-bar-fixed">
          <button
            type="button"
            className="detail-btn-primary"
            onClick={() => startChatForListing(selectedListing)}
          >
            <MessageCircle className="w-4 h-4" />
            {t('chatCta')}
          </button>
        </div>
      )}

      <ListingShareSheet
        listing={selectedListing}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
      <EditListingSheet
        listing={selectedListing}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
      <ReportListingSheet
        listing={selectedListing}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
      <MobileBottomSheet
        open={safetyOpen}
        title={t('reSafetyTitle')}
        onClose={() => setSafetyOpen(false)}
      >
        <p className="re-safety-sheet-body">{t('reSafetyBody')}</p>
      </MobileBottomSheet>
    </div>
  )
}
