/** Exchange (صرافی) rate fields for post / edit / detail */

export const EXCHANGE_CURRENCY_OPTIONS = [
  { id: 'USD', fa: 'دلار آمریکا (USD)', en: 'US Dollar (USD)' },
  { id: 'CAD', fa: 'دلار کانادا (CAD)', en: 'Canadian Dollar (CAD)' },
  { id: 'EUR', fa: 'یورو (EUR)', en: 'Euro (EUR)' },
  { id: 'GBP', fa: 'پوند (GBP)', en: 'British Pound (GBP)' },
  { id: 'IRR', fa: 'ریال ایران (IRR)', en: 'Iranian Rial (IRR)' },
  { id: 'AED', fa: 'درهم (AED)', en: 'UAE Dirham (AED)' },
  { id: 'TRY', fa: 'لیر ترکیه (TRY)', en: 'Turkish Lira (TRY)' },
  { id: 'AUD', fa: 'دلار استرالیا (AUD)', en: 'Australian Dollar (AUD)' },
  { id: 'CNY', fa: 'یوان (CNY)', en: 'Chinese Yuan (CNY)' },
  { id: 'other', fa: 'سایر', en: 'Other' },
]

export const EMPTY_EXCHANGE_DETAIL = {
  exchangeCurrency: '',
  exchangeBuyPrice: '',
  exchangeSellPrice: '',
  exchangeTodayPrice: '',
}

export function exchangeCurrencyLabel(id, lang = 'fa') {
  const row = EXCHANGE_CURRENCY_OPTIONS.find((o) => o.id === id)
  if (!row) return id || ''
  return lang === 'fa' ? row.fa : row.en
}

export function formatExchangePriceLabel(attrs, lang = 'fa') {
  if (!attrs) return lang === 'fa' ? 'نرخ توافقی' : 'Rate on request'
  const buy = Number(attrs.exchangeBuyPrice)
  const sell = Number(attrs.exchangeSellPrice)
  const today = Number(attrs.exchangeTodayPrice)
  const cur = attrs.exchangeCurrency || ''
  const suffix = cur && cur !== 'other' ? ` ${cur}` : ''
  if (Number.isFinite(buy) && buy > 0 && Number.isFinite(sell) && sell > 0) {
    const a = buy.toLocaleString()
    const b = sell.toLocaleString()
    return lang === 'fa'
      ? `خرید ${a} / فروش ${b}${suffix}`
      : `Buy ${a} / Sell ${b}${suffix}`
  }
  if (Number.isFinite(today) && today > 0) {
    return lang === 'fa'
      ? `امروز ${today.toLocaleString()}${suffix}`
      : `Today ${today.toLocaleString()}${suffix}`
  }
  if (Number.isFinite(sell) && sell > 0) {
    return lang === 'fa' ? `فروش ${sell.toLocaleString()}${suffix}` : `Sell ${sell.toLocaleString()}${suffix}`
  }
  if (Number.isFinite(buy) && buy > 0) {
    return lang === 'fa' ? `خرید ${buy.toLocaleString()}${suffix}` : `Buy ${buy.toLocaleString()}${suffix}`
  }
  return lang === 'fa' ? 'نرخ توافقی' : 'Rate on request'
}
