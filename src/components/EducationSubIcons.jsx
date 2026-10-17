/** Education subcategory outline glyphs — thin navy stroke for header circles */

const s = {
  stroke: 'currentColor',
  strokeWidth: 1.55,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
}

export function EduIconAll({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.35" {...s} />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.35" {...s} />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.35" {...s} />
      <rect x="13.25" y="13.25" width="7" height="7" rx="1.35" {...s} />
    </svg>
  )
}

export function EduIconComputer({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3.5" y="4.5" width="17" height="11.5" rx="1.4" {...s} />
      <path d="M8 19.5h8M12 16v3.5" {...s} />
    </svg>
  )
}

export function EduIconMobile({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="7.2" y="2.8" width="9.6" height="18.4" rx="1.8" {...s} />
      <path d="M10.5 18.8h3" {...s} />
      <circle cx="15.6" cy="15.2" r="2.6" {...s} />
      <path d="M15.6 13.7v3M14.1 15.2h3" {...s} />
    </svg>
  )
}

export function EduIconFinance({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="3.5" y="5" width="11" height="14" rx="1.2" {...s} />
      <path d="M6 9.2h6M6 12h6M6 14.8h4" {...s} />
      <ellipse cx="17.2" cy="14.5" rx="2.6" ry="1.1" {...s} />
      <ellipse cx="17.2" cy="12.6" rx="2.6" ry="1.1" {...s} />
      <ellipse cx="17.2" cy="10.7" rx="2.6" ry="1.1" {...s} />
    </svg>
  )
}

export function EduIconMarketing({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M4.5 10.2v3.6l4.2 1.6V8.6L4.5 10.2Z" {...s} />
      <path d="M8.7 8.6 18.5 5.2v13.6L8.7 15.4" {...s} />
      <path d="M19.6 9.2c1 .8 1.5 1.8 1.5 2.8s-.5 2-1.5 2.8" {...s} />
    </svg>
  )
}

export function EduIconProgramming({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M8.2 8.2 4.5 12l3.7 3.8M15.8 8.2 19.5 12l-3.7 3.8M13.2 6.8 10.8 17.2" {...s} />
    </svg>
  )
}

export function EduIconCooking({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M8 10.2c0-2.4 1.8-4.4 4-4.4s4 2 4 4.4" {...s} />
      <path d="M7 10.2h10v1.4c0 1.2-.6 2.2-1.5 2.8L14.8 18H9.2l-.7-3.6C7.6 13.8 7 12.8 7 11.6v-1.4Z" {...s} />
      <path d="M10.2 18h3.6" {...s} />
    </svg>
  )
}

export function EduIconSewing({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M6.5 4.5 17.5 19.5" {...s} />
      <path d="M16.2 4.8c1.6 1.6 1.6 4.2 0 5.8L8.5 18.3" {...s} />
      <circle cx="7.2" cy="19.2" r="1.4" {...s} />
      <path d="M14.8 5.5c.9-.9 2.4-.9 3.3 0" {...s} />
    </svg>
  )
}

export function EduIconTools({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M14.5 5.2a3.4 3.4 0 0 0-4.5 4.1L5.5 14l1.4 1.4 4.5-4.1a3.4 3.4 0 0 0 4.1-4.5L13.8 8.5 12.4 7.1l2.1-1.9Z" {...s} />
      <path d="M5.5 14 4.2 18.6 8.8 17.3" {...s} />
      <path d="M15.8 14.5 19.2 17.9M17.4 13.6l1.4 1.4M14.9 16.1l1.4 1.4" {...s} />
    </svg>
  )
}

export function EduIconSpeaking({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M9.2 10.5v5.2a2.2 2.2 0 0 0 4.4 0v-5.2" {...s} />
      <path d="M8.2 10.5a3.7 3.7 0 0 1 7.4 0" {...s} />
      <path d="M11.4 18v2.2M9.2 20.2h4.4" {...s} />
      <path d="M17.2 9.5c1 .9 1.5 2 1.5 3.2s-.5 2.3-1.5 3.2M6.8 9.5c-1 .9-1.5 2-1.5 3.2s.5 2.3 1.5 3.2" {...s} />
    </svg>
  )
}

export function EduIconResume({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="5.2" y="3.5" width="13.6" height="17" rx="1.4" {...s} />
      <circle cx="12" cy="8.2" r="2" {...s} />
      <path d="M8.5 13.2h7M8.5 15.8h5.5" {...s} />
      <circle cx="16.6" cy="16.8" r="2.4" {...s} />
      <path d="M15.6 16.8h2M16.6 15.8v2" {...s} />
    </svg>
  )
}

export function EduIconTutoring({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <circle cx="8.2" cy="7.2" r="2.1" {...s} />
      <path d="M5.2 16.5c.4-2.4 1.8-3.6 3-3.6s2.6 1.2 3 3.6" {...s} />
      <rect x="12.2" y="6.2" width="8" height="6.5" rx="0.8" {...s} />
      <path d="M13.5 8h5.4M13.5 10.2h3.8M14.5 15.5l2.2-2.8" {...s} />
    </svg>
  )
}

export function EduIconLanguage({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M5.2 7.5c0-1.4 1.3-2.5 3-2.5h2.4c1.2 0 2.2.7 2.6 1.7" {...s} />
      <path d="M5.2 7.5v5.8c0 1.2.9 2.2 2.1 2.4L9.5 17.2v-1.5h.9" {...s} />
      <path d="M13.2 10.2h5.1c1.4 0 2.5 1.1 2.5 2.5v4.2c0 1.4-1.1 2.5-2.5 2.5h-1.6L14.8 21v-1.6h-1.6c-1.4 0-2.5-1.1-2.5-2.5v-.8" {...s} />
      <path d="M7.2 9.8h3.2M15.2 13.5h3.2M15.8 16h2" {...s} />
    </svg>
  )
}

export const EDUCATION_SUB_ICONS = {
  all: EduIconAll,
  'computer-tech': EduIconComputer,
  'mobile-software': EduIconMobile,
  'accounting-finance': EduIconFinance,
  'marketing-sales': EduIconMarketing,
  programming: EduIconProgramming,
  cooking: EduIconCooking,
  'sewing-crafts': EduIconSewing,
  'technical-repairs': EduIconTools,
  'public-speaking': EduIconSpeaking,
  'resume-career': EduIconResume,
  'private-tutoring': EduIconTutoring,
  language: EduIconLanguage,
}
