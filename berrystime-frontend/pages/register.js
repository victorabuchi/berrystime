import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import api from '../lib/api'
import { saveAuth } from '../lib/auth'

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ work_number: '', full_name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', form)
      saveAuth(res.data.token, res.data.worker)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Create account — Rannikon Puutarha</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#fff;color:#1a1a18;-webkit-font-smoothing:antialiased}
        .gh-input{width:100%;padding:5px 12px;font-size:14px;border:1px solid #d0d7de;border-radius:6px;background:#fff;font-family:inherit;color:#1a1a18;transition:border-color 0.15s,box-shadow 0.15s}
        .gh-input:focus{outline:none;border-color:#0969da;box-shadow:0 0 0 3px rgba(9,105,218,0.12)}
        .gh-input-wrap{position:relative}
        .gh-input-wrap .eye-btn{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#888;display:flex;align-items:center;padding:0}
        .gh-btn-green{width:100%;padding:5px 16px;background:#2d6a2d;color:#fff;font-size:14px;font-weight:500;border:1px solid rgba(0,0,0,0.15);border-radius:6px;cursor:pointer;font-family:inherit;transition:background 0.15s}
        .gh-btn-green:hover{background:#235223}
        .gh-btn-green:disabled{background:#94a68e;cursor:not-allowed}
        .gh-btn-outline{width:100%;padding:5px 16px;background:#f6f8fa;color:#1a1a18;font-size:14px;font-weight:500;border:1px solid #d0d7de;border-radius:6px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s}
        .gh-btn-outline:hover{background:#eaeef2}
        .gh-divider{display:flex;align-items:center;gap:12px;margin:12px 0;color:#8c959f;font-size:12px}
        .gh-divider::before,.gh-divider::after{content:'';flex:1;height:1px;background:#d0d7de}
        .gh-footer-link{color:#0969da;font-size:11px;text-decoration:none}
        .gh-footer-link:hover{text-decoration:underline}
        .error-box{background:#fff0f0;border:1px solid #ffc1c0;color:#cf2030;border-radius:6px;padding:8px 12px;font-size:13px;margin-bottom:12px}
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff' }}>

        {/* Logo + Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', marginBottom: '16px' }}>
          <img src="/rannikkopuutarhalogo.png" alt="Rannikon Puutarha" style={{ height: '48px', width: 'auto', marginBottom: '14px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '300', letterSpacing: '-0.3px', color: '#1a1a18' }}>Create your account</h1>
        </div>

        {/* Form card */}
        <div style={{ width: '100%', maxWidth: '340px', border: '1px solid #d0d7de', borderRadius: '6px', padding: '20px', background: '#fff' }}>

          {error && <div className="error-box">{error}</div>}

          <div className="gh-divider" style={{ marginTop: '0', marginBottom: '16px' }}>or</div>

          <button className="gh-btn-outline" style={{ marginBottom: '16px' }} onClick={() => {}}>
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="gh-divider">or register with work number</div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Work number</label>
              <input className="gh-input" style={{ height: '32px' }} type="text" name="work_number" placeholder="e.g. 334" value={form.work_number} onChange={handleChange} required />
              <p style={{ fontSize: '11px', color: '#8c959f', marginTop: '4px' }}>Your unique farm number — cannot be changed later.</p>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Full name</label>
              <input className="gh-input" style={{ height: '32px' }} type="text" name="full_name" placeholder="Your full name" value={form.full_name} onChange={handleChange} required />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Email address</label>
              <input className="gh-input" style={{ height: '32px' }} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Password</label>
              <div className="gh-input-wrap">
                <input
                  className="gh-input"
                  style={{ height: '32px', paddingRight: '36px' }}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(s => !s)}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <button type="submit" className="gh-btn-green" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>

          </form>
        </div>

        {/* Sign in link */}
        <div style={{ width: '100%', maxWidth: '340px', border: '1px solid #d0d7de', borderRadius: '6px', padding: '14px 20px', marginTop: '16px', textAlign: 'center', background: '#fff', fontSize: '14px' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#0969da', fontWeight: '500', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'} onMouseLeave={e => e.target.style.textDecoration = 'none'}>
            Sign in
          </a>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '32px', paddingBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '10px 16px', justifyContent: 'center', maxWidth: '500px' }}>
          {[
            ['Terms', '#'],
            ['Privacy', '#'],
            ['Docs', '#'],
            ['Contact support', '#'],
            ['Manage cookies', '#'],
            ['Do not share personal information', '#'],
          ].map(([l, h]) => (
            <a key={l} href={h} className="gh-footer-link">{l}</a>
          ))}
        </div>

      </div>
    </>
  )
}
