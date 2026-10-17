import { useI18n } from '../context/I18nContext'

/** Inline upload progress bar for photos / videos. */
export default function MediaUploadProgress({ progress }) {
  const { lang } = useI18n()
  if (!progress) return null

  const percent = Math.min(100, Math.max(0, Number(progress.percent) || 0))
  const current = Number(progress.current) || 1
  const total = Number(progress.total) || 1
  const kind = progress.kind === 'video'
    ? (lang === 'fa' ? 'فیلم' : 'video')
    : (lang === 'fa' ? 'تصویر' : 'photo')
  const label = lang === 'fa'
    ? `در حال آپلود ${kind}…`
    : `Uploading ${kind}…`
  const fileLabel = total > 1
    ? (lang === 'fa' ? `${current} از ${total}` : `${current} of ${total}`)
    : null

  return (
    <div className="media-upload-progress" role="status" aria-live="polite">
      <div className="media-upload-progress-meta">
        <span>{label}{fileLabel ? ` · ${fileLabel}` : ''}</span>
        <strong dir="ltr">{percent}%</strong>
      </div>
      <div className="media-upload-progress-track">
        <div
          className="media-upload-progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
