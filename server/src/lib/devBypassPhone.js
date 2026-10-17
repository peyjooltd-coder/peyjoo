/** Numbers that skip Firebase SMS. Default OTP is 1234. */
export const BYPASS_PHONES = ['09192047834', '09192047833', '6040000000']
export const BYPASS_PHONE = BYPASS_PHONES[0]
export const BYPASS_OTP = '1234'

/** Google Play review account — Canadian +1 604 000-0000, no OTP step needed. */
export const GOOGLE_REVIEW_PHONE = '6040000000'

function normalizeDigits(raw) {
  let digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('98')) digits = `0${digits.slice(2)}`
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
  return digits
}

export function isBypassPhone(raw) {
  const normalized = normalizeDigits(raw)
  if (!normalized) return false
  return BYPASS_PHONES.some((phone) => {
    const core = phone.replace(/^0/, '')
    return (
      normalized === phone
      || normalized === core
      || normalized === `98${core}`
      || normalized === `1${phone}`
    )
  })
}

export function isGoogleReviewPhone(raw) {
  return normalizeDigits(raw) === GOOGLE_REVIEW_PHONE
}

export function canonicalBypassPhone(raw) {
  const normalized = normalizeDigits(raw)
  if (!normalized) return null
  return BYPASS_PHONES.find((phone) => {
    const core = phone.replace(/^0/, '')
    return (
      normalized === phone
      || normalized === core
      || normalized === `98${core}`
      || normalized === `1${phone}`
    )
  }) || null
}
