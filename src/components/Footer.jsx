import { Shield, Radio, HelpCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'

const links = {
  Marketplace: ['Browse ads', 'Post ad', 'Pulse™', 'Pro Hub'],
  Support: ['Help center', 'Safety tips', 'Report abuse', 'Contact us'],
  Legal: ['Terms of use', 'Privacy policy', 'Cookie settings'],
}

export default function Footer() {
  const { setView, setShowPostModal } = useApp()
  const { lang } = useI18n()

  return (
    <footer className="mt-16 border-t border-divar-border bg-divar-surface">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.jpeg?v=5" alt="PeyJoo" className="w-10 h-10 rounded-lg object-cover shadow-sm bg-white" />
              <div>
                <p className="font-bold text-divar-text">{lang === 'fa' ? 'پی جو · PeyJoo' : 'PeyJoo'}</p>
                <p className="text-[11px] text-divar-muted">{lang === 'fa' ? 'دیوار ونکوور · Greater Vancouver' : 'Divar Vancouver · Greater Vancouver'}</p>
              </div>
            </div>
            <p className="text-sm text-divar-text-secondary leading-relaxed max-w-xs">
              The trusted local marketplace for buying, selling, and growing your business in Metro Vancouver.
            </p>
            <div className="flex gap-3 mt-5">
              {[Shield, Radio, HelpCircle].map((Icon, i) => (
                <span key={i} className="w-9 h-9 rounded-lg bg-divar-bg flex items-center justify-center text-divar-red">
                  <Icon className="w-4 h-4" />
                </span>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <p className="text-xs font-bold text-divar-text uppercase tracking-wider mb-3">{title}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => {
                        if (item === 'Browse ads') setView('explore')
                        else if (item === 'Post ad') setShowPostModal(true)
                        else if (item === 'Pulse™') setView('pulse')
                        else if (item === 'Pro Hub') setView('pro')
                      }}
                      className="text-sm text-divar-text-secondary hover:text-divar-red transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-divar-border-light flex flex-col sm:flex-row justify-between gap-2 text-xs text-divar-muted">
          <span>{lang === 'fa' ? '© 2026 پی جو (PeyJoo) · دیوار ونکوور' : '© 2026 PeyJoo · Divar Vancouver'}</span>
          <span>English · CAD · sRGB colors</span>
        </div>
      </div>
    </footer>
  )
}
