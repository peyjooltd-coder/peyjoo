/** Pets subcategory outline glyphs — thin navy stroke for header circles */

const s = {
  stroke: 'currentColor',
  strokeWidth: 1.55,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
}

export function PetsIconAll({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.35" {...s} />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.35" {...s} />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.35" {...s} />
      <rect x="13.25" y="13.25" width="7" height="7" rx="1.35" {...s} />
    </svg>
  )
}

/** سگ */
export function PetsIconDog({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M8.2 10.5c0-2.4 1.9-4.4 4.3-4.4 1.6 0 3 .8 3.8 2.1l2.2-1.1v3.2l-1.6.6" {...s} />
      <path d="M8.5 12.2c-.8 1-.8 2.4 0 3.5.9 1.2 2.5 1.9 4 1.9s3.1-.7 4-1.9c.8-1.1.8-2.5 0-3.5" {...s} />
      <path d="M10.8 14.2h.1M14.6 14.2h.1M11.5 16.2c.5.4 1.3.4 1.8 0" {...s} />
      <path d="M9.2 18.5c.8 1.2 2 1.9 3.3 1.9s2.5-.7 3.3-1.9" {...s} />
    </svg>
  )
}

/** حیوانات مزرعه — cow */
export function PetsIconFarm({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <ellipse cx="12" cy="13.2" rx="6.2" ry="5" {...s} />
      <path d="M7.2 9.5 5.5 6.8l3.2 1.2M16.8 9.5l1.7-2.7-3.2 1.2" {...s} />
      <circle cx="9.8" cy="12.2" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14.2" cy="12.2" r="0.7" fill="currentColor" stroke="none" />
      <path d="M10.5 15.2h3M11.2 17.8c.3.6.9 1 1.5 1s1.2-.4 1.5-1" {...s} />
      <path d="M9.5 8.2h5" {...s} />
    </svg>
  )
}

/** لوازم جانبی — bowl + bone */
export function PetsIconAccessories({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <ellipse cx="10.2" cy="15.5" rx="5.5" ry="2.2" {...s} />
      <path d="M4.7 15.5c0-2.6 2.5-4.7 5.5-4.7s5.5 2.1 5.5 4.7" {...s} />
      <circle cx="10.2" cy="13.2" r="1.6" {...s} />
      <path d="M10.2 11.8v2.8M8.8 13.2h2.8" {...s} />
      <path d="M15.5 8.2c.7-.7 1.8-.7 2.5 0 .3.3.5.7.5 1.1 0 .4-.2.8-.5 1.1L15.2 13l-2.8-2.8c-.7-.7-.7-1.8 0-2.5.7-.7 1.8-.7 2.5 0l.6.5Z" {...s} />
    </svg>
  )
}

/** ماهی */
export function PetsIconFish({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M4.2 12c2.8-3.8 6.2-5.5 9.8-5.5 3.2 0 5.6 1.8 6.8 5.5-1.2 3.7-3.6 5.5-6.8 5.5-3.6 0-7-1.7-9.8-5.5Z" {...s} />
      <path d="M4.2 12 2.5 9.2v5.6L4.2 12Z" {...s} />
      <circle cx="15.5" cy="11.2" r="0.85" fill="currentColor" stroke="none" />
      <path d="M11.5 9.5c1.2 1 1.2 3.5 0 4.5" {...s} />
    </svg>
  )
}

/** پرنده */
export function PetsIconBird({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M5.5 14.5c1.2-3.5 4-5.5 7.2-5.5 1.4 0 2.7.4 3.8 1.1L19.5 8v4.2l-2.2.8c.3.7.5 1.5.5 2.3 0 3.2-2.4 5.2-5.4 5.2-3.5 0-5.8-2-6.9-5.5Z" {...s} />
      <circle cx="15.2" cy="11.5" r="0.7" fill="currentColor" stroke="none" />
      <path d="M18.8 9.2 21 8.2" {...s} />
      <path d="M9.5 16.5c1 .8 2.2 1.2 3.5 1.2" {...s} />
    </svg>
  )
}

/** خزنده — lizard top view */
export function PetsIconReptile({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <ellipse cx="12" cy="12" rx="3.2" ry="5.5" {...s} />
      <path d="M12 6.5V4.2M10.2 5.2 8.5 3.8M13.8 5.2l1.7-1.4" {...s} />
      <path d="M8.8 9.2 5.5 7.5M15.2 9.2l3.3-1.7M8.8 14.8 5.5 16.5M15.2 14.8l3.3 1.7" {...s} />
      <path d="M12 17.5v2.8" {...s} />
      <circle cx="10.8" cy="9.5" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="13.2" cy="9.5" r="0.55" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** موش و خرگوش */
export function PetsIconRodents({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      {/* rabbit */}
      <ellipse cx="9.2" cy="14" rx="3.6" ry="3.2" {...s} />
      <path d="M7.2 10.8 6 5.5c.8-.3 1.6 0 2 .8L9.2 11M11.2 10.8l1.2-5.3c.8-.3 1.6 0 2 .8L12.2 11" {...s} />
      <circle cx="8.2" cy="13.2" r="0.5" fill="currentColor" stroke="none" />
      {/* mouse */}
      <ellipse cx="16.5" cy="15.5" rx="2.6" ry="2.2" {...s} />
      <path d="M15.2 13.5 14.5 11.2M17.8 13.5l.7-2.3" {...s} />
      <path d="M18.8 16.5c1.2.2 2.4 1 3.2 2.2" {...s} />
      <circle cx="15.6" cy="15" r="0.45" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** گربه */
export function PetsIconCat({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M7.5 11.5c0-2.8 2-5 4.5-5s4.5 2.2 4.5 5c0 3.2-1.8 5.8-4.5 5.8s-4.5-2.6-4.5-5.8Z" {...s} />
      <path d="M8.2 7.8 6.5 4.8l3.2 1.6M15.8 7.8l1.7-3 3.2 1.6" {...s} />
      <circle cx="10.2" cy="11.2" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="13.8" cy="11.2" r="0.65" fill="currentColor" stroke="none" />
      <path d="M11.2 13.5h1.6M10.5 15c.5.4 1.3.4 1.8 0" {...s} />
      <path d="M9.5 18.5c.9 1.3 2 2 2.5 2s1.6-.7 2.5-2" {...s} />
    </svg>
  )
}

export const PETS_SUB_ICONS = {
  all: PetsIconAll,
  dog: PetsIconDog,
  farm: PetsIconFarm,
  accessories: PetsIconAccessories,
  fish: PetsIconFish,
  bird: PetsIconBird,
  reptile: PetsIconReptile,
  rodents: PetsIconRodents,
  cat: PetsIconCat,
}
