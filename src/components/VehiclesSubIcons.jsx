/** Vehicles subcategory outline glyphs — thin navy stroke for header circles */

const s = {
  stroke: 'currentColor',
  strokeWidth: 1.55,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
}

/** Shared front-facing car (hood + windshield + bumper) */
function FrontCar({ y = 0 }) {
  return (
    <>
      <path
        d={`M7.2 ${13.8 + y}c.4-2.2 1.6-3.6 4.8-3.6s4.4 1.4 4.8 3.6`}
        {...s}
      />
      <path
        d={`M6.4 ${13.8 + y}h11.2c.5 0 .9.4.9.9v1.6c0 .5-.4.9-.9.9H6.4c-.5 0-.9-.4-.9-.9v-1.6c0-.5.4-.9.9-.9Z`}
        {...s}
      />
      <path d={`M8.6 ${12.2 + y}h6.8`} {...s} />
      <circle cx="8.4" cy={16.6 + y} r="0.55" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy={16.6 + y} r="0.55" fill="currentColor" stroke="none" />
    </>
  )
}

export function VehiclesIconAll({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.35" {...s} />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.35" {...s} />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.35" {...s} />
      <rect x="13.25" y="13.25" width="7" height="7" rx="1.35" {...s} />
    </svg>
  )
}

/** خودرو — front car */
export function VehiclesIconCar({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M6.8 14.2c.5-2.6 2-4.4 5.2-4.4s4.7 1.8 5.2 4.4" {...s} />
      <path d="M5.8 14.2h12.4c.55 0 1 .45 1 1v1.7c0 .55-.45 1-1 1H5.8c-.55 0-1-.45-1-1v-1.7c0-.55.45-1 1-1Z" {...s} />
      <path d="M8.2 12.2h7.6" {...s} />
      <circle cx="8.2" cy="17.4" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="17.4" r="0.65" fill="currentColor" stroke="none" />
      <path d="M7.5 9.8 9.2 7.8h5.6l1.7 2" {...s} />
    </svg>
  )
}

/** موتورسیکلت — side profile */
export function VehiclesIconMotorcycle({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <circle cx="6.8" cy="16.2" r="2.6" {...s} />
      <circle cx="17.2" cy="16.2" r="2.6" {...s} />
      <path d="M9.2 16.2h5.2" {...s} />
      <path d="M11.2 16.2 12.5 10.5h3.2L17.2 13.8" {...s} />
      <path d="M12.5 10.5 10.2 8.2H8.5" {...s} />
      <path d="M15.7 10.5h2.8M16.5 8.2l1.2 2.3" {...s} />
      <path d="M8.5 8.2c1.2 0 2.2.6 2.7 1.5" {...s} />
    </svg>
  )
}

/** قطعات یدکی — house + car inside */
export function VehiclesIconParts({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M4.2 11.2 12 4.8l7.8 6.4" {...s} />
      <path d="M5.8 10.6V19h12.4v-8.4" {...s} />
      <path d="M9.2 15.2c.3-1.4 1.1-2.3 2.8-2.3s2.5.9 2.8 2.3" {...s} />
      <path d="M8.6 15.2h6.8c.3 0 .55.25.55.55v.9c0 .3-.25.55-.55.55H8.6c-.3 0-.55-.25-.55-.55v-.9c0-.3.25-.55.55-.55Z" {...s} />
      <circle cx="10" cy="16.9" r="0.4" fill="currentColor" stroke="none" />
      <circle cx="14" cy="16.9" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** لوازم و سایر — wrench */
export function VehiclesIconOther({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M14.8 4.5a4.2 4.2 0 0 0-5.6 5.6L4.5 15.8a2 2 0 0 0 2.8 2.8l5.7-4.7a4.2 4.2 0 0 0 5.6-5.6l-2.4 2.4-1.8-1.8 2.4-2.4Z"
        {...s}
      />
      <circle cx="7.2" cy="16.8" r="1.1" {...s} />
    </svg>
  )
}

/** تعمیرگاه ها — car + vertical wrench */
export function VehiclesIconGarage({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M3.8 14.5c.4-2 1.4-3.4 3.8-3.4s3.4 1.4 3.8 3.4" {...s} />
      <path d="M3 14.5h9.2c.4 0 .75.35.75.75v1.3c0 .4-.35.75-.75.75H3c-.4 0-.75-.35-.75-.75v-1.3c0-.4.35-.75.75-.75Z" {...s} />
      <path d="M4.8 12.8h5.6" {...s} />
      <circle cx="4.8" cy="17" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="10.2" cy="17" r="0.5" fill="currentColor" stroke="none" />
      {/* vertical open-end wrench */}
      <path d="M16.2 4.8c1.4 0 2.5 1.1 2.5 2.5 0 .6-.2 1.1-.55 1.55L15.8 11.2v8.5" {...s} />
      <path d="M15.8 19.7h2.4" {...s} />
      <path d="M14.5 6.2c0-1 .7-1.8 1.7-1.8" {...s} />
      <path d="M18.2 8.2c.3.4.5.9.5 1.4" {...s} />
    </svg>
  )
}

/** اجاره خودرو — key above front car */
export function VehiclesIconRental({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <circle cx="8.2" cy="5.8" r="2" {...s} />
      <path d="M10.1 5.8h8.2" {...s} />
      <path d="M15.8 5.8v1.6M17.6 5.8v1.6" {...s} />
      <path d="M6.5 15.2c.45-2.2 1.7-3.6 4.5-3.6s4.05 1.4 4.5 3.6" {...s} />
      <path d="M5.6 15.2h11.3c.5 0 .9.4.9.9v1.5c0 .5-.4.9-.9.9H5.6c-.5 0-.9-.4-.9-.9v-1.5c0-.5.4-.9.9-.9Z" {...s} />
      <path d="M7.8 13.5h7" {...s} />
      <circle cx="7.8" cy="18" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="18" r="0.55" fill="currentColor" stroke="none" />
    </svg>
  )
}

export const VEHICLES_SUB_ICONS = {
  all: VehiclesIconAll,
  car: VehiclesIconCar,
  motorcycle: VehiclesIconMotorcycle,
  'parts-accessories': VehiclesIconParts,
  'boat-other': VehiclesIconOther,
  garage: VehiclesIconGarage,
  'car-rental': VehiclesIconRental,
}
