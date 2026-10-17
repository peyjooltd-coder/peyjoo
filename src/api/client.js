function resolveApiBase() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL

  // Dev (Vite) and production (nginx / vite preview) both proxy /api on the same origin.
  return '/api'
}

const API_BASE = resolveApiBase()

const TOKEN_KEY = 'divar_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = typeof data.error === 'string' ? data.error : data.error?.message || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data
}

export const apiClient = {
  health: () => api('/health', { auth: false }),

  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  checkPhone: (phone) => api('/auth/check-phone', { method: 'POST', body: { phone }, auth: false }),

  sendOtp: (phone) => api('/auth/check-phone', { method: 'POST', body: { phone }, auth: false }),

  loginWithFirebase: (idToken, profile = {}) => api('/auth/firebase', {
    method: 'POST',
    body: {
      idToken,
      name: profile.name,
      username: profile.username,
    },
    auth: false,
  }),

  verifyOtp: (phone, code, profile = {}) => api('/auth/verify-otp', {
    method: 'POST',
    body: {
      phone,
      code,
      name: profile.name,
      username: profile.username,
    },
    auth: false,
  }),

  register: (payload) => api('/auth/register', { method: 'POST', body: payload, auth: false }),

  logout: () => api('/auth/logout', { method: 'POST' }),

  deleteAccount: () => api('/auth/account', { method: 'DELETE' }),

  me: () => api('/auth/me'),

  updateProfile: (payload) => api('/auth/me', { method: 'PATCH', body: payload }),

  sendEmailOtp: (email) => api('/auth/email/send-otp', { method: 'POST', body: { email } }),

  verifyEmailOtp: (email, code) => api('/auth/email/verify-otp', {
    method: 'POST',
    body: { email, code },
  }),

  getListings: () => api('/listings'),

  getListing: (id) => api(`/listings/${id}`),

  createListing: (payload) => api('/listings', { method: 'POST', body: payload }),

  approveListing: (id, adminSecret) => api(`/listings/${id}/approve`, {
    method: 'POST',
    body: { adminSecret },
  }),
  updateListing: (id, payload) => api(`/listings/${id}`, { method: 'PATCH', body: payload }),

  deleteListing: (id) => api(`/listings/${id}`, { method: 'DELETE' }),

  reportListing: (id, payload) => api(`/listings/${id}/report`, { method: 'POST', body: payload }),

  getMyListings: () => api('/user/listings'),

  toggleSaved: (listingId) => api(`/user/saved/${listingId}/toggle`, { method: 'POST' }),

  getSaved: () => api('/user/saved'),

  toggleCompare: (listingId) => api(`/user/compare/${listingId}/toggle`, { method: 'POST' }),

  getCompare: () => api('/user/compare'),

  getAlerts: () => api('/user/alerts'),

  createAlert: (query, region) => api('/user/alerts', { method: 'POST', body: { query, region } }),

  deleteAlert: (id) => api(`/user/alerts/${id}`, { method: 'DELETE' }),

  getChatThreads: () => api('/chat/threads'),

  startChat: (listingId, message) => api('/chat/threads', { method: 'POST', body: { listingId, message } }),

  sendMessage: (threadId, text) => api(`/chat/threads/${threadId}/messages`, { method: 'POST', body: { text } }),

  markChatRead: (threadId) => api(`/chat/threads/${threadId}/read`, { method: 'PATCH' }),

  getDemandPulse: () => api('/pulse/demand', { auth: false }),

  getWantSignals: () => api('/pulse/wants', { auth: false }),

  createWantSignal: (payload) => api('/pulse/wants', { method: 'POST', body: payload }),

  getPulseMatches: () => api('/pulse/matches', { auth: false }),

  getHandshakes: () => api('/pulse/handshakes'),

  createHandshake: (payload) => api('/pulse/handshakes', { method: 'POST', body: payload }),

  getBootstrap: () => api('/meta/bootstrap', { auth: false }),

  getDatingNearby: (lat, lng, radiusKm = 5) =>
    api(`/dating/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`, { auth: true }),

  getDatingOnline: (lat, lng) =>
    api(`/dating/online?lat=${lat}&lng=${lng}`, { auth: true }),

  datingHeartbeat: (lat, lng) =>
    api('/dating/heartbeat', { method: 'POST', body: { lat, lng } }),

  getDatingProfile: () => api('/dating/me'),

  saveDatingProfile: (payload) => api('/dating/me', { method: 'PUT', body: payload }),

  blockDatingUser: (userId) =>
    api('/dating/block', { method: 'POST', body: { userId } }),

  likeDatingUser: (userId) =>
    api('/dating/like', { method: 'POST', body: { userId } }),

  passDatingUser: (userId) =>
    api('/dating/pass', { method: 'POST', body: { userId } }),

  getDatingMatches: () => api('/dating/matches'),

  getDatingLikedMe: () => api('/dating/liked-me'),

  getDatingSecretCrush: () => api('/dating/secret-crush'),

  saveDatingSecretCrush: (userIds) =>
    api('/dating/secret-crush', { method: 'PUT', body: { userIds } }),

  messageDatingUser: (userId, message) =>
    api('/dating/message', { method: 'POST', body: { userId, message } }),

  getDatingThreads: () => api('/dating/threads'),

  sendDatingMessage: (threadId, text) =>
    api(`/dating/threads/${threadId}/messages`, { method: 'POST', body: { text } }),

  markDatingThreadRead: (threadId) =>
    api(`/dating/threads/${threadId}/read`, { method: 'PATCH' }),

  getNewsFeed: () => api('/news/feed', { auth: false }),

  getHamyariFeed: (category = '') =>
    api(`/hamyari/feed?category=${encodeURIComponent(category || '')}`, { auth: true }),

  createHamyariPost: (payload) =>
    api('/hamyari/posts', { method: 'POST', body: payload }),

  updateHamyariPost: (postId, payload) =>
    api(`/hamyari/posts/${postId}`, { method: 'PATCH', body: payload }),

  deleteHamyariPost: (postId) =>
    api(`/hamyari/posts/${postId}`, { method: 'DELETE' }),

  getHamyariMyPosts: () => api('/hamyari/me/posts'),

  toggleHamyariLike: (postId) =>
    api(`/hamyari/posts/${postId}/like`, { method: 'POST' }),

  getHamyariComments: (postId) =>
    api(`/hamyari/posts/${postId}/comments`, { auth: true }),

  addHamyariComment: (postId, body) =>
    api(`/hamyari/posts/${postId}/comments`, { method: 'POST', body: { body } }),

  deleteHamyariComment: (commentId) =>
    api(`/hamyari/comments/${commentId}`, { method: 'DELETE' }),

  getHamyariNotifications: () => api('/hamyari/notifications'),

  markHamyariNotificationsRead: () =>
    api('/hamyari/notifications/read', { method: 'PATCH' }),

  getHamyariThreads: () => api('/hamyari/threads'),

  messageHamyariUser: (userId, message) =>
    api('/hamyari/message', { method: 'POST', body: { userId, message } }),

  sendHamyariMessage: (threadId, text) =>
    api(`/hamyari/threads/${threadId}/messages`, { method: 'POST', body: { text } }),

  markHamyariThreadRead: (threadId) =>
    api(`/hamyari/threads/${threadId}/read`, { method: 'PATCH' }),
}
