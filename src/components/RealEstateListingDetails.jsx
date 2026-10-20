import { useMemo, useState, useEffect, useRef } from 'react'
import {
  AlertTriangle, Building2, Car, ChevronDown, ChevronUp, FileSearch, Warehouse,
} from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import {
  optionLabel,
  RE_ADVERTISER_OPTIONS,
  RE_BATHROOM_OPTIONS,
  RE_COOLING_OPTIONS,
  RE_DIRECTION_OPTIONS,
  RE_FLOORING_OPTIONS,
  RE_HEATING_OPTIONS,
  RE_ROOM_OPTIONS,
} from '../data/realEstateDetailFields'
import {
  realEstatePropertyTypeLabel,
  realEstateSubLabel,
} from '../data/realEstateSubcategories'
import { cityLabel } from '../data/canadaCities'
import { listingPriceLabel } from '../lib/localizeListing'

function inferDefaults(listing) {
  const text = `${listing.title || ''} ${listing.titleEn || ''} ${listing.titleFa || ''} ${listing.description || ''} ${listing.descriptionEn || ''} ${listing.descriptionFa || ''}`.toLowerCase()
  const attrs = listing.attributes || {}
  const roomsFromTitle = text.match(/(\d+)\s*خواب|(\d+)\s*bed|studio|سوئیت/)
  let rooms = attrs.rooms
  if (!rooms) {
    if (/studio|سوئیت|اتاق مستر|room/.test(text) && !/\d\s*خواب/.test(text)) rooms = '0'
    else if (roomsFromTitle) rooms = String(roomsFromTitle[1] || roomsFromTitle[2] || '1')
    else rooms = '1'
  }
  const area = attrs.area || (text.match(/(\d+)\s*متر/)?.[1]) || ''
  const isRent = /اجاره|rent|ماهانه|monthly/i.test(text)
    || String(attrs.realEstateSubcategory || '').includes('rent')
    || (listing.price > 0 && listing.price < 15000)

  return {
    ...attrs,
    rooms,
    area: area || attrs.area || 65,
    buildingAge: attrs.buildingAge ?? 5,
    buildingYear: attrs.buildingYear,
    floor: attrs.floor ?? 2,
    totalFloors: attrs.totalFloors ?? 5,
    elevator: attrs.elevator ?? /آسانسور|elevator/i.test(text),
    elevatorCount: attrs.elevatorCount || '',
    parking: attrs.parking ?? /پارکینگ|parking/i.test(text),
    parkingCount: attrs.parkingCount || '',
    storage: attrs.storage ?? /انبار|storage/i.test(text),
    storageCount: attrs.storageCount || '',
    balcony: attrs.balcony ?? /بالکن|balcony/i.test(text),
    // Only show amounts the advertiser entered — never auto-calc deposit
    deposit: attrs.deposit != null && attrs.deposit !== '' ? attrs.deposit : undefined,
    monthlyRent: attrs.monthlyRent != null && attrs.monthlyRent !== ''
      ? attrs.monthlyRent
      : (isRent && listing.price ? listing.price : undefined),
    photosAuthentic: attrs.photosAuthentic !== false,
    isRent,
    realEstateSubcategory: attrs.realEstateSubcategory
      || (isRent ? 'rent-residential' : 'sale-residential'),
    realEstatePropertyType: attrs.realEstatePropertyType || 'apartment',
  }
}

function formatMoney(n, lang) {
  if (n == null || n === '') return '—'
  const num = Number(n)
  if (!Number.isFinite(num)) return String(n)
  const formatted = Math.round(num).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-CA')
  return lang === 'fa' ? `${formatted} $` : `$${formatted}`
}

function Amenity({ on, label, Icon }) {
  return (
    <div className={`re-amenity ${on ? 'is-on' : 'is-off'}`}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </div>
  )
}

/** Frozen map — all pan/zoom/touch off so scrolling the ad never moves it. */
function ListingMap({ lat, lng, title }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  const la = Number(lat)
  const ln = Number(lng)
  const valid = Number.isFinite(la) && Number.isFinite(ln)

  useEffect(() => {
    if (!valid || !containerRef.current || mapRef.current) return undefined

    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, {
        center: [la, ln],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
        bounceAtZoomLimits: false,
        preferCanvas: true,
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false,
      })

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map)

      L.circleMarker([la, ln], {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#d4522a',
        fillOpacity: 1,
        interactive: false,
      }).addTo(map)

      mapRef.current = map
      requestAnimationFrame(() => map.invalidateSize({ animate: false }))
    })()

    return () => {
      cancelled = true
      if (mapRef.current) {
        try { mapRef.current.remove() } catch { /* ignore */ }
        mapRef.current = null
      }
    }
  }, [valid, la, ln])

  if (!valid) return null

  return (
    <div className="re-map re-map-static" aria-label={title || 'map'}>
      <div ref={containerRef} className="re-map-leaflet" />
    </div>
  )
}

export default function RealEstateListingDetails({ listing, onOpenSafety }) {
  const { t, lang } = useI18n()
  const isFa = lang === 'fa'
  const [moreOpen, setMoreOpen] = useState(false)
  const [expertiseOpen, setExpertiseOpen] = useState(false)
  const [metaOpen, setMetaOpen] = useState(false)
  const a = useMemo(() => inferDefaults(listing), [listing])

  const roomsLabel = optionLabel(RE_ROOM_OPTIONS, String(a.rooms), lang)
    || String(a.rooms)
  const yearLabel = a.buildingYear
    || (a.buildingAge != null && a.buildingAge !== ''
      ? (isFa ? `${a.buildingAge} سال` : `${a.buildingAge} yr`)
      : '—')
  const floorLabel = a.totalFloors
    ? (isFa ? `${a.floor} از ${a.totalFloors}` : `${a.floor} of ${a.totalFloors}`)
    : String(a.floor ?? '—')

  const breadcrumb = [
    t('cats.real-estate'),
    realEstateSubLabel(a.realEstateSubcategory, lang),
    a.realEstatePropertyType && a.realEstatePropertyType !== 'all'
      ? realEstatePropertyTypeLabel(a.realEstateSubcategory, a.realEstatePropertyType, lang)
      : null,
  ].filter(Boolean)

  const published = a.publishedAt || listing.createdAt || listing.time
  const updated = a.updatedAt || listing.updatedAt || published

  const extraRows = [
    a.buildingDirection && {
      label: t('reDirection'),
      value: optionLabel(RE_DIRECTION_OPTIONS, a.buildingDirection, lang),
    },
    a.cooling && {
      label: t('reCooling'),
      value: optionLabel(RE_COOLING_OPTIONS, a.cooling, lang),
    },
    a.heating && {
      label: t('reHeating'),
      value: optionLabel(RE_HEATING_OPTIONS, a.heating, lang),
    },
    a.flooring && {
      label: t('reFlooring'),
      value: optionLabel(RE_FLOORING_OPTIONS, a.flooring, lang),
    },
    a.bathroom && {
      label: t('reBathroom'),
      value: optionLabel(RE_BATHROOM_OPTIONS, a.bathroom, lang),
    },
    a.advertiserType && {
      label: t('reAdvertiser'),
      value: optionLabel(RE_ADVERTISER_OPTIONS, a.advertiserType, lang),
    },
    a.balcony != null && {
      label: t('reBalcony'),
      value: a.balcony ? t('reHas') : t('reHasNot'),
    },
  ].filter(Boolean)

  return (
    <div className="re-listing-details">
      <nav className="re-breadcrumb" aria-label="breadcrumb">
        {breadcrumb.map((part, i) => (
          <span key={`${part}-${i}`}>
            {i > 0 && <span className="re-breadcrumb-sep">›</span>}
            {part}
          </span>
        ))}
      </nav>

      <button
        type="button"
        className="re-meta-toggle"
        onClick={() => setMetaOpen((v) => !v)}
      >
        <span>
          {listing.time}
          {(listing.neighborhood || listing.city) && (
            <>
              {' '}
              {t('reIn')}
              {' '}
              {[listing.city, listing.neighborhood].filter(Boolean).map((p) => cityLabel(p, lang)).join(isFa ? '، ' : ', ')}
            </>
          )}
        </span>
        {metaOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {metaOpen && (
        <div className="re-meta-dates">
          <div>
            <span>{t('rePublished')}</span>
            <strong>{published}</strong>
          </div>
          <div>
            <span>{t('reUpdated')}</span>
            <strong>{updated}</strong>
          </div>
        </div>
      )}

      <button type="button" className="re-safety-banner" onClick={onOpenSafety}>
        <AlertTriangle className="w-4 h-4" />
        <span>{t('reSafetyTips')}</span>
        <ChevronDown className="w-4 h-4 re-safety-chevron" />
      </button>

      <div className="re-specs-row">
        <div className="re-spec">
          <span className="re-spec-value">{a.area || '—'}</span>
          <span className="re-spec-label">{t('reArea')}</span>
        </div>
        <div className="re-spec">
          <span className="re-spec-value">{yearLabel}</span>
          <span className="re-spec-label">{t('reBuilt')}</span>
        </div>
        <div className="re-spec">
          <span className="re-spec-value">{roomsLabel}</span>
          <span className="re-spec-label">{t('reRooms')}</span>
        </div>
      </div>

      <div className="re-photo-confirm">
        <span>{t('rePhotosAuthentic')}</span>
        <strong>{a.photosAuthentic ? t('reYes') : t('reNo')}</strong>
      </div>

      {a.isRent ? (
        <div className="re-rent-block">
          <div className="re-rent-grid">
            <div>
              <p className="re-rent-value">{a.deposit != null ? formatMoney(a.deposit, lang) : '—'}</p>
              <p className="re-rent-label">{t('reDeposit')}</p>
            </div>
            <div>
              <p className="re-rent-value">{a.monthlyRent != null ? formatMoney(a.monthlyRent, lang) : '—'}</p>
              <p className="re-rent-label">{t('reMonthlyRent')}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="re-sale-price">
          <p className="re-rent-value">{listingPriceLabel(listing, lang, t) || formatMoney(listing.price, lang)}</p>
          <p className="re-rent-label">{t('reSalePrice')}</p>
        </div>
      )}

      <div className="re-floor-row">
        <span className="re-floor-label">{t('reFloor')}</span>
        <span className="re-floor-value">{floorLabel}</span>
      </div>

      <section className="re-amenities-section">
        <h3>{t('reAmenities')}</h3>
        <div className="re-amenities-grid">
          <Amenity
            on={!!a.elevator}
            label={a.elevator
              ? (a.elevatorCount ? `${t('reElevator')} ×${a.elevatorCount}` : t('reElevator'))
              : t('reNoElevator')}
            Icon={Building2}
          />
          <Amenity
            on={!!a.parking}
            label={a.parking
              ? (a.parkingCount ? `${t('reParking')} ×${a.parkingCount}` : t('reParking'))
              : t('reNoParking')}
            Icon={Car}
          />
          <Amenity
            on={!!a.storage}
            label={a.storage
              ? (a.storageCount ? `${t('reStorage')} ×${a.storageCount}` : t('reStorage'))
              : t('reNoStorage')}
            Icon={Warehouse}
          />
        </div>
      </section>

      <button
        type="button"
        className="re-expand-row"
        onClick={() => setMoreOpen((v) => !v)}
      >
        <span>{t('reOtherFeatures')}</span>
        {moreOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {moreOpen && (
        <div className="re-extra-facts">
          {extraRows.length > 0 ? extraRows.map((row) => (
            <div key={row.label} className="re-extra-fact">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          )) : (
            <p className="re-empty-note">{t('reNoExtraFeatures')}</p>
          )}
        </div>
      )}

      <button
        type="button"
        className="re-expand-row"
        onClick={() => setExpertiseOpen((v) => !v)}
      >
        <span className="re-expertise-label">
          <FileSearch className="w-4 h-4" />
          {t('reExpertise')}
        </span>
        {expertiseOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expertiseOpen && (
        <div className="re-expertise-body">
          <p>{t('reExpertiseBody')}</p>
        </div>
      )}

      <ListingMap lat={listing.lat ?? a.lat} lng={listing.lng ?? a.lng} title={listing.title} />
    </div>
  )
}
