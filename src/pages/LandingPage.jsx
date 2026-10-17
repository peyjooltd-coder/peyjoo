import { useState } from 'react'
import { ArrowLeft, Lock, Mail, User, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import AppLogo from '../components/AppLogo'
import LanguageToggle from '../components/LanguageToggle'

export default function LandingPage({ onGuest }) {
  const { register, login, authError, authLoading } = useApp()
  const { t, isRtl } = useI18n()
  const [panel, setPanel] = useState('register')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [localError, setLocalError] = useState(null)

  const onRegister = async (e) => {
    e.preventDefault()
    setLocalError(null)
    if (form.password.length < 6) {
      setLocalError(t('landingPasswordHint'))
      return
    }
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        city: 'Vancouver',
      })
    } catch {
      /* authError set in context */
    }
  }

  const onLogin = async (e) => {
    e.preventDefault()
    setLocalError(null)
    try {
      await login(form.email.trim(), form.password)
    } catch {
      /* authError set in context */
    }
  }

  const error = localError || authError

  return (
    <div className="landing-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="landing-bg" aria-hidden />
      <div className="landing-glow" aria-hidden />

      <header className="landing-top">
        <LanguageToggle className="lang-toggle-header" />
      </header>

      <main className="landing-main">
        <section className="landing-intro">
          <AppLogo className="landing-logo" rounded="rounded-[22px]" letterClass="text-3xl" />
          <p className="landing-kicker">{t('brandSub')}</p>
          <h1 className="landing-brand">{t('brand')}</h1>
          <p className="landing-lead">{t('landingLead')}</p>
          <ul className="landing-points">
            <li>{t('landingPoint1')}</li>
            <li>{t('landingPoint2')}</li>
            <li>{t('landingPoint3')}</li>
          </ul>
        </section>

        <section className="landing-auth" aria-label={t('landingRegisterTitle')}>
          <div className="landing-auth-card">
            <div className="landing-auth-tabs">
              <button
                type="button"
                className={panel === 'register' ? 'is-active' : ''}
                onClick={() => { setPanel('register'); setLocalError(null) }}
              >
                {t('landingRegisterTitle')}
              </button>
              <button
                type="button"
                className={panel === 'login' ? 'is-active' : ''}
                onClick={() => { setPanel('login'); setLocalError(null) }}
              >
                {t('login')}
              </button>
            </div>

            {error && <div className="landing-error">{error}</div>}

            {panel === 'register' ? (
              <form className="landing-form" onSubmit={onRegister}>
                <label>
                  <span>{t('yourName')}</span>
                  <div className="landing-field">
                    <User className="w-4 h-4" />
                    <input
                      required
                      minLength={2}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t('yourName')}
                    />
                  </div>
                </label>
                <label>
                  <span>{t('email')}</span>
                  <div className="landing-field">
                    <Mail className="w-4 h-4" />
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@email.com"
                    />
                  </div>
                </label>
                <label>
                  <span>{t('password')}</span>
                  <div className="landing-field">
                    <Lock className="w-4 h-4" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      dir="ltr"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••"
                    />
                  </div>
                </label>
                <p className="landing-hint">{t('landingPasswordHint')}</p>
                <button type="submit" className="landing-submit" disabled={authLoading}>
                  {authLoading ? t('pleaseWait') : t('landingCreateAccount')}
                </button>
              </form>
            ) : (
              <form className="landing-form" onSubmit={onLogin}>
                <label>
                  <span>{t('email')}</span>
                  <div className="landing-field">
                    <Mail className="w-4 h-4" />
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@email.com"
                    />
                  </div>
                </label>
                <label>
                  <span>{t('password')}</span>
                  <div className="landing-field">
                    <Lock className="w-4 h-4" />
                    <input
                      type="password"
                      required
                      dir="ltr"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••"
                    />
                  </div>
                </label>
                <button type="submit" className="landing-submit" disabled={authLoading}>
                  {authLoading ? t('pleaseWait') : t('login')}
                </button>
              </form>
            )}
          </div>

          {typeof onGuest === 'function' && (
          <button type="button" className="landing-guest" onClick={onGuest}>
            <UserRound className="w-5 h-5" />
            <span>
              <strong>{t('landingGuestCta')}</strong>
              <em>{t('landingGuestHint')}</em>
            </span>
            <ArrowLeft className={`w-4 h-4 landing-guest-arrow ${isRtl ? '' : 'is-ltr'}`} />
          </button>
          )}
        </section>
      </main>
    </div>
  )
}
