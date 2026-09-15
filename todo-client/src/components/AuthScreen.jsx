import { useState, useEffect, useRef } from 'react'
import * as auth from '../services/auth'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI

const scriptCache = {}
function loadScript(src) {
  if (!scriptCache[src]) {
    scriptCache[src] = new Promise((resolve, reject) => {
      const el = document.createElement('script')
      el.src = src
      el.async = true
      el.onload = resolve
      el.onerror = reject
      document.head.appendChild(el)
    })
  }
  return scriptCache[src]
}

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const googleBtnRef = useRef(null)

  const isRegister = mode === 'register'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const session = isRegister
        ? await auth.register(email.trim(), password)
        : await auth.login(email.trim(), password)
      onAuthed(session)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleGuest() {
    onAuthed(auth.continueAsGuest())
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleBtnRef.current) return
    let cancelled = false

    loadScript('https://accounts.google.com/gsi/client')
      .then(() => {
        if (cancelled || !window.google || !googleBtnRef.current) return
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            setError('')
            try {
              onAuthed(await auth.loginWithGoogle(credential))
            } catch (err) {
              setError(err.message)
            }
          },
        })
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 284,
          text: isRegister ? 'signup_with' : 'signin_with',
        })
      })
      .catch(() => {})

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegister])

  async function handleApple() {
    if (!APPLE_CLIENT_ID) return
    setError('')
    try {
      await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js')
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: APPLE_REDIRECT_URI || window.location.origin,
        usePopup: true,
      })
      const res = await window.AppleID.auth.signIn()
      onAuthed(await auth.loginWithApple(res.authorization.id_token))
    } catch (err) {
      setError(err.message || 'Apple sign-in failed')
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="logo">✅ Todoist</span>
        <h1 className="auth-title">{isRegister ? 'Create your account' : 'Welcome back'}</h1>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={8}
            required
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="btn-add" type="submit" disabled={submitting}>
          {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}
        </button>

        <button
          type="button"
          className="auth-switch"
          onClick={() => { setMode(isRegister ? 'login' : 'register'); setError('') }}
        >
          {isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>

        <div className="auth-divider"><span>or continue with</span></div>

        <div className="auth-social">
          {GOOGLE_CLIENT_ID ? (
            <div ref={googleBtnRef} className="google-btn-slot" />
          ) : (
            <button
              type="button"
              className="btn-social"
              disabled
              title="Set VITE_GOOGLE_CLIENT_ID to enable"
            >
              Continue with Google
            </button>
          )}

          <button
            type="button"
            className="btn-social"
            onClick={handleApple}
            disabled={!APPLE_CLIENT_ID}
            title={APPLE_CLIENT_ID ? undefined : 'Set VITE_APPLE_CLIENT_ID to enable'}
          >
            Continue with Apple
          </button>

          <button type="button" className="btn-social btn-guest" onClick={handleGuest}>
            Continue as Guest
          </button>
        </div>

        {(!GOOGLE_CLIENT_ID || !APPLE_CLIENT_ID) && (
          <p className="auth-hint">Social sign-in needs a client ID configured before it works &mdash; see the client README.</p>
        )}
      </form>
    </div>
  )
}
