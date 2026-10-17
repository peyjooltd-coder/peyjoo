import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'
import AppLogo from './AppLogo'

const SLIDE_MS = 5200
const ICON = 'v=icons7'

const SLIDE_DEFS = [
  {
    id: 'kitchen',
    tone: 'peach',
    icon: `/categories/home-market.png?${ICON}`,
    title: 'promoHomeMarketTitle',
    text: 'promoHomeMarketText',
    cta: 'promoHomeMarketCta',
    target: 'home-market',
  },
  {
    id: 'estate',
    tone: 'lilac',
    icon: `/categories/real-estate.png?${ICON}`,
    title: 'promoRealEstateTitle',
    text: 'promoRealEstateText',
    cta: 'promoRealEstateCta',
    target: 'real-estate',
  },
  {
    id: 'vehicles',
    tone: 'amber',
    icon: `/categories/vehicles.png?${ICON}`,
    title: 'promoVehiclesTitle',
    text: 'promoVehiclesText',
    cta: 'promoVehiclesCta',
    target: 'vehicles',
  },
  {
    id: 'dating',
    tone: 'rose',
    icon: '/promo/dating-pin.png?v=2',
    title: 'promoDatingTitle',
    text: 'promoDatingText',
    cta: 'promoDatingCta',
    target: 'dating',
  },
  {
    id: 'kolbar',
    tone: 'aqua',
    icon: `/categories/couriers.png?${ICON}`,
    title: 'promoKolbarTitle',
    text: 'promoKolbarText',
    cta: 'promoKolbarCta',
    target: 'couriers',
  },
]

function FloatIcon({ icon, className }) {
  return <img className={`promo-mg-float ${className}`} src={icon} alt="" draggable={false} />
}

export default function PromoSlider() {
  const { t, isRtl } = useI18n()
  const { setViewTab, openCategory } = useApp()
  const [index, setIndex] = useState(0)
  const [held, setHeld] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const dragged = useRef(false)

  useEffect(() => {
    if (held) return undefined
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDE_DEFS.length)
    }, SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [held])

  const open = (target) => {
    if (dragged.current) {
      dragged.current = false
      return
    }
    if (target === 'news') setViewTab('news')
    else openCategory(target)
  }

  const step = (dir) => {
    setIndex((current) => (current + dir + SLIDE_DEFS.length) % SLIDE_DEFS.length)
  }

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    startX.current = event.clientX
    startY.current = event.clientY
    dragged.current = false
    setHeld(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const onPointerUp = (event) => {
    const dx = event.clientX - startX.current
    const dy = event.clientY - startY.current
    setHeld(false)
    if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy)) return
    dragged.current = true
    const forward = isRtl ? dx > 0 : dx < 0
    step(forward ? 1 : -1)
  }

  const onPointerCancel = () => setHeld(false)

  const active = SLIDE_DEFS[index]

  return (
    <section
      className={`home-banner promo-slider promo-mg${held ? ' is-held' : ''}`}
      data-tone={active.tone}
      aria-roledescription="carousel"
      aria-label={t(active.title)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {SLIDE_DEFS.map((slide, i) => {
        const on = i === index
        return (
          <article
            key={slide.id}
            className={`promo-mg-slide tone-${slide.tone}${on ? ' is-on' : ''}`}
            aria-hidden={!on}
          >
            <div className="promo-mg-copy">
              <div className="promo-mg-brand">
                <AppLogo className="promo-mg-logo" rounded="rounded-lg" letterClass="text-xs" />
                <strong>{t('brand')}</strong>
              </div>
              <h2>{t(slide.title)}</h2>
              <p className="promo-mg-text">{t(slide.text)}</p>
              <button type="button" className="promo-mg-cta" tabIndex={on ? 0 : -1} onClick={() => open(slide.target)}>
                {t(slide.cta)}
              </button>
            </div>
            <div className="promo-mg-stage" aria-hidden>
              <FloatIcon icon={slide.icon} className="promo-mg-float--1" />
            </div>
          </article>
        )
      })}
      <div className="promo-dots" role="tablist">
        {SLIDE_DEFS.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-label={t(slide.title)}
            aria-selected={i === index}
            className={`promo-dot${i === index ? ' is-active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  )
}
