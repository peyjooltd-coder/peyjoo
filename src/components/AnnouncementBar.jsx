import { X, Radio } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)
  const { setView } = useApp()

  if (!visible) return null

  return (
    <div className="bg-divar-yellow-soft border-b border-divar-yellow/50 text-divar-text text-xs sm:text-sm">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-2 flex items-center gap-2 relative min-h-[40px]">
        <Radio className="w-4 h-4 text-divar-orange shrink-0 hidden sm:block" />
        <p className="flex-1 text-center sm:text-left pr-8 leading-snug">
          <strong>Pulse™</strong> — no chat.{' '}
          <button type="button" onClick={() => setView('pulse')} className="text-divar-red font-bold">
            Try →
          </button>
        </p>
        <button type="button" onClick={() => setVisible(false)} className="absolute right-2 sm:right-4 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
