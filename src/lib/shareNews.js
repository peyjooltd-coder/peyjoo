/** News post share helpers (Instagram-style destinations). */

export function newsAppUrl(postId) {
  const url = new URL(window.location.href)
  url.searchParams.set('news', String(postId))
  url.hash = ''
  return url.toString()
}

export function newsShareUrl(postId) {
  return `${window.location.origin}/?news=${encodeURIComponent(postId)}`
}

export function newsShareText(post, lang = 'fa') {
  const title = lang === 'fa' ? post.titleFa : post.titleEn
  const body = lang === 'fa' ? post.bodyFa : post.bodyEn
  const author = lang === 'fa' ? post.authorFa : post.authorEn
  const site = lang === 'fa' ? 'پی‌جو ونکوور · خبر' : 'PeyJoo Vancouver · News'
  return `${title}\n\n${body}\n\n— ${author}\n${site}`.slice(0, 1200)
}

export function newsSharePayload(post, lang = 'fa') {
  const url = newsShareUrl(post.id)
  const text = newsShareText(post, lang)
  const title = (lang === 'fa' ? post.titleFa : post.titleEn) || (lang === 'fa' ? 'خبر پی‌جو' : 'PeyJoo news')
  return { title, text, url, full: `${text}\n${url}` }
}

export async function shareNewsViaSystem(post, lang = 'fa') {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unsupported'
  }
  const { title, text, url } = newsSharePayload(post, lang)
  try {
    await navigator.share({ title, text, url })
    return 'shared'
  } catch (e) {
    if (e?.name === 'AbortError') return 'aborted'
    throw e
  }
}

export function openFacebookShare(url) {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    '_blank',
    'noopener,noreferrer',
  )
}
