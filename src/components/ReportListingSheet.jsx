import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import MobileBottomSheet from './mobile/MobileBottomSheet'
import { useI18n } from '../context/I18nContext'
import { apiClient } from '../api/client'

export const REPORT_REASON_IDS = [
  'spam',
  'fraud',
  'wrong-category',
  'sold',
  'inappropriate',
  'other',
]

export default function ReportListingSheet({ listing, open, onClose }) {
  const { t } = useI18n()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [already, setAlready] = useState(false)

  useEffect(() => {
    if (!open) return
    setReason('')
    setDetails('')
    setSending(false)
    setError('')
    setDone(false)
    setAlready(false)
  }, [open, listing?.id])

  if (!listing) return null

  const submit = async () => {
    if (!reason || sending) return
    setSending(true)
    setError('')
    try {
      const res = await apiClient.reportListing(listing.id, {
        reason,
        details: reason === 'other' ? details : details.trim(),
      })
      setAlready(Boolean(res.alreadyReported))
      setDone(true)
    } catch (e) {
      setError(e?.message || t('reportFailed'))
    } finally {
      setSending(false)
    }
  }

  return (
    <MobileBottomSheet open={open} title={t('reportAd')} onClose={onClose}>
      {done ? (
        <div className="report-sheet-success">
          <CheckCircle2 className="w-10 h-10 text-divar-red" />
          <p className="report-sheet-success-title">
            {already ? t('reportAlreadySent') : t('reportThanks')}
          </p>
          <p className="report-sheet-success-body">{t('reportThanksBody')}</p>
          <button type="button" className="fb-re-btn-primary !w-full" onClick={onClose}>
            {t('ok')}
          </button>
        </div>
      ) : (
        <div className="report-sheet">
          <p className="report-sheet-hint">{t('reportHint')}</p>
          <ul className="mobile-sheet-list report-reason-list">
            {REPORT_REASON_IDS.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className={`mobile-sheet-option ${reason === id ? 'mobile-sheet-option-active' : ''}`}
                  onClick={() => setReason(id)}
                >
                  {t(`reportReasons.${id}`)}
                </button>
              </li>
            ))}
          </ul>

          {(reason === 'other' || reason === 'fraud') && (
            <label className="report-details-field">
              <span>{t('reportDetails')}</span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                rows={3}
                placeholder={t('reportDetailsPlaceholder')}
                maxLength={500}
              />
            </label>
          )}

          {error && <p className="report-sheet-error">{error}</p>}

          <div className="fb-re-sheet-actions">
            <button type="button" className="fb-re-btn-ghost" onClick={onClose} disabled={sending}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className="fb-re-btn-primary"
              disabled={!reason || sending}
              onClick={submit}
            >
              {sending ? t('sending') : t('reportSubmit')}
            </button>
          </div>
        </div>
      )}
    </MobileBottomSheet>
  )
}
