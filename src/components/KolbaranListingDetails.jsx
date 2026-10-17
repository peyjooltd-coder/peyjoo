import { useI18n } from '../context/I18nContext'
import { kolbaranSubLabel } from '../data/kolbaranSubcategories'
import {
  KOLBARAN_DAY_OPTIONS,
  KOLBARAN_CARGO_TYPE_OPTIONS,
  kolbaranOptionLabel,
  formatKolbaranPriceLabel,
} from '../data/kolbaranDetailFields'

function Fact({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="detail-fact">
      <span className="detail-fact-label">{label}</span>
      <span className="detail-fact-value">{value}</span>
    </div>
  )
}

function weightLabel(n, lang) {
  if (n == null || n === '') return ''
  const num = Number(n)
  if (!Number.isFinite(num)) return String(n)
  const s = num.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-CA')
  return lang === 'fa' ? `${s} کیلو` : `${s} kg`
}

export default function KolbaranListingDetails({ listing }) {
  const { t, lang } = useI18n()
  const attrs = listing?.attributes || {}
  const sub = attrs.kolbaranSubcategory
  const isHaveLoad = sub === 'have-load'
  const isWillCarry = sub === 'will-carry'

  const cargoType = attrs.kolbaranCargoType
    ? kolbaranOptionLabel(KOLBARAN_CARGO_TYPE_OPTIONS, attrs.kolbaranCargoType, lang)
    : ''
  const day = attrs.kolbaranDay
    ? kolbaranOptionLabel(KOLBARAN_DAY_OPTIONS, attrs.kolbaranDay, lang)
    : ''

  let weightText = ''
  if (isHaveLoad && attrs.kolbaranWeight) {
    weightText = weightLabel(attrs.kolbaranWeight, lang)
  } else if (isWillCarry) {
    const min = attrs.kolbaranWeightMin
    const max = attrs.kolbaranWeightMax
    if (min && max) weightText = `${weightLabel(min, lang)} – ${weightLabel(max, lang)}`
    else if (min) weightText = lang === 'fa' ? `از ${weightLabel(min, lang)}` : `From ${weightLabel(min, lang)}`
    else if (max) weightText = lang === 'fa' ? `تا ${weightLabel(max, lang)}` : `Up to ${weightLabel(max, lang)}`
  }

  return (
    <div className="detail-facts kolbaran-listing-details">
      <Fact label={t('postAdKolbaranSection')} value={sub ? kolbaranSubLabel(sub, lang) : ''} />
      {isHaveLoad && <Fact label={t('kolbaranDay')} value={day} />}
      {isHaveLoad && <Fact label={t('kolbaranCargoName')} value={attrs.kolbaranCargoName} />}
      <Fact label={t('kolbaranCargoType')} value={cargoType} />
      <Fact label={isWillCarry ? t('kolbaranWeightRange') : t('kolbaranWeight')} value={weightText} />
      <div className="kolbaran-od-boxes">
        <div className="kolbaran-od-box">
          <span className="kolbaran-od-label">{t('kolbaranOrigin')}</span>
          <span className="kolbaran-od-value">{attrs.kolbaranOrigin || '—'}</span>
        </div>
        <div className="kolbaran-od-box">
          <span className="kolbaran-od-label">{t('kolbaranDestination')}</span>
          <span className="kolbaran-od-value">{attrs.kolbaranDestination || '—'}</span>
        </div>
      </div>
      {isHaveLoad && <Fact label={t('kolbaranDate')} value={attrs.kolbaranDate} />}
      <Fact label={t('kolbaranPrice')} value={formatKolbaranPriceLabel(attrs, lang)} />
      {attrs.kolbaranNegotiable && (
        <Fact label={t('kolbaranNegotiable')} value={lang === 'fa' ? 'بله' : 'Yes'} />
      )}
    </div>
  )
}
