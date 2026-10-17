/**
 * با هر تغییر در سورس فرانت، build می‌زند تا preview همان dist جدید را سرو کند.
 */
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
let building = false
let queued = false

function runBuild() {
  if (building) {
    queued = true
    return
  }
  building = true
  const t = new Date().toLocaleTimeString('fa-IR')
  console.log(`[divar-rebuild] ${t} — در حال build…`)

  const child = spawn('npm', ['run', 'build'], {
    cwd: root,
    shell: true,
    stdio: 'inherit',
  })

  child.on('exit', (code) => {
    building = false
    if (code === 0) {
      console.log(`[divar-rebuild] ${new Date().toLocaleTimeString('fa-IR')} — build موفق ✓`)
    } else {
      console.error(`[divar-rebuild] build خطا (code ${code})`)
    }
    if (queued) {
      queued = false
      runBuild()
    }
  })
}

console.log('[divar-rebuild] آماده — با هر تغییر، build اجرا می‌شود')
runBuild()
// PM2 با watch این پروسه را دوباره اجرا می‌کند → build تازه → divar-web از dist جدید سرو می‌کند
