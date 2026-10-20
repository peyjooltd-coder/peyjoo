import { useState } from 'react'
import { useI18n } from '../context/I18nContext'

export default function AppLogo({ className = 'w-14 h-14', rounded = 'rounded-2xl', letterClass = 'text-2xl' }) {
  const { lang } = useI18n()
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`${className} ${rounded} bg-divar-red flex items-center justify-center shadow-[var(--shadow-red)]`}>
        <span className={`text-white font-extrabold ${letterClass}`}>{lang === 'fa' ? 'پ' : 'P'}</span>
      </div>
    )
  }

  return (
    <img
      src="/logo.jpeg?v=6"
      alt={lang === 'fa' ? 'پی جو' : 'PeyJoo'}
      className={`${className} ${rounded} object-contain shadow-[var(--shadow-red)] bg-white`}
      onError={() => setFailed(true)}
    />
  )
}
