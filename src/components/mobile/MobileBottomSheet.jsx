import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function MobileBottomSheet({ open, title, onClose, children }) {
  if (!open) return null

  return createPortal(
    <div className="mobile-sheet-overlay" onClick={onClose} role="presentation">
      <div
        className="mobile-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="mobile-sheet-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} className="home-icon-btn" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="mobile-sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
