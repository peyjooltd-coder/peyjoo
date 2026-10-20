import MobileBottomNav from './MobileBottomNav'
import PejoAssistant from '../PejoAssistant'
import { useApp } from '../../context/AppContext'

export default function MobileShell({ children, hideNav = false }) {
  const { view, activeChatId, showPostModal, authGateOpen } = useApp()
  const immersive = (view === 'chat' && !!activeChatId) || view === 'detail'
  const showAssistant =
    view === 'home'
    && !showPostModal
    && !authGateOpen
    && !activeChatId

  return (
    <div className="mobile-app-frame hd-surface hd-app tablet-app-frame">
      <div className="mobile-device ios-safe-shell tablet-device">
        <div
          className={[
            'mobile-screen',
            'tablet-screen',
            hideNav ? '' : 'mobile-screen-with-nav',
            hideNav ? '' : 'tablet-screen-with-nav',
            immersive ? 'mobile-screen-immersive' : '',
          ].filter(Boolean).join(' ')}
        >
          <div className="tablet-content">
            {children}
          </div>
        </div>
        {!hideNav && <MobileBottomNav />}
        {showAssistant && <PejoAssistant />}
      </div>
    </div>
  )
}
