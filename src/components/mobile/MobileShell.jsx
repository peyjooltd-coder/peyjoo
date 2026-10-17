import MobileBottomNav from './MobileBottomNav'
import PejoAssistant from '../PejoAssistant'
import { useApp } from '../../context/AppContext'

export default function MobileShell({ children, hideNav = false }) {
  const { view, activeChatId } = useApp()
  const immersive = (view === 'chat' && !!activeChatId) || view === 'detail'

  return (
    <div className="mobile-app-frame hd-surface">
      <div className="mobile-device ios-safe-shell">
        <div
          className={[
            'mobile-screen',
            hideNav ? '' : 'mobile-screen-with-nav',
            immersive ? 'mobile-screen-immersive' : '',
          ].filter(Boolean).join(' ')}
        >
          {children}
        </div>
        {!hideNav && <MobileBottomNav />}
        {view === 'home' && <PejoAssistant />}
      </div>
    </div>
  )
}
