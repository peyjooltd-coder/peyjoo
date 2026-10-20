import { useEffect, useRef, useState } from 'react'
import { Map as MlMap, Marker, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'

setWorkerUrl(workerUrl)

/** Sharp vector basemap (OpenFreeMap). CARTO raster tiles now watermark without a key. */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/bright'
const NUMERIC_CMP = new Set(['==', '!=', '<', '>', '<=', '>='])

/**
 * OpenFreeMap compares nullable tile fields (admin_level, ref_length) to numbers.
 * MapLibre then logs "expected number, found null". Coalesce null to a value that
 * fails the comparison, which is the same result as the library's own fallback.
 */
function nullFallback(op, literal) {
  if (op === '>' || op === '>=') return literal - 1
  if (op === '<' || op === '<=') return literal + 1
  return literal + 1
}

function hardenExpr(expr) {
  if (!Array.isArray(expr)) return expr
  const [op, ...rest] = expr
  if (typeof op === 'string' && NUMERIC_CMP.has(op) && rest.length === 2) {
    const left = hardenExpr(rest[0])
    const right = hardenExpr(rest[1])
    if (typeof right === 'number' && Number.isFinite(right) && Array.isArray(left)) {
      return [op, ['coalesce', left, nullFallback(op, right)], right]
    }
    if (typeof left === 'number' && Number.isFinite(left) && Array.isArray(right)) {
      return [op, left, ['coalesce', right, nullFallback(op, left)]]
    }
    return [op, left, right]
  }
  return expr.map((item) => hardenExpr(item))
}

function hardenStyle(style) {
  const next = structuredClone(style)
  for (const layer of next.layers || []) {
    if (layer.filter) layer.filter = hardenExpr(layer.filter)
  }
  return next
}

async function loadMapStyle() {
  const response = await fetch(STYLE_URL)
  if (!response.ok) throw new Error('map style')
  return hardenStyle(await response.json())
}

const RADIUS_OPTIONS = [5, 10, 20, 35]

function zoomForRadius(km) {
  if (km <= 5) return 13
  if (km <= 10) return 12
  if (km <= 20) return 11
  if (km <= 35) return 10
  return 9
}

/** Stable ~200–600m offset so pins stay approximate, not exact address */
function approxCoord(lat, lng, seed) {
  const n = Math.abs(Number(seed) || 0)
  const ang = ((n * 9301 + 49297) % 233280) / 233280 * Math.PI * 2
  const meters = 220 + (n % 380)
  const dLat = (meters * Math.cos(ang)) / 111320
  const dLng = (meters * Math.sin(ang)) / (111320 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)))
  return { lat: lat + dLat, lng: lng + dLng }
}

function circleFeature(lat, lng, radiusM) {
  const steps = 72
  const coords = []
  const cos = Math.max(0.2, Math.cos((lat * Math.PI) / 180))
  for (let i = 0; i <= steps; i += 1) {
    const ang = (i / steps) * Math.PI * 2
    const dLat = (radiusM * Math.sin(ang)) / 111320
    const dLng = (radiusM * Math.cos(ang)) / (111320 * cos)
    coords.push([lng + dLng, lat + dLat])
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  }
}

function safeAvatar(url) {
  const value = String(url || '/logo.jpeg?v=6').trim()
  if (/^javascript:/i.test(value) || /^data:text/i.test(value)) return '/logo.jpeg?v=6'
  return value.replace(/"/g, '')
}

function pinElement(url) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'dating-pin'
  const photo = document.createElement('span')
  photo.className = 'dating-pin-photo'
  const img = document.createElement('img')
  img.alt = ''
  img.draggable = false
  img.src = safeAvatar(url)
  photo.appendChild(img)
  const stem = document.createElement('span')
  stem.className = 'dating-pin-stem'
  const dot = document.createElement('span')
  dot.className = 'dating-pin-dot'
  button.append(photo, stem, dot)
  return button
}

export { RADIUS_OPTIONS, approxCoord }

export default function DatingMap({
  center,
  radiusKm,
  people,
  myProfile,
  onSelect,
  active = true,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const meRef = useRef(null)
  const onSelectRef = useRef(onSelect)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined
    let cancelled = false
    let map = null
    let observer = null
    const timers = []

    const start = async () => {
      let style = STYLE_URL
      try {
        style = await loadMapStyle()
      } catch {
        style = STYLE_URL
      }
      if (cancelled || !containerRef.current) return

      map = new MlMap({
        container: containerRef.current,
        style,
        center: [center.lng, center.lat],
        zoom: zoomForRadius(radiusKm),
        attributionControl: { compact: false },
        fadeDuration: 0,
        pitchWithRotate: false,
        dragRotate: false,
        touchPitch: false,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      })
      map.touchZoomRotate.disableRotation()

      map.on('load', () => {
        if (cancelled) return
        map.addSource('dating-range', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
        map.addLayer({
          id: 'dating-range-fill',
          type: 'fill',
          source: 'dating-range',
          paint: {
            'fill-color': '#007AFF',
            'fill-opacity': 0.18,
          },
        })
        setReady(true)
      })

      mapRef.current = map
      const fit = () => map.resize()
      requestAnimationFrame(fit)
      timers.push(setTimeout(fit, 60), setTimeout(fit, 280))
      observer = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(fit)
        : null
      observer?.observe(containerRef.current)
    }

    start()

    return () => {
      cancelled = true
      timers.forEach((id) => clearTimeout(id))
      observer?.disconnect()
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      meRef.current?.remove()
      meRef.current = null
      map?.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !active) return
    requestAnimationFrame(() => map.resize())
    const t = setTimeout(() => map.resize(), 80)
    return () => clearTimeout(t)
  }, [active, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    const me = myProfile?.lat != null && myProfile?.lng != null
      ? approxCoord(myProfile.lat, myProfile.lng, myProfile.userId || 'me')
      : { lat: center.lat, lng: center.lng }

    map.easeTo({
      center: [center.lng, center.lat],
      zoom: zoomForRadius(radiusKm),
      duration: 420,
      essential: true,
    })

    const source = map.getSource('dating-range')
    const haloM = Math.max(650, radiusKm * 160)
    source?.setData(circleFeature(me.lat, me.lng, haloM))

    if (!meRef.current) {
      const dot = document.createElement('div')
      dot.className = 'dating-me-dot'
      meRef.current = new Marker({ element: dot, anchor: 'center' })
        .setLngLat([me.lng, me.lat])
        .addTo(map)
    } else {
      meRef.current.setLngLat([me.lng, me.lat])
    }
  }, [ready, center.lat, center.lng, radiusKm, myProfile])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    people.forEach((person) => {
      if (person?.lat == null || person?.lng == null) return
      const pin = approxCoord(person.lat, person.lng, person.userId)
      const element = pinElement(person.avatar)
      element.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        onSelectRef.current?.(person)
      })
      const marker = new Marker({ element, anchor: 'bottom' })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map)
      markersRef.current.push(marker)
    })
  }, [ready, people])

  return (
    <div className="dating-map-stage">
      <div
        ref={containerRef}
        className={`dating-map dating-map-fast dating-map-apple ${active ? 'is-active' : 'is-idle'}`}
        aria-hidden={!active}
      />
      <div className="dating-map-zoom">
        <button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>+</button>
        <button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>−</button>
      </div>
    </div>
  )
}
