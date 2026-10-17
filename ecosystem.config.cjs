/**
 * PM2 — اجرای دائم در پس‌زمینه + ری‌استارت خودکار
 * آدرس عمومی: https://peyjoo.com
 * آدرس مستقیم: http://142.44.160.190:15173
 *
 * شروع:  npm run bg:start
 * توقف:   npm run bg:stop
 * لاگ:    npm run bg:logs
 * نصب استارتاپ ویندوز: npm run bg:install-startup
 */

const path = require('path')
const fs = require('fs')

const root = __dirname
const apiTarget = 'http://127.0.0.1:13001'

/** Load server/.env into PM2 process env */
function loadServerEnv() {
  const envPath = path.join(root, 'server', '.env')
  const out = { NODE_ENV: 'production', HOST: '0.0.0.0', PORT: 13001 }
  if (!fs.existsSync(envPath)) return out
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const key = t.slice(0, i).trim()
    const val = t.slice(i + 1).trim()
    out[key] = val
  }
  return out
}

const serverEnv = loadServerEnv()

const keepAlive = {
  autorestart: true,
  max_restarts: 100,
  min_uptime: '10s',
  exp_backoff_restart_delay: 1000,
  kill_timeout: 5000,
  max_memory_restart: '800M',
}

module.exports = {
  apps: [
    {
      name: 'divar-api',
      cwd: path.join(root, 'server'),
      script: 'src/index.js',
      interpreter: 'node',
      watch: false,
      ...keepAlive,
      env: serverEnv,
    },
    {
      name: 'divar-web',
      cwd: root,
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --host 0.0.0.0 --port 15173',
      interpreter: 'node',
      watch: false,
      ...keepAlive,
      env: {
        VITE_DEV_API_TARGET: apiTarget,
        VITE_PREVIEW_PORT: '15173',
      },
    },
    {
      name: 'peyjoo-django',
      cwd: path.join(root, 'django_backend'),
      script: path.join(root, 'django_backend', '.venv', 'Scripts', 'python.exe'),
      args: 'manage.py runserver 127.0.0.1:8000 --noreload',
      interpreter: 'none',
      watch: false,
      ...keepAlive,
      env: {
        DJANGO_DEBUG: '0',
        DJANGO_SETTINGS_MODULE: 'peyjoo.settings',
      },
    },
    // rebuild watcher disabled in production — it crash-looped and broke hashed assets
  ],
}
