import MobileBottomSheet from './MobileBottomSheet'
import { useI18n } from '../../context/I18nContext'

export default function HelpSheet({ open, onClose }) {
  const { t } = useI18n()

  const faqs = [
    { q: t('helpFaq1q'), a: t('helpFaq1a') },
    { q: t('helpFaq2q'), a: t('helpFaq2a') },
    { q: t('helpFaq3q'), a: t('helpFaq3a') },
    { q: t('helpFaq4q'), a: t('helpFaq4a') },
  ]

  return (
    <MobileBottomSheet open={open} title={t('helpSupport')} onClose={onClose}>
      <div className="mobile-sheet-filters space-y-3">
        <p className="text-xs text-divar-muted">{t('helpDesc')}</p>
        {faqs.map((item) => (
          <details key={item.q} className="profile-faq">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
        <a className="home-btn-outline !w-full !block text-center no-underline" href="/terms/">{t('termsTitle')}</a>
        <a className="home-btn-outline !w-full !block text-center no-underline" href="/privacy/">{t('privacyPolicyTitle')}</a>
        <a className="home-btn-outline !w-full !block text-center no-underline" href="/guidelines/">{t('guidelinesTitle')}</a>
        <a
          className="post-submit-btn !mt-2 !block text-center no-underline"
          href="mailto:support@pejovancouver.ca"
        >
          {t('helpContact')}
        </a>
        <button type="button" className="home-btn-outline !w-full" onClick={onClose}>
          {t('done')}
        </button>
      </div>
    </MobileBottomSheet>
  )
}
