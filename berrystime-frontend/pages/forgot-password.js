import { useState } from 'react'
import Head from 'next/head'
import api from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp = { width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }
  const lbl = { display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '5px', color: '#333' }

  return (
    <>
      <Head><title>Forgot Password — Rannikon</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={{ background: '#f9f9f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h1 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '700', marginBottom: '4px' }}>
            <span style={{ color: '#2d6a2d' }}>Berry</span><span style={{ color: '#000' }}>stime</span>
          </h1>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '28px' }}>Reset your password</p>

          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '28px' }}>
            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#2d6a2d' }}>Check your email</h2>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  We sent a password reset link to <b>{email}</b>. Click the link in the email to reset your password.
                </p>
                <p style={{ fontSize: '13px', color: '#888', marginTop: '16px' }}>
                  Did not receive it? Check your spam folder.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
                  Enter your email address and we will send you a link to reset your password.
                </p>
                {error && (
                  <div style={{ background: '#fdecea', border: '1px solid #f5c6cb', color: '#c0392b', borderRadius: '8px', padding: '12px', fontSize: '14px', marginBottom: '16px' }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={lbl}>Email address</label>
                    <input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '14px', background: loading ? '#aaa' : '#2d6a2d', color: '#fff', fontSize: '16px', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    {loading ? 'Sending...' : 'Send reset link'}
                  </button>
                </form>
              </>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <a href="/login" style={{ color: '#2d6a2d', fontWeight: '600' }}>Back to sign in</a>
          </p>
        </div>
      </div>
    </>
  )
}