import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import api from '../lib/api'
import { getWorker, isLoggedIn, clearAuth } from '../lib/auth'

function toMins(t) {
  const p = t.split(':')
  return parseInt(p[0]) * 60 + parseInt(p[1])
}

function toHHMM(m) {
  if (m <= 0) return '0:00'
  return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0')
}

function addMins(t, add) {
  const total = toMins(t) + add
  return String(Math.floor(total / 60) % 24).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0')
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const VALID = ['09:00','09:15','09:30','09:45']

export default function Dashboard() {
  const router = useRouter()
  const [worker, setWorker] = useState(null)
  const [entries, setEntries] = useState({})
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [editDay, setEditDay] = useState(null)
  const [form, setForm] = useState({ start: '', finish: '', work: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return }
    setWorker(getWorker())
    loadEntries()
  }, [month, year])

  async function loadEntries() {
    try {
      const res = await api.get('/api/timesheet/' + month + '/' + year)
      const map = {}
      res.data.entries.forEach(e => {
        const d = new Date(e.entry_date)
        const day = d.getUTCDate()
        map[day] = e
      })
      setEntries(map)
    } catch (err) {
      console.error('Failed to load entries')
    }
  }

  function getDaysInMonth(m, y) {
    return new Date(y, m, 0).getDate()
  }

  function openEdit(day) {
    const e = entries[day]
    if (e) {
      setForm({
        start: e.actual_start?.slice(0,5) || '',
        finish: e.actual_finish?.slice(0,5) || '',
        work: e.what_work || ''
      })
    } else {
      setForm({ start: '', finish: '', work: '' })
    }
    setEditDay(day)
    setSelectedEntry(null)
  }

  async function saveEntry() {
    if (!form.start || !form.finish) { setError('Start and finish time are required'); return }
    setSaving(true)
    setError('')
    try {
      const dateStr = year + '-' + String(month).padStart(2,'0') + '-' + String(editDay).padStart(2,'0')
      await api.post('/api/timesheet/entry', {
        entry_date: dateStr,
        actual_start: form.start,
        actual_finish: form.finish,
        what_work: form.work
      })
      await loadEntries()
      setEditDay(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function logout() {
    clearAuth()
    router.push('/login')
  }

  const days = getDaysInMonth(month, year)
  const inp = { width: '100%', padding: '10px 12px', fontSize: '15px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', fontFamily: 'inherit' }

  const thW = { border: '1px solid #333', padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap', background: '#f0f0f0' }
  const tdW = { border: '1px solid #333', padding: '8px' }
  const thO = { border: '1px solid #c97d00', padding: '6px 8px', textAlign: 'left', whiteSpace: 'nowrap', background: '#ffe0a0' }
  const tdO = { border: '1px solid #c97d00', padding: '8px' }
  const thB = { border: '1px solid #1565c0', padding: '6px 8px', textAlign: 'center', background: '#bbdefb' }
  const tdB = { border: '1px solid #1565c0', padding: '8px', textAlign: 'center' }

  return (
    <>
      <Head><title>Berrystime — My Timesheet</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={{ background: '#f9f9f9', minHeight: '100vh' }}>

        <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
            <span style={{ color: '#2d6a2d' }}>Berry</span><span style={{ color: '#000' }}>stime</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {worker && <span style={{ fontSize: '13px', color: '#555' }}>#{worker.work_number} {worker.full_name}</span>}
            <button onClick={logout} style={{ padding: '6px 12px', background: 'none', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>Sign out</button>
          </div>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <button onClick={() => { if (month === 1) { setMonth(12); setYear(y => y-1) } else setMonth(m => m-1) }} style={{ padding: '6px 14px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '16px' }}>{'<'}</button>
            <div style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: '16px' }}>{MONTHS[month-1]} {year}</div>
            <button onClick={() => { if (month === 12) { setMonth(1); setYear(y => y+1) } else setMonth(m => m+1) }} style={{ padding: '6px 14px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '16px' }}>{'>'}</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: days }, (_, i) => i + 1).map(day => {
              const entry = entries[day]
              const hasEntry = !!entry
              return (
                <div key={day} style={{ background: '#fff', border: hasEntry ? '1.5px solid #2d6a2d' : '1px solid #e0e0e0', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '15px' }}>Day {day}</span>
                      {hasEntry && (
                        <span style={{ marginLeft: '8px', fontSize: '13px', color: '#2d6a2d' }}>
                          {entry.actual_start?.slice(0,5)} to {entry.actual_finish?.slice(0,5)} | Total: {entry.total_hours} | {entry.what_work}
                        </span>
                      )}
                      {!hasEntry && <span style={{ marginLeft: '8px', fontSize: '13px', color: '#aaa' }}>No entry</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {hasEntry && (
                        <button onClick={() => setSelectedEntry(selectedEntry === day ? null : day)} style={{ padding: '5px 10px', background: '#e8f5e9', border: '1px solid #2d6a2d', borderRadius: '6px', fontSize: '12px', color: '#2d6a2d', cursor: 'pointer' }}>
                          {selectedEntry === day ? 'Hide' : 'View'}
                        </button>
                      )}
                      <button onClick={() => openEdit(editDay === day ? null : day)} style={{ padding: '5px 10px', background: '#2d6a2d', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#fff', cursor: 'pointer' }}>{hasEntry ? 'Edit' : '+ Add'}</button>
                    </div>
                  </div>

                  {editDay === day && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {error && <p style={{ color: 'red', fontSize: '13px', margin: 0 }}>{error}</p>}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Actual start time</label>
                        <input style={inp} placeholder="HH:MM e.g. 10:15" value={form.start} onChange={e => setForm({...form, start: e.target.value})} />
                        {form.start && !VALID.includes(form.start) && <p style={{ color: 'orange', fontSize: '12px', margin: '3px 0 0' }}>Warning: Start time should be 9:00, 9:15, 9:30, or 9:45</p>}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Actual finish time</label>
                        <input style={inp} placeholder="HH:MM e.g. 20:45" value={form.finish} onChange={e => setForm({...form, finish: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>What work</label>
                        <input style={inp} placeholder="e.g. cleaning, planting, water system" value={form.work} onChange={e => setForm({...form, work: e.target.value})} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={saveEntry} disabled={saving} style={{ flex: 1, padding: '10px', background: saving ? '#aaa' : '#2d6a2d', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                        <button onClick={() => { setEditDay(null); setError('') }} style={{ flex: 1, padding: '10px', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {selectedEntry === day && hasEntry && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px', overflowX: 'auto' }}>

                      <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>WORK PAID BY THE HOUR</p>
                      <p style={{ fontSize: '11px', color: '#555', marginBottom: '6px' }}>8 HOURS PER DAY / 40 HOURS PER WEEK</p>
                      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '540px', fontSize: '12px', marginBottom: '6px' }}>
                        <thead>
                          <tr>
                            <th style={thW}>Date</th>
                            <th style={thW}>Start</th>
                            <th style={thW}>Finish</th>
                            <th style={thW}>Must have Eating break</th>
                            <th style={thW}>Extra Breaks</th>
                            <th style={thW}>Hours minus breaks</th>
                            <th style={thW}>What work</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={tdW}>{day}</td>
                            <td style={tdW}>{entry.white_start?.slice(0,5)}</td>
                            <td style={tdW}>{entry.white_finish?.slice(0,5)}</td>
                            <td style={{ ...tdW, textAlign: 'center' }}>30 min</td>
                            <td style={tdW}></td>
                            <td style={{ ...tdW, fontWeight: '700', color: '#2d6a2d' }}>7:30</td>
                            <td style={tdW}>{entry.what_work}</td>
                          </tr>
                        </tbody>
                      </table>
                      <p style={{ fontSize: '11px', color: '#666', marginBottom: '16px', fontStyle: 'italic' }}>When you have worked 4 hours, You need to have an eating break, minimum of 30 mins. START WORK 9:00, 9:15, 9:30 or 9:45.</p>

                      <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#b45309' }}>EXTRAWORK PAID BY THE HOUR</p>
                      <p style={{ fontSize: '11px', color: '#555', marginBottom: '6px' }}>MAXIMUM 3 HOURS PER DAY (MONDAY-FRIDAY) | MAXIMUM 11 HOURS PER DAY (SATURDAY)</p>
                      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '540px', fontSize: '12px', marginBottom: '6px', background: '#fffbf0' }}>
                        <thead>
                          <tr>
                            <th style={thO}>Date</th>
                            <th style={thO}>Start</th>
                            <th style={thO}>Finish</th>
                            <th style={thO}>Break</th>
                            <th style={thO}>Hours minus breaks</th>
                            <th style={thO}>What work</th>
                            <th style={thO}>Signature</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={tdO}>{day}</td>
                            <td style={tdO}>{entry.orange_start?.slice(0,5)}</td>
                            <td style={tdO}>{entry.orange_finish?.slice(0,5)}</td>
                            <td style={{ ...tdO, textAlign: 'center' }}>0:15</td>
                            <td style={{ ...tdO, fontWeight: '700', color: '#b45309' }}>{entry.orange_hours}</td>
                            <td style={tdO}>{entry.what_work}</td>
                            <td style={tdO}></td>
                          </tr>
                        </tbody>
                      </table>
                      <p style={{ fontSize: '11px', color: '#666', marginBottom: '16px', fontStyle: 'italic' }}>Start work 9:00, 9:15, 9:30 or 9:45. Work does not start 9:05, 9:10, 9:20, 9:25 etc.</p>

                      <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#1565c0' }}>WEEKLY SUMMARY</p>
                      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '540px', fontSize: '12px', marginBottom: '6px', background: '#f0f7ff' }}>
                        <thead>
                          <tr>
                            <th style={{ ...thB, textAlign: 'left' }}>Type</th>
                            <th style={thB}>Mon</th>
                            <th style={thB}>Tue</th>
                            <th style={thB}>Wed</th>
                            <th style={thB}>Thur</th>
                            <th style={thB}>Fri</th>
                            <th style={thB}>Sat (max 11)</th>
                            <th style={thB}>Sun</th>
                            <th style={thB}>Total hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ ...tdB, textAlign: 'left', fontWeight: '600' }}>Working hours (max 8)</td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={{ ...tdB, color: '#999' }}>X</td>
                            <td style={{ ...tdB, fontWeight: '700' }}>7:30</td>
                          </tr>
                          <tr>
                            <td style={{ ...tdB, textAlign: 'left', fontWeight: '600' }}>Extra hours (max 3)</td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={{ ...tdB, color: '#999' }}>X</td>
                            <td style={{ ...tdB, fontWeight: '700', color: '#1565c0' }}>{entry.orange_hours}</td>
                          </tr>
                          <tr style={{ background: '#e3f2fd' }}>
                            <td style={{ ...tdB, textAlign: 'left', fontWeight: '700' }}>Total</td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={tdB}></td>
                            <td style={{ ...tdB, color: '#999' }}>X</td>
                            <td style={{ ...tdB, fontWeight: '700', color: '#1565c0', fontSize: '14px' }}>{entry.total_hours}</td>
                          </tr>
                        </tbody>
                      </table>
                      <p style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginBottom: '8px' }}>Copy these values to your paper forms. Yes, I want to work extra hours.</p>

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}