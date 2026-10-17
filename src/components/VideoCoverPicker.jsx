import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImagePlus, X } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { captureVideoFrame, fileToCompressedDataUrl } from '../lib/imageCompress'
import { uploadOrKeep } from '../lib/firebaseStorage'

/**
 * Instagram-style cover picker: scrub a video frame or upload a custom cover image.
 * Portaled to document.body so it appears above ثبت آگهی / edit sheets.
 */
export default function VideoCoverPicker({
  open,
  videoUrl,
  initialPoster = '',
  onConfirm,
  onCancel,
}) {
  const { lang } = useI18n()
  const fa = lang === 'fa'
  const tx = (persian, english) => (fa ? persian : english)
  const videoRef = useRef(null)
  const coverFileRef = useRef(null)
  const [duration, setDuration] = useState(0)
  const [time, setTime] = useState(0)
  const [poster, setPoster] = useState(initialPoster || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setPoster(initialPoster || '')
    setTime(0)
    setDuration(0)
    setError('')
    setBusy(false)
  }, [open, videoUrl, initialPoster])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || !videoUrl) return null

  const onMeta = () => {
    const v = videoRef.current
    if (!v) return
    const d = Number.isFinite(v.duration) ? v.duration : 0
    setDuration(d)
    const start = d > 0.3 ? Math.min(0.15, d * 0.05) : 0
    setTime(start)
    try {
      v.currentTime = start
    } catch {
      /* ignore */
    }
  }

  const onSeeked = () => {
    const v = videoRef.current
    if (!v || busy) return
    try {
      setPoster(captureVideoFrame(v))
      setError('')
    } catch {
      /* wait until dimensions ready */
    }
  }

  const onScrub = (e) => {
    const next = Number(e.target.value)
    setTime(next)
    const v = videoRef.current
    if (v) {
      try {
        v.currentTime = next
      } catch {
        /* ignore */
      }
    }
  }

  const onUploadCover = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const localUrl = await fileToCompressedDataUrl(file)
      const url = await uploadOrKeep(localUrl, 'covers')
      setPoster(url)
    } catch (err) {
      setError(err.message || tx('آپلود کاور ممکن نشد', 'Could not upload the cover'))
    } finally {
      setBusy(false)
    }
  }

  const confirm = async () => {
    if (!poster) {
      setError(tx('یک فریم از ویدیو انتخاب کنید یا کاور آپلود کنید', 'Pick a video frame or upload a cover'))
      return
    }
    setBusy(true)
    setError('')
    try {
      const url = await uploadOrKeep(poster, 'covers')
      onConfirm?.(url)
    } catch (err) {
      setError(err.message || tx('ذخیره کاور ممکن نشد', 'Could not save the cover'))
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <div className="video-cover-overlay" role="dialog" aria-modal="true" aria-label={tx('انتخاب کاور ویدیو', 'Choose video cover')}>
      <div className="video-cover-sheet">
        <header className="video-cover-header">
          <h3>{tx('کاور آگهی', 'Listing cover')}</h3>
          <button type="button" className="video-cover-close" onClick={onCancel} aria-label={tx('بستن', 'Close')}>
            <X className="w-5 h-5" />
          </button>
        </header>
        <p className="video-cover-hint">
          {tx('یک فریم از ویدیو را انتخاب کنید یا عکس کاور آپلود کنید. اگر ببندید، یک فریم از ویدیو خودکار به‌عنوان کاور گذاشته می‌شود.', 'Pick a frame or upload a cover. If you close this, a frame from the video is used automatically.')}
        </p>

        <div className="video-cover-preview">
          {poster ? (
            <img src={poster} alt="" className="video-cover-preview-img" />
          ) : (
            <div className="video-cover-preview-empty">{tx('در حال آماده‌سازی…', 'Preparing…')}</div>
          )}
          <span className="video-cover-preview-label">{tx('پیش‌نمایش کاور', 'Cover preview')}</span>
        </div>

        <video
          ref={videoRef}
          src={videoUrl}
          className="video-cover-scrubber"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={onMeta}
          onSeeked={onSeeked}
        />

        {duration > 0 && (
          <label className="video-cover-slider-wrap">
            <span>{tx('جابه‌جایی در ویدیو', 'Scrub the video')}</span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.05}
              value={Math.min(time, duration)}
              onChange={onScrub}
              className="video-cover-slider"
            />
          </label>
        )}

        <div className="video-cover-actions">
          <button
            type="button"
            className="video-cover-upload-btn"
            onClick={() => coverFileRef.current?.click()}
            disabled={busy}
          >
            <ImagePlus className="w-4 h-4" />
            {tx('آپلود کاور', 'Upload cover')}
          </button>
          <input
            ref={coverFileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onUploadCover}
          />
          <button type="button" className="video-cover-confirm-btn" onClick={confirm} disabled={busy || !poster}>
            {tx('تأیید کاور', 'Use this cover')}
          </button>
        </div>
        {error ? <p className="video-cover-error">{error}</p> : null}
      </div>
    </div>,
    document.body,
  )
}
