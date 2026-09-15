const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/auth`
const JSON_HEADERS = { 'Content-Type': 'application/json' }

const TOKEN_KEY = 'todo_token'
const EMAIL_KEY = 'todo_email'
const MODE_KEY = 'todo_mode' // 'server' | 'guest'

async function postJson(path, body) {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    const message = Array.isArray(errBody) ? errBody.join(' ') : (typeof errBody === 'string' ? errBody : null)
    throw new Error(message || 'Authentication failed')
  }
  return res.json()
}

function setServerSession({ token, email }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EMAIL_KEY, email)
  localStorage.setItem(MODE_KEY, 'server')
  return { mode: 'server', email }
}

export async function register(email, password) {
  return setServerSession(await postJson('register', { email, password }))
}

export async function login(email, password) {
  return setServerSession(await postJson('login', { email, password }))
}

export async function loginWithGoogle(idToken) {
  return setServerSession(await postJson('google', { idToken }))
}

export async function loginWithApple(identityToken) {
  return setServerSession(await postJson('apple', { identityToken }))
}

export function continueAsGuest() {
  localStorage.setItem(MODE_KEY, 'guest')
  return { mode: 'guest', email: 'Guest' }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
  localStorage.removeItem(MODE_KEY)
}

export function getMode() {
  return localStorage.getItem(MODE_KEY)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getSession() {
  const mode = getMode()
  if (mode === 'guest') return { mode: 'guest', email: 'Guest' }
  if (mode === 'server' && getToken()) return { mode: 'server', email: localStorage.getItem(EMAIL_KEY) }
  return null
}
