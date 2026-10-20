import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import fs from 'fs'
import { config } from './config.js'
import { initDatabase } from './db/database.js'
import { migrateInlineListingMedia } from './utils/migrateInlineMedia.js'
import { backfillBilingualListings } from './utils/translate.js'
import { errorHandler, notFound } from './middleware/error.js'
import authRoutes from './routes/auth.js'
import listingsRoutes from './routes/listings.js'
import userRoutes from './routes/user.js'
import chatRoutes from './routes/chat.js'
import datingRoutes from './routes/dating.js'
import hamyariRoutes from './routes/hamyari.js'
import newsRoutes from './routes/news.js'
import shareRoutes from './routes/share.js'
import pulseRoutes from './routes/pulse.js'
import metaRoutes from './routes/meta.js'
import uploadsRoutes from './routes/uploads.js'

initDatabase()

if (!fs.existsSync(config.databasePath)) {
  console.warn('⚠ Database not found. Run: cd server && npm run db:seed')
}

if (!fs.existsSync(config.uploadsPath)) {
  fs.mkdirSync(config.uploadsPath, { recursive: true })
}

try {
  migrateInlineListingMedia()
} catch (err) {
  console.warn('⚠ Media migration skipped:', err.message)
}

setTimeout(() => {
  backfillBilingualListings().catch((err) => {
    console.warn('⚠ Bilingual backfill skipped:', err.message)
  })
}, 2500)

const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(morgan(config.isProd ? 'combined' : 'dev'))
function isAllowedOrigin(origin) {
  if (!origin) return true
  if (config.corsOrigins.includes(origin)) return true
  try {
    const host = new URL(origin).hostname
    return host === 'peyjoo.com' || host.endsWith('.peyjoo.com')
  } catch {
    return false
  }
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin))
    },
    credentials: true,
  })
)
app.use(express.json({ limit: '100mb' }))

app.use(
  config.uploadsUrlPrefix,
  express.static(config.uploadsPath, {
    maxAge: config.isProd ? '7d' : 0,
    fallthrough: true,
  })
)

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'divarvanciver-api',
    env: config.nodeEnv,
    time: new Date().toISOString(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/listings', listingsRoutes)
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/dating', datingRoutes)
app.use('/api/hamyari', hamyariRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/share', shareRoutes)
app.use('/api/pulse', pulseRoutes)
app.use('/api/meta', metaRoutes)
app.use('/api/uploads', uploadsRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(config.port, config.host, () => {
  console.log(`✓ API http://${config.host}:${config.port}`)
  console.log(`  Health: http://localhost:${config.port}/api/health`)
  console.log(`  Uploads: ${config.uploadsPath}`)
})
