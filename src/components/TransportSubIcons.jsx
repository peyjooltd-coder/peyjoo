/** Transport subcategory outline glyphs — thin navy stroke for header circles */

const s = {
  stroke: 'currentColor',
  strokeWidth: 1.55,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
}

export function TransportIconAll({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.35" {...s} />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.35" {...s} />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.35" {...s} />
      <rect x="13.25" y="13.25" width="7" height="7" rx="1.35" {...s} />
    </svg>
  )
}

/** پیک و ارسال — dolly + box */
export function TransportIconCourier({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M6.2 19.2 9.5 8.5h7.2L19 19.2" {...s} />
      <rect x="10.2" y="5.2" width="5.8" height="4.6" rx="0.6" {...s} />
      <path d="M6.2 19.2h13.2M8.2 19.2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2" {...s} />
      <path d="M4.5 10.5h2.2M4.2 13h2.8M4 15.5h3" {...s} />
    </svg>
  )
}

/** حمل و نقل — box truck with motion */
export function TransportIconFreight({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M3.5 14.5h11.2V7.2H3.5v7.3Z" {...s} />
      <path d="M14.7 10.2h3.4l2.4 3.2v1.1h-5.8v-4.3Z" {...s} />
      <circle cx="7.2" cy="17.2" r="1.7" {...s} />
      <circle cx="16.8" cy="17.2" r="1.7" {...s} />
      <path d="M2.2 9.5h1.8M1.8 11.8h2.2M1.6 14h2.2" {...s} />
    </svg>
  )
}

/** اسباب‌کشی — house + small truck */
export function TransportIconMoving({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M4.2 11.2 10.5 5.8l6.3 5.4" {...s} />
      <path d="M5.6 10.6V18h9.8v-7.4" {...s} />
      <path d="M12.8 14.8h6.6v3.2h-1.2" {...s} />
      <path d="M16.2 14.8V12h2.2l1 1.4v1.4" {...s} />
      <circle cx="14.4" cy="18" r="1.15" {...s} />
      <circle cx="18.6" cy="18" r="1.15" {...s} />
    </svg>
  )
}

/** اجاره کامیون و ون — box truck */
export function TransportIconTruckRental({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M2.8 14.8h12V6.5H2.8v8.3Z" {...s} />
      <path d="M14.8 9.8h3.6L21 13.2v1.6h-6.2V9.8Z" {...s} />
      <circle cx="6.8" cy="17.4" r="1.7" {...s} />
      <circle cx="17.2" cy="17.4" r="1.7" {...s} />
      <path d="M8.6 17.4h6.8" {...s} />
    </svg>
  )
}

/** راننده و ون — van + person */
export function TransportIconDriverVan({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M3.2 14.5h12.2l1.6-4.2H8.8L7.2 8.2H4.5v6.3Z" {...s} />
      <path d="M15.4 10.3h2.8l2 2.6v1.6h-4.8" {...s} />
      <circle cx="6.5" cy="17" r="1.5" {...s} />
      <circle cx="15.8" cy="17" r="1.5" {...s} />
      <circle cx="19.4" cy="8.2" r="1.5" {...s} />
      <path d="M17.6 13c.4-1.5 1.2-2.2 1.8-2.2s1.4.7 1.8 2.2" {...s} />
    </svg>
  )
}

/** حمل مبلمان — sofa */
export function TransportIconFurniture({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M4.5 12.5v-2.2c0-1.2 1-2.2 2.2-2.2h10.6c1.2 0 2.2 1 2.2 2.2v2.2" {...s} />
      <path d="M3.5 12.5h17v3.6H3.5v-3.6Z" {...s} />
      <path d="M5.2 16.1v2.2M18.8 16.1v2.2M7.5 10.1v2.4M16.5 10.1v2.4" {...s} />
    </svg>
  )
}

/** حمل خودرو — tow truck */
export function TransportIconCarTransport({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M2.8 15.2h8.4l1.5-3.2H8.2L7 10.2H4.2v5Z" {...s} />
      <path d="M11.2 12h3.8l2.2 3.2H11.2" {...s} />
      <circle cx="5.8" cy="17.2" r="1.4" {...s} />
      <circle cx="14.8" cy="17.2" r="1.4" {...s} />
      <path d="M16.5 14.2 20.5 9.8M18.2 10.5h2.8v2.2" {...s} />
      <path d="M17.8 9.2h3.2l.8 1.6h-2.6" {...s} />
    </svg>
  )
}

export const TRANSPORT_SUB_ICONS = {
  all: TransportIconAll,
  courier: TransportIconCourier,
  freight: TransportIconFreight,
  moving: TransportIconMoving,
  'truck-van-rental': TransportIconTruckRental,
  'driver-van': TransportIconDriverVan,
  furniture: TransportIconFurniture,
  'car-transport': TransportIconCarTransport,
}
