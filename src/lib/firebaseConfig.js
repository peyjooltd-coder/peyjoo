/**
 * Firebase web app: peyjooweb (project peyjoo)
 * Authorized domains must include peyjoo.com and www.peyjoo.com.
 * Never put Service Account / Admin credentials in the frontend.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBAXlmLiNvdLRNlUqwUXQBMea05MVs9z64',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'peyjoo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'peyjoo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'peyjoo.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '496674335571',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:496674335571:web:dbc25d7a852295bf9b4fa6',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
)
