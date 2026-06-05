import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import api from '../lib/api'
import { saveAuth } from '../lib/auth'

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
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

  const inp = { width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }
  const lbl = { display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '5px', color: '#333' }

  return (
    <>
      <Head><title>Register — Rannikon</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={{ background: '#f9f9f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h1 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '700', marginBottom: '4px' }}>
            <span style={{ color: '#2d6a2d' }}>Berry</span><span style={{ color: '#000' }}>stime</span>
          </h1>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '28px' }}>Create your account</p>

          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '28px' }}>
            {error && (
              <div style={{ background: '#fdecea', border: '1px solid #f5c6cb', color: '#c0392b', borderRadius: '8px', padding: '12px', fontSize: '14px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={lbl}>Work number</label>
                <input style={inp} type="text" name="work_number" placeholder="e.g. 334" value={form.work_number} onChange={handleChange} required />
                <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Your unique farm work number. Cannot be changed later.</p>
              </div>
              <div>
                <label style={lbl}>Full name</label>
                <input style={inp} type="text" name="full_name" placeholder="Your full name" value={form.full_name} onChange={handleChange} required />
              </div>
              <div>
                <label style={lbl}>Email address</label>
                <input style={inp} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label style={lbl}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inp, paddingRight: '44px' }}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', padding: '0' }}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '14px', background: loading ? '#aaa' : '#2d6a2d', color: '#fff', fontSize: '16px', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#2d6a2d', fontWeight: '600' }}>Sign in</a>
          </p>
        </div>
      </div>
    </>
  )
}