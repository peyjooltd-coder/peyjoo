/** Default profile image until the user uploads their own photo. */
export const PEJO_DEFAULT_AVATAR = '/logo.jpeg?v=6'

export function resolveUserAvatar(url) {
  const src = String(url || '').trim()
  if (!src) return PEJO_DEFAULT_AVATAR
  if (/pravatar\.cc/i.test(src)) return PEJO_DEFAULT_AVATAR
  return src
}
