import { JOBS_SUBCATEGORIES, JOBS_SUB_ALL } from '../data/jobsSubcategories'
import { useI18n } from '../context/I18nContext'

/** Divar-style job field picker — shown before job listings */
export default function JobsSubcategoryGate({ onPick, onBack }) {
  const { t, lang, isRtl } = useI18n()
  const label = (row) => (lang === 'fa' ? row.fa : row.en)

  return (
    <div className="jobs-sub-gate">
      <div className="jobs-sub-gate-head">
        <h2>{t('cats.jobs')}</h2>
        <p>{t('jobsPickSubHint')}</p>
      </div>

      <ul className="jobs-sub-gate-list">
        {JOBS_SUBCATEGORIES.map((s) => (
          <li key={s.id}>
            <button type="button" className="jobs-sub-gate-item" onClick={() => onPick(s.id)}>
              <span className="jobs-sub-gate-label">{label(s)}</span>
              <span className="jobs-sub-gate-icon" aria-hidden>{s.icon}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className="jobs-sub-gate-item is-all" onClick={() => onPick('all')}>
            <span className="jobs-sub-gate-label">{label(JOBS_SUB_ALL)}</span>
            <span className="jobs-sub-gate-icon" aria-hidden>{JOBS_SUB_ALL.icon}</span>
          </button>
        </li>
      </ul>

      {onBack && (
        <button type="button" className="jobs-sub-gate-back" onClick={onBack}>
          {isRtl ? '← ' : ''}{t('back')}{!isRtl ? ' →' : ''}
        </button>
      )}
    </div>
  )
}
