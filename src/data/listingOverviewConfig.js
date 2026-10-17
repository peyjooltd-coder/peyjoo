import { categories } from './mockData'

/** Labels for attribute keys per category */
const attrLabels = {
  'real-estate': {
    listingType: 'Listing type',
    bedrooms: 'Bedrooms',
    propertyType: 'Property',
    sqft: 'Size (sq ft)',
  },
  vehicles: {
    make: 'Make',
    model: 'Model',
    year: 'Year',
    mileage: 'Mileage',
    fuel: 'Fuel',
  },
  electronics: {
    brand: 'Brand',
    deviceType: 'Device',
    storage: 'Storage / specs',
    warranty: 'Warranty',
  },
  furniture: {
    itemType: 'Item',
    material: 'Material',
    delivery: 'Delivery',
  },
  services: {
    serviceType: 'Service',
    licensed: 'Licensed',
    serviceArea: 'Area',
    startingPrice: 'Starting from',
  },
  fashion: { size: 'Size', brand: 'Brand', gender: 'For' },
  sports: { sportType: 'Type', brand: 'Brand' },
  business: { equipmentType: 'Equipment', quantity: 'Qty' },
}

export function getCategoryMeta(categoryId) {
  return categories.find((c) => c.id === categoryId)
}

export function getListingSpecRows(listing) {
  const attrs = listing.attributes || {}
  const labels = attrLabels[listing.category] || {}
  const rows = Object.entries(attrs).map(([key, value]) => ({
    key,
    label: labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
    value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value),
  }))

  if (listing.category !== 'services' && listing.condition) {
    rows.unshift({ key: 'condition', label: 'Condition', value: listing.condition })
  }

  return rows
}

export const categoryOverviewExtras = {
  'real-estate': {
    title: 'Property overview',
    subtitle: 'Rental & sale details for Greater Vancouver',
    highlights: ['Utilities & pets in features', 'In-suite laundry common', 'Ask about move-in date'],
    blocks: ['specs', 'features', 'location', 'viewing'],
  },
  vehicles: {
    title: 'Vehicle overview',
    subtitle: 'Specs, history & test drive',
    highlights: ['Request CarFax / service records', 'Schedule test drive', 'Financing may be available'],
    blocks: ['specs', 'history', 'features', 'location'],
  },
  electronics: {
    title: 'Device overview',
    subtitle: 'Specs, warranty & authenticity',
    highlights: ['Check serial / IMEI at meetup', 'Warranty transfer if applicable', 'Original box adds value'],
    blocks: ['specs', 'warranty', 'features', 'location'],
  },
  furniture: {
    title: 'Furniture overview',
    subtitle: 'Dimensions, condition & delivery',
    highlights: ['Ask for exact measurements', 'Smoke-free home?', 'Stairs / elevator access'],
    blocks: ['specs', 'features', 'delivery', 'location'],
  },
  services: {
    title: 'Service overview',
    subtitle: 'Scope, licensing & quote',
    highlights: ['Free consultation common', 'Licensed & insured preferred', 'Portfolio / references'],
    blocks: ['specs', 'credentials', 'features', 'area'],
  },
  fashion: {
    title: 'Fashion overview',
    subtitle: 'Size, brand & condition',
    highlights: ['Authenticity for designer items', 'Exact measurements help', 'No returns unless stated'],
    blocks: ['specs', 'features', 'location'],
  },
  sports: {
    title: 'Sports & outdoors overview',
    subtitle: 'Usage, condition & pickup',
    highlights: ['Check wear on moving parts', 'Membership transfer if any', 'Pickup often required'],
    blocks: ['specs', 'features', 'location'],
  },
  business: {
    title: 'Business equipment overview',
    subtitle: 'Commercial specs & quantity',
    highlights: ['Bulk pricing possible', 'Invoice / depreciation docs', 'Installation support'],
    blocks: ['specs', 'features', 'location'],
  },
}

export function getOverviewConfig(categoryId) {
  return (
    categoryOverviewExtras[categoryId] || {
      title: 'Listing overview',
      subtitle: 'Key details for this ad',
      highlights: [],
      blocks: ['specs', 'features', 'location'],
    }
  )
}
