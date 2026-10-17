import { useI18n } from '../context/I18nContext'
import {
  KOLBARAN_DAY_OPTIONS,
  KOLBARAN_CARGO_TYPE_OPTIONS,
} from '../data/kolbaranDetailFields'

function SelectField({ label, placeholder, field, options, values, lang, set }) {
  return (
    <label className="re-native-select-wrap">
      <span className="re-native-select-label">{label}</span>
      <select
        className="re-native-select"
        value={values[field] || ''}
        onChange={(e) => set({ [field]: e.target.value })}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {lang === 'fa' ? o.fa : o.en}
          </option>
        ))}
      </select>
    </label>
  )
}

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
      />
      <span className="post-field-label">{label}</span>
    </div>
  )
}

/**
 * Kolbaran post fields:
 * - have-load (بار دارم): day, cargo name, cargo type, weight, origin, destination, date, price min/max, negotiable
 * - will-carry (بار می‌برم): cargo type, weight min/max, price min/max, negotiable, origin, destination
 */
export default function KolbaranDetailFields({ subcategory, values = {}, onChange }) {
  const { t, lang, isRtl } = useI18n()
  const set = (patch) => onChange?.(patch)
  const isHaveLoad = subcategory === 'have-load'
  const isWillCarry = subcategory === 'will-carry'
  if (!isHaveLoad && !isWillCarry) return null

  const textDir = isRtl ? 'rtl' : 'ltr'

  return (
    <div className="re-detail-fields kolbaran-detail-fields">
      {isHaveLoad && (
        <SelectField
          label={t('kolbaranDay')}
          placeholder={t('kolbaranPickDay')}
          field="kolbaranDay"
          options={KOLBARAN_DAY_OPTIONS}
          values={values}
          lang={lang}
          set={set}
        />
      )}

      {isHaveLoad && (
        <TextRow
          label={t('kolbaranCargoName')}
          placeholder={t('kolbaranCargoNamePh')}
          field="kolbaranCargoName"
          values={values}
          set={set}
          dir={textDir}
        />
      )}

      <SelectField
        label={t('kolbaranCargoType')}
        placeholder={t('kolbaranPickCargoType')}
        field="kolbaranCargoType"
        options={KOLBARAN_CARGO_TYPE_OPTIONS}
        values={values}
        lang={lang}
        set={set}
      />

      {isHaveLoad && (
        <TextRow
          label={t('kolbaranWeight')}
          placeholder={t('kolbaranWeightPh')}
          field="kolbaranWeight"
          values={values}
          set={set}
          type="number"
          dir={textDir}
        />
      )}

      {isWillCarry && (
        <>
          <TextRow
            label={t('kolbaranWeightMin')}
            placeholder={t('kolbaranWeightPh')}
            field="kolbaranWeightMin"
            values={values}
            set={set}
            type="number"
            dir={textDir}
          />
          <TextRow
            label={t('kolbaranWeightMax')}
            placeholder={t('kolbaranWeightPh')}
            field="kolbaranWeightMax"
            values={values}
            set={set}
            type="number"
            dir={textDir}
          />
        </>
      )}

      <div className="kolbaran-od-fields">
        <label className="kolbaran-od-field">
          <span className="kolbaran-od-field-label">{t('kolbaranOrigin')}</span>
          <input
            type="text"
            className="kolbaran-od-input"
            placeholder={t('kolbaranOriginPh')}
            value={values.kolbaranOrigin || ''}
            onChange={(e) => set({ kolbaranOrigin: e.target.value })}
            dir={textDir}
          />
        </label>
        <label className="kolbaran-od-field">
          <span className="kolbaran-od-field-label">{t('kolbaranDestination')}</span>
          <input
            type="text"
            className="kolbaran-od-input"
            placeholder={t('kolbaranDestinationPh')}
            value={values.kolbaranDestination || ''}
            onChange={(e) => set({ kolbaranDestination: e.target.value })}
            dir={textDir}
          />
        </label>
      </div>

      {isHaveLoad && (
        <div className="post-field-row post-field-static">
          <input
            type="date"
            className="post-input-inline"
            value={values.kolbaranDate || ''}
            onChange={(e) => set({ kolbaranDate: e.target.value })}
            dir="ltr"
          />
          <span className="post-field-label">{t('kolbaranDate')}</span>
        </div>
      )}

      {!values.priceNegotiable && (
        <>
          <TextRow
            label={t('kolbaranPriceMin')}
            placeholder={t('kolbaranPricePh')}
            field="kolbaranPriceMin"
            values={values}
            set={set}
            type="number"
            dir={textDir}
          />
          <TextRow
            label={t('kolbaranPriceMax')}
            placeholder={t('kolbaranPricePh')}
            field="kolbaranPriceMax"
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
