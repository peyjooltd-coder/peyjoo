import { useI18n } from '../context/I18nContext'
import { EXCHANGE_CURRENCY_OPTIONS } from '../data/exchangeDetailFields'

function TextRow({ label, placeholder, field, values, set, type = 'text', dir }) {
  return (
    <div className="post-field-row post-field-static">
      <input
        type={type}
        className="post-input-inline"
        placeholder={placeholder}
        value={values[field] || ''}
        onChange={(e) => set({ [field]: e.target.value })}
        dir={dir}
        step={type === 'number' ? 'any' : undefined}
      />
      <span className="post-field-label">{label}</span>
    </div>
  )
}

/** Currency + buy / sell / today's rate for صرافی ads */
export default function ExchangeDetailFields({ values = {}, onChange }) {
  const { t, lang, isRtl } = useI18n()
  const set = (patch) => onChange?.(patch)
  const textDir = isRtl ? 'rtl' : 'ltr'

  return (
    <div className="re-detail-fields exchange-detail-fields">
      <label className="re-native-select-wrap">
        <span className="re-native-select-label">{t('exchangeCurrency')}</span>
        <select
          className="re-native-select"
          value={values.exchangeCurrency || ''}
          onChange={(e) => set({ exchangeCurrency: e.target.value })}
        >
          <option value="">{t('exchangePickCurrency')}</option>
          {EXCHANGE_CURRENCY_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {lang === 'fa' ? o.fa : o.en}
            </option>
          ))}
        </select>
      </label>

      {!values.priceNegotiable && (
        <>
          <TextRow
            label={t('exchangeBuyPrice')}
            placeholder={t('exchangePricePh')}
            field="exchangeBuyPrice"
            values={values}
            set={set}
            type="number"
            dir={textDir}
          />
          <TextRow
            label={t('exchangeSellPrice')}
            placeholder={t('exchangePricePh')}
            field="exchangeSellPrice"
            values={values}
            set={set}
            type="number"
            dir={textDir}
          />
          <TextRow
            label={t('exchangeTodayPrice')}
            placeholder={t('exchangePricePh')}
            field="exchangeTodayPrice"
            values={values}
            set={set}
            type="number"
            dir={textDir}
          />
        </>
      )}
    </div>
  )
}
