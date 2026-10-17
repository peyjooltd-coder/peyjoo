import { useI18n } from '../context/I18nContext'

export default function ApiLoading({ error, onRetry }) {
  const { t, isRtl } = useI18n()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-divar-bg p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="post-modal-card max-w-md w-full p-8 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="font-bold text-divar-text text-lg">{t('connectionFailed')}</h1>
          <p className="text-sm text-divar-muted mt-2">{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="post-submit-btn !w-full !mx-0 mt-6">
              {t('retry')}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-divar-bg gap-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-12 h-12 rounded-xl bg-divar-red flex items-center justify-center animate-pulse">
        <span className="text-white font-bold text-xl">P</span>
      </div>
      <p className="text-sm text-divar-muted font-medium">{t('loading')}</p>
    </div>
  )
}
