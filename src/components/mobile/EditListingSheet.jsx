import { useState, useEffect, useRef } from 'react'
import { Camera, Film, ImagePlus, Images, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useI18n } from '../../context/I18nContext'
import MobileBottomSheet from './MobileBottomSheet'
import MediaSlide, { listingMediaList } from '../MediaSlide'
import VideoCoverPicker from '../VideoCoverPicker'
import MediaUploadProgress from '../MediaUploadProgress'
import RealEstateDetailFields from '../RealEstateDetailFields'
import KolbaranDetailFields from '../KolbaranDetailFields'
import ExchangeDetailFields from '../ExchangeDetailFields'
import { JOBS_SUBCATEGORIES } from '../../data/jobsSubcategories'
import {
  REAL_ESTATE_SUBCATEGORIES,
  getRealEstateL2,
} from '../../data/realEstateSubcategories'
import { HOME_KITCHEN_SUBCATEGORIES } from '../../data/homeKitchenSubcategories'
import { VEHICLES_SUBCATEGORIES } from '../../data/vehiclesSubcategories'
import { PETS_SUBCATEGORIES } from '../../data/petsSubcategories'
import { SPORTS_SUBCATEGORIES } from '../../data/sportsSubcategories'
import { BEAUTY_SUBCATEGORIES } from '../../data/beautySubcategories'
import { HEALTH_SUBCATEGORIES } from '../../data/healthSubcategories'
import { EDUCATION_SUBCATEGORIES } from '../../data/educationSubcategories'
import { TOOLS_RENTAL_SUBCATEGORIES } from '../../data/toolsRentalSubcategories'
import { TRANSPORT_SUBCATEGORIES } from '../../data/transportSubcategories'
import { KOLBARAN_SUBCATEGORIES } from '../../data/kolbaranSubcategories'
import { isRealEstateRentSub } from '../../data/realEstateDetailFields'
import {
  hydrateListingDetails,
  buildListingAttributes,
  buildListingPrice,
  hideGenericPriceField,
} from '../../lib/listingFormFields'
import PriceNegotiableToggle from '../PriceNegotiableToggle'
import {
  fileToMediaItem, MAX_MEDIA_ITEMS, MAX_VIDEO_ITEMS, normalizeMedia, mediaCoverUrl,
  extractVideoPoster,
} from '../../lib/imageCompress'

function SubChips({ label, options, value, onChange, lang }) {
  if (!options?.length) return null
  return (
    <div className="re-detail-block" style={{ marginBottom: 12 }}>
      <p className="jobs-filter-title">{label}</p>
      <div className="jobs-filter-chips re-room-chips">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`jobs-filter-chip ${value === o.id ? 'is-active' : ''}`}
            onClick={() => onChange(value === o.id ? '' : o.id)}
          >
            {o.icon ? <span aria-hidden>{o.icon}</span> : null}
            {lang === 'fa' ? o.fa : o.en}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EditListingSheet({ listing, open, onClose }) {
  const { updateMyListing } = useApp()
  const { t, lang } = useI18n()
  const fa = lang === 'fa'
  const tx = (persian, english) => (fa ? persian : english)
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [media, setMedia] = useState([])
  const [details, setDetails] = useState(() => hydrateListingDetails(null))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [coverPickerIdx, setCoverPickerIdx] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(null)

  const category = listing?.category || ''
  const isExchange = category === 'exchange'
  const isRealEstate = category === 'real-estate'
  const isKolbaran = category === 'kolbaran'
  const isJobs = category === 'jobs'
  const isHomeKitchen = category === 'home-appliances'
  const isVehicles = category === 'vehicles'
  const isPets = category === 'pets'
  const isSports = category === 'sports'
  const isBeauty = category === 'beauty'
  const isHealth = category === 'health'
  const isEducation = category === 'education'
  const isToolsRental = category === 'tools-rental'
  const isTransport = category === 'transport'
  const isReRent = isRealEstate && isRealEstateRentSub(details.realEstateSubcategory)
  const reL2 = isRealEstate && details.realEstateSubcategory
    ? getRealEstateL2(details.realEstateSubcategory)
    : []

  const patchDetails = (patch) => setDetails((f) => ({ ...f, ...patch }))

  useEffect(() => {
    if (!listing || !open) return
    setTitle(listing.title || '')
    setPrice(String(listing.price ?? ''))
    setDescription(listing.description || '')
    setMedia(listingMediaList(listing))
    const hydrated = hydrateListingDetails(listing)
    // Prefer monthlyRent from attrs; fall back to listing.price for older rent ads
    if (
      listing.category === 'real-estate'
      && isRealEstateRentSub(hydrated.realEstateSubcategory)
      && !hydrated.monthlyRent
      && listing.price
    ) {
      hydrated.monthlyRent = String(listing.price)
    }
    setDetails(hydrated)
    setError('')
    setCoverPickerIdx(null)
  }, [listing, open])

  if (!listing) return null

  const videoCount = media.filter((m) => m.type === 'video').length

  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index))
    setCoverPickerIdx((cur) => {
      if (cur == null) return null
      if (cur === index) return null
      return cur > index ? cur - 1 : cur
    })
  }

  const onPickMedia = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length || uploadProgress) return
    setError('')
    const queue = files.slice(0, Math.max(0, MAX_MEDIA_ITEMS - media.length))
    if (!queue.length) return
    try {
      const next = [...media]
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
            /* optional */
          }
        }
        next.push(item)
        setMedia(normalizeMedia(next).slice(0, MAX_MEDIA_ITEMS))
      }
    } catch (err) {
      setError(err.message || tx('خطا در افزودن رسانه', 'Could not add media'))
    } finally {
      setUploadProgress(null)
    }
  }

  const openCoverPicker = (idx) => {
    const target = typeof idx === 'number'
      ? idx
      : media.findIndex((m) => m.type === 'video')
    if (target < 0 || !media[target] || media[target].type !== 'video') {
      setError(tx('اول یک ویدیو اضافه کنید، بعد کاور را انتخاب کنید', 'Add a video first, then choose a cover'))
      return
    }
    setCoverPickerIdx(target)
    setError('')
  }

  const applyVideoCover = (poster) => {
    if (coverPickerIdx == null) return
    setMedia((prev) => prev.map((m, i) => (i === coverPickerIdx ? { ...m, poster } : m)))
    setCoverPickerIdx(null)
    setError('')
  }

  const cancelVideoCover = () => {
    const idx = coverPickerIdx
    const video = idx != null ? media[idx] : null
    setCoverPickerIdx(null)
    if (!video || video.type !== 'video' || video.poster || !video.url) return
    extractVideoPoster(video.url)
      .then((poster) => {
        setMedia((prev) => prev.map((m, i) => (
          i === idx && m.type === 'video' && !m.poster ? { ...m, poster } : m
        )))
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
        /* keep */
      }
    }
    return out
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const withPosters = await ensureVideoPosters(media)
      const normalized = normalizeMedia(withPosters).slice(0, MAX_MEDIA_ITEMS)
      const cover = mediaCoverUrl(normalized)
      const form = { ...details, price }
      const attributes = buildListingAttributes(category, form, normalized)
      const { price: nextPrice, priceLabel } = buildListingPrice(category, form, attributes, lang)

      const patch = {
        title: (title || listing.title).trim(),
        description: description.trim(),
        media: normalized,
        images: normalized,
        image: cover || '',
        attributes: {
          ...(listing.attributes || {}),
          ...attributes,
        },
        price: nextPrice,
        priceLabel,
      }

      await updateMyListing(listing.id, patch)
      onClose()
    } catch (err) {
      setError(err.message || tx('ذخیره نشد', 'Could not save'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <MobileBottomSheet open={open} title={tx('ویرایش آگهی', 'Edit listing')} onClose={onClose}>
      <div className="mobile-sheet-filters">
        <p className="text-xs text-amber-800 font-bold mb-2">
          {tx(
            'بعد از ذخیره، آگهی دوباره وارد مرحله تأیید می‌شود تا ادمین منتشرش کند.',
            'After saving, the ad goes back to approval until an admin publishes it.',
          )}
        </p>
        {listing.status === 'pending' && isExchange && (
          <p className="post-form-error" style={{ margin: 0 }}>{t('exchangePendingHint')}</p>
        )}
        <div className="post-photos-row">
          {media.map((item, i) => (
            <div key={`${item.url}-${i}`} className="post-photo-slot has-image">
              {item.type === 'video' && item.poster ? (
                <img src={item.poster} alt="" className="post-photo-thumb" />
              ) : (
                <MediaSlide item={item} className="post-photo-thumb" controls={false} muted />
              )}
              {item.type === 'video' && (
                <span className="post-media-badge"><Film className="w-3 h-3" /></span>
              )}
              {item.type === 'video' && (
                <button
                  type="button"
                  className="post-photo-cover-btn"
                  onClick={() => openCoverPicker(i)}
                >
                  {tx('تغییر کاور', 'Change cover')}
                </button>
              )}
              <button type="button" className="post-photo-remove" onClick={() => removeMedia(i)} aria-label={tx('حذف', 'Remove')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {media.length < MAX_MEDIA_ITEMS && !uploadProgress && (
            <>
              <button
                type="button"
                className="post-photo-slot is-add"
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="w-6 h-6 text-divar-text" />
              </button>
              <button
                type="button"
                className="post-photo-slot is-add is-video"
                onClick={() => videoRef.current?.click()}
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
          <button type="button" className="post-media-action-btn" onClick={() => fileRef.current?.click()} disabled={!!uploadProgress}>
            <ImagePlus className="w-4 h-4" /> {tx('عکس', 'Photo')}
          </button>
          <button type="button" className="post-media-action-btn" onClick={() => videoRef.current?.click()} disabled={!!uploadProgress}>
            <Film className="w-4 h-4" /> {tx('ویدیو', 'Video')}
          </button>
          <button
            type="button"
            className="post-media-action-btn"
            onClick={() => openCoverPicker()}
            disabled={!videoCount || !!uploadProgress}
          >
            <Images className="w-4 h-4" /> {tx('کاور', 'Cover')}
          </button>
        </div>
        <p className="post-photos-hint">
          {tx(
            `عکس · ویدیو · کاور جدا · اگر کاور نزنید خودکار از ویدیو گرفته می‌شود · ${media.length}/${MAX_MEDIA_ITEMS}`,
            `Photo · video · cover is separate · a video frame is used if you skip the cover · ${media.length}/${MAX_MEDIA_ITEMS}`,
          )}
          {videoCount ? ` · ${videoCount} ${tx('ویدیو', 'video')}` : ''}
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

        <label className="mobile-sheet-field">
          <span>{tx('عنوان', 'Title')}</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            dir={fa ? 'rtl' : 'ltr'}
            className="post-input"
          />
        </label>

        {isJobs && (
          <SubChips
            label={tx('دسته‌بندی شغلی', 'Job category')}
            options={JOBS_SUBCATEGORIES}
            value={details.jobSubcategory}
            onChange={(id) => patchDetails({ jobSubcategory: id })}
            lang={lang}
          />
        )}

        {isRealEstate && (
          <>
            <SubChips
              label={tx('بخش املاک', 'Real estate section')}
              options={REAL_ESTATE_SUBCATEGORIES}
              value={details.realEstateSubcategory}
              onChange={(id) => patchDetails({ realEstateSubcategory: id, realEstatePropertyType: '' })}
              lang={lang}
            />
            {reL2.length > 0 && (
              <SubChips
                label={tx('نوع ملک', 'Property type')}
                options={reL2}
                value={details.realEstatePropertyType}
                onChange={(id) => patchDetails({ realEstatePropertyType: id })}
                lang={lang}
              />
            )}
            {details.realEstateSubcategory && (
              <RealEstateDetailFields
                mode="post"
                values={details}
                onChange={patchDetails}
              />
            )}
          </>
        )}

        {isHomeKitchen && (
          <SubChips
            label={tx('خانه و آشپزخانه', 'Home & kitchen')}
            options={HOME_KITCHEN_SUBCATEGORIES}
            value={details.homeKitchenSubcategory}
            onChange={(id) => patchDetails({ homeKitchenSubcategory: id })}
            lang={lang}
          />
        )}
        {isVehicles && (
          <SubChips
            label={tx('وسایل نقلیه', 'Vehicles')}
            options={VEHICLES_SUBCATEGORIES}
            value={details.vehiclesSubcategory}
            onChange={(id) => patchDetails({ vehiclesSubcategory: id })}
            lang={lang}
          />
        )}
        {isPets && (
          <SubChips
            label={tx('حیوانات', 'Pets')}
            options={PETS_SUBCATEGORIES}
            value={details.petsSubcategory}
            onChange={(id) => patchDetails({ petsSubcategory: id })}
            lang={lang}
          />
        )}
        {isSports && (
          <SubChips
            label={tx('ورزش', 'Sports')}
            options={SPORTS_SUBCATEGORIES}
            value={details.sportsSubcategory}
            onChange={(id) => patchDetails({ sportsSubcategory: id })}
            lang={lang}
          />
        )}
        {isBeauty && (
          <SubChips
            label={tx('زیبایی', 'Beauty')}
            options={BEAUTY_SUBCATEGORIES}
            value={details.beautySubcategory}
            onChange={(id) => patchDetails({ beautySubcategory: id })}
            lang={lang}
          />
        )}
        {isHealth && (
          <SubChips
            label={tx('سلامت', 'Health')}
            options={HEALTH_SUBCATEGORIES}
            value={details.healthSubcategory}
            onChange={(id) => patchDetails({ healthSubcategory: id })}
            lang={lang}
          />
        )}
        {isEducation && (
          <SubChips
            label={tx('آموزش', 'Education')}
            options={EDUCATION_SUBCATEGORIES}
            value={details.educationSubcategory}
            onChange={(id) => patchDetails({ educationSubcategory: id })}
            lang={lang}
          />
        )}
        {isToolsRental && (
          <SubChips
            label={tx('ابزار و اجاره', 'Tools & rental')}
            options={TOOLS_RENTAL_SUBCATEGORIES}
            value={details.toolsRentalSubcategory}
            onChange={(id) => patchDetails({ toolsRentalSubcategory: id })}
            lang={lang}
          />
        )}
        {isTransport && (
          <SubChips
            label={tx('حمل‌ونقل', 'Transport')}
            options={TRANSPORT_SUBCATEGORIES}
            value={details.transportSubcategory}
            onChange={(id) => patchDetails({ transportSubcategory: id })}
            lang={lang}
          />
        )}

        {isKolbaran && (
          <>
            <SubChips
              label={tx('کولبران', 'Kolbaran')}
              options={KOLBARAN_SUBCATEGORIES}
              value={details.kolbaranSubcategory}
              onChange={(id) => patchDetails({ kolbaranSubcategory: id })}
              lang={lang}
            />
            {details.kolbaranSubcategory && (
              <KolbaranDetailFields
                subcategory={details.kolbaranSubcategory}
                values={details}
                onChange={patchDetails}
              />
            )}
          </>
        )}

        {isExchange && (
          <ExchangeDetailFields
            values={details}
            onChange={patchDetails}
          />
        )}

        {!hideGenericPriceField(category, details) && (
          <label className="mobile-sheet-field">
            <span>
              {isRealEstate && !isReRent
                ? tx('قیمت فروش (دلار)', 'Sale price (CAD)')
                : tx('قیمت (دلار)', 'Price (CAD)')}
            </span>
            <input
              type="number"
              value={details.priceNegotiable ? '' : price}
              onChange={(e) => {
                setPrice(e.target.value)
                patchDetails({ priceNegotiable: false })
              }}
              dir="ltr"
              className="post-input"
              disabled={!!details.priceNegotiable}
            />
          </label>
        )}

        <PriceNegotiableToggle
          checked={!!details.priceNegotiable}
          onChange={(on) => {
            patchDetails({
              priceNegotiable: on,
              ...(on ? {
                deposit: '',
                monthlyRent: '',
                kolbaranPriceMin: '',
                kolbaranPriceMax: '',
                kolbaranNegotiable: true,
                exchangeBuyPrice: '',
                exchangeSellPrice: '',
                exchangeTodayPrice: '',
              } : { kolbaranNegotiable: false }),
            })
            if (on) setPrice('')
          }}
        />

        <label className="mobile-sheet-field">
          <span>{tx('توضیحات', 'Description')}</span>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            dir={fa ? 'rtl' : 'ltr'}
            className="post-textarea"
          />
        </label>

        {error && <p className="post-form-error">{error}</p>}

        <button type="button" className="post-submit-btn" onClick={save} disabled={saving}>
          {saving ? '...' : tx('ذخیره', 'Save')}
        </button>
      </div>

      <VideoCoverPicker
        open={coverPickerIdx != null && !!media[coverPickerIdx]?.url}
        videoUrl={coverPickerIdx != null ? media[coverPickerIdx]?.url : ''}
        initialPoster={coverPickerIdx != null ? (media[coverPickerIdx]?.poster || '') : ''}
        onConfirm={applyVideoCover}
        onCancel={cancelVideoCover}
      />
    </MobileBottomSheet>
  )
}
