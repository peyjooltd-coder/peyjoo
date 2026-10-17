/** کولبران subcategory outline glyphs — thin navy stroke for header circles */

const s = {
  stroke: 'currentColor',
  strokeWidth: 1.55,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
}

export function KolbaranIconAll({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.35" {...s} />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.35" {...s} />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.35" {...s} />
      <rect x="13.25" y="13.25" width="7" height="7" rx="1.35" {...s} />
    </svg>
  )
}

/** بار دارم — hand holding box + motion lines */
export function KolbaranIconHaveLoad({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M2.8 11.2h3.2M2.5 13.2h3.5M2.8 15.2h3.2" {...s} />
      <rect x="8.2" y="7.5" width="8.2" height="7.4" rx="0.7" {...s} />
      <path d="M8.2 10.2h8.2M12.3 7.5v7.4" {...s} />
      <path d="M6.5 16.5c1.2 1.8 3.2 2.8 5.5 2.8h4.2c1.4 0 2.5-1 2.5-2.2 0-.8-.5-1.5-1.3-1.9" {...s} />
      <path d="M6.5 16.5c-.8-.4-1.3-1.2-1.3-2.1 0-1.3 1.1-2.4 2.4-2.4.6 0 1.1.2 1.5.5" {...s} />
    </svg>
  )
}

/** بار می‌برم — walker with backpack + briefcase */
export function KolbaranIconWillCarry({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12.2" cy="5.2" r="1.7" {...s} />
      <path d="M12.2 7.2v5.8" {...s} />
      <path d="M12.2 9.2 8.5 11.5M12.2 9.2l4.2 1.5" {...s} />
      <path d="M12.2 13l-2.8 5.8M12.2 13l3.2 5.5" {...s} />
      {/* backpack */}
      <path d="M9.2 8.5c0-1.2.9-2 2-2h.5c1.1 0 2 .8 2 2v3.2c0 .7-.5 1.2-1.2 1.2h-2.1c-.7 0-1.2-.5-1.2-1.2V8.5Z" {...s} />
      {/* briefcase in trailing hand */}
      <rect x="15.8" y="10.2" width="4.2" height="3.4" rx="0.45" {...s} />
      <path d="M17.2 10.2V9.4c0-.4.3-.7.7-.7h.8c.4 0 .7.3.7.7v.8" {...s} />
      <path d="M16.2 11.5h3.4" {...s} />
    </svg>
  )
}

export const KOLBARAN_SUB_ICONS = {
  all: KolbaranIconAll,
  'have-load': KolbaranIconHaveLoad,
  'will-carry': KolbaranIconWillCarry,
}
