/**
 * Real-estate subcategory glyphs — exact line-art from the reference sheet
 * (thin navy stroke in a light-gray circle).
 */

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.55,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
}

/** همه — 2×2 grid */
export function ReIconAll({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.35" {...stroke} />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.35" {...stroke} />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.35" {...stroke} />
      <rect x="13.25" y="13.25" width="7" height="7" rx="1.35" {...stroke} />
    </svg>
  )
}

function HouseOutline() {
  return (
    <>
      <path d="M4 11.15 12 4.35l8 6.8" {...stroke} />
      <path d="M5.85 10.55V19.1a.85.85 0 0 0 .85.85h10.6a.85.85 0 0 0 .85-.85v-8.55" {...stroke} />
      <path d="M9.15 5.35V4.2" {...stroke} />
    </>
  )
}

/** اجاره — house + key */
export function ReIconRent({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <HouseOutline />
      <circle cx="15.9" cy="14.15" r="1.65" {...stroke} />
      <path d="M15.9 15.8v4.35" {...stroke} />
      <path d="M15.9 17.85h1.55" {...stroke} />
      <path d="M15.9 19.2h1.15" {...stroke} />
    </svg>
  )
}

/** فروش — house + price tag */
export function ReIconSale({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <HouseOutline />
      <path
        d="M13.15 12.55 18.35 10.25a.7.7 0 0 1 .95.66v4.85a.7.7 0 0 1-.95.66L13.15 14.15Z"
        {...stroke}
      />
      <circle cx="17.55" cy="12.85" r="0.65" fill="currentColor" stroke="none" />
    </svg>
  )
}

export const RE_SUB_ICONS = {
  all: ReIconAll,
  'for-rent': ReIconRent,
  'for-sale': ReIconSale,
}
