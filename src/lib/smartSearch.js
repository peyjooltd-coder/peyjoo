import { categories } from '../data/mockData'
import { categoryConfig } from '../data/categoryConfig'

const CATEGORY_RULES = [
  { id: 'real-estate', re: /\b(rent|rental|lease|apartment|condo|house|bedroom|bed|br\b|studio|sqft|property|real estate|landlord)\b/i },
  { id: 'vehicles', re: /\b(car|vehicle|suv|truck|tesla|bmw|honda|toyota|ford|ev\b|mileage|km\b|dealer|sedan)\b/i },
  { id: 'electronics', re: /\b(iphone|macbook|laptop|phone|tablet|camera|sony|apple|samsung|gaming|pc\b|monitor)\b/i },
  { id: 'furniture', re: /\b(sofa|sectional|couch|table|bed|desk|chair|furniture|mattress)\b/i },
  { id: 'services', re: /\b(renovation|contractor|plumber|cleaning|moving|repair|service|design build)\b/i },
  { id: 'fashion', re: /\b(jacket|shoes|sneaker|bag|clothing|dress|designer|wear)\b/i },
  { id: 'sports', re: /\b(bike|bicycle|gym|peloton|fitness|camping|ski|sports|outdoor)\b/i },
  { id: 'business', re: /\b(office equipment|commercial|industrial|business)\b/i },
]

function tokenize(q) {
  return q.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 1)
}

function extractPriceHints(q) {
  const filters = {}
  const under = q.match(/under\s*\$?(\d[\d,]*)/i)
  const over = q.match(/over\s*\$?(\d[\d,]*)/i)
  const range = q.match(/\$?(\d[\d,]*)\s*[-–]\s*\$?(\d[\d,]*)/)
  const maxOnly = q.match(/max\s*\$?(\d[\d,]*)/i)
  const minOnly = q.match(/min\s*\$?(\d[\d,]*)/i)
  const plain = q.match(/\$([\d,]+)/)

  if (range) {
    filters.maxPrice = range[2].replace(/,/g, '')
    filters.minPrice = range[1].replace(/,/g, '')
  } else if (under) filters.maxPrice = under[1].replace(/,/g, '')
  else if (over) filters.minPrice = over[1].replace(/,/g, '')
  else if (maxOnly) filters.maxPrice = maxOnly[1].replace(/,/g, '')
  else if (minOnly) filters.minPrice = minOnly[1].replace(/,/g, '')
  else if (plain) filters.maxPrice = plain[1].replace(/,/g, '')

  return filters
}

function extractCategoryFilters(q, categoryId) {
  const out = {}
  if (!categoryId) return out

  if (categoryId === 'real-estate') {
    if (/\b(rent|rental|lease|\/mo)\b/i.test(q)) out.listingType = 'Rent'
    if (/\b(sale|buy|purchase)\b/i.test(q)) out.listingType = 'Sale'
    const br = q.match(/(\d)\s*br\b/i)
    if (br) out.bedrooms = br[1] === '1' ? '1' : br[1] >= 3 ? '3+' : br[1]
    if (/\bstudio\b/i.test(q)) out.bedrooms = 'Studio'
    if (/\bcondo\b/i.test(q)) out.propertyType = 'Condo'
    if (/\bhouse\b/i.test(q)) out.propertyType = 'House'
  }

  if (categoryId === 'vehicles') {
    const makes = ['Tesla', 'Toyota', 'Honda', 'BMW', 'Ford']
    makes.forEach((m) => {
      if (new RegExp(`\\b${m}\\b`, 'i').test(q)) out.make = m
    })
    const year = q.match(/\b(20\d{2})\b/)
    if (year) out.yearMin = year[1]
    if (/\belectric|ev\b/i.test(q)) out.fuel = 'Electric'
  }

  if (categoryId === 'electronics') {
    if (/\bapple|iphone|macbook|ipad\b/i.test(q)) out.brand = 'Apple'
    if (/\bsony\b/i.test(q)) out.brand = 'Sony'
    if (/\blaptop|macbook\b/i.test(q)) out.deviceType = 'Laptop'
    if (/\biphone|phone\b/i.test(q)) out.deviceType = 'Phone'
    if (/\bcamera\b/i.test(q)) out.deviceType = 'Camera'
  }

  return out
}

/** Detect likely category + filter hints from natural language */
export function analyzeSearchQuery(query, currentCategory = null) {
  const trimmed = query.trim()
  if (!trimmed) {
    return {
      suggestedCategory: currentCategory,
      categoryConfidence: 0,
      extractedFilters: {},
      tokens: [],
      label: null,
    }
  }

  const scores = {}
  CATEGORY_RULES.forEach(({ id, re }) => {
    if (re.test(trimmed)) scores[id] = (scores[id] || 0) + 2
  })

  categories.forEach((c) => {
    const cfg = categoryConfig[c.id]
    cfg?.searchHints?.forEach((hint) => {
      if (trimmed.toLowerCase().includes(hint.toLowerCase())) {
        scores[c.id] = (scores[c.id] || 0) + 1
      }
    })
    if (trimmed.toLowerCase().includes(c.name.toLowerCase())) scores[c.id] = (scores[c.id] || 0) + 3
  })

  let suggestedCategory = currentCategory
  let categoryConfidence = 0
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  if (sorted.length > 0 && sorted[0][1] >= 2) {
    suggestedCategory = sorted[0][0]
    categoryConfidence = Math.min(sorted[0][1] / 5, 1)
  }

  const extractedFilters = {
    ...extractPriceHints(trimmed),
    ...extractCategoryFilters(trimmed, suggestedCategory),
  }

  const catName = categories.find((c) => c.id === suggestedCategory)?.name
  const label =
    categoryConfidence > 0.3 && suggestedCategory
      ? `Showing ${catName} — smart match`
      : null

  return {
    suggestedCategory,
    categoryConfidence,
    extractedFilters,
    tokens: tokenize(trimmed),
    label,
  }
}

function listingText(listing) {
  return [
    listing.title,
    listing.description,
    listing.neighborhood,
    listing.city,
    listing.seller,
    ...(listing.features || []),
    ...Object.values(listing.attributes || {}),
  ]
    .join(' ')
    .toLowerCase()
}

/** Relevance score 0–100 for ranking */
export function scoreListing(listing, query, intent) {
  if (!query.trim()) return 50
  const q = query.toLowerCase()
  const text = listingText(listing)
  let score = 0

  if (text.includes(q)) score += 40

  intent?.tokens?.forEach((t) => {
    if (text.includes(t)) score += 12
  })

  if (intent?.suggestedCategory && listing.category === intent.suggestedCategory) score += 15

  if (listing.isPro) score += 2
  if (listing.sellerVerified) score += 2

  return Math.min(score, 100)
}

export function matchesCategoryFilters(listing, categoryFilters, categoryId) {
  const attrs = listing.attributes || {}

  for (const [key, val] of Object.entries(categoryFilters)) {
    if (key === 'verifiedOnly' && val && !listing.sellerVerified) return false
    if (key === 'proOnly' && val && !listing.isPro) return false
    if (!val || val === 'Any' || val === '') continue

    if (key === 'minPrice' && listing.price < Number(val)) return false
    if (key === 'maxPrice' && listing.price > Number(val)) return false
    if (key === 'condition' && listing.condition !== val) return false

    const attrVal = attrs[key]

    if (key === 'yearMin') {
      if (!attrVal || Number(attrVal) < Number(val)) return false
      continue
    }
    if (key === 'yearMax') {
      if (!attrVal || Number(attrVal) > Number(val)) return false
      continue
    }
    if (key === 'maxMileage') {
      if (!attrVal || Number(attrVal) > Number(val)) return false
      continue
    }
    if (key === 'licensed' || key === 'freeQuote') {
      if (val && !attrVal) return false
      continue
    }
    if (key === 'delivery' && val === 'Available') {
      if (attrVal !== 'Available' && attrVal !== 'Delivery available') return false
      continue
    }

    if (key === 'jobSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.jobSubcategory !== val) return false
      continue
    }
    if (key === 'realEstateSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      // Soft match: listings without a subcategory still appear in browse
      if (attrs.realEstateSubcategory && attrs.realEstateSubcategory !== val) return false
      continue
    }
    if (key === 'realEstatePropertyType') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.realEstatePropertyType && attrs.realEstatePropertyType !== val) return false
      continue
    }
    if (key === 'homeKitchenSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.homeKitchenSubcategory !== val) return false
      continue
    }
    if (key === 'servicesSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.servicesSubcategory !== val) return false
      continue
    }
    if (key === 'vehiclesSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.vehiclesSubcategory !== val) return false
      continue
    }
    if (key === 'petsSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.petsSubcategory !== val) return false
      continue
    }
    if (key === 'sportsSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.sportsSubcategory !== val) return false
      continue
    }
    if (key === 'beautySubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.beautySubcategory !== val) return false
      continue
    }
    if (key === 'healthSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.healthSubcategory !== val) return false
      continue
    }
    if (key === 'repairsSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.repairsSubcategory !== val) return false
      continue
    }
    if (key === 'educationSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.educationSubcategory !== val) return false
      continue
    }
    if (key === 'toolsRentalSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.toolsRentalSubcategory !== val) return false
      continue
    }
    if (key === 'transportSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.transportSubcategory !== val) return false
      continue
    }
    if (key === 'kolbaranSubcategory') {
      if (!val || val === 'Any' || val === 'all') continue
      if (attrs.kolbaranSubcategory !== val) return false
      continue
    }

    if (key === 'rooms') {
      if (!val || val === 'Any') continue
      const rooms = attrs.rooms ?? attrs.bedrooms
      if (val === '4+') {
        const n = Number(rooms)
        if (!(rooms === '4+' || (!Number.isNaN(n) && n >= 4))) return false
      } else if (String(rooms) !== String(val) && !(val === '0' && (rooms === '0' || rooms === 'Studio'))) {
        return false
      }
      continue
    }

    if (key === 'neighborhood') {
      if (!val || val === 'Any' || val === 'all') continue
      if (listing.neighborhood !== val) return false
      continue
    }

    if (key === 'balcony') {
      if (val === true || val === '1' || val === 'yes') {
        if (!attrs.balcony) return false
      }
      continue
    }

    if (key === 'elevator') {
      if (val === true || val === '1' || val === 'yes') {
        if (!attrs.elevator) return false
      }
      if (val === false || val === '0' || val === 'no') {
        if (attrs.elevator) return false
      }
      continue
    }

    if (key === 'parking') {
      if (val === true || val === '1' || val === 'yes') {
        if (!attrs.parking) return false
      }
      if (val === false || val === '0' || val === 'no') {
        if (attrs.parking) return false
      }
      continue
    }

    if (key === 'storage') {
      if (val === true || val === '1' || val === 'yes') {
        if (!attrs.storage) return false
      }
      if (val === false || val === '0' || val === 'no') {
        if (attrs.storage) return false
      }
      continue
    }

    if (key === 'depositMin') {
      const dep = Number(attrs.deposit ?? attrs.monthlyRent ?? listing.price)
      if (!dep || dep < Number(val)) return false
      continue
    }
    if (key === 'depositMax') {
      const dep = Number(attrs.deposit ?? attrs.monthlyRent ?? listing.price)
      if (!dep || dep > Number(val)) return false
      continue
    }
    if (key === 'rentMin') {
      const rent = Number(attrs.monthlyRent ?? listing.price)
      if (!rent || rent < Number(val)) return false
      continue
    }
    if (key === 'rentMax') {
      const rent = Number(attrs.monthlyRent ?? listing.price)
      if (!rent || rent > Number(val)) return false
      continue
    }

    if (key === 'areaMin') {
      const area = Number(attrs.area ?? attrs.sqft)
      if (!area || area < Number(val)) return false
      continue
    }
    if (key === 'areaMax') {
      const area = Number(attrs.area ?? attrs.sqft)
      if (!area || area > Number(val)) return false
      continue
    }
    if (key === 'buildingAgeMin') {
      const age = Number(attrs.buildingAge)
      if (Number.isNaN(age) || age < Number(val)) return false
      continue
    }
    if (key === 'buildingAgeMax') {
      const age = Number(attrs.buildingAge)
      if (Number.isNaN(age) || age > Number(val)) return false
      continue
    }
    if (key === 'floorMin') {
      const floor = Number(attrs.floor)
      if (Number.isNaN(floor) || floor < Number(val)) return false
      continue
    }
    if (key === 'floorMax') {
      const floor = Number(attrs.floor)
      if (Number.isNaN(floor) || floor > Number(val)) return false
      continue
    }

    if (key === 'hasVideo') {
      if (!val) continue
      const media = listing.media || listing.images || []
      const fromMedia = media.some((m) => m && (m.type === 'video' || (typeof m.url === 'string' && /\.(mp4|webm|mov)/i.test(m.url))))
      if (!fromMedia && !attrs.hasVideo) return false
      continue
    }
    if (key === 'hasPropertyPhotos') {
      if (!val) continue
      const media = listing.media || listing.images || []
      const fromMedia = media.some((m) => {
        if (!m) return false
        if (typeof m === 'string') return true
        return m.type === 'image' || (!m.type && m.url)
      }) || !!listing.image
      if (!fromMedia && !attrs.hasPropertyPhotos) return false
      continue
    }

    if (['buildingDirection', 'cooling', 'heating', 'flooring', 'bathroom', 'hotWater', 'advertiserType'].includes(key)) {
      if (!val || val === 'Any') continue
      if (attrs[key] !== val) return false
      continue
    }

    if (attrVal === undefined) continue

    if (key === 'bedrooms' && val === '3+') {
      if (Number(attrVal) < 3 && attrVal !== '3+') return false
      continue
    }

    if (typeof attrVal === 'string' && attrVal !== val) return false
    if (typeof attrVal === 'boolean' && attrVal !== val) return false
  }

  return true
}

export function getSearchSuggestions(query, trending = []) {
  const q = query.trim().toLowerCase()
  if (!q) return trending.slice(0, 6)

  const fromCategories = categories
    .filter((c) => c.name.toLowerCase().includes(q) || categoryConfig[c.id]?.searchHints?.some((h) => h.includes(q)))
    .map((c) => c.name)

  const fromHints = Object.entries(categoryConfig).flatMap(([, cfg]) =>
    (cfg.searchHints || []).filter((h) => h.includes(q))
  )

  return [...new Set([...fromCategories, ...fromHints, ...trending.filter((t) => t.toLowerCase().includes(q))])].slice(0, 8)
}
