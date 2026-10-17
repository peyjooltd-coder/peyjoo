import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../context/I18nContext'

const SLIDE_MS = 4200

export default function RealEstateAgencySlider({ agency }) {
  const { lang } = useI18n()
  const fa = lang === 'fa'
  const name = fa ? agency.nameFa : agency.nameEn
  const banners = agency.banners.map((banner) => ({
    title: fa ? banner.titleFa : banner.titleEn,
    text: fa ? banner.textFa : banner.textEn,
    image: banner.image,
  }))
  const [index, setIndex] = useState(0)
  const [held, setHeld] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)

  useEffect(() => {
    setIndex(0)
  }, [agency.id])

  useEffect(() => {
    if (held || banners.length < 2) return undefined
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length)
    }, SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [held, banners.length, agency.id])

  const step = (dir) => {
    setIndex((current) => (current + dir + banners.length) % banners.length)
  }

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    startX.current = event.clientX
    startY.current = event.clientY
    setHeld(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const onPointerUp = (event) => {
    const dx = event.clientX - startX.current
    const dy = event.clientY - startY.current
    setHeld(false)
    if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy)) return
    step(dx < 0 ? 1 : -1)
  }

  return (
    <section
      className={`re-biz${held ? ' is-held' : ''}`}
      style={{ '--re-biz-accent': agency.accent }}
      aria-roledescription="carousel"
      aria-label={name}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setHeld(false)}
    >
      <div className="re-biz-viewport">
        <div className="re-biz-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {banners.map((banner) => (
            <article key={banner.title} className="re-biz-slide">
              <img src={banner.image} alt="" draggable={false} />
              <div className="re-biz-shade" />
              <div className="re-biz-copy">
                <span className="re-biz-badge">{name}</span>
                <strong>{banner.title}</strong>
                <span>{banner.text}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="re-biz-dots" role="tablist">
        {banners.map((banner, i) => (
          <button
            key={banner.title}
            type="button"
            role="tab"
            aria-label={banner.title}
            aria-selected={i === index}
            className={`re-biz-dot${i === index ? ' is-active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  )
}
