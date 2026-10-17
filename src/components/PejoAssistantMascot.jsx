/** Pejo AI assistant mark — modern robot glyph (SVG fallback) */
export default function PejoAssistantMascot({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="pejoFabBg" x1="12" y1="8" x2="84" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#243552" />
          <stop offset="1" stopColor="#121a2b" />
        </linearGradient>
        <linearGradient id="pejoFace" x1="28" y1="28" x2="68" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF8F1" />
          <stop offset="1" stopColor="#F0E4D6" />
        </linearGradient>
        <radialGradient id="pejoEye" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(38 46) scale(7.5)">
          <stop stopColor="#7DF0FF" />
          <stop offset="1" stopColor="#1EC8E0" />
        </radialGradient>
      </defs>
      <rect x="8" y="8" width="80" height="80" rx="22" fill="url(#pejoFabBg)" />
      <path d="M22 52c0-14 10-26 26-26s26 12 26 26v6c0 4-2 8-6 10H28c-4-2-6-6-6-10v-6Z" fill="url(#pejoFace)" />
      <circle cx="38" cy="46" r="6.5" fill="url(#pejoEye)" />
      <circle cx="58" cy="46" r="6.5" fill="url(#pejoEye)" />
      <circle cx="36.5" cy="44.5" r="1.8" fill="#fff" opacity="0.9" />
      <circle cx="56.5" cy="44.5" r="1.8" fill="#fff" opacity="0.9" />
      <path d="M42 58c2.2 2.4 9.8 2.4 12 0" stroke="#C4B5A5" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="48" cy="18" r="4.5" fill="#D4522A" />
      <rect x="46.2" y="21.5" width="3.6" height="7" rx="1.8" fill="#2A3A55" />
      <path d="M24 44c-4 2-7 7-7 12" stroke="#D4522A" strokeWidth="5" strokeLinecap="round" />
      <path d="M72 44c4 2 7 7 7 12" stroke="#D4522A" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
