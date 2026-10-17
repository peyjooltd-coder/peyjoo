import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useI18n } from '../../context/I18nContext'
import { CANADA_CITIES, cityLabel } from '../../data/canadaCities'
import MobileBottomSheet from './MobileBottomSheet'

export default function MyLocationSheet({ open, onClose }) {
  const { user, updateProfile } = useApp()
  const { t, lang } = useI18n()
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !user) return
    setCity(user.city || 'ونکوور')
    setError('')
  }, [open, user])

  const save = async () => {
    if (!city.trim()) {
      setError(t('locationRequired'))
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateProfile({ city: city.trim() })
      onClose()
    } catch (err) {
      setError(err.message || t('profileSaveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <MobileBottomSheet open={open} title={t('myLocation')} onClose={onClose}>
      <div className="mobile-sheet-filters">
        <p className="text-xs text-divar-muted mb-2 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {t('myLocationHint')}
        </p>
        <div className="space-y-2">
          {CANADA_CITIES.filter((option) => option.id !== 'all').map((option) => (
            <button
              key={option.id}
              type="button"
              className={`w-full text-right px-3 py-3 rounded-xl border text-sm font-semibold ${
                city === option.id
                  ? 'border-divar-red bg-red-50 text-divar-red'
                  : 'border-divar-border bg-white text-divar-text'
              }`}
              onClick={() => setCity(option.id)}
            >
              {cityLabel(option.id, lang)}
            </button>
          ))}
        </div>
        {error ? <p className="text-sm text-divar-red mt-2">{error}</p> : null}
        <button type="button" className="post-submit-btn !mt-4" onClick={save} disabled={saving}>
          {saving ? t('saving') : t('saveChanges')}
        </button>
      </div>
    </MobileBottomSheet>
  )
}
