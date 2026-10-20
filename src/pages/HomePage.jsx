import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { popularCategories } from '../data/mobileUiData'
import FeaturedAdCard from '../components/mobile/FeaturedAdCard'
import GlassCategoryIcon from '../components/GlassCategoryIcon'
import PromoSlider from '../components/PromoSlider'
import { listingSortTs } from '../lib/listingTime'
import { listingCoverUrl, normalizeMedia } from '../lib/imageCompress'
import { listingTitle, listingPriceLabel } from '../lib/localizeListing'

/** Home categories: first row of marketplace cats, plus Home Market */
const HOME_CAT_SLOTS = [
  ...popularCategories.slice(0, 9),
  popularCategories.find((c) => c.id === 'home-market'),
].filter(Boolean)

export default function HomePage() {
  const {
    setViewTab, openPostModal, openCategory, openListing, openNewestListings, listings,
    savedIds, toggleSave,
  } = useApp()
  const { t, lang } = useI18n()

  const featured = useMemo(() => {
    const sorted = listings.filter((l) => l.status === 'active').sort((a, b) => {
      const pa = a.isPro ? 1 : 0
      const pb = b.isPro ? 1 : 0
      if (pb !== pa) return pb - pa
      return listingSortTs(b) - listingSortTs(a)
    })
    const pro = sorted.filter((l) => l.isPro)
    const pool = pro.length >= 6 ? pro : sorted
    return pool.slice(0, 6)
  }, [listings])

  return (
    <div className="mobile-page home-page home-page--flush">
      <PromoSlider />

      <section className="home-cats-panel">
        <div className="home-cats-panel-head">
          <button type="button" className="home-cats-post-btn" onClick={openPostModal}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>{t('postAd')}</span>
          </button>
          <button
            type="button"
            className="home-cats-post-btn"
            onClick={() => setViewTab('categories')}
          >
            <span>{t('allCategoriesLink')}</span>
          </button>
        </div>

        <div className="home-cats-grid home-cats-grid--2row">
          {HOME_CAT_SLOTS.map((cat) => (
            <div key={cat.id} className="home-cat-slot">
              <button
                type="button"
                className="home-cat-tile"
                aria-label={t(`cats.${cat.id}`)}
                onClick={() => openCategory(cat.id)}
              >
                <GlassCategoryIcon id={cat.id} size="sm" />
              </button>
              <span className="home-cat-label">{t(`cats.${cat.id}`)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mobile-section home-featured-section">
        <div className="home-cats-panel-head">
          <h3>{t('featuredAds')}</h3>
          <button type="button" className="home-cats-post-btn" onClick={openNewestListings}>
            <span>{t('more')}</span>
          </button>
        </div>
        <div className="featured-ads-grid">
          {featured.map((ad) => (
            <FeaturedAdCard
              key={ad.id}
              title={listingTitle(ad, lang)}
              priceLabel={listingPriceLabel(ad, lang, t)}
              image={listingCoverUrl(ad) || ad.image}
              media={normalizeMedia(ad.media?.length ? ad.media : ad.images)}
              hasVideo={ad.hasVideo || (ad.media || []).some((m) => m.type === 'video')}
              isSaved={savedIds.has(Number(ad.id))}
              onToggleSave={() => toggleSave(ad.id)}
              onClick={() => openListing(ad)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
