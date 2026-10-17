import { Bookmark } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import MobileBackButton from '../components/mobile/MobileBackButton'
import FeedListingCard from '../components/mobile/FeedListingCard'
import { listingCoverUrl, normalizeMedia } from '../lib/imageCompress'

export default function SavedPage() {
  const { savedListings, openListing, toggleSave } = useApp()
  const { t } = useI18n()

  return (
    <div className="mobile-page p-4">
      <MobileBackButton label={t('back')} fallback="home" className="mb-2 -mr-1" />
      <div className="mobile-section-head mb-4">
        <h3>{t('cats.favorites')}</h3>
      </div>

      {savedListings.length === 0 ? (
        <div className="text-center py-12 text-divar-muted text-sm">
          <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{t('savedEmpty')}</p>
        </div>
      ) : (
        <div className="feed-grid">
          {savedListings.map((l) => (
            <div key={l.id} className="relative">
              <FeedListingCard
                title={l.title}
                priceLabel={l.priceLabel}
                image={listingCoverUrl(l) || l.image}
                media={normalizeMedia(l.media?.length ? l.media : l.images)}
                timeLabel={l.time}
                hasVideo={l.hasVideo || (l.media || []).some((m) => m.type === 'video')}
                isSaved
                onToggleSave={() => toggleSave(l.id)}
                onClick={() => openListing(l)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
