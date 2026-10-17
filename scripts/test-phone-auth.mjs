import { spawn } from 'child_process'
import { randomUUID } from 'crypto'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9334
const TARGET = 'https://peyjoo.com/'

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function wsRpc(wsUrl) {
  const socket = new WebSocket(wsUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', (ev) => reject(ev.error || new Error('ws error')), { once: true })
  })
  let next = 1
  const pending = new Map()
  socket.addEventListener('message', (event) => {
    const msg = JSON.parse(String(event.data))
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(new Error(msg.error.message))
      else resolve(msg.result)
    }
  })
  async function send(method, params = {}) {
    const id = next++
    socket.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject })
      setTimeout(() => reject(new Error(`timeout ${method}`)), 25000)
    })
  }
  return { send, close: () => socket.close() }
}

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${process.env.TEMP}\\peyjoo-chrome-${randomUUID()}`,
  TARGET,
], { stdio: 'ignore' })

try {
  let page
  for (let i = 0; i < 20; i++) {
    await sleep(400)
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
      page = list.find((t) => t.type === 'page')
      if (page?.webSocketDebuggerUrl) break
    } catch {
      /* wait */
    }
  }
  if (!page?.webSocketDebuggerUrl) throw new Error('Chrome debug page not ready')

  const { send, close } = await wsRpc(page.webSocketDebuggerUrl)
  await send('Runtime.enable')
  await send('Page.enable')
  await send('Page.navigate', { url: TARGET })
  await sleep(3500)

  const result = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(() => {
      const clickLogin = () => {
        const nodes = [...document.querySelectorAll('button, a, [role="button"]')]
        const btn = nodes.find((el) => /Post Ad|ثبت آگهی|ورود|Sign in/i.test((el.textContent || '').trim()))
        btn?.click()
        return Boolean(btn)
      }
      return new Promise(async (resolve) => {
        const opened = clickLogin()
        await new Promise((r) => setTimeout(r, 800))
        if (!opened) {
          const again = clickLogin()
          await new Promise((r) => setTimeout(r, 800))
          if (!again) resolve({ ok: false, error: 'login button not found', html: document.body.innerText.slice(0, 400) })
        }
        const phone = document.querySelector('#auth-phone')
        const recaptcha = document.querySelector('#peyjoo-recaptcha')
        if (!phone) {
          resolve({
            ok: false,
            error: 'auth phone input missing',
            text: document.body.innerText.slice(0, 500),
            recaptcha: Boolean(recaptcha),
          })
          return
        }
        const native = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
        native.call(phone, '6045550199')
        phone.dispatchEvent(new Event('input', { bubbles: true }))
        const form = phone.closest('form')
        form?.requestSubmit?.() || form?.querySelector('[type=submit]')?.click()
        await new Promise((r) => setTimeout(r, 6000))
        const err = document.querySelector('.auth-pro-error')
        resolve({
          ok: true,
          recaptcha: Boolean(document.querySelector('#peyjoo-recaptcha')),
          codeStep: Boolean(document.querySelector('#auth-otp')),
          error: err ? err.textContent.trim() : '',
          phoneValue: phone.value,
        })
      })
    })()`,
  })

  console.log(JSON.stringify(result.result?.value || result, null, 2))
  close()
} catch (err) {
  console.error('E2E FAIL:', err.message)
  process.exitCode = 1
} finally {
  chrome.kill()
}
