import { ArrowRight } from 'lucide-react'

export default function SectionHeader({ title, subtitle, action, onAction, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-5 ${className}`}>
      <div>
        <h2 className="dv-section-title">{title}</h2>
        {subtitle && <p className="dv-section-sub">{subtitle}</p>}
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          className="shrink-0 text-sm font-semibold text-divar-red flex items-center gap-1 hover:gap-2 transition-all"
        >
          {action} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
