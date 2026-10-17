import { useEffect, useRef } from 'react'

/** Attach horizontal swipe on an element to change gallery index. */
export function useSwipeGallery(ref, { enabled, count, onIndex }) {
  const startX = useRef(0)
  const startY = useRef(0)
  const locked = useRef(null)

  useEffect(() => {
    const el = ref?.current
    if (!el || !enabled || count < 2) return undefined

    const onStart = (e) => {
      const t = e.touches[0]
      startX.current = t.clientX
      startY.current = t.clientY
      locked.current = null
    }
    const onMove = (e) => {
      if (locked.current === 'y') return
      const t = e.touches[0]
      const dx = t.clientX - startX.current
      const dy = t.clientY - startY.current
      if (locked.current == null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        locked.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }
      if (locked.current === 'x') e.preventDefault()
    }
    const onEnd = (e) => {
      if (locked.current !== 'x') return
      const t = e.changedTouches[0]
      const dx = t.clientX - startX.current
      if (Math.abs(dx) < 40) return
      onIndex((i) => {
        if (dx < 0) return Math.min(count - 1, i + 1)
        return Math.max(0, i - 1)
      })
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [ref, enabled, count, onIndex])
}
