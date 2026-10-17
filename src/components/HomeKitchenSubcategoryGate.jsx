import { HOME_KITCHEN_SUBCATEGORIES, HOME_KITCHEN_SUB_ALL } from '../data/homeKitchenSubcategories'
import { useI18n } from '../context/I18nContext'

export default function HomeKitchenSubcategoryGate({ onPick }) {
  const { t, lang } = useI18n()
  const label = (row) => (lang === 'fa' ? row.fa : row.en)

  return (
    <div className="jobs-sub-gate">
      <div className="jobs-sub-gate-head">
        <h2>{t('cats.home-appliances')}</h2>
        <p>{t('homeKitchenPickSubHint')}</p>
      </div>

      <ul className="jobs-sub-gate-list">
        {HOME_KITCHEN_SUBCATEGORIES.map((s) => (
          <li key={s.id}>
            <button type="button" className="jobs-sub-gate-item" onClick={() => onPick(s.id)}>
              <span className="jobs-sub-gate-label">{label(s)}</span>
              <span className="jobs-sub-gate-icon" aria-hidden>{s.icon}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className="jobs-sub-gate-item is-all" onClick={() => onPick('all')}>
            <span className="jobs-sub-gate-label">{label(HOME_KITCHEN_SUB_ALL)}</span>
            <span className="jobs-sub-gate-icon" aria-hidden>{HOME_KITCHEN_SUB_ALL.icon}</span>
          </button>
        </li>
      </ul>
    </div>
  )
}
