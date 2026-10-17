import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiTarget = process.env.VITE_DEV_API_TARGET || 'http://127.0.0.1:13001'
const webPort = Number(process.env.VITE_DEV_PORT || process.env.VITE_PREVIEW_PORT) || 15173

function missingAsset404() {
  return {
    name: 'missing-asset-404',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url || '').split('?')[0])
        if (!url.startsWith('/assets/') || !/\.(js|css|map)$/.test(url)) return next()
        const file = path.join(process.cwd(), 'dist', url)
        if (fs.existsSync(file)) return next()
        res.statusCode = 404
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end('Not found')
      })
    },
  }
}

/** Serve legal folder pages without trailing slash (Google Play URL checks). */
function legalPagesRedirect() {
  const legal = new Set([
    '/privacy',
    '/terms',
    '/guidelines',
    '/support',
    '/delete-account',
  ])
  return {
    name: 'legal-pages-redirect',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = decodeURIComponent((req.url || '').split('?')[0])
        if (!legal.has(raw)) return next()
        const indexFile = path.join(process.cwd(), 'dist', raw.slice(1), 'index.html')
        if (!fs.existsSync(indexFile)) return next()
        res.statusCode = 301
        res.setHeader('Location', `${raw}/`)
        res.setHeader('Cache-Control', 'no-store')
        res.end()
      })
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = decodeURIComponent((req.url || '').split('?')[0])
        if (!legal.has(raw)) return next()
        res.statusCode = 301
        res.setHeader('Location', `${raw}/`)
        res.setHeader('Cache-Control', 'no-store')
        res.end()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), legalPagesRedirect(), missingAsset404()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('leaflet') || id.includes('maplibre')) return 'maps'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react-dom') || id.includes('/react/')) return 'react'
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: webPort,
    strictPort: true,
    allowedHosts: ['peyjoo.com', 'www.peyjoo.com', '.peyjoo.com'],
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: webPort,
    strictPort: true,
    allowedHosts: ['peyjoo.com', 'www.peyjoo.com', '.peyjoo.com'],
    headers: {
      'Cache-Control': 'no-cache',
    },
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
