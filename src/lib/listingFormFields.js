import { EMPTY_RE_DETAIL, formatRealEstateRentPriceLabel, isRealEstateRentSub } from '../data/realEstateDetailFields'
import { EMPTY_KOLBARAN_DETAIL, formatKolbaranPriceLabel } from '../data/kolbaranDetailFields'
import { EMPTY_EXCHANGE_DETAIL, formatExchangePriceLabel } from '../data/exchangeDetailFields'
import { mediaCoverUrl } from './imageCompress'

function str(v) {
  if (v == null || v === '') return ''
  return String(v)
}

function boolOrNull(v) {
  if (v === true || v === false) return v
  return null
}

/** Load editable category fields from an existing listing. */
export function hydrateListingDetails(listing) {
  const attrs = listing?.attributes || {}
  return {
    ...EMPTY_RE_DETAIL,
    ...EMPTY_KOLBARAN_DETAIL,
    ...EMPTY_EXCHANGE_DETAIL,
    jobSubcategory: attrs.jobSubcategory || '',
    realEstateSubcategory: attrs.realEstateSubcategory || '',
    realEstatePropertyType: attrs.realEstatePropertyType || '',
    homeKitchenSubcategory: attrs.homeKitchenSubcategory || '',
    vehiclesSubcategory: attrs.vehiclesSubcategory || '',
    petsSubcategory: attrs.petsSubcategory || '',
    sportsSubcategory: attrs.sportsSubcategory || '',
    beautySubcategory: attrs.beautySubcategory || '',
    healthSubcategory: attrs.healthSubcategory || '',
    educationSubcategory: attrs.educationSubcategory || '',
    toolsRentalSubcategory: attrs.toolsRentalSubcategory || '',
    transportSubcategory: attrs.transportSubcategory || '',
    kolbaranSubcategory: attrs.kolbaranSubcategory || '',
    rooms: attrs.rooms || '',
    area: str(attrs.area),
    buildingAge: str(attrs.buildingAge),
    floor: str(attrs.floor),
    buildingDirection: attrs.buildingDirection || '',
    cooling: attrs.cooling || '',
    heating: attrs.heating || '',
    flooring: attrs.flooring || '',
    bathroom: attrs.bathroom || '',
    hotWater: attrs.hotWater || '',
    advertiserType: attrs.advertiserType || '',
    elevator: boolOrNull(attrs.elevator),
    elevatorCount: attrs.elevatorCount || '',
    parking: boolOrNull(attrs.parking),
    parkingCount: attrs.parkingCount || '',
    storage: boolOrNull(attrs.storage),
    storageCount: attrs.storageCount || '',
    deposit: str(attrs.deposit),
    monthlyRent: str(attrs.monthlyRent),
    kolbaranDay: attrs.kolbaranDay || '',
    kolbaranCargoName: attrs.kolbaranCargoName || '',
    kolbaranCargoType: attrs.kolbaranCargoType || '',
    kolbaranWeight: str(attrs.kolbaranWeight),
    kolbaranWeightMin: str(attrs.kolbaranWeightMin),
    kolbaranWeightMax: str(attrs.kolbaranWeightMax),
    kolbaranOrigin: attrs.kolbaranOrigin || '',
    kolbaranDestination: attrs.kolbaranDestination || '',
    kolbaranDate: attrs.kolbaranDate || '',
    kolbaranPriceMin: str(attrs.kolbaranPriceMin),
    kolbaranPriceMax: str(attrs.kolbaranPriceMax),
    kolbaranNegotiable: !!attrs.kolbaranNegotiable,
    exchangeCurrency: attrs.exchangeCurrency || '',
    exchangeBuyPrice: str(attrs.exchangeBuyPrice),
    exchangeSellPrice: str(attrs.exchangeSellPrice),
    exchangeTodayPrice: str(attrs.exchangeTodayPrice),
    priceNegotiable: !!(
      attrs.priceNegotiable
      || attrs.kolbaranNegotiable
      || (listing?.priceLabel && /توافقی|negotiable/i.test(String(listing.priceLabel)))
      || (Number(listing?.price) === 0 && !attrs.monthlyRent && !attrs.deposit)
    ),
  }
}

/** Build attributes payload from category + form details (same shape as post wizard). */
export function buildListingAttributes(category, form, media = []) {
  const attributes = {}
  const isJobs = category === 'jobs'
  const isRealEstate = category === 'real-estate'
  const isHomeKitchen = category === 'home-appliances'
  const isVehicles = category === 'vehicles'
  const isPets = category === 'pets'
  const isSports = category === 'sports'
  const isBeauty = category === 'beauty'
  const isHealth = category === 'health'
  const isEducation = category === 'education'
  const isToolsRental = category === 'tools-rental'
  const isTransport = category === 'transport'
  const isKolbaran = category === 'kolbaran'
  const isExchange = category === 'exchange'

  if (isJobs && form.jobSubcategory) attributes.jobSubcategory = form.jobSubcategory

  if (isRealEstate && form.realEstateSubcategory) {
    attributes.realEstateSubcategory = form.realEstateSubcategory
    if (form.realEstatePropertyType) attributes.realEstatePropertyType = form.realEstatePropertyType
    if (form.rooms) attributes.rooms = form.rooms
    if (form.area !== '' && form.area != null) attributes.area = Number(form.area)
    if (form.buildingAge !== '' && form.buildingAge != null) attributes.buildingAge = Number(form.buildingAge)
    if (form.floor !== '' && form.floor != null) attributes.floor = Number(form.floor)
    if (form.buildingDirection) attributes.buildingDirection = form.buildingDirection
    if (form.cooling) attributes.cooling = form.cooling
    if (form.heating) attributes.heating = form.heating
    if (form.flooring) attributes.flooring = form.flooring
    if (form.bathroom) attributes.bathroom = form.bathroom
    if (form.hotWater) attributes.hotWater = form.hotWater
    if (form.advertiserType) attributes.advertiserType = form.advertiserType
    if (form.elevator === true || form.elevator === false) {
      attributes.elevator = form.elevator
      if (form.elevator === true && form.elevatorCount) attributes.elevatorCount = form.elevatorCount
    }
    if (form.parking === true || form.parking === false) {
      attributes.parking = form.parking
      if (form.parking === true && form.parkingCount) attributes.parkingCount = form.parkingCount
    }
    if (form.storage === true || form.storage === false) {
      attributes.storage = form.storage
      if (form.storage === true && form.storageCount) attributes.storageCount = form.storageCount
    }
    if (isRealEstateRentSub(form.realEstateSubcategory)) {
      if (form.deposit !== '' && form.deposit != null) attributes.deposit = Number(form.deposit)
      if (form.monthlyRent !== '' && form.monthlyRent != null) attributes.monthlyRent = Number(form.monthlyRent)
    }
    const hasVideo = media.some((m) => m.type === 'video')
    const hasPhotos = media.some((m) => m.type === 'image') || !!mediaCoverUrl(media)
    if (hasVideo) attributes.hasVideo = true
    if (hasPhotos) attributes.hasPropertyPhotos = true
  }

  if (isHomeKitchen && form.homeKitchenSubcategory) attributes.homeKitchenSubcategory = form.homeKitchenSubcategory
  if (isVehicles && form.vehiclesSubcategory) attributes.vehiclesSubcategory = form.vehiclesSubcategory
  if (isPets && form.petsSubcategory) attributes.petsSubcategory = form.petsSubcategory
  if (isSports && form.sportsSubcategory) attributes.sportsSubcategory = form.sportsSubcategory
  if (isBeauty && form.beautySubcategory) attributes.beautySubcategory = form.beautySubcategory
  if (isHealth && form.healthSubcategory) attributes.healthSubcategory = form.healthSubcategory
  if (isEducation && form.educationSubcategory) attributes.educationSubcategory = form.educationSubcategory
  if (isToolsRental && form.toolsRentalSubcategory) attributes.toolsRentalSubcategory = form.toolsRentalSubcategory
  if (isTransport && form.transportSubcategory) attributes.transportSubcategory = form.transportSubcategory

  if (isKolbaran && form.kolbaranSubcategory) {
    attributes.kolbaranSubcategory = form.kolbaranSubcategory
    if (form.kolbaranDay) attributes.kolbaranDay = form.kolbaranDay
    if (form.kolbaranCargoName) attributes.kolbaranCargoName = String(form.kolbaranCargoName).trim()
    if (form.kolbaranCargoType) attributes.kolbaranCargoType = form.kolbaranCargoType
    if (form.kolbaranWeight !== '' && form.kolbaranWeight != null) attributes.kolbaranWeight = Number(form.kolbaranWeight)
    if (form.kolbaranWeightMin !== '' && form.kolbaranWeightMin != null) attributes.kolbaranWeightMin = Number(form.kolbaranWeightMin)
    if (form.kolbaranWeightMax !== '' && form.kolbaranWeightMax != null) attributes.kolbaranWeightMax = Number(form.kolbaranWeightMax)
    if (form.kolbaranOrigin) attributes.kolbaranOrigin = String(form.kolbaranOrigin).trim()
    if (form.kolbaranDestination) attributes.kolbaranDestination = String(form.kolbaranDestination).trim()
    if (form.kolbaranDate) attributes.kolbaranDate = form.kolbaranDate
    if (form.kolbaranPriceMin !== '' && form.kolbaranPriceMin != null) attributes.kolbaranPriceMin = Number(form.kolbaranPriceMin)
    if (form.kolbaranPriceMax !== '' && form.kolbaranPriceMax != null) attributes.kolbaranPriceMax = Number(form.kolbaranPriceMax)
    if (form.kolbaranNegotiable) attributes.kolbaranNegotiable = true
  }

  if (isExchange) {
    if (form.exchangeCurrency) attributes.exchangeCurrency = form.exchangeCurrency
    if (form.exchangeBuyPrice !== '' && form.exchangeBuyPrice != null) attributes.exchangeBuyPrice = Number(form.exchangeBuyPrice)
    if (form.exchangeSellPrice !== '' && form.exchangeSellPrice != null) attributes.exchangeSellPrice = Number(form.exchangeSellPrice)
    if (form.exchangeTodayPrice !== '' && form.exchangeTodayPrice != null) attributes.exchangeTodayPrice = Number(form.exchangeTodayPrice)
  }

  if (form.priceNegotiable) {
    attributes.priceNegotiable = true
    if (isKolbaran) attributes.kolbaranNegotiable = true
  }

  return attributes
}

/** Price + label for post/edit from category form. */
export function buildListingPrice(category, form, attributes, lang = 'fa') {
  if (form.priceNegotiable) {
    return {
      price: 0,
      priceLabel: lang === 'fa' ? 'توافقی' : 'Negotiable',
    }
  }

  const isKolbaran = category === 'kolbaran'
  const isExchange = category === 'exchange'
  const isReRent = category === 'real-estate' && isRealEstateRentSub(form.realEstateSubcategory)

  if (isKolbaran) {
    return {
      price: Number(form.kolbaranPriceMin) || Number(form.kolbaranPriceMax) || 0,
      priceLabel: formatKolbaranPriceLabel(attributes, lang),
    }
  }
  if (isExchange) {
    return {
      price: Number(form.exchangeSellPrice) || Number(form.exchangeTodayPrice) || Number(form.exchangeBuyPrice) || 0,
      priceLabel: formatExchangePriceLabel(attributes, lang),
    }
  }
  if (isReRent) {
    return {
      price: Number(form.monthlyRent) || Number(form.deposit) || 0,
      priceLabel: formatRealEstateRentPriceLabel({
        deposit: form.deposit,
        monthlyRent: form.monthlyRent,
      }, lang),
    }
  }
  const priceNum = Number(form.price) || 0
  return {
    price: priceNum,
    priceLabel: priceNum
      ? `$${Number(priceNum).toLocaleString()}`
      : (lang === 'fa' ? 'توافقی' : 'Negotiable'),
  }
}

export function hideGenericPriceField(category, form) {
  if (category === 'kolbaran' || category === 'exchange') return true
  if (category === 'real-estate' && isRealEstateRentSub(form.realEstateSubcategory)) return true
  return false
}
