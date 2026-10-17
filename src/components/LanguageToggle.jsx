import { useI18n } from '../context/I18nContext'

/** Compact language switch — text only, no flags */
export default function LanguageToggle({ className = '' }) {
  const { lang, toggleLang, meta, t } = useI18n()

  return (
    <button
      type="button"
      className={`lang-toggle ${className}`}
      onClick={toggleLang}
      aria-label={`${t('switchLanguage')}: ${meta.switchLabel}`}
      title={`${t('switchLanguage')}: ${meta.switchLabel}`}
    >
      <span className="lang-toggle-code">{lang === 'en' ? 'FA' : 'EN'}</span>
    </button>
  )
}
