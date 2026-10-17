import { RecaptchaVerifier, initializeRecaptchaConfig, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from './firebase'

export const RECAPTCHA_CONTAINER_ID = 'peyjoo-recaptcha'

let recaptchaVerifier = null
let confirmationResult = null
let sendingOtp = false

const ERRORS = {
  fa: {
    'auth/invalid-phone-number': 'شماره موبایل نامعتبر است. شماره ۱۰ رقمی کانادا را وارد کنید.',
    'auth/missing-phone-number': 'شماره موبایل را وارد کنید.',
    'auth/quota-exceeded': 'سقف ارسال پیامک پر شده است. بعداً دوباره تلاش کنید.',
    'auth/too-many-requests': 'تعداد تلاش‌ها زیاد است. کمی صبر کنید و دوباره بزنید.',
    'auth/captcha-check-failed': 'تأیید امنیتی ناموفق بود. صفحه را رفرش کنید.',
    'auth/invalid-app-credential': 'تنظیمات ورود موبایل در فایربیس کامل نیست.',
    'auth/operation-not-allowed': 'ورود با موبایل در کنسول فایربیس فعال نشده است.',
    'auth/billing-not-enabled': 'پیامک فایربیس خاموش است. در کنسول فایربیس پلن Blaze را روشن کنید.',
    'auth/unauthorized-domain': 'دامنه peyjoo.com در Authorized domains فایربیس ثبت نشده است.',
    'auth/invalid-verification-code': 'کد تأیید اشتباه است.',
    'auth/invalid-verification-id': 'کد منقضی شده است. دوباره کد بگیرید.',
    'auth/code-expired': 'کد منقضی شده است. دوباره کد بگیرید.',
    'auth/missing-verification-code': 'کد تأیید را وارد کنید.',
    'auth/missing-confirmation': 'ابتدا شماره را وارد کنید تا کد ارسال شود.',
    'auth/session-expired': 'نشست منقضی شد. دوباره کد بگیرید.',
    'auth/network-request-failed': 'اتصال اینترنت برقرار نشد. دوباره تلاش کنید.',
    'auth/argument-error': 'reCAPTCHA آماده نشد. صفحه را رفرش کنید.',
  },
  en: {
    'auth/invalid-phone-number': 'Invalid number. Enter a 10-digit Canadian mobile.',
    'auth/missing-phone-number': 'Enter your mobile number.',
    'auth/quota-exceeded': 'SMS quota exceeded. Try again later.',
    'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
    'auth/captcha-check-failed': 'Security check failed. Refresh the page.',
    'auth/invalid-app-credential': 'Phone auth is not fully configured in Firebase.',
    'auth/operation-not-allowed': 'Phone authentication is disabled in Firebase.',
    'auth/billing-not-enabled': 'Firebase SMS is off until the project is upgraded to Blaze.',
    'auth/unauthorized-domain': 'Add peyjoo.com to Firebase Authorized domains.',
    'auth/invalid-verification-code': 'The verification code is incorrect.',
    'auth/invalid-verification-id': 'The code expired. Request a new one.',
    'auth/code-expired': 'The code expired. Request a new one.',
    'auth/missing-verification-code': 'Enter the verification code.',
    'auth/missing-confirmation': 'Request a code first.',
    'auth/session-expired': 'Session expired. Request a new code.',
    'auth/network-request-failed': 'Network error. Try again.',
    'auth/argument-error': 'reCAPTCHA failed to start. Refresh the page.',
  },
}

export function mapPhoneAuthError(err, lang = 'en') {
  const server = err?.customData?._serverResponse
  const serverMsg = typeof server === 'string'
    ? server
    : (server?.error?.message || server?.message || '')
  const raw = `${err?.code || ''} ${err?.message || ''} ${serverMsg}`.toLowerCase()
  let code = err?.code || ''
  if (raw.includes('billing-not-enabled') || raw.includes('billing_not_enabled')) {
    code = 'auth/billing-not-enabled'
  }
  const table = ERRORS[lang] || ERRORS.fa
  const message = table[code] || err?.message || table['auth/invalid-verification-code']
  const mapped = new Error(message)
  mapped.code = code
  return mapped
}

/** Canadian 10-digit number → +1XXXXXXXXXX */
export function toE164Plus1(raw) {
  let digits = String(raw || '').replace(/\D/g, '')
  if (digits.startsWith('09') || digits.startsWith('98')) {
    const err = new Error()
    err.code = 'auth/invalid-phone-number'
    throw err
  }
  if (digits.startsWith('1')) digits = digits.slice(1)
  if (digits.length !== 10) {
    const err = new Error()
    err.code = 'auth/invalid-phone-number'
    throw err
  }
  return `+1${digits}`
}

function getAuthOrThrow() {
  if (!auth) {
    const err = new Error()
    err.code = 'auth/invalid-app-credential'
    throw err
  }
  return auth
}

function ensureRecaptchaContainer() {
  let container = document.getElementById(RECAPTCHA_CONTAINER_ID)
  if (!container) {
    container = document.createElement('div')
    container.id = RECAPTCHA_CONTAINER_ID
    container.className = 'auth-recaptcha'
  }
  // Keep it on document.body. React must not own this node — unmounting it
  // while the image challenge is open throws "reading 'style'" in recaptcha.
  if (container.parentElement !== document.body) document.body.appendChild(container)
  return container
}

/** Reset the widget in place. clear() removes the node Google is still animating. */
function safeResetWidget() {
  const widget = recaptchaVerifier?.recaptcha
  if (!widget || typeof widget.reset !== 'function') return
  try {
    widget.reset()
  } catch {
    /* challenge already closed */
  }
}

let recaptchaConfigPromise = null

function prepareRecaptchaConfig(firebaseAuth) {
  if (!recaptchaConfigPromise) {
    recaptchaConfigPromise = initializeRecaptchaConfig(firebaseAuth).catch((err) => {
      recaptchaConfigPromise = null
      throw err
    })
  }
  return recaptchaConfigPromise
}

/**
 * One RecaptchaVerifier only. Never wipe the container from inside
 * recaptcha callbacks — that throws "Cannot read properties of null (style)".
 */
export function getOrCreateRecaptchaVerifier() {
  const firebaseAuth = getAuthOrThrow()
  if (recaptchaVerifier) return recaptchaVerifier

  if (typeof document === 'undefined') {
    const err = new Error()
    err.code = 'auth/argument-error'
    throw err
  }

  ensureRecaptchaContainer()

  recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, RECAPTCHA_CONTAINER_ID, {
    size: 'invisible',
    callback: () => {
      safeResetWidget()
    },
    'expired-callback': () => {
      safeResetWidget()
    },
    'error-callback': () => {
      safeResetWidget()
    },
  })

  return recaptchaVerifier
}

export function clearRecaptcha() {
  const verifier = recaptchaVerifier
  recaptchaVerifier = null
  if (!verifier) return
  window.setTimeout(() => {
    try {
      verifier.clear()
    } catch {
      /* widget already gone */
    }
  }, 800)
}

export function resetRecaptcha() {
  clearRecaptcha()
}

export function resetPhoneAuth() {
  confirmationResult = null
  safeResetWidget()
}

function shouldResetRecaptcha(code) {
  return code !== 'auth/billing-not-enabled'
    && code !== 'auth/quota-exceeded'
    && code !== 'auth/too-many-requests'
}

export async function sendPhoneOtp(rawPhone, lang = 'en') {
  if (sendingOtp) {
    const err = new Error()
    err.code = 'auth/too-many-requests'
    throw mapPhoneAuthError(err, lang)
  }

  sendingOtp = true
  try {
    const e164 = toE164Plus1(rawPhone)
    const firebaseAuth = getAuthOrThrow()
    try {
      await prepareRecaptchaConfig(firebaseAuth)
    } catch {
      /* v2 challenge still runs if Enterprise config cannot load */
    }
    const verifier = getOrCreateRecaptchaVerifier()
    confirmationResult = await signInWithPhoneNumber(firebaseAuth, e164, verifier)
    return { ok: true, phone: e164 }
  } catch (err) {
    confirmationResult = null
    const mapped = mapPhoneAuthError(err, lang)
    if (shouldResetRecaptcha(mapped.code)) safeResetWidget()
    throw mapped
  } finally {
    sendingOtp = false
  }
}

export async function confirmPhoneOtp(code, lang = 'en') {
  const trimmed = String(code || '').replace(/\D/g, '')
  if (trimmed.length < 6) {
    throw mapPhoneAuthError({ code: 'auth/missing-verification-code' }, lang)
  }
  if (!confirmationResult) {
    throw mapPhoneAuthError({ code: 'auth/missing-confirmation' }, lang)
  }

  try {
    const cred = await confirmationResult.confirm(trimmed)
    const idToken = await cred.user.getIdToken()
    confirmationResult = null
    return {
      user: cred.user,
      idToken,
      phone: cred.user.phoneNumber,
    }
  } catch (err) {
    const codeName = err?.code || ''
    if (codeName === 'auth/invalid-verification-code') {
      throw mapPhoneAuthError(err, lang)
    }
    confirmationResult = null
    safeResetWidget()
    throw mapPhoneAuthError(err, lang)
  }
}
