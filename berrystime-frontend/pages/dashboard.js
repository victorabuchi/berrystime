import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import api from '../lib/api'
import { getWorker, isLoggedIn, clearAuth } from '../lib/auth'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const VALID = ['09:00','09:15','09:30','09:45']

function getDaysInMonth(m, y) {
  return new Date(y, m, 0).getDate()
}

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
  const [activeTab, setActiveTab] = useState('white')
  const [view, setView] = useState('list')

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
        const day = new Date(e.entry_date).getUTCDate()
        map[day] = e
      })
      setEntries(map)
    } catch (err) {
      console.error('Failed to load entries')
    }
  }

  function openEdit(day) {
    const e = entries[day]
    setForm({
      start: e ? e.actual_start?.slice(0,5) || '' : '',
      finish: e ? e.actual_finish?.slice(0,5) || '' : '',
      work: e ? e.what_work || '' : ''
    })
    setEditDay(day)
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

  const inp = {
    width: '100%', padding: '10px 12px', fontSize: '15px',
    border: '1px solid #ccc', borderRadius: '8px',
    boxSizing: 'border-box', fontFamily: 'inherit'
  }

  function thStyle(bg, border) {
    return { border: '1px solid ' + border, padding: '7px 8px', textAlign: 'left', whiteSpace: 'nowrap', background: bg, fontSize: '12px', fontWeight: '700' }
  }

  function tdStyle(border, bg) {
    return { border: '1px solid ' + border, padding: '6px 8px', fontSize: '12px', background: bg || 'transparent' }
  }

  function tabBtn(tab) {
    return {
      padding: '8px 16px', fontWeight: '700', fontSize: '13px',
      border: '1px solid #ccc', borderBottom: activeTab === tab ? '2px solid #2d6a2d' : '1px solid #ccc',
      background: activeTab === tab ? '#fff' : '#f5f5f5',
      cursor: 'pointer', borderRadius: '6px 6px 0 0',
      color: activeTab === tab ? '#2d6a2d' : '#555'
    }
  }

  function minsToHHMM(m) {
    if (m <= 0) return ''
    return Math.floor(m/60) + ':' + String(m%60).padStart(2,'0')
  }

  return (
    <>
      <Head><title>Berrystime</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>

        <div style={{ background: '#2d6a2d', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#fff' }}>Berrystime</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {worker && <span style={{ fontSize: '13px', color: '#cfffcf' }}>#{worker.work_number} {worker.full_name}</span>}
            <button onClick={logout} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#fff' }}>Sign out</button>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => { if (month === 1) { setMonth(12); setYear(y => y-1) } else setMonth(m => m-1) }} style={{ padding: '6px 14px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '16px' }}>{'<'}</button>
              <div style={{ fontWeight: '700', fontSize: '16px', minWidth: '140px', textAlign: 'center' }}>{MONTHS[month-1]} {year}</div>
              <button onClick={() => { if (month === 12) { setMonth(1); setYear(y => y+1) } else setMonth(m => m+1) }} style={{ padding: '6px 14px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '16px' }}>{'>'}</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setView('list')} style={{ padding: '7px 14px', background: view === 'list' ? '#2d6a2d' : '#fff', color: view === 'list' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Days</button>
              <button onClick={() => setView('papers')} style={{ padding: '7px 14px', background: view === 'papers' ? '#2d6a2d' : '#fff', color: view === 'papers' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Papers</button>
            </div>
          </div>

          {view === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Array.from({ length: days }, (_, i) => i + 1).map(day => {
                const entry = entries[day]
                const hasEntry = !!entry
                return (
                  <div key={day} style={{ background: '#fff', border: hasEntry ? '2px solid #2d6a2d' : '1px solid #ddd', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', fontSize: '15px', minWidth: '55px' }}>Day {day}</span>
                        {hasEntry ? (
                          <span style={{ fontSize: '13px', color: '#2d6a2d', fontWeight: '600' }}>
                            {entry.actual_start?.slice(0,5)} to {entry.actual_finish?.slice(0,5)} | White: 7:30 | Extra: {entry.orange_hours} | Total: {entry.total_hours} | {entry.what_work}
                          </span>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#bbb' }}>No entry yet</span>
                        )}
                      </div>
                      <button onClick={() => openEdit(editDay === day ? null : day)} style={{ padding: '5px 12px', background: hasEntry ? '#e8f5e9' : '#2d6a2d', border: hasEntry ? '1px solid #2d6a2d' : 'none', borderRadius: '6px', fontSize: '12px', color: hasEntry ? '#2d6a2d' : '#fff', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        {editDay === day ? 'Close' : hasEntry ? 'Edit' : '+ Add'}
                      </button>
                    </div>

                    {editDay === day && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {error && <p style={{ color: 'red', fontSize: '13px', margin: 0 }}>{error}</p>}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '130px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Actual start time</label>
                            <input style={inp} placeholder="HH:MM e.g. 10:15" value={form.start} onChange={e => setForm({...form, start: e.target.value})} />
                            {form.start && !VALID.includes(form.start) && <p style={{ color: 'orange', fontSize: '11px', margin: '2px 0 0' }}>Should be 9:00, 9:15, 9:30, or 9:45</p>}
                          </div>
                          <div style={{ flex: 1, minWidth: '130px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Actual finish time</label>
                            <input style={inp} placeholder="HH:MM e.g. 20:45" value={form.finish} onChange={e => setForm({...form, finish: e.target.value})} />
                          </div>
                          <div style={{ flex: 2, minWidth: '180px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>What work</label>
                            <input style={inp} placeholder="e.g. cleaning, planting" value={form.work} onChange={e => setForm({...form, work: e.target.value})} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={saveEntry} disabled={saving} style={{ flex: 1, padding: '10px', background: saving ? '#aaa' : '#2d6a2d', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                          <button onClick={() => { setEditDay(null); setError('') }} style={{ padding: '10px 20px', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {view === 'papers' && (
            <div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '0' }}>
                <button style={tabBtn('white')} onClick={() => setActiveTab('white')}>White Paper</button>
                <button style={tabBtn('orange')} onClick={() => setActiveTab('orange')}>Orange Paper</button>
                <button style={tabBtn('weekly')} onClick={() => setActiveTab('weekly')}>Weekly Summary</button>
              </div>

              <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: '0 8px 8px 8px', padding: '16px', overflowX: 'auto' }}>

                {activeTab === 'white' && (
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '14px', marginBottom: '2px' }}>WORK PAID BY THE HOUR</p>
                    <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '2px' }}>8 HOURS PER DAY / 40 HOURS PER WEEK</p>
                    <p style={{ fontSize: '11px', color: '#333', marginBottom: '10px' }}>Name: <b>{worker?.full_name}</b> &nbsp;&nbsp; Work number: <b>{worker?.work_number}</b></p>
                    <table style={{ borderCollapse: 'collapse', minWidth: '600px', width: '100%', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th style={thStyle('#e0e0e0', '#333')}>Date</th>
                          <th style={thStyle('#e0e0e0', '#333')}>Start</th>
                          <th style={thStyle('#e0e0e0', '#333')}>Finish</th>
                          <th style={thStyle('#e0e0e0', '#333')}>Must have Eating break</th>
                          <th style={thStyle('#e0e0e0', '#333')}>Extra Breaks</th>
                          <th style={thStyle('#e0e0e0', '#333')}>Hours minus breaks</th>
                          <th style={thStyle('#e0e0e0', '#333')}>What work</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: days }, (_, i) => i + 1).map(day => {
                          const entry = entries[day]
                          return (
                            <tr key={day} style={{ background: entry ? '#f0fff0' : '#fff' }}>
                              <td style={tdStyle('#333')}><b>{day}</b></td>
                              <td style={tdStyle('#333')}>{entry ? entry.white_start?.slice(0,5) : ''}</td>
                              <td style={tdStyle('#333')}>{entry ? entry.white_finish?.slice(0,5) : ''}</td>
                              <td style={{ ...tdStyle('#333'), textAlign: 'center' }}>30 min</td>
                              <td style={tdStyle('#333')}></td>
                              <td style={{ ...tdStyle('#333'), fontWeight: '700', color: entry ? '#2d6a2d' : '' }}>{entry ? '7:30' : ''}</td>
                              <td style={tdStyle('#333')}>{entry ? entry.what_work : ''}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    <p style={{ fontSize: '11px', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>When you have worked 4 hours, You need to have an eating break, minimum of 30 mins.</p>
                    <p style={{ fontSize: '11px', color: '#555', fontStyle: 'italic' }}>START WORK 9:00, 9:15, 9:30 or 9:45. WORK DOES NOT START 9:05, 9:10, 9:20, 9:25 etc.</p>
                  </div>
                )}

                {activeTab === 'orange' && (
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '14px', marginBottom: '2px', color: '#b45309' }}>EXTRAWORK PAID BY THE HOUR</p>
                    <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '2px' }}>MAXIMUM 3 HOURS PER DAY (MONDAY-FRIDAY)</p>
                    <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '2px' }}>MAXIMUM 11 HOURS PER DAY (SATURDAY)</p>
                    <p style={{ fontSize: '11px', color: '#333', marginBottom: '10px' }}>Name: <b>{worker?.full_name}</b> &nbsp;&nbsp; Work number: <b>{worker?.work_number}</b></p>
                    <table style={{ borderCollapse: 'collapse', minWidth: '600px', width: '100%', fontSize: '12px', background: '#fffbf0' }}>
                      <thead>
                        <tr>
                          <th style={thStyle('#ffe0a0', '#c97d00')}>Date</th>
                          <th style={thStyle('#ffe0a0', '#c97d00')}>Start</th>
                          <th style={thStyle('#ffe0a0', '#c97d00')}>Finish</th>
                          <th style={thStyle('#ffe0a0', '#c97d00')}>Break</th>
                          <th style={thStyle('#ffe0a0', '#c97d00')}>Hours minus breaks</th>
                          <th style={thStyle('#ffe0a0', '#c97d00')}>What work</th>
                          <th style={thStyle('#ffe0a0', '#c97d00')}>Signature</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: days }, (_, i) => i + 1).map(day => {
                          const entry = entries[day]
                          return (
                            <tr key={day} style={{ background: entry ? '#fff8e1' : '#fffbf0' }}>
                              <td style={tdStyle('#c97d00')}><b>{day}</b></td>
                              <td style={tdStyle('#c97d00')}>{entry ? entry.orange_start?.slice(0,5) : ''}</td>
                              <td style={tdStyle('#c97d00')}>{entry ? entry.orange_finish?.slice(0,5) : ''}</td>
                              <td style={{ ...tdStyle('#c97d00'), textAlign: 'center' }}>{entry ? '0:15' : ''}</td>
                              <td style={{ ...tdStyle('#c97d00'), fontWeight: '700', color: entry ? '#b45309' : '' }}>{entry ? entry.orange_hours : ''}</td>
                              <td style={tdStyle('#c97d00')}>{entry ? entry.what_work : ''}</td>
                              <td style={tdStyle('#c97d00')}></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    <p style={{ fontSize: '11px', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>Start work 9:00, 9:15, 9:30 or 9:45. Work does not start 9:05, 9:10, 9:20, 9:25 etc.</p>
                  </div>
                )}

                {activeTab === 'weekly' && (
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>WEEKLY SUMMARY</p>
                    <p style={{ fontSize: '11px', color: '#333', marginBottom: '10px' }}>Name: <b>{worker?.full_name}</b> &nbsp;&nbsp; Work number: <b>{worker?.work_number}</b></p>
                    {Array.from({ length: Math.ceil(days / 7) }, (_, weekIdx) => {
                      const weekStart = weekIdx * 7 + 1
                      const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i).filter(d => d <= days)
                      const weekEntries = weekDays.map(d => entries[d]).filter(Boolean)
                      const totalWorking = weekEntries.length * 450
                      const totalExtra = weekEntries.reduce((sum, e) => {
                        if (!e.orange_hours) return sum
                        const p = e.orange_hours.split(':')
                        return sum + parseInt(p[0]) * 60 + parseInt(p[1])
                      }, 0)
                      const totalAll = totalWorking + totalExtra
                      return (
                        <div key={weekIdx} style={{ marginBottom: '24px' }}>
                          <p style={{ fontWeight: '700', fontSize: '12px', marginBottom: '6px', color: '#1565c0' }}>Week {weekIdx + 1} (Days {weekStart} to {weekDays[weekDays.length-1]})</p>
                          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px', background: '#f0f7ff' }}>
                            <thead>
                              <tr>
                                <th style={{ ...thStyle('#bbdefb', '#1565c0'), textAlign: 'left', minWidth: '140px' }}>Type</th>
                                {weekDays.map(d => <th key={d} style={{ ...thStyle('#bbdefb', '#1565c0'), textAlign: 'center', minWidth: '60px' }}>Day {d}</th>)}
                                {weekDays.length < 7 && Array.from({ length: 7 - weekDays.length }, (_, i) => <th key={'e'+i} style={thStyle('#bbdefb', '#1565c0')}></th>)}
                                <th style={{ ...thStyle('#bbdefb', '#1565c0'), textAlign: 'center' }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{ ...tdStyle('#1565c0', '#f0f7ff'), fontWeight: '600' }}>Working hours (max 8)</td>
                                {weekDays.map(d => <td key={d} style={{ ...tdStyle('#1565c0'), textAlign: 'center', fontWeight: '700', color: entries[d] ? '#2d6a2d' : '#ddd' }}>{entries[d] ? '7:30' : ''}</td>)}
                                {weekDays.length < 7 && Array.from({ length: 7 - weekDays.length }, (_, i) => <td key={'e'+i} style={tdStyle('#1565c0')}></td>)}
                                <td style={{ ...tdStyle('#1565c0'), textAlign: 'center', fontWeight: '700', color: '#2d6a2d' }}>{minsToHHMM(totalWorking)}</td>
                              </tr>
                              <tr>
                                <td style={{ ...tdStyle('#1565c0', '#f0f7ff'), fontWeight: '600' }}>Extra hours (max 3)</td>
                                {weekDays.map(d => <td key={d} style={{ ...tdStyle('#1565c0'), textAlign: 'center', fontWeight: '700', color: entries[d] ? '#b45309' : '#ddd' }}>{entries[d] ? entries[d].orange_hours : ''}</td>)}
                                {weekDays.length < 7 && Array.from({ length: 7 - weekDays.length }, (_, i) => <td key={'e'+i} style={tdStyle('#1565c0')}></td>)}
                                <td style={{ ...tdStyle('#1565c0'), textAlign: 'center', fontWeight: '700', color: '#b45309' }}>{minsToHHMM(totalExtra)}</td>
                              </tr>
                              <tr style={{ background: '#e3f2fd' }}>
                                <td style={{ ...tdStyle('#1565c0'), fontWeight: '700' }}>Total hours</td>
                                {weekDays.map(d => <td key={d} style={{ ...tdStyle('#1565c0'), textAlign: 'center', fontWeight: '700', color: entries[d] ? '#1565c0' : '#ddd' }}>{entries[d] ? entries[d].total_hours : ''}</td>)}
                                {weekDays.length < 7 && Array.from({ length: 7 - weekDays.length }, (_, i) => <td key={'e'+i} style={tdStyle('#1565c0')}></td>)}
                                <td style={{ ...tdStyle('#1565c0'), textAlign: 'center', fontWeight: '700', color: '#1565c0', fontSize: '13px' }}>{minsToHHMM(totalAll)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )
                    })}
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}