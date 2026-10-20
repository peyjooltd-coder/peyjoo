import { useState, useEffect, useMemo } from 'react'
import {
  Bell, MapPin, ChevronDown, Search, SlidersHorizontal, ArrowUpDown, LayoutGrid,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { feedCategories } from '../data/mobileUiData'
import ExploreFilterChips from '../components/ExploreFilterChips'
import GlassCategoryIcon from '../components/GlassCategoryIcon'
import { CANADA_CITIES, cityLabel, normalizeCityId } from '../data/canadaCities'
import { resolveApiCategory } from '../lib/categoryMap'
import { jobsSubLabel, JOBS_SUBCATEGORIES, JOBS_SUB_ALL } from '../data/jobsSubcategories'
import { realEstateSubLabel, realEstatePropertyTypeLabel, REAL_ESTATE_SUBCATEGORIES, REAL_ESTATE_SUB_ALL } from '../data/realEstateSubcategories'
import { homeKitchenSubLabel, HOME_KITCHEN_SUBCATEGORIES, HOME_KITCHEN_SUB_ALL } from '../data/homeKitchenSubcategories'
import { servicesSubLabel, SERVICES_SUBCATEGORIES, SERVICES_SUB_ALL } from '../data/servicesSubcategories'
import { vehiclesSubLabel, VEHICLES_SUBCATEGORIES, VEHICLES_SUB_ALL } from '../data/vehiclesSubcategories'
import { petsSubLabel, PETS_SUBCATEGORIES, PETS_SUB_ALL } from '../data/petsSubcategories'
import { sportsSubLabel, SPORTS_SUBCATEGORIES, SPORTS_SUB_ALL } from '../data/sportsSubcategories'
import { beautySubLabel, BEAUTY_SUBCATEGORIES, BEAUTY_SUB_ALL } from '../data/beautySubcategories'
import { healthSubLabel, HEALTH_SUBCATEGORIES, HEALTH_SUB_ALL } from '../data/healthSubcategories'
import { repairsSubLabel, REPAIRS_SUBCATEGORIES, REPAIRS_SUB_ALL } from '../data/repairsSubcategories'
import { educationSubLabel, EDUCATION_SUBCATEGORIES, EDUCATION_SUB_ALL } from '../data/educationSubcategories'
import { toolsRentalSubLabel, TOOLS_RENTAL_SUBCATEGORIES, TOOLS_RENTAL_SUB_ALL } from '../data/toolsRentalSubcategories'
import { transportSubLabel, TRANSPORT_SUBCATEGORIES, TRANSPORT_SUB_ALL } from '../data/transportSubcategories'
import FeedListingCard from '../components/mobile/FeedListingCard'
import { listingCoverUrl, normalizeMedia } from '../lib/imageCompress'
import MobileBottomSheet from '../components/mobile/MobileBottomSheet'
import SectionOrangeHeader from '../components/mobile/SectionOrangeHeader'
import JobsSubcategoryGate from '../components/JobsSubcategoryGate'
import HomeKitchenSubcategoryGate from '../components/HomeKitchenSubcategoryGate'
import ServicesSubcategoryGate from '../components/ServicesSubcategoryGate'
import VehiclesSubcategoryGate from '../components/VehiclesSubcategoryGate'
import PetsSubcategoryGate from '../components/PetsSubcategoryGate'
import SportsSubcategoryGate from '../components/SportsSubcategoryGate'
import BeautySubcategoryGate from '../components/BeautySubcategoryGate'
import HealthSubcategoryGate from '../components/HealthSubcategoryGate'
import RepairsSubcategoryGate from '../components/RepairsSubcategoryGate'
import EducationSubcategoryGate from '../components/EducationSubcategoryGate'
import ToolsRentalSubcategoryGate from '../components/ToolsRentalSubcategoryGate'
import TransportSubcategoryGate from '../components/TransportSubcategoryGate'
import RealEstateDetailFields from '../components/RealEstateDetailFields'
import { EMPTY_RE_DETAIL } from '../data/realEstateDetailFields'
import { formatListingRelativeTime, groupListingsByDay } from '../lib/listingTime'
import { listingTitle, listingPriceLabel } from '../lib/localizeListing'

const SORT_IDS = ['newest', 'price-asc', 'price-desc', 'popular']

function chipIsActive(chipId, selectedCategory) {
  if (chipId === 'all') return !selectedCategory
  if (chipId === 'more') return false
  return resolveApiCategory(chipId) === selectedCategory
}

export default function ExplorePage() {
  const {
    openListing,
    filteredListings,
    selectedCategory,
    setSelectedCategory,
    setViewTab,
    searchQuery,
    runSmartSearch,
    sortBy,
    setSortBy,
    selectedRegion,
    setSelectedRegion,
    categoryFilters,
    setCategoryFilters,
    resetAllFilters,
    setRealEstateSheetOpen,
    savedIds,
    toggleSave,
    openCategory,
  } = useApp()
  const { t, isRtl, lang } = useI18n()

  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [regionOpen, setRegionOpen] = useState(false)

  const isJobsCategory = selectedCategory === 'jobs'
  const isRealEstateCategory = selectedCategory === 'real-estate'
  const isHomeKitchenCategory = selectedCategory === 'home-appliances'
  const isServicesCategory = selectedCategory === 'services'
  const isVehiclesCategory = selectedCategory === 'vehicles'
  const isPetsCategory = selectedCategory === 'pets'
  const isSportsCategory = selectedCategory === 'sports'
  const isBeautyCategory = selectedCategory === 'beauty'
  const isHealthCategory = selectedCategory === 'health'
  const isRepairsCategory = selectedCategory === 'repairs'
  const isEducationCategory = selectedCategory === 'education'
  const isToolsRentalCategory = selectedCategory === 'tools-rental'
  const isTransportCategory = selectedCategory === 'transport'
  const showJobsGate = isJobsCategory && !categoryFilters.jobSubcategory
  const showRealEstateGate = isRealEstateCategory && !categoryFilters.realEstateSubcategory
  const showHomeKitchenGate = isHomeKitchenCategory && !categoryFilters.homeKitchenSubcategory
  const showServicesGate = isServicesCategory && !categoryFilters.servicesSubcategory
  const showVehiclesGate = isVehiclesCategory && !categoryFilters.vehiclesSubcategory
  const showPetsGate = isPetsCategory && !categoryFilters.petsSubcategory
  const showSportsGate = isSportsCategory && !categoryFilters.sportsSubcategory
  const showBeautyGate = isBeautyCategory && !categoryFilters.beautySubcategory
  const showHealthGate = isHealthCategory && !categoryFilters.healthSubcategory
  const showRepairsGate = isRepairsCategory && !categoryFilters.repairsSubcategory
  const showEducationGate = isEducationCategory && !categoryFilters.educationSubcategory
  const showToolsRentalGate = isToolsRentalCategory && !categoryFilters.toolsRentalSubcategory
  const showTransportGate = isTransportCategory && !categoryFilters.transportSubcategory

  const sortLabels = {
    newest: t('sortNewest'),
    'price-asc': t('sortCheapest'),
    'price-desc': t('sortExpensive'),
    popular: t('sortPopular'),
  }

  const regionLabel = (r) => cityLabel(normalizeCityId(r), lang)

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Real-estate has its own FB-Marketplace-style page — bounce there if someone
  // lands on ExplorePage with the real-estate category selected.
  useEffect(() => {
    if (isRealEstateCategory) setViewTab('real-estate')
  }, [isRealEstateCategory, setViewTab])

  const gridItems = useMemo(
    () =>
      filteredListings.map((l) => ({
        id: l.id,
        title: listingTitle(l, lang),
        priceLabel: listingPriceLabel(l, lang, t),
        image: l.image,
        timeLabel: formatListingRelativeTime(l, lang),
        listing: l,
      })),
    [filteredListings, lang, t],
  )

  const dayGroups = useMemo(() => {
    if (sortBy !== 'newest' || searchQuery.trim() || !filteredListings.length) return null
    return groupListingsByDay(filteredListings, lang)
  }, [filteredListings, sortBy, searchQuery, lang])

  const onChipClick = (chipId) => {
    if (chipId === 'more') {
      setViewTab('categories')
      return
    }
    if (chipId === 'all') {
      setSelectedCategory(null)
      return
    }
    // FB Marketplace categories open the dedicated browse UI
    openCategory(chipId)
  }

  const applySearch = () => {
    runSmartSearch(localSearch)
  }

  const catLabel = (cat) => {
    if (cat.id === 'all') return t('all')
    if (cat.id === 'more') return t('more')
    return t(`cats.${cat.id}`)
  }

  const pickJobSub = (id) => {
    setCategoryFilters((f) => ({ ...f, jobSubcategory: id }))
  }

  const pickRealEstateSub = (id) => {
    setCategoryFilters((f) => ({
      ...f,
      realEstateSubcategory: id,
      realEstatePropertyType: f.realEstatePropertyType || 'all',
    }))
  }

  const openRealEstateSheet = () => {
    setRealEstateSheetOpen(true)
  }

  const pickHomeKitchenSub = (id) => {
    setCategoryFilters((f) => ({ ...f, homeKitchenSubcategory: id }))
  }

  const pickServicesSub = (id) => {
    setCategoryFilters((f) => ({ ...f, servicesSubcategory: id }))
  }

  const pickVehiclesSub = (id) => {
    setCategoryFilters((f) => ({ ...f, vehiclesSubcategory: id }))
  }

  const pickPetsSub = (id) => {
    setCategoryFilters((f) => ({ ...f, petsSubcategory: id }))
  }

  const pickSportsSub = (id) => {
    setCategoryFilters((f) => ({ ...f, sportsSubcategory: id }))
  }

  const pickBeautySub = (id) => {
    setCategoryFilters((f) => ({ ...f, beautySubcategory: id }))
  }

  const pickHealthSub = (id) => {
    setCategoryFilters((f) => ({ ...f, healthSubcategory: id }))
  }

  const pickRepairsSub = (id) => {
    setCategoryFilters((f) => ({ ...f, repairsSubcategory: id }))
  }

  const pickEducationSub = (id) => {
    setCategoryFilters((f) => ({ ...f, educationSubcategory: id }))
  }

  const pickToolsRentalSub = (id) => {
    setCategoryFilters((f) => ({ ...f, toolsRentalSubcategory: id }))
  }

  const pickTransportSub = (id) => {
    setCategoryFilters((f) => ({ ...f, transportSubcategory: id }))
  }

  const backFromSubBrowse = () => {
    if (isJobsCategory && categoryFilters.jobSubcategory) {
      setCategoryFilters((f) => ({ ...f, jobSubcategory: '' }))
      return
    }
    if (isRealEstateCategory && categoryFilters.realEstateSubcategory) {
      setCategoryFilters((f) => ({ ...f, realEstateSubcategory: '', realEstatePropertyType: '' }))
      setRealEstateSheetOpen(true)
      return
    }
    if (isHomeKitchenCategory && categoryFilters.homeKitchenSubcategory) {
      setCategoryFilters((f) => ({ ...f, homeKitchenSubcategory: '' }))
      return
    }
    if (isServicesCategory && categoryFilters.servicesSubcategory) {
      setCategoryFilters((f) => ({ ...f, servicesSubcategory: '' }))
      return
    }
    if (isVehiclesCategory && categoryFilters.vehiclesSubcategory) {
      setCategoryFilters((f) => ({ ...f, vehiclesSubcategory: '' }))
      return
    }
    if (isPetsCategory && categoryFilters.petsSubcategory) {
      setCategoryFilters((f) => ({ ...f, petsSubcategory: '' }))
      return
    }
    if (isSportsCategory && categoryFilters.sportsSubcategory) {
      setCategoryFilters((f) => ({ ...f, sportsSubcategory: '' }))
      return
    }
    if (isBeautyCategory && categoryFilters.beautySubcategory) {
      setCategoryFilters((f) => ({ ...f, beautySubcategory: '' }))
      return
    }
    if (isHealthCategory && categoryFilters.healthSubcategory) {
      setCategoryFilters((f) => ({ ...f, healthSubcategory: '' }))
      return
    }
    if (isRepairsCategory && categoryFilters.repairsSubcategory) {
      setCategoryFilters((f) => ({ ...f, repairsSubcategory: '' }))
      return
    }
    if (isEducationCategory && categoryFilters.educationSubcategory) {
      setCategoryFilters((f) => ({ ...f, educationSubcategory: '' }))
      return
    }
    if (isToolsRentalCategory && categoryFilters.toolsRentalSubcategory) {
      setCategoryFilters((f) => ({ ...f, toolsRentalSubcategory: '' }))
      return
    }
    if (isTransportCategory && categoryFilters.transportSubcategory) {
      setCategoryFilters((f) => ({ ...f, transportSubcategory: '' }))
      return
    }
    setViewTab('home')
  }

  const headerTitle = isJobsCategory
    ? (categoryFilters.jobSubcategory && categoryFilters.jobSubcategory !== 'all'
      ? jobsSubLabel(categoryFilters.jobSubcategory, lang)
      : t('cats.jobs'))
    : isRealEstateCategory
      ? (categoryFilters.realEstateSubcategory && categoryFilters.realEstateSubcategory !== 'all'
        ? (
          categoryFilters.realEstatePropertyType
          && categoryFilters.realEstatePropertyType !== 'all'
            ? realEstatePropertyTypeLabel(
              categoryFilters.realEstateSubcategory,
              categoryFilters.realEstatePropertyType,
              lang,
            )
            : realEstateSubLabel(categoryFilters.realEstateSubcategory, lang)
        )
        : t('cats.real-estate'))
      : isHomeKitchenCategory
        ? (categoryFilters.homeKitchenSubcategory && categoryFilters.homeKitchenSubcategory !== 'all'
          ? homeKitchenSubLabel(categoryFilters.homeKitchenSubcategory, lang)
          : t('cats.home-appliances'))
        : isServicesCategory
          ? (categoryFilters.servicesSubcategory && categoryFilters.servicesSubcategory !== 'all'
            ? servicesSubLabel(categoryFilters.servicesSubcategory, lang)
            : t('cats.services'))
          : isVehiclesCategory
            ? (categoryFilters.vehiclesSubcategory && categoryFilters.vehiclesSubcategory !== 'all'
              ? vehiclesSubLabel(categoryFilters.vehiclesSubcategory, lang)
              : t('cats.vehicles'))
            : isPetsCategory
              ? (categoryFilters.petsSubcategory && categoryFilters.petsSubcategory !== 'all'
                ? petsSubLabel(categoryFilters.petsSubcategory, lang)
                : t('cats.pets'))
              : isSportsCategory
                ? (categoryFilters.sportsSubcategory && categoryFilters.sportsSubcategory !== 'all'
                  ? sportsSubLabel(categoryFilters.sportsSubcategory, lang)
                  : t('cats.sports'))
                : isBeautyCategory
                  ? (categoryFilters.beautySubcategory && categoryFilters.beautySubcategory !== 'all'
                    ? beautySubLabel(categoryFilters.beautySubcategory, lang)
                    : t('cats.beauty'))
                  : isHealthCategory
                    ? (categoryFilters.healthSubcategory && categoryFilters.healthSubcategory !== 'all'
                      ? healthSubLabel(categoryFilters.healthSubcategory, lang)
                      : t('cats.health'))
                    : isRepairsCategory
                      ? (categoryFilters.repairsSubcategory && categoryFilters.repairsSubcategory !== 'all'
                        ? repairsSubLabel(categoryFilters.repairsSubcategory, lang)
                        : t('cats.repairs'))
                      : isEducationCategory
                        ? (categoryFilters.educationSubcategory && categoryFilters.educationSubcategory !== 'all'
                          ? educationSubLabel(categoryFilters.educationSubcategory, lang)
                          : t('cats.education'))
                        : isToolsRentalCategory
                          ? (categoryFilters.toolsRentalSubcategory && categoryFilters.toolsRentalSubcategory !== 'all'
                            ? toolsRentalSubLabel(categoryFilters.toolsRentalSubcategory, lang)
                            : t('cats.tools-rental'))
                          : isTransportCategory
                            ? (categoryFilters.transportSubcategory && categoryFilters.transportSubcategory !== 'all'
                              ? transportSubLabel(categoryFilters.transportSubcategory, lang)
                              : t('cats.transport'))
                            : t('newestAds')

  if (showJobsGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.jobs')} onBack={() => setViewTab('home')} />
        <JobsSubcategoryGate onPick={pickJobSub} />
      </div>
    )
  }

  if (showRealEstateGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.real-estate')} onBack={() => setViewTab('home')} />
        <div className="re-gate-placeholder">
          <p>{t('realEstatePickSubHint')}</p>
          <button
            type="button"
            className="home-btn-primary"
            onClick={() => setRealEstateSheetOpen(true)}
          >
            {t('cats.real-estate')}
          </button>
        </div>
      </div>
    )
  }

  if (showHomeKitchenGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.home-appliances')} onBack={() => setViewTab('home')} />
        <HomeKitchenSubcategoryGate onPick={pickHomeKitchenSub} />
      </div>
    )
  }

  if (showServicesGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.services')} onBack={() => setViewTab('home')} />
        <ServicesSubcategoryGate onPick={pickServicesSub} />
      </div>
    )
  }

  if (showVehiclesGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.vehicles')} onBack={() => setViewTab('home')} />
        <VehiclesSubcategoryGate onPick={pickVehiclesSub} />
      </div>
    )
  }

  if (showPetsGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.pets')} onBack={() => setViewTab('home')} />
        <PetsSubcategoryGate onPick={pickPetsSub} />
      </div>
    )
  }

  if (showSportsGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.sports')} onBack={() => setViewTab('home')} />
        <SportsSubcategoryGate onPick={pickSportsSub} />
      </div>
    )
  }

  if (showBeautyGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.beauty')} onBack={() => setViewTab('home')} />
        <BeautySubcategoryGate onPick={pickBeautySub} />
      </div>
    )
  }

  if (showHealthGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.health')} onBack={() => setViewTab('home')} />
        <HealthSubcategoryGate onPick={pickHealthSub} />
      </div>
    )
  }

  if (showRepairsGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.repairs')} onBack={() => setViewTab('home')} />
        <RepairsSubcategoryGate onPick={pickRepairsSub} />
      </div>
    )
  }

  if (showEducationGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.education')} onBack={() => setViewTab('home')} />
        <EducationSubcategoryGate onPick={pickEducationSub} />
      </div>
    )
  }

  if (showToolsRentalGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.tools-rental')} onBack={() => setViewTab('home')} />
        <ToolsRentalSubcategoryGate onPick={pickToolsRentalSub} />
      </div>
    )
  }

  if (showTransportGate) {
    return (
      <div className="mobile-page explore-page">
        <SectionOrangeHeader title={t('cats.transport')} onBack={() => setViewTab('home')} />
        <TransportSubcategoryGate onPick={pickTransportSub} />
      </div>
    )
  }

  return (
    <div className="mobile-page explore-page">
      <SectionOrangeHeader title={headerTitle} onBack={backFromSubBrowse}>
        <button
          type="button"
          className="section-orange-icon"
          aria-label={t('notifications')}
        >
          <Bell className="w-5 h-5" />
        </button>
      </SectionOrangeHeader>

      <div className="explore-body px-4 pt-3">
        <div className="divar-search-bar">
          <button type="button" className="divar-city-btn" onClick={() => setRegionOpen(true)}>
            <MapPin className="w-4 h-4" />
            <span>{regionLabel(selectedRegion)}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
          <div className="explore-search divar-search-input-wrap">
            <Search className="w-4 h-4 text-divar-muted shrink-0" />
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              placeholder={
                isRealEstateCategory
                  ? t('searchInApartment')
                  : t('searchInPejo')
              }
              dir={isRtl ? 'rtl' : 'ltr'}
              className="explore-search-input"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            />
            {localSearch && (
              <button type="button" className="explore-search-clear" onClick={() => { setLocalSearch(''); runSmartSearch('') }}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {isJobsCategory && categoryFilters.jobSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, jobSubcategory: '' }))}
        >
          <span>{t('jobsChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {jobsSubLabel(categoryFilters.jobSubcategory, lang)}
          </span>
        </button>
      )}

      {isRealEstateCategory && categoryFilters.realEstateSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => {
            setCategoryFilters((f) => ({ ...f, realEstateSubcategory: '', realEstatePropertyType: '' }))
            setRealEstateSheetOpen(true)
          }}
        >
          <span>{t('realEstateChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {categoryFilters.realEstatePropertyType && categoryFilters.realEstatePropertyType !== 'all'
              ? realEstatePropertyTypeLabel(
                categoryFilters.realEstateSubcategory,
                categoryFilters.realEstatePropertyType,
                lang,
              )
              : realEstateSubLabel(categoryFilters.realEstateSubcategory, lang)}
          </span>
        </button>
      )}

      {isHomeKitchenCategory && categoryFilters.homeKitchenSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, homeKitchenSubcategory: '' }))}
        >
          <span>{t('homeKitchenChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {homeKitchenSubLabel(categoryFilters.homeKitchenSubcategory, lang)}
          </span>
        </button>
      )}

      {isServicesCategory && categoryFilters.servicesSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, servicesSubcategory: '' }))}
        >
          <span>{t('servicesChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {servicesSubLabel(categoryFilters.servicesSubcategory, lang)}
          </span>
        </button>
      )}

      {isVehiclesCategory && categoryFilters.vehiclesSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, vehiclesSubcategory: '' }))}
        >
          <span>{t('vehiclesChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {vehiclesSubLabel(categoryFilters.vehiclesSubcategory, lang)}
          </span>
        </button>
      )}

      {isPetsCategory && categoryFilters.petsSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, petsSubcategory: '' }))}
        >
          <span>{t('petsChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {petsSubLabel(categoryFilters.petsSubcategory, lang)}
          </span>
        </button>
      )}

      {isSportsCategory && categoryFilters.sportsSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, sportsSubcategory: '' }))}
        >
          <span>{t('sportsChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {sportsSubLabel(categoryFilters.sportsSubcategory, lang)}
          </span>
        </button>
      )}

      {isBeautyCategory && categoryFilters.beautySubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, beautySubcategory: '' }))}
        >
          <span>{t('beautyChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {beautySubLabel(categoryFilters.beautySubcategory, lang)}
          </span>
        </button>
      )}

      {isHealthCategory && categoryFilters.healthSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, healthSubcategory: '' }))}
        >
          <span>{t('healthChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {healthSubLabel(categoryFilters.healthSubcategory, lang)}
          </span>
        </button>
      )}

      {isRepairsCategory && categoryFilters.repairsSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, repairsSubcategory: '' }))}
        >
          <span>{t('repairsChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {repairsSubLabel(categoryFilters.repairsSubcategory, lang)}
          </span>
        </button>
      )}

      {isEducationCategory && categoryFilters.educationSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, educationSubcategory: '' }))}
        >
          <span>{t('educationChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {educationSubLabel(categoryFilters.educationSubcategory, lang)}
          </span>
        </button>
      )}

      {isToolsRentalCategory && categoryFilters.toolsRentalSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, toolsRentalSubcategory: '' }))}
        >
          <span>{t('toolsRentalChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {toolsRentalSubLabel(categoryFilters.toolsRentalSubcategory, lang)}
          </span>
        </button>
      )}

      {isTransportCategory && categoryFilters.transportSubcategory && (
        <button
          type="button"
          className="jobs-sub-change-bar"
          onClick={() => setCategoryFilters((f) => ({ ...f, transportSubcategory: '' }))}
        >
          <span>{t('transportChangeSub')}</span>
          <span className="jobs-sub-change-value">
            {transportSubLabel(categoryFilters.transportSubcategory, lang)}
          </span>
        </button>
      )}

      <div className="explore-cats-scroll">
        {isRealEstateCategory ? (
          <>
            <button
              type="button"
              className={`explore-cat-chip ${!categoryFilters.realEstateSubcategory || categoryFilters.realEstateSubcategory === 'all' ? 'explore-cat-chip-active' : ''}`}
              onClick={() => setCategoryFilters((f) => ({
                ...f,
                realEstateSubcategory: 'all',
                realEstatePropertyType: 'all',
              }))}
            >
              <span className={`explore-cat-icon ${!categoryFilters.realEstateSubcategory || categoryFilters.realEstateSubcategory === 'all' ? 'explore-cat-icon-active' : ''}`}>
                <LayoutGrid className="w-5 h-5" />
              </span>
              <span className={`explore-cat-label ${!categoryFilters.realEstateSubcategory || categoryFilters.realEstateSubcategory === 'all' ? 'explore-cat-label-active' : ''}`}>
                {t('all')}
              </span>
              {(!categoryFilters.realEstateSubcategory || categoryFilters.realEstateSubcategory === 'all') && (
                <span className="explore-cat-underline" />
              )}
            </button>
            {REAL_ESTATE_SUBCATEGORIES.map((s) => {
              const isActive = categoryFilters.realEstateSubcategory === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`explore-cat-chip ${isActive ? 'explore-cat-chip-active' : ''}`}
                  onClick={() => {
                    setCategoryFilters((f) => ({
                      ...f,
                      realEstateSubcategory: s.id,
                      realEstatePropertyType: 'all',
                    }))
                  }}
                >
                  <span className={`explore-cat-icon ${isActive ? 'explore-cat-icon-active' : ''}`}>
                    <span className="text-xl">{s.icon}</span>
                  </span>
                  <span className={`explore-cat-label ${isActive ? 'explore-cat-label-active' : ''}`}>
                    {lang === 'fa' ? s.fa : s.en}
                  </span>
                  {isActive && <span className="explore-cat-underline" />}
                </button>
              )
            })}
          </>
        ) : (
          feedCategories.map((cat) => {
            const isActive = chipIsActive(cat.id, selectedCategory)
            return (
              <button
                key={cat.id}
                type="button"
                className={`explore-cat-chip ${isActive ? 'explore-cat-chip-active' : ''}`}
                onClick={() => onChipClick(cat.id)}
              >
                <span className={`explore-cat-glyph ${isActive ? 'is-active' : ''}`}>
                  <GlassCategoryIcon id={cat.id} size="sm" />
                </span>
                <span className={`explore-cat-label ${isActive ? 'explore-cat-label-active' : ''}`}>
                  {catLabel(cat)}
                </span>
                {isActive && <span className="explore-cat-underline" />}
              </button>
            )
          })
        )}
      </div>

      <div className="explore-filters">
        <button type="button" className="explore-filter-pill" onClick={() => setSortOpen(true)}>
          <ArrowUpDown className="w-4 h-4" />
          {t('sort')}
        </button>
        <button type="button" className="explore-filter-pill" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal className="w-4 h-4" />
          {t('filters')}
        </button>
      </div>

      <ExploreFilterChips onOpenFullFilters={() => setFilterOpen(true)} />

      <div className="feed-grid">
        {gridItems.length === 0 && (
          <p className="col-span-2 text-center py-12 text-sm text-divar-muted">{t('noResults')}</p>
        )}
        {dayGroups
          ? dayGroups.map((group) => (
            <div key={group.key} className="feed-day-group">
              <h4 className="feed-day-heading">{group.label}</h4>
              <div className="feed-day-cards">
                {group.items.map((l) => (
                  <FeedListingCard
                    key={l.id}
                    title={listingTitle(l, lang)}
                    priceLabel={listingPriceLabel(l, lang, t)}
                    media={normalizeMedia(l.media?.length ? l.media : l.images)}
                    image={listingCoverUrl(l) || l.image}
                    timeLabel={formatListingRelativeTime(l, lang)}
                    hasVideo={l.hasVideo || (l.media || []).some((m) => m.type === 'video')}
                    isSaved={savedIds.has(Number(l.id))}
                    onToggleSave={() => toggleSave(l.id)}
                    onClick={() => openListing(l)}
                  />
                ))}
              </div>
            </div>
          ))
          : gridItems.map((item) => (
            <FeedListingCard
              key={item.id}
              title={item.title}
              priceLabel={item.priceLabel}
              media={normalizeMedia((item.listing || item).media?.length ? (item.listing || item).media : (item.listing || item).images)}
              image={listingCoverUrl(item.listing || item) || item.image}
              timeLabel={item.timeLabel}
              hasVideo={(() => {
                const row = item.listing || item
                return row.hasVideo || (row.media || []).some((m) => m.type === 'video')
              })()}
              isSaved={savedIds.has(Number((item.listing || item).id))}
              onToggleSave={() => toggleSave((item.listing || item).id)}
              onClick={() => item.listing && openListing(item.listing)}
            />
          ))}
      </div>

      <MobileBottomSheet open={sortOpen} title={t('sort')} onClose={() => setSortOpen(false)}>
        <ul className="mobile-sheet-list">
          {SORT_IDS.map((id) => (
            <li key={id}>
              <button
                type="button"
                className={`mobile-sheet-option ${sortBy === id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => { setSortBy(id); setSortOpen(false) }}
              >
                {sortLabels[id]}
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet open={filterOpen} title={t('filters')} onClose={() => setFilterOpen(false)}>
        <div className="mobile-sheet-filters">
          {isJobsCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('jobsFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.jobSubcategory || categoryFilters.jobSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, jobSubcategory: 'all' }))}
                >
                  <span aria-hidden>{JOBS_SUB_ALL.icon}</span>
                  {lang === 'fa' ? JOBS_SUB_ALL.fa : JOBS_SUB_ALL.en}
                </button>
                {JOBS_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.jobSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, jobSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isRealEstateCategory && (
            <>
              <div className="jobs-filter-block">
                <p className="jobs-filter-title">{t('realEstateFilterField')}</p>
                <div className="jobs-filter-chips">
                  <button
                    type="button"
                    className={`jobs-filter-chip ${!categoryFilters.realEstateSubcategory || categoryFilters.realEstateSubcategory === 'all' ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, realEstateSubcategory: 'all' }))}
                  >
                    <span aria-hidden>{REAL_ESTATE_SUB_ALL.icon}</span>
                    {lang === 'fa' ? REAL_ESTATE_SUB_ALL.fa : REAL_ESTATE_SUB_ALL.en}
                  </button>
                  {REAL_ESTATE_SUBCATEGORIES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`jobs-filter-chip ${categoryFilters.realEstateSubcategory === s.id ? 'is-active' : ''}`}
                      onClick={() => setCategoryFilters((f) => ({ ...f, realEstateSubcategory: s.id }))}
                    >
                      <span aria-hidden>{s.icon}</span>
                      {lang === 'fa' ? s.fa : s.en}
                    </button>
                  ))}
                </div>
              </div>
              <RealEstateDetailFields
                mode="filter"
                values={categoryFilters}
                onChange={(patch) => setCategoryFilters((f) => ({ ...f, ...patch }))}
              />
            </>
          )}

          {isHomeKitchenCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('homeKitchenFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.homeKitchenSubcategory || categoryFilters.homeKitchenSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, homeKitchenSubcategory: 'all' }))}
                >
                  <span aria-hidden>{HOME_KITCHEN_SUB_ALL.icon}</span>
                  {lang === 'fa' ? HOME_KITCHEN_SUB_ALL.fa : HOME_KITCHEN_SUB_ALL.en}
                </button>
                {HOME_KITCHEN_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.homeKitchenSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, homeKitchenSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isServicesCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('servicesFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.servicesSubcategory || categoryFilters.servicesSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, servicesSubcategory: 'all' }))}
                >
                  <span aria-hidden>{SERVICES_SUB_ALL.icon}</span>
                  {lang === 'fa' ? SERVICES_SUB_ALL.fa : SERVICES_SUB_ALL.en}
                </button>
                {SERVICES_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.servicesSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, servicesSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isVehiclesCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('vehiclesFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.vehiclesSubcategory || categoryFilters.vehiclesSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, vehiclesSubcategory: 'all' }))}
                >
                  <span aria-hidden>{VEHICLES_SUB_ALL.icon}</span>
                  {lang === 'fa' ? VEHICLES_SUB_ALL.fa : VEHICLES_SUB_ALL.en}
                </button>
                {VEHICLES_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.vehiclesSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, vehiclesSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isPetsCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('petsFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.petsSubcategory || categoryFilters.petsSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, petsSubcategory: 'all' }))}
                >
                  <span aria-hidden>{PETS_SUB_ALL.icon}</span>
                  {lang === 'fa' ? PETS_SUB_ALL.fa : PETS_SUB_ALL.en}
                </button>
                {PETS_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.petsSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, petsSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isSportsCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('sportsFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.sportsSubcategory || categoryFilters.sportsSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, sportsSubcategory: 'all' }))}
                >
                  <span aria-hidden>{SPORTS_SUB_ALL.icon}</span>
                  {lang === 'fa' ? SPORTS_SUB_ALL.fa : SPORTS_SUB_ALL.en}
                </button>
                {SPORTS_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.sportsSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, sportsSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isBeautyCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('beautyFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.beautySubcategory || categoryFilters.beautySubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, beautySubcategory: 'all' }))}
                >
                  <span aria-hidden>{BEAUTY_SUB_ALL.icon}</span>
                  {lang === 'fa' ? BEAUTY_SUB_ALL.fa : BEAUTY_SUB_ALL.en}
                </button>
                {BEAUTY_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.beautySubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, beautySubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isHealthCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('healthFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.healthSubcategory || categoryFilters.healthSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, healthSubcategory: 'all' }))}
                >
                  <span aria-hidden>{HEALTH_SUB_ALL.icon}</span>
                  {lang === 'fa' ? HEALTH_SUB_ALL.fa : HEALTH_SUB_ALL.en}
                </button>
                {HEALTH_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.healthSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, healthSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isRepairsCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('repairsFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.repairsSubcategory || categoryFilters.repairsSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, repairsSubcategory: 'all' }))}
                >
                  <span aria-hidden>{REPAIRS_SUB_ALL.icon}</span>
                  {lang === 'fa' ? REPAIRS_SUB_ALL.fa : REPAIRS_SUB_ALL.en}
                </button>
                {REPAIRS_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.repairsSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, repairsSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isEducationCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('educationFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.educationSubcategory || categoryFilters.educationSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, educationSubcategory: 'all' }))}
                >
                  <span aria-hidden>{EDUCATION_SUB_ALL.icon}</span>
                  {lang === 'fa' ? EDUCATION_SUB_ALL.fa : EDUCATION_SUB_ALL.en}
                </button>
                {EDUCATION_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.educationSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, educationSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isToolsRentalCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('toolsRentalFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.toolsRentalSubcategory || categoryFilters.toolsRentalSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, toolsRentalSubcategory: 'all' }))}
                >
                  <span aria-hidden>{TOOLS_RENTAL_SUB_ALL.icon}</span>
                  {lang === 'fa' ? TOOLS_RENTAL_SUB_ALL.fa : TOOLS_RENTAL_SUB_ALL.en}
                </button>
                {TOOLS_RENTAL_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.toolsRentalSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, toolsRentalSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isTransportCategory && (
            <div className="jobs-filter-block">
              <p className="jobs-filter-title">{t('transportFilterField')}</p>
              <div className="jobs-filter-chips">
                <button
                  type="button"
                  className={`jobs-filter-chip ${!categoryFilters.transportSubcategory || categoryFilters.transportSubcategory === 'all' ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilters((f) => ({ ...f, transportSubcategory: 'all' }))}
                >
                  <span aria-hidden>{TRANSPORT_SUB_ALL.icon}</span>
                  {lang === 'fa' ? TRANSPORT_SUB_ALL.fa : TRANSPORT_SUB_ALL.en}
                </button>
                {TRANSPORT_SUBCATEGORIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`jobs-filter-chip ${categoryFilters.transportSubcategory === s.id ? 'is-active' : ''}`}
                    onClick={() => setCategoryFilters((f) => ({ ...f, transportSubcategory: s.id }))}
                  >
                    <span aria-hidden>{s.icon}</span>
                    {lang === 'fa' ? s.fa : s.en}
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className="mobile-sheet-check">
            <input
              type="checkbox"
              checked={!!categoryFilters.proOnly}
              onChange={(e) => setCategoryFilters((f) => ({ ...f, proOnly: e.target.checked }))}
            />
            <span>{t('proOnly')}</span>
          </label>
          <label className="mobile-sheet-check">
            <input
              type="checkbox"
              checked={!!categoryFilters.verifiedOnly}
              onChange={(e) => setCategoryFilters((f) => ({ ...f, verifiedOnly: e.target.checked }))}
            />
            <span>{t('verifiedOnly')}</span>
          </label>
          <button
            type="button"
            className="mobile-sheet-reset"
            onClick={() => {
              if (isJobsCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  jobSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isRealEstateCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  realEstateSubcategory: 'all',
                  ...EMPTY_RE_DETAIL,
                  minPrice: '',
                  maxPrice: '',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isHomeKitchenCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  homeKitchenSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isServicesCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  servicesSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isVehiclesCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  vehiclesSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isPetsCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  petsSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isSportsCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  sportsSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isBeautyCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  beautySubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isHealthCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  healthSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isRepairsCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  repairsSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isEducationCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  educationSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isToolsRentalCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  toolsRentalSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else if (isTransportCategory) {
                setCategoryFilters((f) => ({
                  ...f,
                  transportSubcategory: 'all',
                  proOnly: false,
                  verifiedOnly: false,
                }))
              } else {
                resetAllFilters()
              }
              setFilterOpen(false)
            }}
          >
            {t('clearFilters')}
          </button>
          <button
            type="button"
            className="post-submit-btn !w-full !mx-0 mt-2"
            onClick={() => setFilterOpen(false)}
          >
            {t('applyFilters')}
          </button>
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={regionOpen} title={t('chooseCity')} onClose={() => setRegionOpen(false)}>
        <ul className="mobile-sheet-list">
          {CANADA_CITIES.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`mobile-sheet-option ${normalizeCityId(selectedRegion) === c.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => { setSelectedRegion(c.id); setRegionOpen(false) }}
              >
                {lang === 'fa' ? c.fa : c.en}
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>
    </div>
  )
}
