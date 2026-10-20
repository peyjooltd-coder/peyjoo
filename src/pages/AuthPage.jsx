import { useEffect, useMemo, useRef, useState } from 'react'
import { Phone, ShieldCheck, User, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import AppLogo from '../components/AppLogo'
import LanguageToggle from '../components/LanguageToggle'
import {
  confirmPhoneOtp,
  resetPhoneAuth,
} from '../lib/firebasePhoneAuth'
import {
  BYPASS_OTP,
  canonicalBypassPhone,
  isBypassPhone,
  isGoogleReviewPhone,
} from '../lib/devBypassPhone'

const PENDING_FB_TOKEN_KEY = 'pejo_pending_fb_id_token'

function digitsOnly(v) {
  return String(v || '').replace(/\D/g, '')
}

/** Iranian 09… stays 11 digits. +1 / 1-prefixed Canadian becomes 10 NANP digits. */
function normalizeAuthPhone(raw) {
  let d = digitsOnly(raw)
  if (!d) return ''
  if (d.startsWith('98')) d = `0${d.slice(2)}`
  const bypass = canonicalBypassPhone(d)
  if (bypass) return bypass
  if (d.startsWith('09')) return d.slice(0, 11)
  if (d.startsWith('1')) d = d.slice(1)
  return d.slice(0, 10)
}

function isIranianInput(raw) {
  return normalizeAuthPhone(raw).startsWith('09')
}

function formatPhoneDisplay(raw) {
  const d = normalizeAuthPhone(raw)
  if (d.startsWith('09')) {
    const x = d.slice(0, 11)
    if (x.length <= 4) return x
    if (x.length <= 7) return `${x.slice(0, 4)} ${x.slice(4)}`
    return `${x.slice(0, 4)} ${x.slice(4, 7)} ${x.slice(7)}`
  }
  const c = d.slice(0, 10)
  if (c.length <= 3) return c
  if (c.length <= 6) return `(${c.slice(0, 3)}) ${c.slice(3)}`
  return `(${c.slice(0, 3)}) ${c.slice(3, 6)}-${c.slice(6)}`
}

function readPendingFirebaseToken() {
  try {
    return sessionStorage.getItem(PENDING_FB_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function writePendingFirebaseToken(token) {
  try {
    if (token) sessionStorage.setItem(PENDING_FB_TOKEN_KEY, token)
    else sessionStorage.removeItem(PENDING_FB_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * Phone-only auth as in-card steps (avoids iOS keyboard + bottom-sheet bugs).
 * @param {{ intent?: 'post' | 'signup' | 'default' }} props
 */
export default function AuthPage({ intent = 'default' }) {
  const {
    loginWithFirebase, loginWithOtp, checkPhone, sendOtp,
    authError, authLoading, setAuthError,
  } = useApp()
  const { t, isRtl, lang } = useI18n()

  const startOnSignup = intent === 'post' || intent === 'signup'
  const [flow, setFlow] = useState(startOnSignup ? 'signup' : 'signin')
  const [step, setStep] = useState('phone') // phone | code | profile
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [username, setUsername] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [localError, setLocalError] = useState(null)
  /** Survives re-renders / intent flips; OTP confirm must not run twice. */
  const firebaseIdTokenRef = useRef(readPendingFirebaseToken())

  const clearPendingFirebaseToken = () => {
    firebaseIdTokenRef.current = ''
    writePendingFirebaseToken('')
  }

  const stashFirebaseToken = (token) => {
    const value = String(token || '')
    firebaseIdTokenRef.current = value
    writePendingFirebaseToken(value)
  }

  const resetAuthDraft = () => {
    setLocalError(null)
    setStep('phone')
    setCode('')
    setUsername('')
    clearPendingFirebaseToken()
    resetPhoneAuth()
  }

  // Only sync sign-in/up tab from parent intent — never wipe mid OTP/profile flow.
  useEffect(() => {
    setFlow(intent === 'post' || intent === 'signup' ? 'signup' : 'signin')
  }, [intent])

  useEffect(() => () => { resetPhoneAuth() }, [])

  const subtitle = useMemo(() => {
    if (step === 'code') {
      return lang === 'fa' ? 'کد تأیید ارسال‌شده را وارد کنید' : 'Enter the verification code we sent'
    }
    if (step === 'profile') {
      return t('authCompleteProfileHint')
    }
    if (intent === 'post') return t('authPostHint')
    return flow === 'signup' ? t('authPhoneSignupHint') : t('authPhoneSigninHint')
  }, [intent, flow, step, t, lang])

  const switchFlow = (next) => {
    setFlow(next)
    resetAuthDraft()
  }

  const requestOtp = async (e) => {
    e.preventDefault()
    setLocalError(null)
    if (!agreed) {
      setLocalError(t('mustAgree'))
      return
    }
    const cleaned = normalizeAuthPhone(phone)
    const bypass = isBypassPhone(cleaned)
    if (!bypass && cleaned.length !== 10) {
      setLocalError(lang === 'fa' ? 'شماره موبایل ۱۰ رقمی کانادا را وارد کنید' : 'Enter a 10-digit Canadian mobile number')
      return
    }
    try {
      const check = await checkPhone(cleaned)
      if (!isGoogleReviewPhone(cleaned)) {
        if (flow === 'signin' && check?.isNewUser) {
          setLocalError(t('authNoAccountPhone'))
          return
        }
        if (flow === 'signup' && check && check.isNewUser === false) {
          setLocalError(t('authHaveAccountPhone'))
          return
        }
      }
      clearPendingFirebaseToken()
      // Google Play review account: log in immediately, no SMS / OTP screen.
      if (isGoogleReviewPhone(cleaned)) {
        const result = await loginWithOtp(cleaned, BYPASS_OTP, {})
        if (result?.needsProfile) {
          setAuthError?.(null)
          setLocalError(null)
          setCode(BYPASS_OTP)
          setStep('profile')
          return
        }
        resetAuthDraft()
        return
      }
      if (!bypass) {
        await sendOtp(cleaned, lang)
      }
      setCode('')
      setStep('code')
    } catch (err) {
      setLocalError(err?.message || t('pleaseWait'))
    }
  }

  /** Confirm OTP once, then open profile or finish login. */
  const submitOtp = async (e) => {
    e.preventDefault()
    setLocalError(null)
    const cleaned = normalizeAuthPhone(phone)
    const minLen = isBypassPhone(cleaned) ? 4 : 6
    if (code.trim().length < minLen) {
      setLocalError(lang === 'fa' ? 'کد تأیید را وارد کنید' : 'Enter the verification code')
      return
    }
    try {
      if (isBypassPhone(cleaned)) {
        const result = await loginWithOtp(cleaned, code.trim(), {})
        if (result?.needsProfile) {
          setAuthError?.(null)
          setLocalError(null)
          setStep('profile')
          return
        }
        resetAuthDraft()
        return
      }

      let idToken = firebaseIdTokenRef.current || readPendingFirebaseToken()
      if (!idToken) {
        const confirmed = await confirmPhoneOtp(code.trim(), lang)
        idToken = confirmed.idToken
        stashFirebaseToken(idToken)
      }
      const result = await loginWithFirebase(idToken, {})
      if (result?.needsProfile) {
        setAuthError?.(null)
        setLocalError(null)
        setStep('profile')
        return
      }
      clearPendingFirebaseToken()
      setStep('phone')
      setCode('')
    } catch (err) {
      setLocalError(err?.message || t('pleaseWait'))
    }
  }

  /** Finish signup with username — reuse cached Firebase token; never re-confirm OTP. */
  const submitProfile = async (e) => {
    e.preventDefault()
    setLocalError(null)
    setAuthError?.(null)
    const u = username.trim().replace(/\s+/g, '_')
    if (u.length < 3) {
      setLocalError(lang === 'fa' ? 'یوزرنیم باید حداقل ۳ کاراکتر باشد' : 'Username must be at least 3 characters')
      return
    }
    if (!/^[\w.\u0600-\u06FF-]{3,32}$/u.test(u)) {
      setLocalError(lang === 'fa' ? 'یوزرنیم نامعتبر است' : 'Invalid username')
      return
    }
    const cleaned = normalizeAuthPhone(phone)
    try {
      if (isBypassPhone(cleaned)) {
        const result = await loginWithOtp(cleaned, code.trim(), { username: u })
        if (result?.needsProfile) {
          setLocalError(lang === 'fa' ? 'یوزرنیم ذخیره نشد. دوباره تلاش کنید.' : 'Could not save username. Try again.')
          return
        }
        clearPendingFirebaseToken()
        return
      }

      const idToken = firebaseIdTokenRef.current || readPendingFirebaseToken()
      if (!idToken) {
        setLocalError(
          lang === 'fa'
            ? 'نشست تأیید منقضی شد. دوباره کد بگیرید.'
            : 'Verification expired. Request a new code.',
        )
        resetAuthDraft()
        return
      }

      const result = await loginWithFirebase(idToken, { username: u })
      if (result?.needsProfile) {
        setLocalError(lang === 'fa' ? 'یوزرنیم ذخیره نشد. دوباره تلاش کنید.' : 'Could not save username. Try again.')
        return
      }
      clearPendingFirebaseToken()
    } catch (err) {
      setLocalError(err?.message || t('pleaseWait'))
    }
  }

  const error = localError || authError

  return (
    <div className="auth-page-shell auth-page-pro" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="auth-pro-topbar">
        <LanguageToggle />
      </div>

      <div className="auth-pro-card">
        <div className="auth-pro-brand">
          <AppLogo className="auth-pro-logo" />
          <h1>{t('brand')}</h1>
          <p>{subtitle}</p>
        </div>

        {step === 'phone' ? (
          <>
            <div className="auth-pro-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={flow === 'signin'}
                className={`auth-pro-tab ${flow === 'signin' ? 'is-active' : ''}`}
                onClick={() => switchFlow('signin')}
              >
                {t('authSignIn')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={flow === 'signup'}
                className={`auth-pro-tab ${flow === 'signup' ? 'is-active' : ''}`}
                onClick={() => switchFlow('signup')}
              >
                {t('authSignUp')}
              </button>
            </div>

            {error ? <div className="auth-pro-error">{error}</div> : null}

            <form onSubmit={requestOtp} className="auth-pro-form">
              <label className="auth-pro-label" htmlFor="auth-phone">{t('phoneNumber')}</label>
              <div className="auth-pro-field">
                <Phone className="auth-pro-field-icon" strokeWidth={2.1} />
                {isIranianInput(phone) ? null : (
                  <span className="auth-pro-prefix" dir="ltr">+1</span>
                )}
                <input
                  id="auth-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  dir="ltr"
                  className="auth-pro-input"
                  placeholder={isIranianInput(phone) ? '0919 204 7834' : '(604) 555-0100'}
                  value={formatPhoneDisplay(phone)}
                  onChange={(e) => setPhone(normalizeAuthPhone(e.target.value))}
                />
              </div>
              <p className="auth-pro-hint">
                {lang === 'fa'
                  ? 'کد تأیید به همین شماره ارسال می‌شود.'
                  : 'We will send a verification code to this number.'}
              </p>
              <label className="auth-legal">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  aria-checked={agreed}
                />
                <span>
                  {t('agreeTerms')}{' '}
                  <a href="/terms/" target="_blank" rel="noreferrer">{t('termsTitle')}</a>
                  {' · '}
                  <a href="/privacy/" target="_blank" rel="noreferrer">{t('privacyPolicyTitle')}</a>
                </span>
              </label>
              <button type="submit" disabled={authLoading || !agreed} className="auth-pro-submit">
                {authLoading ? t('pleaseWait') : t('sendCode')}
              </button>
            </form>

            <p className="auth-pro-switch">
              {flow === 'signin' ? t('authNoAccount') : t('authHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => switchFlow(flow === 'signin' ? 'signup' : 'signin')}
              >
                {flow === 'signin' ? t('authSignUp') : t('authSignIn')}
              </button>
            </p>
          </>
        ) : null}

        {step === 'code' ? (
          <>
            <div className="auth-step-badge">
              <ShieldCheck className="w-5 h-5" strokeWidth={2.2} />
              <span dir="ltr">{isBypassPhone(phone) ? formatPhoneDisplay(phone) : `+1 ${formatPhoneDisplay(phone)}`}</span>
            </div>
            {error ? <div className="auth-pro-error">{error}</div> : null}
            <form onSubmit={submitOtp} className="auth-pro-form">
              <label className="auth-pro-label" htmlFor="auth-otp">{t('verificationCode')}</label>
              <input
                id="auth-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                dir="ltr"
                className="auth-otp-code-input"
                placeholder="•••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
              />
              <button type="submit" disabled={authLoading} className="auth-pro-submit">
                {authLoading ? t('signingIn') : t('verifyAndLogin')}
              </button>
              <button
                type="button"
                className="auth-otp-back"
                disabled={authLoading}
                onClick={() => { resetAuthDraft() }}
              >
                <ArrowLeft className="w-4 h-4" />
                {t('changeNumber')}
              </button>
            </form>
          </>
        ) : null}

        {step === 'profile' ? (
          <>
            <div className="auth-step-badge">
              <User className="w-5 h-5" strokeWidth={2.2} />
              <span>{t('authCompleteProfile')}</span>
            </div>
            {error ? <div className="auth-pro-error">{error}</div> : null}
            <form onSubmit={submitProfile} className="auth-pro-form">
              <label className="auth-pro-label" htmlFor="auth-username">{t('username')}</label>
              <div className="auth-pro-field">
                <User className="auth-pro-field-icon" strokeWidth={2.1} />
                <input
                  id="auth-username"
                  required
                  minLength={3}
                  maxLength={32}
                  autoComplete="username"
                  className="auth-pro-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '_'))}
                  placeholder={t('usernamePlaceholder')}
                  autoFocus
                  dir="ltr"
                />
              </div>
              <p className="auth-pro-hint">{t('usernameHint')}</p>
              <button type="submit" disabled={authLoading} className="auth-pro-submit">
                {authLoading ? t('pleaseWait') : t('authFinishSignup')}
              </button>
            </form>
          </>
        ) : null}
      </div>
    </div>
  )
}
