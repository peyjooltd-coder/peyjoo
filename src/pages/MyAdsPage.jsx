import { useState } from 'react'
import { Plus, Eye, Pencil, Trash2, Package } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { apiClient } from '../api/client'
import MobileBackButton from '../components/mobile/MobileBackButton'
import EditListingSheet from '../components/mobile/EditListingSheet'

export default function MyAdsPage() {
  const { myListings, openListing, openPostModal, deleteMyListing } = useApp()
  const { t, lang } = useI18n()
  const fa = lang === 'fa'
  const tabs = [
    { id: 'pending', label: fa ? 'منتظر تأیید' : 'Waiting for approval' },
    { id: 'active', label: fa ? 'در حال انتشار' : 'Published' },
    { id: 'rejected', label: fa ? 'تأیید نشده' : 'Not approved' },
  ]
  const [tab, setTab] = useState('pending')
  const [editListing, setEditListing] = useState(null)

  const filtered = myListings.filter((l) => (l.status || 'pending') === tab)

  const openEdit = async (l) => {
    setEditListing(l)
    try {
      const { listing } = await apiClient.getListing(l.id)
      if (listing) setEditListing(listing)
    } catch {
      /* keep card listing */
    }
  }

  return (
    <div className="mobile-page p-4">
      <MobileBackButton label={t('back')} fallback="profile" className="mb-2 -mr-1" />
      <div className="mobile-section-head mb-4">
        <h3>{t('myListings')}</h3>
        <button type="button" className="home-btn-primary !flex-none !px-4 !py-2 text-xs" onClick={openPostModal}>
          <Plus className="w-4 h-4" />
          {t('postAd')}
        </button>
      </div>

      <div className="chat-tabs mb-4">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`chat-tab ${tab === id ? 'chat-tab-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-divar-muted text-sm">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{fa ? 'هنوز آگهی‌ای ثبت نکرده‌اید' : 'You have not posted an ad yet'}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((l) => (
            <li key={l.id} className="category-row-card !min-h-0 !p-3">
              <img src={l.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm line-clamp-2">{l.title}</p>
                <p className="text-divar-red font-extrabold text-sm mt-1">{l.priceLabel}</p>
                <p className="text-xs text-amber-700 mt-1 font-bold">
                  {tab === 'rejected'
                    ? (fa ? 'تأیید نشده' : 'Not approved')
                    : tab === 'pending'
                      ? (fa ? 'منتظر تأیید' : 'Waiting for approval')
                      : (fa ? 'در حال انتشار' : 'Published')}
                </p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-divar-text"
                  onClick={() => openEdit(l)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {fa ? 'ویرایش آگهی' : 'Edit listing'}
                </button>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button type="button" onClick={() => openListing(l)} className="p-2 text-divar-muted" aria-label={fa ? 'مشاهده' : 'View'}>
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-divar-muted"
                  aria-label={fa ? 'ویرایش' : 'Edit'}
                  onClick={() => openEdit(l)}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => deleteMyListing(l.id)} className="p-2 text-divar-red" aria-label={fa ? 'حذف' : 'Delete'}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <EditListingSheet
        listing={editListing}
        open={!!editListing}
        onClose={() => setEditListing(null)}
      />
    </div>
  )
}
