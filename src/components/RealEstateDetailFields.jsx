import { useI18n } from '../context/I18nContext'
import {
  RE_ROOM_OPTIONS,
  RE_DIRECTION_OPTIONS,
  RE_COOLING_OPTIONS,
  RE_HEATING_OPTIONS,
  RE_FLOORING_OPTIONS,
  RE_BATHROOM_OPTIONS,
  RE_ADVERTISER_OPTIONS,
  RE_AMENITY_COUNT_OPTIONS,
  isRealEstateRentSub,
} from '../data/realEstateDetailFields'

function RangeRow({ label, fromVal, toVal, onFrom, onTo, fa }) {
  return (
    <div className="re-detail-block">
      <p className="jobs-filter-title">{label}</p>
      <div className="re-range-row">
        <input
          type="number"
          className="re-range-input"
          placeholder={fa ? 'تا' : 'To'}
          value={toVal || ''}
          onChange={(e) => onTo(e.target.value)}
          dir={fa ? 'rtl' : 'ltr'}
        />
        <input
          type="number"
          className="re-range-input"
          placeholder={fa ? 'از' : 'From'}
          value={fromVal || ''}
          onChange={(e) => onFrom(e.target.value)}
          dir={fa ? 'rtl' : 'ltr'}
        />
      </div>
    </div>
  )
}

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

function AmenityField({ label, flagKey, countKey, values, set, fa, showCount }) {
  const has = values[flagKey]
  const count = values[countKey] || ''
  return (
    <div className="re-detail-block">
      <p className="jobs-filter-title">{label}</p>
      <div className="jobs-filter-chips re-room-chips">
        <button
          type="button"
          className={`jobs-filter-chip ${has === true ? 'is-active' : ''}`}
          onClick={() => set({
            [flagKey]: true,
            ...(count ? {} : { [countKey]: '1' }),
          })}
        >
          {fa ? 'دارد' : 'Yes'}
        </button>
        <button
          type="button"
          className={`jobs-filter-chip ${has === false ? 'is-active' : ''}`}
          onClick={() => set({ [flagKey]: false, [countKey]: '' })}
        >
          {fa ? 'ندارد' : 'No'}
        </button>
      </div>
      {showCount && has === true && (
        <>
          <p className="jobs-filter-title" style={{ marginTop: 4 }}>
            {fa ? 'تعداد' : 'Quantity'}
          </p>
          <div className="jobs-filter-chips re-room-chips">
            {RE_AMENITY_COUNT_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`jobs-filter-chip ${count === o.id ? 'is-active' : ''}`}
                onClick={() => set({ [countKey]: count === o.id ? '' : o.id })}
              >
                {fa ? o.fa : o.en}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** mode: 'filter' | 'post' */
export default function RealEstateDetailFields({ mode = 'filter', values = {}, onChange }) {
  const { lang } = useI18n()
  const fa = lang === 'fa'
  const set = (patch) => onChange?.(patch)
  const tx = (persian, english) => (fa ? persian : english)
  const isRent = isRealEstateRentSub(values.realEstateSubcategory)

  return (
    <div className="re-detail-fields">
      {mode === 'post' && isRent && (
        <div className="re-detail-block">
          <p className="jobs-filter-title">{tx('ودیعه و اجاره', 'Deposit & rent')}</p>
          <div className="post-field-row post-field-static">
            <input
              type="number"
              className="post-input-inline"
              placeholder={tx('۳۰۰۰', '3000')}
              value={values.priceNegotiable ? '' : (values.deposit ?? '')}
              onChange={(e) => set({ deposit: e.target.value, priceNegotiable: false })}
              dir={fa ? 'rtl' : 'ltr'}
              min="0"
              inputMode="decimal"
              disabled={!!values.priceNegotiable}
            />
            <span className="post-field-label">{tx('ودیعه / دپوزیت ($)', 'Deposit ($)')}</span>
          </div>
          <div className="post-field-row post-field-static">
            <input
              type="number"
              className="post-input-inline"
              placeholder={tx('۱۸۰۰', '1800')}
              value={values.priceNegotiable ? '' : (values.monthlyRent ?? '')}
              onChange={(e) => set({ monthlyRent: e.target.value, priceNegotiable: false })}
              dir={fa ? 'rtl' : 'ltr'}
              min="0"
              inputMode="decimal"
              disabled={!!values.priceNegotiable}
            />
            <span className="post-field-label">{tx('اجاره ماهانه ($)', 'Monthly rent ($)')}</span>
          </div>
        </div>
      )}

      <div className="re-detail-block">
        <p className="jobs-filter-title">{tx('تعداد اتاق‌ها', 'Bedrooms')}</p>
        <div className="jobs-filter-chips re-room-chips">
          {RE_ROOM_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`jobs-filter-chip ${values.rooms === o.id ? 'is-active' : ''}`}
              onClick={() => set({ rooms: values.rooms === o.id ? '' : o.id })}
            >
              {lang === 'fa' ? o.fa : o.en}
            </button>
          ))}
        </div>
      </div>

      {mode === 'filter' ? (
        <>
          <RangeRow
            fa={fa}
            label={tx('متراژ (متر)', 'Area (m²)')}
            fromVal={values.areaMin}
            toVal={values.areaMax}
            onFrom={(v) => set({ areaMin: v })}
            onTo={(v) => set({ areaMax: v })}
          />
          <RangeRow
            fa={fa}
            label={tx('سن بنا', 'Building age')}
            fromVal={values.buildingAgeMin}
            toVal={values.buildingAgeMax}
            onFrom={(v) => set({ buildingAgeMin: v })}
            onTo={(v) => set({ buildingAgeMax: v })}
          />
          <RangeRow
            fa={fa}
            label={tx('طبقه', 'Floor')}
            fromVal={values.floorMin}
            toVal={values.floorMax}
            onFrom={(v) => set({ floorMin: v })}
            onTo={(v) => set({ floorMax: v })}
          />
        </>
      ) : (
        <>
          <div className="post-field-row post-field-static">
            <input
              type="number"
              className="post-input-inline"
              placeholder={tx('۸۵', '85')}
              value={values.area || ''}
              onChange={(e) => set({ area: e.target.value })}
              dir={fa ? 'rtl' : 'ltr'}
            />
            <span className="post-field-label">{tx('متراژ (متر)', 'Area (m²)')}</span>
          </div>
          <div className="post-field-row post-field-static">
            <input
              type="number"
              className="post-input-inline"
              placeholder={tx('۵', '5')}
              value={values.buildingAge || ''}
              onChange={(e) => set({ buildingAge: e.target.value })}
              dir={fa ? 'rtl' : 'ltr'}
            />
            <span className="post-field-label">{tx('سن بنا (سال)', 'Age (years)')}</span>
          </div>
          <div className="post-field-row post-field-static">
            <input
              type="number"
              className="post-input-inline"
              placeholder={tx('۳', '3')}
              value={values.floor || ''}
              onChange={(e) => set({ floor: e.target.value })}
              dir={fa ? 'rtl' : 'ltr'}
            />
            <span className="post-field-label">{tx('طبقه', 'Floor')}</span>
          </div>
        </>
      )}

      <AmenityField
        label={tx('آسانسور', 'Elevator')}
        flagKey="elevator"
        countKey="elevatorCount"
        values={values}
        set={set}
        fa={fa}
        showCount={mode === 'post'}
      />
      <AmenityField
        label={tx('پارکینگ', 'Parking')}
        flagKey="parking"
        countKey="parkingCount"
        values={values}
        set={set}
        fa={fa}
        showCount={mode === 'post'}
      />
      <AmenityField
        label={tx('انباری', 'Storage')}
        flagKey="storage"
        countKey="storageCount"
        values={values}
        set={set}
        fa={fa}
        showCount={mode === 'post'}
      />

      <SelectField label={tx('جهت ساختمان', 'Building direction')} placeholder={tx('انتخاب', 'Choose')} field="buildingDirection" options={RE_DIRECTION_OPTIONS} values={values} lang={lang} set={set} />
      <SelectField label={tx('سرمایش', 'Cooling')} placeholder={tx('انتخاب', 'Choose')} field="cooling" options={RE_COOLING_OPTIONS} values={values} lang={lang} set={set} />
      <SelectField label={tx('گرمایش', 'Heating')} placeholder={tx('انتخاب', 'Choose')} field="heating" options={RE_HEATING_OPTIONS} values={values} lang={lang} set={set} />
      <SelectField label={tx('جنس کف', 'Flooring')} placeholder={tx('انتخاب', 'Choose')} field="flooring" options={RE_FLOORING_OPTIONS} values={values} lang={lang} set={set} />
      <SelectField label={tx('سرویس بهداشتی', 'Bathroom')} placeholder={tx('انتخاب', 'Choose')} field="bathroom" options={RE_BATHROOM_OPTIONS} values={values} lang={lang} set={set} />
      <SelectField label={tx('آگهی‌دهنده', 'Advertiser')} placeholder={tx('انتخاب', 'Choose')} field="advertiserType" options={RE_ADVERTISER_OPTIONS} values={values} lang={lang} set={set} />

      {mode === 'filter' && (
        <div className="re-detail-block">
          <p className="jobs-filter-title">{tx('امکانات تصویری آگهی', 'Listing media')}</p>
          <label className="mobile-sheet-check">
            <input
              type="checkbox"
              checked={!!values.hasVideo}
              onChange={(e) => set({ hasVideo: e.target.checked })}
            />
            <span>{tx('ویدیو‌دار', 'Has video')}</span>
          </label>
          <label className="mobile-sheet-check">
            <input
              type="checkbox"
              checked={!!values.hasPropertyPhotos}
              onChange={(e) => set({ hasPropertyPhotos: e.target.checked })}
            />
            <span>{tx('دارای عکس از ملک', 'Has property photos')}</span>
          </label>
        </div>
      )}
    </div>
  )
}
