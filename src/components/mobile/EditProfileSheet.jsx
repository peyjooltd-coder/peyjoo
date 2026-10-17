import { useEffect, useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useI18n } from '../../context/I18nContext'
import MobileBottomSheet from './MobileBottomSheet'
import { fileToCompressedDataUrl } from '../../lib/imageCompress'
import { uploadOrKeep } from '../../lib/firebaseStorage'
import { PEJO_DEFAULT_AVATAR, userAvatar } from '../../lib/defaultAvatar'

export default function EditProfileSheet({ open, onClose }) {
  const { user, updateProfile } = useApp()
  const { t } = useI18n()
  const fileRef = useRef(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !user) return
    setName(user.name || '')
    setPhone(user.phone || '')
    setAvatar(user.avatar || '')
    setError('')
  }, [open, user])

  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const localUrl = await fileToCompressedDataUrl(file)
      const url = await uploadOrKeep(localUrl, 'avatars')
      setAvatar(url)
    } catch (err) {
      setError(err.message || t('profileSaveFailed'))
    }
  }

  const save = async () => {
    const u = name.trim().replace(/\s+/g, '_')
    if (u.length < 3) {
      setError(t('profileNameInvalid'))
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateProfile({
        name: u,
        phone: phone.trim(),
        avatar: avatar || user?.avatar || PEJO_DEFAULT_AVATAR,
      })
      onClose()
    } catch (err) {
      setError(err.message || t('profileSaveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <MobileBottomSheet open={open} title={t('editProfile')} onClose={onClose}>
      <div className="mobile-sheet-filters">
        <div className="flex flex-col items-center gap-2 mb-2">
          <button
            type="button"
            className="relative"
            onClick={() => fileRef.current?.click()}
            aria-label={t('changePhoto')}
          >
            <img
              src={userAvatar(avatar)}
              alt=""
              className="w-20 h-20 rounded-full object-cover border-2 border-divar-border"
            />
            <span className="absolute bottom-0 end-0 w-7 h-7 rounded-full bg-divar-red text-white flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickAvatar} />
        </div>

        <label className="mobile-sheet-field">
          <span>{t('username')}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/\s+/g, '_'))}
            dir="ltr"
            className="post-input"
            maxLength={32}
            placeholder={t('usernamePlaceholder')}
          />
        </label>
        <label className="mobile-sheet-field">
          <span>{t('phone')}</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
            className="post-input"
            placeholder="6045550100"
          />
        </label>
        {error ? <p className="text-sm text-divar-red mt-2">{error}</p> : null}
        <button type="button" className="post-submit-btn !mt-4" onClick={save} disabled={saving}>
          {saving ? t('saving') : t('saveChanges')}
        </button>
      </div>
    </MobileBottomSheet>
  )
}
