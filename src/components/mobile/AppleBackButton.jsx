import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'

/**
 * iOS-style back control: chevron + label, no filled chip.
 * variant: "default" (system blue) | "onOrange" (white on brand header) | "muted"
 */
export default function AppleBackButton({
  label,
  onClick,
  variant = 'default',
  className = '',
}) {
  const { t, isRtl } = useI18n()
  const Icon = isRtl ? ChevronRight : ChevronLeft
  const text = label ?? t('back')

  return (
    <button
      type="button"
      className={`apple-back-btn apple-back-btn--${variant} ${className}`.trim()}
      onClick={onClick}
      aria-label={text}
    >
      <Icon className="apple-back-chevron" strokeWidth={2.75} />
      <span className="apple-back-label">{text}</span>
    </button>
  )
}
