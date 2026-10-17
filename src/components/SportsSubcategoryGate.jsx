import { SPORTS_SUBCATEGORIES, SPORTS_SUB_ALL } from '../data/sportsSubcategories'
import { useI18n } from '../context/I18nContext'

export default function SportsSubcategoryGate({ onPick }) {
  const { t, lang } = useI18n()
  const label = (row) => (lang === 'fa' ? row.fa : row.en)

  return (
    <div className="jobs-sub-gate">
      <div className="jobs-sub-gate-head">
        <h2>{t('cats.sports')}</h2>
        <p>{t('sportsPickSubHint')}</p>
      </div>

      <ul className="jobs-sub-gate-list">
        {SPORTS_SUBCATEGORIES.map((s) => (
          <li key={s.id}>
            <button type="button" className="jobs-sub-gate-item" onClick={() => onPick(s.id)}>
              <span className="jobs-sub-gate-label">{label(s)}</span>
              <span className="jobs-sub-gate-icon" aria-hidden>{s.icon}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className="jobs-sub-gate-item is-all" onClick={() => onPick('all')}>
            <span className="jobs-sub-gate-label">{label(SPORTS_SUB_ALL)}</span>
            <span className="jobs-sub-gate-icon" aria-hidden>{SPORTS_SUB_ALL.icon}</span>
          </button>
        </li>
      </ul>
    </div>
  )
}
