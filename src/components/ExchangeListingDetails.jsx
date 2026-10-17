import { useI18n } from '../context/I18nContext'
import {
  exchangeCurrencyLabel,
  formatExchangePriceLabel,
} from '../data/exchangeDetailFields'

function Fact({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="detail-fact">
      <span className="detail-fact-label">{label}</span>
      <span className="detail-fact-value">{value}</span>
    </div>
  )
}

function fmt(n, lang) {
  if (n == null || n === '') return ''
  const num = Number(n)
  if (!Number.isFinite(num)) return String(n)
  return num.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-CA')
}

export default function ExchangeListingDetails({ listing }) {
  const { t, lang } = useI18n()
  const attrs = listing?.attributes || {}

  return (
    <div className="detail-facts exchange-listing-details">
      <Fact
        label={t('exchangeCurrency')}
        value={attrs.exchangeCurrency ? exchangeCurrencyLabel(attrs.exchangeCurrency, lang) : ''}
      />
      <Fact label={t('exchangeBuyPrice')} value={fmt(attrs.exchangeBuyPrice, lang)} />
      <Fact label={t('exchangeSellPrice')} value={fmt(attrs.exchangeSellPrice, lang)} />
      <Fact label={t('exchangeTodayPrice')} value={fmt(attrs.exchangeTodayPrice, lang)} />
      <Fact label={t('exchangeRateSummary')} value={formatExchangePriceLabel(attrs, lang)} />
    </div>
  )
}
