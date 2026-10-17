import MobileBottomSheet from './MobileBottomSheet'
import { useI18n } from '../../context/I18nContext'

export default function PrivacySheet({ open, onClose }) {
  const { t } = useI18n()

  const items = [
    { title: t('privacyProfile'), body: t('privacyProfileBody') },
    { title: t('privacyPhone'), body: t('privacyPhoneBody') },
    { title: t('privacyBlock'), body: t('privacyBlockBody') },
    { title: t('privacyData'), body: t('privacyDataBody') },
  ]

  return (
    <MobileBottomSheet open={open} title={t('privacy')} onClose={onClose}>
      <div className="mobile-sheet-filters space-y-3">
        <p className="text-xs text-divar-muted">{t('privacyDesc')}</p>
        <a className="home-btn-outline !w-full !block text-center no-underline" href="/privacy/">{t('privacyPolicyTitle')}</a>
        <a className="home-btn-outline !w-full !block text-center no-underline" href="/terms/">{t('termsTitle')}</a>
        {items.map((item) => (
          <div key={item.title} className="profile-info-card">
            <h4>{item.title}</h4>
            <p>{item.body}</p>
          </div>
        ))}
        <button type="button" className="post-submit-btn !mt-2" onClick={onClose}>
          {t('done')}
        </button>
      </div>
    </MobileBottomSheet>
  )
}
