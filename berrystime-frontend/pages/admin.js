import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import api from '../lib/api'
import { getWorker, isLoggedIn, clearAuth } from '../lib/auth'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function AdminPanel() {
  const router = useRouter()
  const [worker, setWorker] = useState(null)
  const [workers, setWorkers] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [entries, setEntries] = useState([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('workers')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    const w = getWorker()
    if (w?.role !== 'admin') { router.push('/dashboard'); return }
    setWorker(w)
    loadData()
  }, [])

  useEffect(() => {
    if (selectedWorker) loadEntries(selectedWorker.id)
  }, [month, year, selectedWorker])

  async function loadData() {
    setLoading(true)
    try {
      const [workersRes, statsRes] = await Promise.all([
        api.get('/api/admin/workers'),
        api.get('/api/admin/stats')
      ])
      setWorkers(workersRes.data.workers)
      setStats(statsRes.data)
    } catch (err) {
      if (err.response?.status === 403) router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function loadEntries(workerId) {
    try {
      const res = await api.get(`/api/admin/workers/${workerId}/timesheet/${month}/${year}`)
      const map = {}
      res.data.entries.forEach(e => {
        const day = parseInt(e.entry_date.split('T')[0].split('-')[2])
        map[day] = e
      })
      setEntries(map)
    } catch (err) {
      console.error('Failed to load entries')
    }
  }

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
        <p style={{ color: '#555' }}>Loading admin panel...</p>
      </div>
    )
  }

  return (
    <>
      <Head><title>Admin — Rannikon Puutarha</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#f5f5f0;color:#1a1a18;-webkit-font-smoothing:antialiased}
        .btn{padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:all 0.15s}
        .btn-green{background:#2d6a2d;color:#fff}
        .btn-green:hover{background:#235223}
        .btn-outline{background:#fff;color:#333;border:1px solid #ddd}
        .btn-outline:hover{background:#f5f5f0}
        .btn-red{background:#fdecea;color:#c0392b;border:1px solid #ffc1c0}
        .btn-red:hover{background:#fbd0cd}
        .btn-orange{background:#fff3e0;color:#b45309;border:1px solid #fde0b0}
        .stat-card{background:#fff;border:1px solid #e8e8e3;borderRadius:12px;padding:20px 24px}
        .worker-row:hover{background:#f9f9f6}
        .worker-row{transition:background 0.15s;cursor:pointer}
        input:focus{outline:none;border-color:#2d6a2d!important;box-shadow:0 0 0 3px rgba(45,106,45,0.1)}
      `}</style>

      {/* NAV */}
      <div style={{ background: '#2d6a2d', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/rannikkopuutarhalogo.png" alt="" style={{ height: '36px', borderRadius: '6px' }} />
          <div>
            <span style={{ fontFamily: 'Dancing Script, cursive', fontWeight: '700', fontSize: '18px', color: '#fff' }}>Rannikon Puutarha</span>
            <span style={{ marginLeft: '10px', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>ADMIN</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>#{worker?.work_number} {worker?.full_name}</span>
          <button className="btn btn-outline" onClick={() => router.push('/dashboard')} style={{ fontSize: '12px' }}>My timesheet</button>
          <button className="btn btn-outline" onClick={() => { clearAuth(); router.push('/login') }} style={{ fontSize: '12px' }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total workers', value: stats.total_workers, color: '#2d6a2d' },
              { label: 'Active workers', value: activeCount, color: '#2d6a2d' },
              { label: 'Admins', value: adminCount, color: '#1565c0' },
              { label: 'Entries today', value: stats.entries_today, color: '#b45309' },
              { label: 'Total entries', value: stats.total_entries, color: '#555' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #e8e8e3', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
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
              {selectedWorker.full_name} — Timesheet
            </button>
          )}
        </div>

        {view === 'workers' && (
          <div style={{ background: '#fff', border: '1px solid #e8e8e3', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e8e3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Workers</h2>
              <input
                type="text"
                placeholder="Search by name, number or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '8px', width: '280px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#f9f9f6', borderBottom: '1px solid #e8e8e3' }}>
                    {['#', 'Work No.', 'Full Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w, i) => (
                    <tr key={w.id} className="worker-row" style={{ borderBottom: '1px solid #f0f0ec' }}>
                      <td style={{ padding: '12px 14px', color: '#aaa', fontSize: '12px' }}>{i + 1}</td>
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
                <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                  No workers found matching your search.
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'timesheet' && selectedWorker && (
          <div>
            <div style={{ background: '#fff', border: '1px solid #e8e8e3', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{selectedWorker.full_name} — #{selectedWorker.work_number}</h2>
                <p style={{ fontSize: '13px', color: '#888' }}>{selectedWorker.email}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => { if (month === 1) { setMonth(12); setYear(y => y-1) } else setMonth(m => m-1) }}
                  style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>{'<'}</button>
                <span style={{ fontWeight: '700', minWidth: '140px', textAlign: 'center' }}>{MONTHS[month-1]} {year}</span>
                <button onClick={() => { if (month === 12) { setMonth(1); setYear(y => y+1) } else setMonth(m => m+1) }}
                  style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>{'>'}</button>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e8e8e3', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f6', borderBottom: '1px solid #e8e8e3' }}>
                      {['Day', 'Start', 'Finish', 'White hrs', 'Orange start', 'Orange finish', 'Orange hrs', 'Total', 'What work'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1).map(day => {
                      const entry = entries[day]
                      return (
                        <tr key={day} style={{ borderBottom: '1px solid #f0f0ec', background: entry ? '#fafffe' : '#fff' }}>
                          <td style={{ padding: '10px 14px', fontWeight: '700', color: entry ? '#2d6a2d' : '#ccc' }}>Day {day}</td>
                          <td style={{ padding: '10px 14px' }}>{entry ? entry.actual_start?.slice(0,5) : '—'}</td>
                          <td style={{ padding: '10px 14px' }}>{entry ? entry.actual_finish?.slice(0,5) : '—'}</td>
                          <td style={{ padding: '10px 14px', fontWeight: entry ? '700' : '400', color: '#2d6a2d' }}>{entry ? '7:30' : '—'}</td>
                          <td style={{ padding: '10px 14px' }}>{entry ? entry.orange_start?.slice(0,5) : '—'}</td>
                          <td style={{ padding: '10px 14px' }}>{entry ? entry.orange_finish?.slice(0,5) : '—'}</td>
                          <td style={{ padding: '10px 14px', fontWeight: entry ? '700' : '400', color: '#b45309' }}>{entry ? entry.orange_hours : '—'}</td>
                          <td style={{ padding: '10px 14px', fontWeight: entry ? '700' : '400', color: '#1565c0' }}>{entry ? entry.total_hours : '—'}</td>
                          <td style={{ padding: '10px 14px', color: '#666' }}>{entry ? entry.what_work : ''}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '14px 20px', borderTop: '1px solid #e8e8e3', background: '#f9f9f6', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {(() => {
                  const filled = Object.values(entries)
                  const totalMins = filled.reduce((sum, e) => {
                    if (!e.total_hours) return sum
                    const p = e.total_hours.split(':')
                    return sum + parseInt(p[0]) * 60 + parseInt(p[1])
                  }, 0)
                  const extraMins = filled.reduce((sum, e) => {
                    if (!e.orange_hours) return sum
                    const p = e.orange_hours.split(':')
                    return sum + parseInt(p[0]) * 60 + parseInt(p[1])
                  }, 0)
                  const toHHMM = m => Math.floor(m/60) + ':' + String(m%60).padStart(2,'0')
                  return (
                    <>
                      <div><span style={{ fontSize: '12px', color: '#888' }}>Days worked: </span><span style={{ fontWeight: '700' }}>{filled.length}</span></div>
                      <div><span style={{ fontSize: '12px', color: '#888' }}>White hours: </span><span style={{ fontWeight: '700', color: '#2d6a2d' }}>{toHHMM(filled.length * 450)}</span></div>
                      <div><span style={{ fontSize: '12px', color: '#888' }}>Extra hours: </span><span style={{ fontWeight: '700', color: '#b45309' }}>{toHHMM(extraMins)}</span></div>
                      <div><span style={{ fontSize: '12px', color: '#888' }}>Total hours: </span><span style={{ fontWeight: '700', color: '#1565c0', fontSize: '15px' }}>{toHHMM(totalMins)}</span></div>
                    </>
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
