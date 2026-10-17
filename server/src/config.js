import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST || '0.0.0.0',
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '../data/divar.db'),
  uploadsPath: process.env.UPLOADS_PATH || path.join(__dirname, '../data/uploads'),
  uploadsUrlPrefix: process.env.UPLOADS_URL_PREFIX || '/uploads',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  demoEmail: process.env.DEMO_EMAIL || 'ali.rezaei@divarvancouver.ca',
  demoPassword: process.env.DEMO_PASSWORD || '12345',
  otpCode: process.env.OTP_CODE || '12345',
  adminSecret: process.env.ADMIN_SECRET || process.env.OTP_CODE || 'pejo-admin',
  isProd: process.env.NODE_ENV === 'production',
  publicWebUrl: process.env.PUBLIC_WEB_URL || '',
  firebaseWebApiKey: process.env.FIREBASE_WEB_API_KEY || '',
}
