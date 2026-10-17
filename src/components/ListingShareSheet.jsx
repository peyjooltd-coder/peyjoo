import { Copy, MessageCircle, Send, Share2, X } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import {
  copyShareText,
  listingSharePayload,
  openTelegramShare,
  openWhatsAppShare,
  shareViaSystem,
} from '../lib/shareListing'

export default function ListingShareSheet({ listing, open, onClose }) {
  const { t, lang } = useI18n()
  if (!open || !listing) return null

  const payload = listingSharePayload(listing, lang)
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const run = async (fn) => {
    try {
      await fn()
      onClose?.()
    } catch {
      window.alert(t('shareFailed'))
    }
  }

  return (
    <div className="share-sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="share-sheet"
        role="dialog"
        aria-label={t('share')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="share-sheet-head">
          <h3>{t('shareWhere')}</h3>
          <button type="button" className="tg-icon-btn" onClick={onClose} aria-label={t('cancel')}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="share-sheet-preview">{listing.title}</p>
        <ul className="share-sheet-list">
          {canNative && (
            <li>
              <button
                type="button"
                className="share-sheet-option"
                onClick={() => run(async () => {
                  const r = await shareViaSystem(listing, lang)
                  if (r === 'unsupported') throw new Error('unsupported')
                })}
              >
                <Share2 className="w-5 h-5" />
                <span>{t('shareSystem')}</span>
              </button>
            </li>
          )}
          <li>
            <button
              type="button"
              className="share-sheet-option"
              onClick={() => run(async () => openWhatsAppShare(payload.full))}
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t('shareWhatsApp')}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="share-sheet-option"
              onClick={() => run(async () => openTelegramShare(payload.url, payload.text))}
            >
              <Send className="w-5 h-5" />
              <span>{t('shareTelegram')}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="share-sheet-option"
              onClick={() => run(async () => {
                await copyShareText(payload.full)
                window.alert(t('shareLinkCopied'))
              })}
            >
              <Copy className="w-5 h-5" />
              <span>{t('shareCopy')}</span>
            </button>
          </li>
        </ul>
        <p className="share-sheet-hint">{t('shareHint')}</p>
      </div>
    </div>
  )
}
