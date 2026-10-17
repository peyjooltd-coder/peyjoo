/** Resolve Apple Color Emoji PNG URL from a Unicode emoji string. */

const APPLE_EMOJI_CDN =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64'

/** Strip VS16 and join codepoints as emoji-datasource filename. */
export function emojiToAppleCodepoint(emoji) {
  if (!emoji || typeof emoji !== 'string') return null
  const parts = []
  for (const ch of emoji) {
    const cp = ch.codePointAt(0)
    if (cp == null || cp === 0xfe0f) continue // variation selector
    if (cp === 0x200d) {
      parts.push('200d')
      continue
    }
    parts.push(cp.toString(16))
  }
  return parts.length ? parts.join('-') : null
}

export function appleEmojiSrc(emoji) {
  const cp = emojiToAppleCodepoint(emoji)
  return cp ? `${APPLE_EMOJI_CDN}/${cp}.png` : null
}
