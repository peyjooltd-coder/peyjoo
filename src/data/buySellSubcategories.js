/** زیر‌دسته‌های خرید و فروش — خانه و آشپزخانه + اجاره ابزار */

export const BUY_SELL_SUBCATEGORIES = [
  {
    id: 'home-appliances',
    fa: 'خانه و آشپزخانه',
    en: 'Home & kitchen',
    icon: '🏠',
    apiCategory: 'home-appliances',
  },
  {
    id: 'tools-rental',
    fa: 'اجاره ابزار',
    en: 'Tool rental',
    icon: '🔩',
    apiCategory: 'tools-rental',
  },
]

export function buySellSubLabel(id, lang = 'fa') {
  const row = BUY_SELL_SUBCATEGORIES.find((s) => s.id === id)
  if (!row) return id || ''
  return lang === 'fa' ? row.fa : row.en
}

export function buySellApiCategory(subId) {
  const row = BUY_SELL_SUBCATEGORIES.find((s) => s.id === subId)
  return row?.apiCategory || 'electronics'
}
