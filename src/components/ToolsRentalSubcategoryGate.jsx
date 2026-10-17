import { TOOLS_RENTAL_SUBCATEGORIES, TOOLS_RENTAL_SUB_ALL } from '../data/toolsRentalSubcategories'
import { useI18n } from '../context/I18nContext'

export default function ToolsRentalSubcategoryGate({ onPick }) {
  const { t, lang } = useI18n()
  const label = (row) => (lang === 'fa' ? row.fa : row.en)

  return (
    <div className="jobs-sub-gate">
      <div className="jobs-sub-gate-head">
        <h2>{t('cats.tools-rental')}</h2>
        <p>{t('toolsRentalPickSubHint')}</p>
      </div>

      <ul className="jobs-sub-gate-list">
        {TOOLS_RENTAL_SUBCATEGORIES.map((s) => (
          <li key={s.id}>
            <button type="button" className="jobs-sub-gate-item" onClick={() => onPick(s.id)}>
              <span className="jobs-sub-gate-label">{label(s)}</span>
              <span className="jobs-sub-gate-icon" aria-hidden>{s.icon}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className="jobs-sub-gate-item is-all" onClick={() => onPick('all')}>
            <span className="jobs-sub-gate-label">{label(TOOLS_RENTAL_SUB_ALL)}</span>
            <span className="jobs-sub-gate-icon" aria-hidden>{TOOLS_RENTAL_SUB_ALL.icon}</span>
          </button>
        </li>
      </ul>
    </div>
  )
}
