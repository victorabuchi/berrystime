import { useState, useEffect } from 'react'
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

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

/* Animated floating cards for the left panel */
function LeftVisual() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(s => (s + 1) % 60), 1000)
    return () => clearInterval(t)
  }, [])

  const rows = [
    { day: 1,  start: '09:30', finish: '18:00', hrs: '7:30' },
    { day: 2,  start: '10:00', finish: '19:30', hrs: '7:30' },
    { day: 3,  start: '09:15', finish: '18:00', hrs: '7:30' },
    { day: 4,  start: '08:45', finish: '17:15', hrs: '7:30' },
    { day: 5,  start: '09:00', finish: '18:30', hrs: '7:30' },
  ]

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '360px', margin: '36px auto 0', height: '280px' }}>

      {/* Main timesheet card */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '240px', animation: 'floatA 5s ease-in-out infinite', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px 16px' }}>
        <div style={{ fontSize: '9px', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>White Paper — June</div>
        {rows.map((r, i) => (
          <div key={r.day} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', opacity: tick % 6 > i ? 1 : 0.25, transition: 'opacity 0.4s' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Day {r.day}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{r.start} – {r.finish}</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80' }}>{r.hrs}</span>
          </div>
        ))}
      </div>

      {/* Weekly summary card */}
      <div style={{ position: 'absolute', right: 0, top: '50px', animation: 'floatB 4s ease-in-out infinite', background: 'rgba(45,106,45,0.35)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '12px', padding: '12px 14px', width: '140px' }}>
        <div style={{ fontSize: '9px', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Week 1</div>
        {[['White hrs', '37:30'], ['Extra hrs', '5:15'], ['Total', '42:45']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{l}</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#fff' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Month badge */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', animation: 'floatC 6s ease-in-out infinite', background: '#2d6a2d', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '20px', padding: '8px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', marginBottom: '1px' }}>June total</div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>156 hrs</div>
      </div>

    </div>
  )
}

const FEATURES = [
  { title: 'Digital timesheet', desc: 'Log every working day and track your full month.' },
  { title: 'Auto-calculated papers', desc: 'White, orange, and weekly summary filled instantly.' },
  { title: 'Zero math errors', desc: 'Start and finish times produce correct hour totals.' },
  { title: 'Supervisor verification', desc: 'Hours reviewed and approved before payroll.' },
  { title: 'Secure cloud storage', desc: 'Your records safe and accessible from any device.' },
]

const COUNTRIES = [
  'Finland', 'Sweden', 'Norway', 'Denmark', 'Estonia', 'Latvia', 'Lithuania',
  'Poland', 'Germany', 'Romania', 'Bulgaria', 'Hungary', 'Slovakia',
  'Ukraine', 'Thailand', 'Vietnam', 'Nepal', 'Philippines', 'Other'
]

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ work_number: '', full_name: '', email: '', password: '' })
  const [country, setCountry] = useState('Finland')
  const [emailPref, setEmailPref] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const [cookieBanner, setCookieBanner] = useState(true)
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
      <Head>
        <title>Create account — Rannikon Puutarha</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#0e1a0e;color:#e6edf3;-webkit-font-smoothing:antialiased}
        a{text-decoration:none;color:inherit}
        @keyframes floatA{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0) rotate(2deg)}50%{transform:translateY(-12px) rotate(-1deg)}}
        @keyframes floatC{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-8px)}}
        .gh-input{width:100%;padding:5px 12px;font-size:14px;border:1px solid #d0d7de;border-radius:6px;background:#fff;font-family:inherit;color:#1a1a18;height:32px;transition:border-color 0.15s,box-shadow 0.15s}
        .gh-input:focus{outline:none;border-color:#2d6a2d;box-shadow:0 0 0 3px rgba(45,106,45,0.15)}
        .gh-select{width:100%;padding:4px 12px;font-size:14px;border:1px solid #d0d7de;border-radius:6px;background:#fff;font-family:inherit;color:#1a1a18;height:32px;cursor:pointer}
        .gh-select:focus{outline:none;border-color:#2d6a2d;box-shadow:0 0 0 3px rgba(45,106,45,0.15)}
        .gh-input-wrap{position:relative}
        .eye-btn{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#888;display:flex;align-items:center;padding:0}
        .gh-btn-green{width:100%;padding:5px 16px;height:34px;background:#2d6a2d;color:#fff;font-size:14px;font-weight:600;border:1px solid rgba(0,0,0,0.15);border-radius:6px;cursor:pointer;font-family:inherit;transition:background 0.15s;display:flex;align-items:center;justify-content:center;gap:6px}
        .gh-btn-green:hover{background:#235223}
        .gh-btn-green:disabled{background:#94a68e;cursor:not-allowed}
        .gh-btn-outline{width:100%;padding:5px 16px;height:32px;background:#f6f8fa;color:#1a1a18;font-size:14px;font-weight:500;border:1px solid #d0d7de;border-radius:6px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s}
        .gh-btn-outline:hover{background:#eaeef2}
        .gh-divider{display:flex;align-items:center;gap:12px;margin:10px 0;color:#8c959f;font-size:12px}
        .gh-divider::before,.gh-divider::after{content:'';flex:1;height:1px;background:#d0d7de}
        .hint{font-size:12px;color:#8c959f;margin-top:4px;line-height:1.5}
        .error-box{background:#fff0f0;border:1px solid #ffc1c0;color:#cf2030;border-radius:6px;padding:8px 12px;font-size:13px;margin-bottom:12px}
        .feature-item{display:flex;gap:10px;align-items:flex-start;padding:7px 0}
        .feature-item+.feature-item{border-top:1px solid rgba(255,255,255,0.07)}
        .features-toggle{background:none;border:none;color:rgba(255,255,255,0.75);font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;padding:0;font-family:inherit;transition:color 0.15s}
        .features-toggle:hover{color:#fff}
        .field-label{display:block;font-size:14px;font-weight:600;margin-bottom:4px;color:#1a1a18}
        .field-label span{color:#cf2030;margin-left:1px}
        .cookie-banner{position:fixed;bottom:0;left:0;right:0;background:#1a2e1a;border-top:1px solid rgba(255,255,255,0.1);padding:12px 20px;font-size:12px;color:rgba(255,255,255,0.7);z-index:1000}
        .cookie-banner a{color:#4ade80}
        .cookie-banner a:hover{text-decoration:underline}
        @media(max-width:900px){
          .reg-layout{flex-direction:column!important}
          .reg-left{padding:32px 24px 24px!important;min-height:unset!important}
          .reg-right{width:100%!important;max-width:100%!important;padding:24px 20px 100px!important}
        }
      `}</style>

      {/* Main layout */}
      <div className="reg-layout" style={{ display: 'flex', minHeight: '100vh' }}>

        {/* LEFT PANEL */}
        <div className="reg-left" style={{
          flex: 1, padding: '60px 56px 60px',
          background: 'linear-gradient(160deg, #0e1a0e 0%, #1a3a1a 55%, #0e1f0e 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          minHeight: '100vh', position: 'relative', overflow: 'hidden'
        }}>

          {/* Background grid dots */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(74,222,128,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
          {/* Green glow top-right */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(45,106,45,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', maxWidth: '420px' }}>

            {/* Logo badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.95)', borderRadius: '10px', padding: '6px 12px', marginBottom: '28px' }}>
              <img src="/rannikkopuutarhalogo.png" alt="Rannikon Puutarha" style={{ height: '28px', width: 'auto' }} />
              <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: '700', fontSize: '18px', color: '#2d6a2d', lineHeight: 1 }}>Rannikon Puutarha</span>
            </div>

            <h1 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: '700', lineHeight: 1.15, marginBottom: '10px', color: '#fff' }}>
              Create your account
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '20px' }}>
              Track your farm work hours accurately.<br />Auto-calculate your paper forms.
            </p>

            <button className="features-toggle" onClick={() => setShowFeatures(s => !s)}>
              See what&apos;s included
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showFeatures ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <div style={{ overflow: 'hidden', maxHeight: showFeatures ? '400px' : '0', transition: 'max-height 0.35s ease', marginTop: showFeatures ? '14px' : '0' }}>
              {FEATURES.map(f => (
                <div key={f.title} className="feature-item">
                  <div style={{ flexShrink: 0, marginTop: '2px', width: '18px', height: '18px', background: 'rgba(74,222,128,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckIcon />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#e6edf3', marginBottom: '1px' }}>{f.title}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.4' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Animated visual */}
            <LeftVisual />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="reg-right" style={{ width: '460px', maxWidth: '460px', background: '#fff', overflowY: 'auto', padding: '40px 36px 80px', display: 'flex', flexDirection: 'column' }}>

          {/* Already have account — inside right panel, top */}
          <p style={{ textAlign: 'right', fontSize: '13px', color: '#666', marginBottom: '20px' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#2d6a2d', fontWeight: '600' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}>
              Sign in →
            </a>
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a18', marginBottom: '16px', textAlign: 'center' }}>Sign up for Rannikon</h2>

          <button className="gh-btn-outline" style={{ marginBottom: '4px' }} onClick={() => {}}>
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="gh-divider">or</div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            <div>
              <label className="field-label">Email<span>*</span></label>
              <input className="gh-input" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="field-label">Password<span>*</span></label>
              <div className="gh-input-wrap">
                <input className="gh-input" style={{ paddingRight: '36px' }} type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(s => !s)}><EyeIcon open={showPassword} /></button>
              </div>
              <p className="hint">At least 8 characters including a number and a lowercase letter.</p>
            </div>

            <div>
              <label className="field-label">Work number<span>*</span></label>
              <input className="gh-input" type="text" name="work_number" placeholder="Work number" value={form.work_number} onChange={handleChange} required />
              <p className="hint">Your unique farm number — cannot be changed later.</p>
            </div>

            <div>
              <label className="field-label">Full name<span>*</span></label>
              <input className="gh-input" type="text" name="full_name" placeholder="Full name" value={form.full_name} onChange={handleChange} required />
            </div>

            <div>
              <label className="field-label">Your Country/Region<span>*</span></label>
              <select className="gh-select" value={country} onChange={e => setCountry(e.target.value)}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="hint">Required for compliance and account notifications.</p>
            </div>

            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a18', marginBottom: '6px' }}>Email preferences</p>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={emailPref} onChange={e => setEmailPref(e.target.checked)} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>Receive occasional product updates and announcements</span>
              </label>
            </div>

            <button type="submit" className="gh-btn-green" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>

          </form>

          <p style={{ fontSize: '11px', color: '#8c959f', marginTop: '14px', lineHeight: '1.7' }}>
            By creating an account, you agree to the{' '}
            <a href="#" style={{ color: '#2d6a2d' }}>Terms of Service</a>.{' '}
            See our <a href="#" style={{ color: '#2d6a2d' }}>Privacy Statement</a> for details.{' '}
            We&apos;ll occasionally send you account-related emails.
          </p>

        </div>
      </div>

      {/* Cookie banner — short version */}
      {cookieBanner && (
        <div className="cookie-banner">
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <span>
              We use cookies to improve your experience.{' '}
              <a href="#">Manage preferences</a>{' · '}
              <a href="#">Privacy Statement</a>{' · '}
              <a href="#">Third-Party Cookies</a>
            </span>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => setCookieBanner(false)} style={{ padding: '4px 14px', background: '#2d6a2d', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Accept</button>
              <button onClick={() => setCookieBanner(false)} style={{ padding: '4px 14px', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
