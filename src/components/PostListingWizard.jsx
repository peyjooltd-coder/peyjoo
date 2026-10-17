import { useState, useEffect, useRef } from 'react'
import { X, Camera, ChevronLeft, MapPin, ImagePlus, Film, Images } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import { allCategories } from '../data/mobileUiData'
import { cityLabel } from '../data/canadaCities'
import GlassCategoryIcon from './GlassCategoryIcon'
import { JOBS_SUBCATEGORIES, jobsSubLabel } from '../data/jobsSubcategories'
import { REAL_ESTATE_SUBCATEGORIES, realEstateSubLabel, getRealEstateL2, realEstatePropertyTypeLabel } from '../data/realEstateSubcategories'
import { HOME_KITCHEN_SUBCATEGORIES, homeKitchenSubLabel } from '../data/homeKitchenSubcategories'
import { VEHICLES_SUBCATEGORIES, vehiclesSubLabel } from '../data/vehiclesSubcategories'
import { PETS_SUBCATEGORIES, petsSubLabel } from '../data/petsSubcategories'
import { SPORTS_SUBCATEGORIES, sportsSubLabel } from '../data/sportsSubcategories'
import { BEAUTY_SUBCATEGORIES, beautySubLabel } from '../data/beautySubcategories'
import { HEALTH_SUBCATEGORIES, healthSubLabel } from '../data/healthSubcategories'
import { EDUCATION_SUBCATEGORIES, educationSubLabel } from '../data/educationSubcategories'
import { TOOLS_RENTAL_SUBCATEGORIES, toolsRentalSubLabel } from '../data/toolsRentalSubcategories'
import { TRANSPORT_SUBCATEGORIES, transportSubLabel } from '../data/transportSubcategories'
import { KOLBARAN_SUBCATEGORIES, kolbaranSubLabel } from '../data/kolbaranSubcategories'
import {
  EMPTY_RE_DETAIL,
  formatRealEstateRentPriceLabel,
  isRealEstateRentSub,
} from '../data/realEstateDetailFields'
import { EMPTY_KOLBARAN_DETAIL, formatKolbaranPriceLabel } from '../data/kolbaranDetailFields'
import { EMPTY_EXCHANGE_DETAIL, formatExchangePriceLabel } from '../data/exchangeDetailFields'
import RealEstateDetailFields from './RealEstateDetailFields'
import KolbaranDetailFields from './KolbaranDetailFields'
import ExchangeDetailFields from './ExchangeDetailFields'
import {
  fileToMediaItem, MAX_MEDIA_ITEMS, MAX_VIDEO_ITEMS, normalizeMedia, mediaCoverUrl,
  extractVideoPoster,
} from '../lib/imageCompress'
import { userAvatar } from '../lib/defaultAvatar'
import { resolvePostCategoryFromBrowse } from '../lib/resolvePostCategory'
import MobileBottomSheet from './mobile/MobileBottomSheet'
import VideoCoverPicker from './VideoCoverPicker'
import MediaUploadProgress from './MediaUploadProgress'
import PriceNegotiableToggle from './PriceNegotiableToggle'

function emptyPostForm(seedCategory = '') {
  return {
    title: '',
    category: seedCategory || '',
    jobSubcategory: '',
    realEstateSubcategory: '',
    realEstatePropertyType: '',
    homeKitchenSubcategory: '',
    vehiclesSubcategory: '',
    petsSubcategory: '',
    sportsSubcategory: '',
    beautySubcategory: '',
    healthSubcategory: '',
    educationSubcategory: '',
    toolsRentalSubcategory: '',
    transportSubcategory: '',
    kolbaranSubcategory: '',
    ...EMPTY_RE_DETAIL,
    ...EMPTY_KOLBARAN_DETAIL,
    ...EMPTY_EXCHANGE_DETAIL,
    price: '',
    priceNegotiable: false,
    description: '',
    media: [],
  }
}

export default function PostListingWizard() {
  const { showPostModal, setShowPostModal, addListing, user, selectedCategory, categoryFilters } = useApp()
  const { t, lang, isRtl } = useI18n()
  const [form, setForm] = useState(() => emptyPostForm())
  const [catSheetOpen, setCatSheetOpen] = useState(false)
  const [jobSubSheetOpen, setJobSubSheetOpen] = useState(false)
  const [reSubSheetOpen, setReSubSheetOpen] = useState(false)
  const [hkSubSheetOpen, setHkSubSheetOpen] = useState(false)
  const [vehSubSheetOpen, setVehSubSheetOpen] = useState(false)
  const [petsSubSheetOpen, setPetsSubSheetOpen] = useState(false)
  const [sportsSubSheetOpen, setSportsSubSheetOpen] = useState(false)
  const [beautySubSheetOpen, setBeautySubSheetOpen] = useState(false)
  const [healthSubSheetOpen, setHealthSubSheetOpen] = useState(false)
  const [educationSubSheetOpen, setEducationSubSheetOpen] = useState(false)
  const [toolsRentalSubSheetOpen, setToolsRentalSubSheetOpen] = useState(false)
  const [transportSubSheetOpen, setTransportSubSheetOpen] = useState(false)
  const [kolbaranSubSheetOpen, setKolbaranSubSheetOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [coverPickerIdx, setCoverPickerIdx] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(null)
  const fileRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!showPostModal) return
    const seeded = resolvePostCategoryFromBrowse(selectedCategory)
    const next = emptyPostForm(seeded)
    if (seeded === 'jobs' && categoryFilters?.jobSubcategory && categoryFilters.jobSubcategory !== 'all') {
      next.jobSubcategory = categoryFilters.jobSubcategory
    }
    if (seeded === 'real-estate') {
      const reSub = categoryFilters?.realEstateSubcategory
      const reType = categoryFilters?.realEstatePropertyType
      if (reSub && reSub !== 'all') next.realEstateSubcategory = reSub
      if (reType && reType !== 'all') next.realEstatePropertyType = reType
    }
    if (seeded === 'kolbaran' && categoryFilters?.kolbaranSubcategory && categoryFilters.kolbaranSubcategory !== 'all') {
      next.kolbaranSubcategory = categoryFilters.kolbaranSubcategory
    }
    setForm(next)
    setCatSheetOpen(false)
    setJobSubSheetOpen(false)
    setReSubSheetOpen(false)
    setHkSubSheetOpen(false)
    setVehSubSheetOpen(false)
    setPetsSubSheetOpen(false)
    setSportsSubSheetOpen(false)
    setBeautySubSheetOpen(false)
    setHealthSubSheetOpen(false)
    setEducationSubSheetOpen(false)
    setToolsRentalSubSheetOpen(false)
    setTransportSubSheetOpen(false)
    setKolbaranSubSheetOpen(false)
    setCoverPickerIdx(null)
    setError(null)
  }, [showPostModal, selectedCategory, categoryFilters])

  if (!showPostModal) return null

  const catName = (id) => (id ? (t(`cats.${id}`) || id) : '')

  const selectedCatLabel = form.category
    ? catName(form.category)
    : t('selectCategory')

  const jobSubLabelText = form.jobSubcategory
    ? jobsSubLabel(form.jobSubcategory, lang)
    : t('postAdJobsSection')

  const reSubLabelText = form.realEstateSubcategory
    ? (
      form.realEstatePropertyType
        ? realEstatePropertyTypeLabel(form.realEstateSubcategory, form.realEstatePropertyType, lang)
        : realEstateSubLabel(form.realEstateSubcategory, lang)
    )
    : t('postAdReSection')

  const hkSubLabelText = form.homeKitchenSubcategory
    ? homeKitchenSubLabel(form.homeKitchenSubcategory, lang)
    : t('postAdHomeKitchenSection')

  const vehSubLabelText = form.vehiclesSubcategory
    ? vehiclesSubLabel(form.vehiclesSubcategory, lang)
    : t('postAdVehiclesSection')

  const petsSubLabelText = form.petsSubcategory
    ? petsSubLabel(form.petsSubcategory, lang)
    : t('postAdPetsSection')

  const sportsSubLabelText = form.sportsSubcategory
    ? sportsSubLabel(form.sportsSubcategory, lang)
    : t('postAdSportsSection')

  const beautySubLabelText = form.beautySubcategory
    ? beautySubLabel(form.beautySubcategory, lang)
    : t('postAdBeautySection')

  const healthSubLabelText = form.healthSubcategory
    ? healthSubLabel(form.healthSubcategory, lang)
    : t('postAdHealthSection')

  const educationSubLabelText = form.educationSubcategory
    ? educationSubLabel(form.educationSubcategory, lang)
    : t('postAdEducationSection')

  const toolsRentalSubLabelText = form.toolsRentalSubcategory
    ? toolsRentalSubLabel(form.toolsRentalSubcategory, lang)
    : t('postAdToolsSection')

  const transportSubLabelText = form.transportSubcategory
    ? transportSubLabel(form.transportSubcategory, lang)
    : t('postAdTransportSection')

  const kolbaranSubLabelText = form.kolbaranSubcategory
    ? kolbaranSubLabel(form.kolbaranSubcategory, lang)
    : t('postAdKolbaranSection')

  const videoCount = form.media.filter((m) => m.type === 'video').length
  const isJobs = form.category === 'jobs'
  const isRealEstate = form.category === 'real-estate'
  const isHomeKitchen = form.category === 'home-appliances'
  const isVehicles = form.category === 'vehicles'
  const isPets = form.category === 'pets'
  const isSports = form.category === 'sports'
  const isBeauty = form.category === 'beauty'
  const isHealth = form.category === 'health'
  const isEducation = form.category === 'education'
  const isToolsRental = form.category === 'tools-rental'
  const isTransport = form.category === 'transport'
  const isKolbaran = form.category === 'kolbaran'
  const isExchange = form.category === 'exchange'

  const onPickMedia = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length || uploadProgress) return
    const queue = files.slice(0, Math.max(0, MAX_MEDIA_ITEMS - form.media.length))
    if (!queue.length) return
    try {
      const next = [...form.media]
      for (let i = 0; i < queue.length; i += 1) {
        const file = queue[i]
        const kind = file.type?.startsWith('video/') ? 'video' : 'image'
        setUploadProgress({ percent: 0, current: i + 1, total: queue.length, kind })
        // eslint-disable-next-line no-await-in-loop
        const item = await fileToMediaItem(file, {
          onProgress: (percent) => {
            setUploadProgress((prev) => (prev ? { ...prev, percent } : prev))
          },
        })
        if (item.type === 'video' && next.filter((m) => m.type === 'video').length >= MAX_VIDEO_ITEMS) {
          continue
        }
        if (item.type === 'video' && !item.poster) {
          try {
            // eslint-disable-next-line no-await-in-loop
            item.poster = await extractVideoPoster(item.url)
          } catch {
            /* cover can be set later / on submit */
          }
        }
        next.push(item)
        setForm((f) => ({ ...f, media: next.slice(0, MAX_MEDIA_ITEMS) }))
      }
      setError(null)
    } catch (err) {
      setError(err.message || (lang === 'fa' ? 'آپلود رسانه ممکن نشد' : 'Could not upload media'))
    } finally {
      setUploadProgress(null)
    }
  }

  const removeMedia = (idx) => {
    setForm((f) => ({ ...f, media: f.media.filter((_, i) => i !== idx) }))
    setCoverPickerIdx((cur) => {
      if (cur == null) return null
      if (cur === idx) return null
      return cur > idx ? cur - 1 : cur
    })
  }

  const openCoverPicker = (idx) => {
    const target = typeof idx === 'number'
      ? idx
      : form.media.findIndex((m) => m.type === 'video')
    if (target < 0 || !form.media[target] || form.media[target].type !== 'video') {
      setError(t('postAdNeedVideoFirst'))
      return
    }
    setCoverPickerIdx(target)
    setError(null)
  }

  const applyVideoCover = (poster) => {
    if (coverPickerIdx == null) return
    setForm((f) => ({
      ...f,
      media: f.media.map((m, i) => (i === coverPickerIdx ? { ...m, poster } : m)),
    }))
    setCoverPickerIdx(null)
    setError(null)
  }

  const cancelVideoCover = () => {
    const idx = coverPickerIdx
    const video = idx != null ? form.media[idx] : null
    setCoverPickerIdx(null)
    if (!video || video.type !== 'video' || video.poster || !video.url) return
    extractVideoPoster(video.url)
      .then((poster) => {
        setForm((f) => ({
          ...f,
          media: f.media.map((m, i) => (
            i === idx && m.type === 'video' && !m.poster ? { ...m, poster } : m
          )),
        }))
      })
      .catch(() => {})
  }

  const ensureVideoPosters = async (list) => {
    const out = [...list]
    for (let i = 0; i < out.length; i += 1) {
      const m = out[i]
      if (m.type !== 'video' || m.poster || !m.url) continue
      try {
        // eslint-disable-next-line no-await-in-loop
        const poster = await extractVideoPoster(m.url)
        out[i] = { ...m, poster }
      } catch {
        /* keep without poster */
      }
    }
    return out
  }

  const submit = async () => {
    if (!form.category) {
      setCatSheetOpen(true)
      return
    }
    if (isJobs && !form.jobSubcategory) {
      setJobSubSheetOpen(true)
      setError(t('postAdNeedJobsSub'))
      return
    }
    if (isRealEstate && !form.realEstateSubcategory) {
      setReSubSheetOpen(true)
      setError(t('postAdNeedReSub'))
      return
    }
    if (isHomeKitchen && !form.homeKitchenSubcategory) {
      setHkSubSheetOpen(true)
      setError(t('postAdNeedHkSub'))
      return
    }
    if (isVehicles && !form.vehiclesSubcategory) {
      setVehSubSheetOpen(true)
      setError(t('postAdNeedVehiclesSub'))
      return
    }
    if (isPets && !form.petsSubcategory) {
      setPetsSubSheetOpen(true)
      setError(t('postAdNeedPetsSub'))
      return
    }
    if (isSports && !form.sportsSubcategory) {
      setSportsSubSheetOpen(true)
      setError(t('postAdNeedSportsSub'))
      return
    }
    if (isBeauty && !form.beautySubcategory) {
      setBeautySubSheetOpen(true)
      setError(t('postAdNeedBeautySub'))
      return
    }
    if (isHealth && !form.healthSubcategory) {
      setHealthSubSheetOpen(true)
      setError(t('postAdNeedHealthSub'))
      return
    }
    if (isEducation && !form.educationSubcategory) {
      setEducationSubSheetOpen(true)
      setError(t('postAdNeedEducationSub'))
      return
    }
    if (isToolsRental && !form.toolsRentalSubcategory) {
      setToolsRentalSubSheetOpen(true)
      setError(t('postAdNeedToolsSub'))
      return
    }
    if (isTransport && !form.transportSubcategory) {
      setTransportSubSheetOpen(true)
      setError(t('postAdNeedTransportSub'))
      return
    }
    if (isKolbaran && !form.kolbaranSubcategory) {
      setKolbaranSubSheetOpen(true)
      setError(t('postAdNeedKolbaranSub'))
      return
    }
    if (!form.title.trim() || form.title.trim().length < 3) {
      setError(t('postAdNeedTitle'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const withPosters = await ensureVideoPosters(form.media)
      if (withPosters !== form.media) {
        setForm((f) => ({ ...f, media: withPosters }))
      }
      const media = normalizeMedia(withPosters)
      const cover = mediaCoverUrl(media)
      const attributes = {}
      if (isJobs && form.jobSubcategory) {
        attributes.jobSubcategory = form.jobSubcategory
      }
      if (isRealEstate && form.realEstateSubcategory) {
        attributes.realEstateSubcategory = form.realEstateSubcategory
        if (form.realEstatePropertyType) attributes.realEstatePropertyType = form.realEstatePropertyType
        if (form.rooms) attributes.rooms = form.rooms
        if (form.area) attributes.area = Number(form.area)
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
      if (isHomeKitchen && form.homeKitchenSubcategory) {
        attributes.homeKitchenSubcategory = form.homeKitchenSubcategory
      }
      if (isVehicles && form.vehiclesSubcategory) {
        attributes.vehiclesSubcategory = form.vehiclesSubcategory
      }
      if (isPets && form.petsSubcategory) {
        attributes.petsSubcategory = form.petsSubcategory
      }
      if (isSports && form.sportsSubcategory) {
        attributes.sportsSubcategory = form.sportsSubcategory
      }
      if (isBeauty && form.beautySubcategory) {
        attributes.beautySubcategory = form.beautySubcategory
      }
      if (isHealth && form.healthSubcategory) {
        attributes.healthSubcategory = form.healthSubcategory
      }
      if (isEducation && form.educationSubcategory) {
        attributes.educationSubcategory = form.educationSubcategory
      }
      if (isToolsRental && form.toolsRentalSubcategory) {
        attributes.toolsRentalSubcategory = form.toolsRentalSubcategory
      }
      if (isTransport && form.transportSubcategory) {
        attributes.transportSubcategory = form.transportSubcategory
      }
      if (isKolbaran && form.kolbaranSubcategory) {
        attributes.kolbaranSubcategory = form.kolbaranSubcategory
        if (form.kolbaranDay) attributes.kolbaranDay = form.kolbaranDay
        if (form.kolbaranCargoName) attributes.kolbaranCargoName = form.kolbaranCargoName.trim()
        if (form.kolbaranCargoType) attributes.kolbaranCargoType = form.kolbaranCargoType
        if (form.kolbaranWeight !== '' && form.kolbaranWeight != null) {
          attributes.kolbaranWeight = Number(form.kolbaranWeight)
        }
        if (form.kolbaranWeightMin !== '' && form.kolbaranWeightMin != null) {
          attributes.kolbaranWeightMin = Number(form.kolbaranWeightMin)
        }
        if (form.kolbaranWeightMax !== '' && form.kolbaranWeightMax != null) {
          attributes.kolbaranWeightMax = Number(form.kolbaranWeightMax)
        }
        if (form.kolbaranOrigin) attributes.kolbaranOrigin = form.kolbaranOrigin.trim()
        if (form.kolbaranDestination) attributes.kolbaranDestination = form.kolbaranDestination.trim()
        if (form.kolbaranDate) attributes.kolbaranDate = form.kolbaranDate
        if (form.kolbaranPriceMin !== '' && form.kolbaranPriceMin != null) {
          attributes.kolbaranPriceMin = Number(form.kolbaranPriceMin)
        }
        if (form.kolbaranPriceMax !== '' && form.kolbaranPriceMax != null) {
          attributes.kolbaranPriceMax = Number(form.kolbaranPriceMax)
        }
        if (form.kolbaranNegotiable) attributes.kolbaranNegotiable = true
      }
      if (isExchange) {
        if (form.exchangeCurrency) attributes.exchangeCurrency = form.exchangeCurrency
        if (form.exchangeBuyPrice !== '' && form.exchangeBuyPrice != null) {
          attributes.exchangeBuyPrice = Number(form.exchangeBuyPrice)
        }
        if (form.exchangeSellPrice !== '' && form.exchangeSellPrice != null) {
          attributes.exchangeSellPrice = Number(form.exchangeSellPrice)
        }
        if (form.exchangeTodayPrice !== '' && form.exchangeTodayPrice != null) {
          attributes.exchangeTodayPrice = Number(form.exchangeTodayPrice)
        }
      }
      if (form.priceNegotiable) {
        attributes.priceNegotiable = true
        if (isKolbaran) attributes.kolbaranNegotiable = true
      }
      const isReRent = isRealEstate && isRealEstateRentSub(form.realEstateSubcategory)
      const listingPrice = form.priceNegotiable
        ? 0
        : isKolbaran
          ? (Number(form.kolbaranPriceMin) || Number(form.kolbaranPriceMax) || 0)
          : isExchange
            ? (Number(form.exchangeSellPrice) || Number(form.exchangeTodayPrice) || Number(form.exchangeBuyPrice) || 0)
            : isReRent
              ? (Number(form.monthlyRent) || Number(form.deposit) || 0)
              : (Number(form.price) || 0)
      const listingPriceLabel = form.priceNegotiable
        ? (lang === 'fa' ? 'توافقی' : 'Negotiable')
        : isKolbaran
          ? formatKolbaranPriceLabel(attributes, lang)
          : isExchange
            ? formatExchangePriceLabel(attributes, lang)
            : isReRent
              ? formatRealEstateRentPriceLabel({
                deposit: form.deposit,
                monthlyRent: form.monthlyRent,
              }, lang)
              : (form.price ? `$${Number(form.price).toLocaleString()}` : (lang === 'fa' ? 'توافقی' : 'Negotiable'))
      await addListing({
        title: form.title.trim(),
        category: form.category,
        city: user?.city || 'ونکوور',
        neighborhood: cityLabel(user?.city || 'ونکوور', 'en'),
        price: listingPrice,
        priceLabel: listingPriceLabel,
        image: cover || undefined,
        images: media,
        media,
        description: form.description,
        seller: user?.name || (lang === 'fa' ? 'شما' : 'You'),
        sellerAvatar: userAvatar(user?.avatar),
        condition: 'Like New',
        attributes,
      })
      setShowPostModal(false)
    } catch (err) {
      setError(err?.message || t('postAdFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="post-modal-overlay">
        <p className="post-modal-step-label">{t('postAd')}</p>
        <div className="post-modal-card">
          <header className="post-modal-header">
            <h2>{t('postAd')}</h2>
            <button type="button" onClick={() => setShowPostModal(false)} className="post-modal-close" aria-label={t('postAdClose')}>
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="post-photos-row">
            {form.media.map((item, i) => (
              <div key={`media-${i}`} className="post-photo-slot has-image">
                {item.type === 'video' ? (
                  item.poster ? (
                    <img src={item.poster} alt="" />
                  ) : (
                    <video src={item.url} muted playsInline preload="metadata" />
                  )
                ) : (
                  <img src={item.url} alt="" />
                )}
                {item.type === 'video' && <span className="post-media-badge"><Film className="w-3 h-3" /></span>}
                {item.type === 'video' && (
                  <button
                    type="button"
                    className="post-photo-cover-btn"
                    onClick={() => openCoverPicker(i)}
                  >
                    {t('postAdChangeCover')}
                  </button>
                )}
                <button type="button" className="post-photo-remove" onClick={() => removeMedia(i)} aria-label={t('postAdRemove')}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {form.media.length < MAX_MEDIA_ITEMS && !uploadProgress && (
              <>
                <button
                  type="button"
                  className="post-photo-slot is-add"
                  onClick={() => fileRef.current?.click()}
                  title={t('postAdAddPhoto')}
                >
                  <Camera className="w-6 h-6 text-divar-text" />
                </button>
                <button
                  type="button"
                  className="post-photo-slot is-add is-video"
                  onClick={() => videoRef.current?.click()}
                  title={t('postAdAddVideo')}
                >
                  <Film className="w-6 h-6 text-divar-text" />
                </button>
              </>
            )}
            {uploadProgress && (
              <div className="post-photo-slot is-uploading" aria-hidden>
                <span className="post-upload-slot-pct" dir="ltr">{uploadProgress.percent}%</span>
              </div>
            )}
          </div>
          <MediaUploadProgress progress={uploadProgress} />
          <div className="post-media-actions">
            <button
              type="button"
              className="post-media-action-btn"
              onClick={() => fileRef.current?.click()}
              disabled={!!uploadProgress}
            >
              <ImagePlus className="w-4 h-4" /> {t('postAdPhoto')}
            </button>
            <button
              type="button"
              className="post-media-action-btn"
              onClick={() => videoRef.current?.click()}
              disabled={!!uploadProgress}
            >
              <Film className="w-4 h-4" /> {t('postAdVideo')}
            </button>
            <button
              type="button"
              className="post-media-action-btn"
              onClick={() => openCoverPicker()}
              disabled={!videoCount || !!uploadProgress}
            >
              <Images className="w-4 h-4" /> {t('postAdCover')}
            </button>
          </div>
          <p className="post-photos-hint">
            {t('postAdMediaHint').replace('{n}', String(form.media.length)).replace('{max}', String(MAX_MEDIA_ITEMS))}
            {videoCount ? t('postAdVideoCount').replace('{n}', String(videoCount)) : ''}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={onPickMedia}
          />
          <input
            ref={videoRef}
            type="file"
            accept="video/*,.mp4,.mov,.webm,.m4v"
            multiple
            hidden
            onChange={onPickMedia}
          />

          <div className="post-form-fields">
            <button type="button" className="post-field-row" onClick={() => setCatSheetOpen(true)}>
              <ChevronLeft className="w-4 h-4 text-divar-muted" />
              <span className={form.category ? 'post-field-value' : 'post-field-placeholder'}>
                {selectedCatLabel}
              </span>
              <span className="post-field-label">{t('chooseCategory')}</span>
            </button>

            {isJobs && (
              <button type="button" className="post-field-row" onClick={() => setJobSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.jobSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {jobSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdJobsSection')}</span>
              </button>
            )}

            {isRealEstate && (
              <button type="button" className="post-field-row" onClick={() => setReSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.realEstateSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {reSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdReSection')}</span>
              </button>
            )}

            {isRealEstate && form.realEstateSubcategory && (
              <RealEstateDetailFields
                mode="post"
                values={form}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
              />
            )}

            {isHomeKitchen && (
              <button type="button" className="post-field-row" onClick={() => setHkSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.homeKitchenSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {hkSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdHomeKitchenSection')}</span>
              </button>
            )}

            {isVehicles && (
              <button type="button" className="post-field-row" onClick={() => setVehSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.vehiclesSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {vehSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdVehiclesSection')}</span>
              </button>
            )}

            {isPets && (
              <button type="button" className="post-field-row" onClick={() => setPetsSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.petsSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {petsSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdPetsSection')}</span>
              </button>
            )}

            {isSports && (
              <button type="button" className="post-field-row" onClick={() => setSportsSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.sportsSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {sportsSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdSportsSection')}</span>
              </button>
            )}

            {isBeauty && (
              <button type="button" className="post-field-row" onClick={() => setBeautySubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.beautySubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {beautySubLabelText}
                </span>
                <span className="post-field-label">{t('postAdBeautySection')}</span>
              </button>
            )}

            {isHealth && (
              <button type="button" className="post-field-row" onClick={() => setHealthSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.healthSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {healthSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdHealthSection')}</span>
              </button>
            )}

            {isEducation && (
              <button type="button" className="post-field-row" onClick={() => setEducationSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.educationSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {educationSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdEducationSection')}</span>
              </button>
            )}

            {isToolsRental && (
              <button type="button" className="post-field-row" onClick={() => setToolsRentalSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.toolsRentalSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {toolsRentalSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdToolsSection')}</span>
              </button>
            )}

            {isTransport && (
              <button type="button" className="post-field-row" onClick={() => setTransportSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.transportSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {transportSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdTransportSection')}</span>
              </button>
            )}

            {isKolbaran && (
              <button type="button" className="post-field-row" onClick={() => setKolbaranSubSheetOpen(true)}>
                <ChevronLeft className="w-4 h-4 text-divar-muted" />
                <span className={form.kolbaranSubcategory ? 'post-field-value' : 'post-field-placeholder'}>
                  {kolbaranSubLabelText}
                </span>
                <span className="post-field-label">{t('postAdKolbaranSection')}</span>
              </button>
            )}

            {isKolbaran && form.kolbaranSubcategory && (
              <KolbaranDetailFields
                subcategory={form.kolbaranSubcategory}
                values={form}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
              />
            )}

            {isExchange && (
              <ExchangeDetailFields
                values={form}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
              />
            )}

            {isExchange && (
              <p className="post-photos-hint" style={{ margin: '0 0 4px' }}>{t('exchangePendingHint')}</p>
            )}

            <input
              type="text"
              className="post-input"
              placeholder={t('postAdTitlePlaceholder')}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              dir={isRtl ? 'rtl' : 'ltr'}
            />

            {!isKolbaran && !isExchange && !(isRealEstate && isRealEstateRentSub(form.realEstateSubcategory)) && (
              <div className="post-field-row post-field-static">
                <input
                  type="number"
                  className="post-input-inline"
                  placeholder={t('postAdPricePlaceholder')}
                  value={form.priceNegotiable ? '' : form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value, priceNegotiable: false }))}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  disabled={!!form.priceNegotiable}
                />
                <span className="post-field-label">
                  {isRealEstate ? (lang === 'fa' ? 'قیمت فروش ($)' : 'Sale price ($)') : t('postAdPriceLabel')}
                </span>
              </div>
            )}

            <PriceNegotiableToggle
              checked={!!form.priceNegotiable}
              onChange={(on) => setForm((f) => ({
                ...f,
                priceNegotiable: on,
                ...(on ? {
                  price: '',
                  deposit: '',
                  monthlyRent: '',
                  kolbaranPriceMin: '',
                  kolbaranPriceMax: '',
                  kolbaranNegotiable: true,
                  exchangeBuyPrice: '',
                  exchangeSellPrice: '',
                  exchangeTodayPrice: '',
                } : { kolbaranNegotiable: false }),
              }))}
            />

            <div className="post-field-row post-field-static">
              <span className="post-field-value">{cityLabel(user?.city || 'ونکوور', lang)}</span>
              <MapPin className="w-4 h-4 text-divar-text" />
            </div>

            <textarea
              className="post-textarea"
              placeholder={t('postAdDescPlaceholder')}
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              dir={isRtl ? 'rtl' : 'ltr'}
            />
          </div>

          {error && <p className="post-form-error">{error}</p>}

          <button type="button" className="post-submit-btn" onClick={submit} disabled={saving}>
            {saving ? t('pleaseWait') : t('postAdSubmit')}
          </button>
        </div>
      </div>

      <MobileBottomSheet open={catSheetOpen} title={t('chooseCategory')} onClose={() => setCatSheetOpen(false)}>
        <ul className="mobile-sheet-list">
          {allCategories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`mobile-sheet-option jobs-sub-option ${form.category === c.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({
                    ...f,
                    category: c.id,
                    jobSubcategory: c.id === 'jobs' ? f.jobSubcategory : '',
                    realEstateSubcategory: c.id === 'real-estate' ? f.realEstateSubcategory : '',
                    homeKitchenSubcategory: (c.id === 'home-appliances' || c.id === 'buy-sell') ? f.homeKitchenSubcategory : '',
                    vehiclesSubcategory: c.id === 'vehicles' ? f.vehiclesSubcategory : '',
                    petsSubcategory: c.id === 'pets' ? f.petsSubcategory : '',
                    sportsSubcategory: c.id === 'sports' ? f.sportsSubcategory : '',
                    beautySubcategory: c.id === 'beauty' ? f.beautySubcategory : '',
                    healthSubcategory: c.id === 'health' ? f.healthSubcategory : '',
                    educationSubcategory: c.id === 'education' ? f.educationSubcategory : '',
                    toolsRentalSubcategory: (c.id === 'tools-rental' || c.id === 'buy-sell') ? f.toolsRentalSubcategory : '',
                    transportSubcategory: c.id === 'transport' ? f.transportSubcategory : '',
                    kolbaranSubcategory: c.id === 'kolbaran' ? f.kolbaranSubcategory : '',
                    ...(c.id === 'real-estate' ? {} : EMPTY_RE_DETAIL),
                    ...(c.id === 'kolbaran' ? {} : EMPTY_KOLBARAN_DETAIL),
                    ...(c.id === 'exchange' ? {} : EMPTY_EXCHANGE_DETAIL),
                  }))
                  setCatSheetOpen(false)
                  if (c.id === 'jobs') setJobSubSheetOpen(true)
                  if (c.id === 'real-estate') setReSubSheetOpen(true)
                  if (c.id === 'home-appliances') setHkSubSheetOpen(true)
                  if (c.id === 'vehicles') setVehSubSheetOpen(true)
                  if (c.id === 'pets') setPetsSubSheetOpen(true)
                  if (c.id === 'sports') setSportsSubSheetOpen(true)
                  if (c.id === 'beauty') setBeautySubSheetOpen(true)
                  if (c.id === 'health') setHealthSubSheetOpen(true)
                  if (c.id === 'education') setEducationSubSheetOpen(true)
                  if (c.id === 'tools-rental') setToolsRentalSubSheetOpen(true)
                  if (c.id === 'transport') setTransportSubSheetOpen(true)
                  if (c.id === 'kolbaran') setKolbaranSubSheetOpen(true)
                }}
              >
                <span className="jobs-sub-option-text">{catName(c.id) || c.name}</span>
                <span className="jobs-sub-option-icon post-cat-pick-icon" aria-hidden>
                  <GlassCategoryIcon id={c.id} size="sm" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={jobSubSheetOpen}
        title={t('postAdJobsSheetTitle')}
        onClose={() => setJobSubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdJobsSheetHint')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {JOBS_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option jobs-sub-option ${form.jobSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({ ...f, jobSubcategory: s.id }))
                  setJobSubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={reSubSheetOpen}
        title={form.realEstateSubcategory && getRealEstateL2(form.realEstateSubcategory).length
          ? realEstateSubLabel(form.realEstateSubcategory, lang)
          : t('cats.real-estate')}
        onClose={() => {
          setReSubSheetOpen(false)
          if (!form.realEstatePropertyType) {
            setForm((f) => ({ ...f, realEstateSubcategory: f.realEstatePropertyType ? f.realEstateSubcategory : f.realEstateSubcategory }))
          }
        }}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdReSheetHint')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {!form.realEstateSubcategory || !getRealEstateL2(form.realEstateSubcategory).length ? (
            REAL_ESTATE_SUBCATEGORIES.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`mobile-sheet-option jobs-sub-option ${form.realEstateSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                  onClick={() => {
                    const kids = getRealEstateL2(s.id)
                    if (kids.length) {
                      setForm((f) => ({ ...f, realEstateSubcategory: s.id, realEstatePropertyType: '' }))
                    } else {
                      setForm((f) => ({ ...f, realEstateSubcategory: s.id, realEstatePropertyType: 'all' }))
                      setReSubSheetOpen(false)
                      setError(null)
                    }
                  }}
                >
                  <span>{lang === 'fa' ? s.fa : s.en}</span>
                </button>
              </li>
            ))
          ) : (
            <>
              {getRealEstateL2(form.realEstateSubcategory).map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`mobile-sheet-option jobs-sub-option ${form.realEstatePropertyType === s.id ? 'mobile-sheet-option-active' : ''}`}
                    onClick={() => {
                      setForm((f) => ({ ...f, realEstatePropertyType: s.id }))
                      setReSubSheetOpen(false)
                      setError(null)
                    }}
                  >
                    <span>{lang === 'fa' ? s.fa : s.en}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="mobile-sheet-option jobs-sub-option"
                  onClick={() => {
                    setForm((f) => ({ ...f, realEstatePropertyType: 'all' }))
                    setReSubSheetOpen(false)
                    setError(null)
                  }}
                >
                  <span className="jobs-sub-option-text">
                    {realEstatePropertyTypeLabel(form.realEstateSubcategory, 'all', lang)}
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="mobile-sheet-option jobs-sub-option"
                  onClick={() => setForm((f) => ({ ...f, realEstateSubcategory: '', realEstatePropertyType: '' }))}
                >
                  <span className="jobs-sub-option-text">{lang === 'fa' ? 'بازگشت' : 'Back'}</span>
                </button>
              </li>
            </>
          )}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={hkSubSheetOpen}
        title={t('cats.home-appliances')}
        onClose={() => setHkSubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdSubSheetHint')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {HOME_KITCHEN_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option jobs-sub-option ${form.homeKitchenSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({ ...f, homeKitchenSubcategory: s.id }))
                  setHkSubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={vehSubSheetOpen}
        title={t('cats.vehicles')}
        onClose={() => setVehSubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdSubSheetHint')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {VEHICLES_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option ${form.vehiclesSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({ ...f, vehiclesSubcategory: s.id }))
                  setVehSubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={petsSubSheetOpen}
        title={t('cats.pets')}
        onClose={() => setPetsSubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdSubSheetHint')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {PETS_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option jobs-sub-option ${form.petsSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({ ...f, petsSubcategory: s.id }))
                  setPetsSubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={sportsSubSheetOpen}
        title={t('cats.sports')}
        onClose={() => setSportsSubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdSubSheetHint')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {SPORTS_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option jobs-sub-option ${form.sportsSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({ ...f, sportsSubcategory: s.id }))
                  setSportsSubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={beautySubSheetOpen}
        title={t('cats.beauty')}
        onClose={() => setBeautySubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdNeedBeautySub')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {BEAUTY_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option jobs-sub-option ${form.beautySubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({ ...f, beautySubcategory: s.id }))
                  setBeautySubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={healthSubSheetOpen}
        title={t('cats.health')}
        onClose={() => setHealthSubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdNeedHealthSub')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {HEALTH_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option jobs-sub-option ${form.healthSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({ ...f, healthSubcategory: s.id }))
                  setHealthSubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={educationSubSheetOpen}
        title={t('cats.education')}
        onClose={() => setEducationSubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdNeedEducationSub')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {EDUCATION_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option jobs-sub-option ${form.educationSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({ ...f, educationSubcategory: s.id }))
                  setEducationSubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={toolsRentalSubSheetOpen}
        title={t('cats.tools-rental')}
        onClose={() => setToolsRentalSubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdNeedToolsSub')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {TOOLS_RENTAL_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option jobs-sub-option ${form.toolsRentalSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({ ...f, toolsRentalSubcategory: s.id }))
                  setToolsRentalSubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={transportSubSheetOpen}
        title={t('cats.transport')}
        onClose={() => setTransportSubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdSubSheetHint')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {TRANSPORT_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option ${form.transportSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({ ...f, transportSubcategory: s.id }))
                  setTransportSubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={kolbaranSubSheetOpen}
        title={t('cats.kolbaran')}
        onClose={() => setKolbaranSubSheetOpen(false)}
      >
        <p className="jobs-sub-sheet-hint">{t('postAdNeedKolbaranSub')}</p>
        <ul className="mobile-sheet-list jobs-sub-sheet-list">
          {KOLBARAN_SUBCATEGORIES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`mobile-sheet-option jobs-sub-option ${form.kolbaranSubcategory === s.id ? 'mobile-sheet-option-active' : ''}`}
                onClick={() => {
                  setForm((f) => ({
                    ...f,
                    kolbaranSubcategory: s.id,
                    ...EMPTY_KOLBARAN_DETAIL,
                  }))
                  setKolbaranSubSheetOpen(false)
                  setError(null)
                }}
              >
                <span>{lang === 'fa' ? s.fa : s.en}</span>
              </button>
            </li>
          ))}
        </ul>
      </MobileBottomSheet>

      <VideoCoverPicker
        open={coverPickerIdx != null && !!form.media[coverPickerIdx]?.url}
        videoUrl={coverPickerIdx != null ? form.media[coverPickerIdx]?.url : ''}
        initialPoster={coverPickerIdx != null ? (form.media[coverPickerIdx]?.poster || '') : ''}
        onConfirm={applyVideoCover}
        onCancel={cancelVideoCover}
      />
    </>
  )
}
