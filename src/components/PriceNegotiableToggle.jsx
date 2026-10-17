import { useI18n } from '../context/I18nContext'

/** Shared «قیمت توافقی» checkbox for post + edit forms. */
export default function PriceNegotiableToggle({ checked, onChange }) {
  const { t } = useI18n()
  return (
    <label className="mobile-sheet-check price-negotiable-check">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span>{t('postAdPriceNegotiable')}</span>
    </label>
  )
}
