/**
 * iOS Safari / iPhone shell helpers:
 * - pin the app to the visual viewport (above the keyboard)
 * - stop the document from scrolling, which throws the bottom nav to the top
 * - keep the focused field visible inside the inner scroller
 */
export function initIosSafari() {
  if (typeof window === 'undefined') return () => {}

  const root = document.documentElement
  const ua = navigator.userAgent || ''
  const isAppleMobile = /iP(hone|od|ad)/.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true

  root.classList.toggle('is-ios', isAppleMobile)
  root.dataset.platform = isAppleMobile ? 'ios' : 'other'
  if (isStandalone) root.classList.add('is-standalone')

  const setViewportVars = () => {
    const vv = window.visualViewport
    const height = Math.round(vv?.height || window.innerHeight)
    const offsetTop = Math.round(vv?.offsetTop || 0)
    root.style.setProperty('--app-height', `${height}px`)
    root.style.setProperty('--vv-offset-top', `${offsetTop}px`)
    if (isAppleMobile && (window.scrollX || window.scrollY)) {
      window.scrollTo(0, 0)
    }
  }

  const scrollFieldIntoView = (el) => {
    if (!(el instanceof HTMLElement)) return
    const scroller = el.closest('.mobile-screen, .auth-gate-overlay, .mobile-sheet, [data-keyboard-scroll]')
    if (!scroller) return
    const pad = 24
    const scrollerRect = scroller.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    if (elRect.bottom > scrollerRect.bottom - pad) {
      scroller.scrollTop += elRect.bottom - (scrollerRect.bottom - pad)
    } else if (elRect.top < scrollerRect.top + pad) {
      scroller.scrollTop -= (scrollerRect.top + pad) - elRect.top
    }
  }

  const onFocusIn = (event) => {
    const el = event.target
    if (!(el instanceof HTMLElement)) return
    if (!el.matches('input, textarea, select, [contenteditable="true"]')) return
    requestAnimationFrame(() => {
      setViewportVars()
      scrollFieldIntoView(el)
      requestAnimationFrame(() => scrollFieldIntoView(el))
    })
  }

  setViewportVars()

  const onResize = () => setViewportVars()
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('orientationchange', onResize, { passive: true })
  window.visualViewport?.addEventListener('resize', onResize, { passive: true })
  window.visualViewport?.addEventListener('scroll', onResize, { passive: true })
  if (isAppleMobile) {
    document.addEventListener('focusin', onFocusIn)
    document.body.style.overscrollBehaviorY = 'none'
  }

  return () => {
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
    window.visualViewport?.removeEventListener('resize', onResize)
    window.visualViewport?.removeEventListener('scroll', onResize)
    document.removeEventListener('focusin', onFocusIn)
  }
}
