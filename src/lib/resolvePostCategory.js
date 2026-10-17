import { allCategories } from '../data/mobileUiData'
import { getPejoBrowseCategory } from '../data/pejoBrowseCatalog'

const POSTABLE = new Set(allCategories.map((c) => c.id))

/** Map browse / API category ids onto a postable wizard category. */
const ALIASES = {
  kitchen: 'buy-sell',
  'home-appliances': 'buy-sell',
  'tools-rental': 'buy-sell',
  furniture: 'buy-sell',
  electronics: 'buy-sell',
  food: 'restaurant',
  occupations: 'jobs',
  couriers: 'kolbaran',
  travel: 'transport',
  charity: 'home-market',
  repairs: 'services',
}

/**
 * Resolve the category to pre-select in PostListingWizard from the
 * category the user is currently browsing.
 */
export function resolvePostCategoryFromBrowse(selectedCategory) {
  if (!selectedCategory) return ''
  if (POSTABLE.has(selectedCategory)) return selectedCategory

  const browse = getPejoBrowseCategory(selectedCategory)
  const api = browse?.apiCategory || ''
  if (api && POSTABLE.has(api)) return api
  if (api && ALIASES[api]) return ALIASES[api]
  if (ALIASES[selectedCategory]) return ALIASES[selectedCategory]
  return selectedCategory
}
