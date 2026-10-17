import {
  Apple, Gift, LayoutGrid, BookOpen, Armchair, Shirt,
  MoreHorizontal, Leaf, Baby,
} from 'lucide-react'

/**
 * Hamyari category grid.
 * With page dir=rtl, first item sits top-right.
 * Visual LTR (left→right) matches sample: همه | اهداء | مواد غذایی …
 */
export const HAMYARI_CATEGORIES = [
  { id: 'food', Icon: Apple, tone: 'orange' },
  { id: 'donation-free', Icon: Gift, tone: 'rose' },
  { id: 'all', Icon: LayoutGrid, tone: 'slate' },
  { id: 'books', Icon: BookOpen, tone: 'indigo' },
  { id: 'home', Icon: Armchair, tone: 'sand' },
  { id: 'clothes', Icon: Shirt, tone: 'pink' },
  { id: 'other', Icon: MoreHorizontal, tone: 'slate' },
  { id: 'plants-animals', Icon: Leaf, tone: 'emerald' },
  { id: 'baby', Icon: Baby, tone: 'sky' },
]

/** Map legacy post categories onto the new grid ids for labels/filters */
const LEGACY_CAT_MAP = {
  donation: 'donation-free',
  'free-stuff': 'donation-free',
  'help-request': 'other',
  'offer-help': 'other',
  volunteer: 'other',
  general: 'other',
}

export function normalizeHamyariCategory(id) {
  if (!id || id === 'all') return 'all'
  return LEGACY_CAT_MAP[id] || id
}

export function hamyariCategoryMatches(postCategory, selectedId) {
  if (!selectedId || selectedId === 'all') return true
  return normalizeHamyariCategory(postCategory) === selectedId
}
