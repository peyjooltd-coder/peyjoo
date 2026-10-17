import { HEALTH_SUBCATEGORIES, HEALTH_SUB_ALL } from '../data/healthSubcategories'
import { useI18n } from '../context/I18nContext'

export default function HealthSubcategoryGate({ onPick }) {
  const { t, lang } = useI18n()
  const label = (row) => (lang === 'fa' ? row.fa : row.en)

  return (
    <div className="jobs-sub-gate">
      <div className="jobs-sub-gate-head">
        <h2>{t('cats.health')}</h2>
        <p>{t('healthPickSubHint')}</p>
      </div>

      <ul className="jobs-sub-gate-list">
        <li>
          <button type="button" className="jobs-sub-gate-item is-all" onClick={() => onPick('all')}>
            <span className="jobs-sub-gate-label">{label(HEALTH_SUB_ALL)}</span>
            <span className="jobs-sub-gate-icon" aria-hidden>{HEALTH_SUB_ALL.icon}</span>
          </button>
        </li>
        {HEALTH_SUBCATEGORIES.map((s) => (
          <li key={s.id}>
            <button type="button" className="jobs-sub-gate-item" onClick={() => onPick(s.id)}>
              <span className="jobs-sub-gate-label">{label(s)}</span>
              <span className="jobs-sub-gate-icon" aria-hidden>{s.icon}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
