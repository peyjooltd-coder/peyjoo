import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import { I18nProvider } from './context/I18nContext'
import { initIosSafari } from './lib/iosSafari'
import { initFirebase } from './lib/firebase'
import App from './App'
import './index.css'

const legalPath = window.location.pathname.replace(/\/$/, '')
if (['/privacy', '/terms', '/guidelines', '/support', '/delete-account'].includes(legalPath)) {
  window.location.replace(`${legalPath}/`)
}

initIosSafari()
initFirebase()

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  try {
    if (sessionStorage.getItem('pejo_chunk_reload') === '1') return
    sessionStorage.setItem('pejo_chunk_reload', '1')
  } catch {
    /* ignore */
  }
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </I18nProvider>
  </StrictMode>,
)
