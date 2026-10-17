import { getToken } from '../api/client'

export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(blob)
  })
}

function parseUploadPayload(raw, status) {
  let data = {}
  try {
    data = typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw || {})
  } catch {
    data = {}
  }
  if (status < 200 || status >= 300) {
    throw new Error(typeof data.error === 'string' ? data.error : 'آپلود ناموفق بود')
  }
  if (!data.url) throw new Error('آپلود ناموفق بود')
  return data.url
}

function xhrPost({ url, headers = {}, body, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    Object.entries(headers).forEach(([key, value]) => {
      if (value != null) xhr.setRequestHeader(key, value)
    })
    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable || !event.total) return
        const pct = Math.round((event.loaded / event.total) * 100)
        onProgress(Math.min(100, Math.max(0, pct)))
      }
    }
    xhr.onload = () => {
      try {
        resolve(parseUploadPayload(xhr.responseText, xhr.status))
      } catch (err) {
        reject(err)
      }
    }
    xhr.onerror = () => reject(new Error('آپلود ناموفق بود'))
    xhr.onabort = () => reject(new Error('آپلود لغو شد'))
    xhr.send(body)
  })
}

async function uploadDataUrlViaApi(dataUrl, folder, onProgress) {
  const token = getToken()
  if (!token) throw new Error('ابتدا وارد شوید')
  onProgress?.(8)
  return xhrPost({
    url: '/api/uploads',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dataUrl, folder }),
    onProgress,
  })
}

async function uploadBlobViaApi(fileOrBlob, folder, onProgress) {
  const token = getToken()
  if (!token) throw new Error('ابتدا وارد شوید')
  const type = fileOrBlob.type || 'application/octet-stream'
  onProgress?.(2)
  return xhrPost({
    url: `/api/uploads/binary?folder=${encodeURIComponent(folder)}`,
    headers: {
      'Content-Type': type,
      Authorization: `Bearer ${token}`,
    },
    body: fileOrBlob,
    onProgress,
  })
}

/** Same-origin upload to Peyjoo /uploads (no Firebase Storage / anonymous auth). */
export async function uploadToFirebase(fileOrBlob, folder = 'uploads', options = {}) {
  const onProgress = typeof options === 'function' ? options : options?.onProgress
  if (!fileOrBlob) throw new Error('فایل نامعتبر است')
  if (typeof fileOrBlob === 'string') {
    if (fileOrBlob.startsWith('data:')) return uploadDataUrlViaApi(fileOrBlob, folder, onProgress)
    throw new Error('فایل نامعتبر است')
  }
  if (fileOrBlob.type?.startsWith('image/')) {
    onProgress?.(5)
    const dataUrl = await blobToDataUrl(fileOrBlob)
    onProgress?.(15)
    return uploadDataUrlViaApi(dataUrl, folder, (p) => {
      onProgress?.(15 + Math.round((p / 100) * 85))
    })
  }
  return uploadBlobViaApi(fileOrBlob, folder, onProgress)
}

export async function uploadDataUrlToFirebase(dataUrl, folder = 'uploads', options = {}) {
  return uploadToFirebase(dataUrl, folder, options)
}

/** Upload to Peyjoo storage; if not logged in, keep the local data URL. */
export async function uploadOrKeep(localUrl, folder = 'uploads', options = {}) {
  if (!localUrl || typeof localUrl !== 'string') return localUrl
  if (!localUrl.startsWith('data:') && !localUrl.startsWith('blob:')) return localUrl
  try {
    return await uploadDataUrlToFirebase(localUrl, folder, options)
  } catch {
    return localUrl
  }
}
