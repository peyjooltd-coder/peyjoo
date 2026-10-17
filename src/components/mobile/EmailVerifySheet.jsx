import { useEffect, useState } from 'react'
import { Mail, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useI18n } from '../../context/I18nContext'
import MobileBottomSheet from './MobileBottomSheet'

export default function EmailVerifySheet({ open, onClose }) {
  const { user, sendEmailOtp, verifyEmailOtp } = useApp()
  const { t, lang } = useI18n()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // email | code
  const [hint, setHint] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setEmail(user?.email || '')
    setCode('')
    setHint('')
    setError('')
    setStep(user?.emailVerified ? 'email' : (user?.email ? 'email' : 'email'))
  }, [open, user])

  const requestCode = async (e) => {
    e.preventDefault()
    const cleaned = email.trim().toLowerCase()
    if (!cleaned.includes('@') || cleaned.length < 5) {
      setError(t('emailInvalid'))
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await sendEmailOtp(cleaned)
      setHint(res?.hint || '')
      setCode('')
      setStep('code')
    } catch (err) {
      setError(err?.message || t('pleaseWait'))
    } finally {
      setSaving(false)
    }
  }

  const submitCode = async (e) => {
    e.preventDefault()
    if (code.trim().length < 4) {
      setError(lang === 'fa' ? 'کد تأیید را وارد کنید' : 'Enter the verification code')
      return
    }
    setSaving(true)
    setError('')
    try {
      await verifyEmailOtp(email.trim().toLowerCase(), code.trim())
      onClose()
    } catch (err) {
      setError(err?.message || t('pleaseWait'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <MobileBottomSheet open={open} title={t('email')} onClose={onClose}>
      <div className="mobile-sheet-filters">
        {user?.emailVerified ? (
          <div className="email-verify-ok">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-700">{t('emailVerified')}</p>
              <p className="text-xs text-divar-muted mt-0.5" dir="ltr">{user.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-divar-red font-semibold mb-3">{t('emailUnverifiedHint')}</p>
        )}

        {step === 'email' ? (
          <form onSubmit={requestCode} className="space-y-3">
            <label className="mobile-sheet-field">
              <span>{t('email')}</span>
              <div className="auth-pro-field !mt-1">
                <Mail className="auth-pro-field-icon" strokeWidth={2.1} />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
                  className="auth-pro-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>
            {error ? <p className="text-sm text-divar-red">{error}</p> : null}
            <button type="submit" className="post-submit-btn !mt-2" disabled={saving}>
              {saving ? t('pleaseWait') : t('sendEmailCode')}
            </button>
          </form>
        ) : (
          <form onSubmit={submitCode} className="space-y-3">
            <p className="text-xs text-divar-muted" dir="ltr">{email}</p>
            {hint ? (
              <p className="text-xs text-divar-muted">
                {lang === 'fa' ? `کد موقت: ${hint}` : `Temp code: ${hint}`}
              </p>
            ) : null}
            <label className="mobile-sheet-field">
              <span>{t('verificationCode')}</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                dir="ltr"
                className="post-input"
                placeholder="•••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
                required
              />
            </label>
            {error ? <p className="text-sm text-divar-red">{error}</p> : null}
            <button type="submit" className="post-submit-btn !mt-2" disabled={saving}>
              {saving ? t('pleaseWait') : t('verifyEmail')}
            </button>
            <button
              type="button"
              className="w-full text-sm text-divar-muted py-2"
              disabled={saving}
              onClick={() => { setStep('email'); setError(''); setCode('') }}
            >
              {t('changeEmail')}
            </button>
          </form>
        )}
      </div>
    </MobileBottomSheet>
  )
}
