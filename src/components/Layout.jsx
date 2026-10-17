import MobileShell from './mobile/MobileShell'
import { useApp } from '../context/AppContext'

export default function Layout({ children }) {
  const { view, activeChatId, isAuthenticated, authGateOpen } = useApp()
  const authViews = view === 'profile' || view === 'my-ads' || view === 'chat' || view === 'saved'
  const hideNav =
    authGateOpen
    || view === 'detail'
    || view === 'dating'
    || view === 'hamyari'
    || (view === 'chat' && !!activeChatId)
    || (!isAuthenticated && authViews)

  return (
    <MobileShell hideNav={hideNav}>
      {children}
    </MobileShell>
  )
}
