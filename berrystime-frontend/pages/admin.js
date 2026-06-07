import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import api from '../lib/api'
import { getWorker, isLoggedIn, clearAuth, saveAuth } from '../lib/auth'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function AdminPanel() {
  const router = useRouter()
  const [worker, setWorker] = useState(null)
  const [workers, setWorkers] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [entries, setEntries] = useState({})
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('workers')
  const [updating, setUpdating] = useState(null)
  const [activeTab, setActiveTab] = useState('white')

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    api.get('/api/auth/me')
      .then(res => {
        const w = res.data.worker
        if (w?.role !== 'admin') { router.push('/dashboard'); return }
        setWorker(w)
        saveAuth(localStorage.getItem('rannikon_token'), w)
        Promise.all([api.get('/api/admin/workers'), api.get('/api/admin/stats')])
          .then(([workersRes, statsRes]) => {
            setWorkers(workersRes.data.workers)
            setStats(statsRes.data)
          })
          .catch(err => {
            if (err.response?.status === 403) router.push('/dashboard')
          })
          .finally(() => setLoading(false))
      })
      .catch(err => {
        if (err.response?.status === 401) { router.push('/login'); return }
        const w = getWorker()
        if (!w || w.role !== 'admin') { router.push('/dashboard'); return }
        setWorker(w)
        Promise.all([api.get('/api/admin/workers'), api.get('/api/admin/stats')])
          .then(([workersRes, statsRes]) => {
            setWorkers(workersRes.data.workers)
            setStats(statsRes.data)
          })
          .catch(e => {
            if (e.response?.status === 403) router.push('/dashboard')
          })
          .finally(() => setLoading(false))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedWorker) return
    api.get(`/api/admin/workers/${selectedWorker.id}/timesheet/${month}/${year}`)
      .then(res => {
        const map = {}
        res.data.entries.forEach(e => {
          const day = parseInt(e.entry_date.split('T')[0].split('-')[2])
          map[day] = e
        })
        setEntries(map)
      })
      .catch(() => console.error('Failed to load entries'))
  }, [month, year, selectedWorker])

  async function toggleActive(w) {
    setUpdating(w.id)
    try {
      await api.patch(`/api/admin/workers/${w.id}`, { is_active: !w.is_active })
      setWorkers(prev => prev.map(x => x.id === w.id ? { ...x, is_active: !w.is_active } : x))
    } finally {
      setUpdating(null)
    }
  }

  async function toggleRole(w) {
    setUpdating(w.id)
    const newRole = w.role === 'admin' ? 'worker' : 'admin'
    try {
      await api.patch(`/api/admin/workers/${w.id}`, { role: newRole })
      setWorkers(prev => prev.map(x => x.id === w.id ? { ...x, role: newRole } : x))
    } finally {
      setUpdating(null)
    }
  }

  function openWorkerTimesheet(w) {
    setSelectedWorker(w)
    setEntries({})
    setView('timesheet')
  }

  function getDaysInMonth(m, y) {
    return new Date(y, m, 0).getDate()
  }

  const filtered = workers.filter(w =>
    w.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.work_number?.includes(search) ||
    w.email?.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = workers.filter(w => w.is_active).length
  const adminCount = workers.filter(w => w.role === 'admin').length

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        <p style={{ color: '#555', fontSize: '15px' }}>Loading admin panel...</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin | Rannikon</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f5f5f0; color: #1a1a18; -webkit-font-smoothing: antialiased; }
        .btn { padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: all 0.15s; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-green { background: #2d6a2d; color: #fff; }
        .btn-green:hover:not(:disabled) { background: #235223; }
        .btn-outline { background: #fff; color: #333; border: 1px solid #ddd !important; }
        .btn-outline:hover:not(:disabled) { background: #f5f5f0; }
        .worker-row:hover { background: #f9f9f6 !important; }
        .worker-row { transition: background 0.15s; }
        input:focus { outline: none; border-color: #2d6a2d !important; box-shadow: 0 0 0 3px rgba(45,106,45,0.1); }
        @media (max-width: 600px) { .admin-badge { display: none !important; } }
      `}</style>

      {/* NAV */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ddd', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <img src="/rannikkopuutarhalogo.png" alt="Rannikon" style={{ height: '46px', width: 'auto', display: 'block' }} />
            <span style={{ fontFamily: 'Dancing Script, cursive', fontWeight: '700', fontSize: '22px', color: '#2d6a2d', lineHeight: 1 }}>Rannikon Puutarha</span>
          </div>
          <span className="admin-badge" style={{ background: '#2d6a2d', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#444', fontWeight: '500' }}>#{worker?.work_number} {worker?.full_name}</span>
          <button className="btn btn-green" onClick={() => router.push('/dashboard')} style={{ fontSize: '12px' }}>My timesheet</button>
          <button className="btn btn-green" onClick={() => { clearAuth(); router.push('/login') }} style={{ fontSize: '12px' }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Total workers', value: stats.total_workers, color: '#2d6a2d' },
              { label: 'Active workers', value: activeCount, color: '#2d6a2d' },
              { label: 'Admins', value: adminCount, color: '#1565c0' },
              { label: 'Inactive workers', value: workers.length - activeCount, color: '#c0392b' },
              { label: 'Entries today', value: stats.entries_today, color: '#b45309' },
              { label: 'Total entries', value: stats.total_entries, color: '#555' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #e8e8e3', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontSize: '30px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* View tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button className="btn" onClick={() => setView('workers')}
            style={{ background: view === 'workers' ? '#2d6a2d' : '#fff', color: view === 'workers' ? '#fff' : '#333', border: '1px solid #ddd' }}>
            All Workers ({workers.length})
          </button>
          {selectedWorker && (
            <button className="btn" onClick={() => setView('timesheet')}
              style={{ background: view === 'timesheet' ? '#2d6a2d' : '#fff', color: view === 'timesheet' ? '#fff' : '#333', border: '1px solid #ddd' }}>
              {selectedWorker.full_name}: Timesheet
            </button>
          )}
        </div>

        {/* Workers table */}
        {view === 'workers' && (
          <div style={{ background: '#fff', border: '1px solid #e8e8e3', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e8e3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Workers</h2>
              <input
                type="text"
                placeholder="Search by name, number or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '8px', width: '300px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '750px' }}>
                <thead>
                  <tr style={{ background: '#f9f9f6', borderBottom: '1px solid #e8e8e3' }}>
                    {['#', 'Work No.', 'Full Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w, i) => (
                    <tr key={w.id} className="worker-row" style={{ borderBottom: '1px solid #f0f0ec', background: '#fff' }}>
                      <td style={{ padding: '12px 14px', color: '#bbb', fontSize: '12px' }}>{i + 1}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#2d6a2d' }}>#{w.work_number}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>{w.full_name}</td>
                      <td style={{ padding: '12px 14px', color: '#666' }}>{w.email}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: w.role === 'admin' ? '#e3f2fd' : '#f0f0ec', color: w.role === 'admin' ? '#1565c0' : '#666' }}>
                          {w.role || 'worker'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: w.is_active ? '#e8f5e9' : '#fdecea', color: w.is_active ? '#2d6a2d' : '#c0392b' }}>
                          {w.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#888', fontSize: '12px' }}>
                        {new Date(w.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button className="btn btn-outline" style={{ fontSize: '11px', padding: '4px 10px' }}
                            onClick={() => openWorkerTimesheet(w)}>
                            View timesheet
                          </button>
                          <button className="btn" disabled={updating === w.id}
                            style={{ fontSize: '11px', padding: '4px 10px', background: w.is_active ? '#fdecea' : '#e8f5e9', color: w.is_active ? '#c0392b' : '#2d6a2d', border: `1px solid ${w.is_active ? '#ffc1c0' : '#c8e6c9'}` }}
                            onClick={() => toggleActive(w)}>
                            {w.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          {w.id !== worker?.id && (
                            <button className="btn" disabled={updating === w.id}
                              style={{ fontSize: '11px', padding: '4px 10px', background: '#e3f2fd', color: '#1565c0', border: '1px solid #b3c9f0' }}
                              onClick={() => toggleRole(w)}>
                              {w.role === 'admin' ? 'Remove admin' : 'Make admin'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                  No workers found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Worker timesheet view */}
        {view === 'timesheet' && selectedWorker && (
          <div>
            <div style={{ background: '#fff', border: '1px solid #e8e8e3', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{selectedWorker.full_name} #{selectedWorker.work_number}</h2>
                <p style={{ fontSize: '13px', color: '#888' }}>{selectedWorker.email}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }}
                  style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '14px' }}>{'<'}</button>
                <span style={{ fontWeight: '700', minWidth: '150px', textAlign: 'center', fontSize: '15px' }}>{MONTHS[month - 1]} {year}</span>
                <button onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }}
                  style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '14px' }}>{'>'}</button>
              </div>
            </div>

            {/* Four papers */}
            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
              {/* Paper tab nav */}
              <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc', padding: '8px', display: 'flex', flexDirection: 'row', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>Papers</p>
                {[['white','White Paper','Work paid by hour'],['orange','Orange Paper','Extrawork'],['weekly','Weekly Summary','Mon to Sun totals'],['green','Green Paper','Berry picking']].map(([tab, label, sub]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: '6px 10px', textAlign: 'center', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                    background: activeTab === tab ? '#2d6a2d' : '#fff', color: activeTab === tab ? '#fff' : '#333',
                    border: activeTab === tab ? 'none' : '1px solid #ddd', whiteSpace: 'nowrap'
                  }}>
                    {label}
                    <div style={{ fontSize: '10px', color: activeTab === tab ? '#cfffcf' : '#aaa', marginTop: '2px', fontWeight: '400' }}>{sub}</div>
                  </button>
                ))}
              </div>

              <div style={{ padding: '16px', overflowX: 'auto' }}>

                {/* White Paper */}
                {activeTab === 'white' && (() => {
                  const thW = (x) => ({ border: '1px solid #333', padding: '5px 6px', background: '#e0e0e0', fontWeight: '700', textAlign: 'center', fontSize: '11px', ...x })
                  const tdW = (x) => ({ border: '1px solid #ccc', padding: '5px 6px', fontSize: '12px', ...x })
                  return (
                    <div>
                      <p style={{ fontWeight: '800', fontSize: '14px', marginBottom: '2px' }}>WORK PAID BY THE HOUR</p>
                      <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '2px' }}>8 HOURS PER DAY / 40 HOURS PER WEEK</p>
                      <p style={{ fontSize: '11px', color: '#333', marginBottom: '10px' }}>Name: <b>{selectedWorker.full_name}</b> &nbsp;&nbsp; Work number: <b>{selectedWorker.work_number}</b></p>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ borderCollapse: 'collapse', minWidth: '600px', width: '100%', fontSize: '12px' }}>
                          <thead><tr>
                            <th style={thW()}>Date</th><th style={thW()}>Start</th><th style={thW()}>Finish</th>
                            <th style={thW()}>Must have Eating break</th><th style={thW()}>Extra Breaks</th>
                            <th style={thW()}>Hours minus breaks</th><th style={thW()}>What work</th>
                          </tr></thead>
                          <tbody>
                            {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1).map(day => {
                              const entry = entries[day]
                              return (
                                <tr key={day} style={{ background: entry ? '#fafafa' : '#fff' }}>
                                  <td style={tdW()}><b>{day}</b></td>
                                  <td style={tdW()}>{entry?.white_start?.slice(0,5) || ''}</td>
                                  <td style={tdW()}>{entry?.white_finish?.slice(0,5) || ''}</td>
                                  <td style={tdW({ textAlign: 'center' })}>30 min</td>
                                  <td style={tdW()}></td>
                                  <td style={tdW({ fontWeight: '700', color: entry ? '#2d6a2d' : '' })}>{entry ? (entry.white_hours || '7:30') : ''}</td>
                                  <td style={tdW()}>{entry?.what_work || ''}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      <p style={{ fontSize: '11px', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>When you have worked 4 hours, You need to have an eating break, minimum of 30 mins.</p>
                      <p style={{ fontSize: '11px', color: '#555', fontStyle: 'italic' }}>START WORK 9:00, 9:15, 9:30 or 9:45. WORK DOES NOT START 9:05, 9:10, 9:20, 9:25 etc.</p>
                    </div>
                  )
                })()}

                {/* Orange Paper */}
                {activeTab === 'orange' && (() => {
                  const thO = (x) => ({ border: '1px solid #c97d00', padding: '5px 6px', background: '#ffe0a0', fontWeight: '700', textAlign: 'center', fontSize: '11px', ...x })
                  const tdO = (x) => ({ border: '1px solid #c97d00', padding: '5px 6px', fontSize: '12px', background: '#fffbf0', ...x })
                  return (
                    <div>
                      <p style={{ fontWeight: '800', fontSize: '14px', marginBottom: '2px', color: '#b45309' }}>EXTRAWORK PAID BY THE HOUR</p>
                      <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '2px' }}>MAXIMUM 3 HOURS PER DAY (MONDAY-FRIDAY)</p>
                      <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '2px' }}>MAXIMUM 11 HOURS PER DAY (SATURDAY)</p>
                      <p style={{ fontSize: '11px', color: '#333', marginBottom: '10px' }}>Name: <b>{selectedWorker.full_name}</b> &nbsp;&nbsp; Work number: <b>{selectedWorker.work_number}</b></p>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ borderCollapse: 'collapse', minWidth: '600px', width: '100%', fontSize: '12px', background: '#fffbf0' }}>
                          <thead><tr>
                            <th style={thO()}>Date</th><th style={thO()}>Start</th><th style={thO()}>Finish</th>
                            <th style={thO()}>Break</th><th style={thO()}>Hours minus breaks</th>
                            <th style={thO()}>What work</th><th style={thO()}>Signature</th>
                          </tr></thead>
                          <tbody>
                            {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1).map(day => {
                              const entry = entries[day]
                              return (
                                <tr key={day} style={{ background: entry ? '#fff8e1' : '#fffbf0' }}>
                                  <td style={tdO()}><b>{day}</b></td>
                                  <td style={tdO()}>{entry?.orange_start?.slice(0,5) || ''}</td>
                                  <td style={tdO()}>{entry?.orange_finish?.slice(0,5) || ''}</td>
                                  <td style={tdO({ textAlign: 'center' })}>{entry ? '0:15' : ''}</td>
                                  <td style={tdO({ fontWeight: '700', color: entry ? '#b45309' : '' })}>{entry?.orange_hours || ''}</td>
                                  <td style={tdO()}>{entry?.what_work || ''}</td>
                                  <td style={tdO()}></td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      <p style={{ fontSize: '11px', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>Start work 9:00, 9:15, 9:30 or 9:45. Work does not start 9:05, 9:10, 9:20, 9:25 etc.</p>
                    </div>
                  )
                })()}

                {/* Weekly Summary */}
                {activeTab === 'weekly' && (() => {
                  const days = getDaysInMonth(month, year)
                  const toHHMM = (m) => m > 0 ? Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0') : '0:00'
                  const thW2 = (x) => ({ border: '1px solid #333', padding: '5px 6px', textAlign: 'center', background: '#e0e0e0', fontSize: '11px', fontWeight: '700', ...x })
                  const tdW2 = (x) => ({ border: '1px solid #333', padding: '5px 6px', fontSize: '11px', textAlign: 'center', ...x })
                  const tdO2 = (x) => ({ border: '1px solid #c97d00', padding: '5px 6px', fontSize: '11px', textAlign: 'center', background: '#fffbf0', ...x })
                  const tdG2 = (x) => ({ border: '1px solid #2d6a2d', padding: '5px 6px', fontSize: '11px', textAlign: 'center', background: '#f6fff6', ...x })
                  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
                  return (
                    <div>
                      <p style={{ fontWeight: '800', fontSize: '14px', marginBottom: '2px' }}>WEEKLY SUMMARY</p>
                      <p style={{ fontSize: '11px', color: '#333', marginBottom: '12px' }}>Name: <b>{selectedWorker.full_name}</b> &nbsp;&nbsp; Work number: <b>{selectedWorker.work_number}</b></p>
                      {Array.from({ length: Math.min(Math.ceil(days / 7), 4) }, (_, weekIdx) => {
                        const weekStart = weekIdx * 7 + 1
                        const dayInfos = Array.from({ length: 7 }, (_, i) => {
                          const d = weekStart + i
                          const dow = d <= days ? new Date(year, month - 1, d).getDay() : null
                          return { d, exists: d <= days, dow, name: dow !== null ? DAY_NAMES[dow] : '', isSun: dow === 0, isSat: dow === 6 }
                        })
                        const validDays = dayInfos.filter(x => x.exists)
                        const totalWorking = validDays.filter(x => entries[x.d] && !x.isSun).length * 450
                        const totalExtra = validDays.reduce((sum, x) => {
                          if (!entries[x.d]?.orange_hours || x.isSun) return sum
                          const p = entries[x.d].orange_hours.split(':')
                          return sum + parseInt(p[0]) * 60 + parseInt(p[1])
                        }, 0)
                        return (
                          <div key={weekIdx} style={{ marginBottom: '20px' }}>
                            <p style={{ fontWeight: '800', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Week {weekIdx + 1}</p>
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '11px' }}>
                                <thead>
                                  <tr>
                                    <th style={thW2({ textAlign: 'left', minWidth: '130px', background: '#d0d0d0' })}></th>
                                    {dayInfos.map(({ d, name, exists, isSun, isSat }) => (
                                      <th key={d} style={thW2({ minWidth: '44px', background: isSun ? '#e8e8e8' : '#e0e0e0', color: isSun ? '#999' : '#1a1a18' })}>
                                        {name || ''}<br/>
                                        {exists && !isSun && <span style={{ fontSize: '9px', fontWeight: '400', color: '#666' }}>{isSat ? 'max 11' : 'max 3'}</span>}
                                      </th>
                                    ))}
                                    <th style={thW2({ minWidth: '60px', background: '#d0d0d0' })}>total<br/><span style={{ fontSize: '9px', fontWeight: '400' }}>hours</span></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td style={tdG2({ textAlign: 'left', fontWeight: '700', color: '#2d6a2d', background: '#e8f5e9' })}>
                                      <span style={{ display: 'inline-block', width: '9px', height: '9px', background: '#2d6a2d', borderRadius: '2px', marginRight: '5px', verticalAlign: 'middle' }}/>pickup hours
                                    </td>
                                    {dayInfos.map(({ d, isSun }) => (
                                      <td key={d} style={tdG2({ color: isSun ? '#bbb' : '#2d6a2d', background: '#e8f5e9', fontWeight: '700' })}>{isSun ? 'X' : ''}</td>
                                    ))}
                                    <td style={tdG2({ fontWeight: '700', color: '#2d6a2d', background: '#e8f5e9' })}><div style={{ fontSize: '9px', color: '#888', fontWeight: '400' }}>max 40</div></td>
                                  </tr>
                                  <tr>
                                    <td style={tdW2({ textAlign: 'left', fontWeight: '700', background: '#fafafa' })}>
                                      <span style={{ display: 'inline-block', width: '9px', height: '9px', background: '#ccc', border: '1px solid #999', borderRadius: '2px', marginRight: '5px', verticalAlign: 'middle' }}/>
                                      working hours<div style={{ fontSize: '9px', color: '#888', fontWeight: '400' }}>max 8</div>
                                    </td>
                                    {dayInfos.map(({ d, isSun }) => (
                                      <td key={d} style={tdW2({ fontWeight: entries[d] ? '700' : '400', background: '#fafafa', color: isSun ? '#bbb' : (entries[d] ? '#1a1a18' : '#ccc') })}>
                                        {isSun ? 'X' : (entries[d] ? (entries[d].white_hours || '7:30') : '')}
                                      </td>
                                    ))}
                                    <td style={tdW2({ fontWeight: '700', background: '#fafafa' })}>{toHHMM(totalWorking)}<div style={{ fontSize: '9px', color: '#888', fontWeight: '400' }}>max 40</div></td>
                                  </tr>
                                  <tr>
                                    <td style={tdO2({ textAlign: 'left', fontWeight: '700', color: '#b45309', background: '#fff3e0' })}>
                                      <span style={{ display: 'inline-block', width: '9px', height: '9px', background: '#f59e0b', borderRadius: '2px', marginRight: '5px', verticalAlign: 'middle' }}/>
                                      extra hours / lisatyö
                                    </td>
                                    {dayInfos.map(({ d, isSun }) => (
                                      <td key={d} style={tdO2({ fontWeight: entries[d] ? '700' : '400', background: '#fff3e0', color: isSun ? '#bbb' : (entries[d] ? '#b45309' : '#ccc') })}>
                                        {isSun ? 'X' : (entries[d]?.orange_hours || '')}
                                      </td>
                                    ))}
                                    <td style={tdO2({ fontWeight: '700', color: '#b45309', background: '#fff3e0' })}>{toHHMM(totalExtra)}<div style={{ fontSize: '9px', color: '#888', fontWeight: '400' }}>max 17/week</div></td>
                                  </tr>
                                  <tr>
                                    <td colSpan={9} style={{ border: '1px solid #333', padding: '6px 10px', fontSize: '11px', background: '#fff' }}>
                                      yes, I want to work extra hours &nbsp;&#9744;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Signature: _______________________
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}

                {/* Green Paper */}
                {activeTab === 'green' && (() => {
                  const thG = (x) => ({ border: '1px solid #2d6a2d', padding: '5px 6px', background: '#c8e6c9', fontWeight: '700', textAlign: 'center', fontSize: '11px', ...x })
                  const tdG = (x) => ({ border: '1px solid #2d6a2d', padding: '5px 6px', fontSize: '12px', background: '#f6fff6', ...x })
                  return (
                    <div>
                      <p style={{ fontWeight: '800', fontSize: '14px', marginBottom: '2px', color: '#2d6a2d' }}>TIME USED FOR PICKUP, SALARY IS PAID BY KILOS</p>
                      <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '2px' }}>8 HOURS PER DAY / 40 HOURS PER WEEK</p>
                      <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '2px', color: '#c0392b' }}>HOX, NEED TO PICKUP 10 KILO PER HOUR!</p>
                      <p style={{ fontSize: '11px', color: '#333', marginBottom: '10px' }}>Name: <b>{selectedWorker.full_name}</b> &nbsp;&nbsp; Work number: <b>{selectedWorker.work_number}</b></p>
                      <div style={{ background: '#fff9c4', border: '1px solid #f9a825', borderRadius: '6px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#6d4c00' }}>
                        Berry picking season not yet started. This paper will be active when picking begins.
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ borderCollapse: 'collapse', minWidth: '600px', width: '100%', fontSize: '12px' }}>
                          <thead><tr>
                            <th style={thG()}>Date</th><th style={thG()}>Start</th><th style={thG()}>Finish</th>
                            <th style={thG()}>Must have Eating break</th><th style={thG()}>Extra Breaks</th>
                            <th style={thG()}>Hours minus breaks</th><th style={thG()}>What was picked up</th>
                          </tr></thead>
                          <tbody>
                            {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1).map(day => (
                              <tr key={day} style={{ background: '#fff' }}>
                                <td style={tdG()}><b>{day}</b></td>
                                <td style={tdG()}></td><td style={tdG()}></td>
                                <td style={tdG({ textAlign: 'center', color: '#888' })}>1 hour</td>
                                <td style={tdG()}></td><td style={tdG()}></td><td style={tdG()}></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p style={{ fontSize: '11px', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>When you have worked 4 hours, You need to have an eating break, minimum of 30 mins.</p>
                    </div>
                  )
                })()}

              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}