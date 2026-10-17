import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LANGS, translate } from '../i18n/translations'

const STORAGE_KEY = 'pejo_lang'
const I18nContext = createContext(null)

function readInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'fa') return saved
  } catch { /* ignore */ }
  return 'en'
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readInitialLang)

  const setLang = useCallback((next) => {
    const code = next === 'fa' ? 'fa' : 'en'
    setLangState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch { /* ignore */ }
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'fa' : 'en')
  }, [lang, setLang])

  const t = useCallback((key) => translate(lang, key), [lang])

  const meta = LANGS[lang]

  useEffect(() => {
    document.documentElement.lang = meta.code
    document.documentElement.dir = meta.dir
    document.title = lang === 'en' ? 'PeyJoo — Divar Vancouver' : 'پی جو — دیوار ونکوور'
    document.body.classList.toggle('lang-fa', lang === 'fa')
    document.body.classList.toggle('lang-en', lang === 'en')
  }, [lang, meta])

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, meta, isRtl: meta.dir === 'rtl' }),
    [lang, setLang, toggleLang, t, meta]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
