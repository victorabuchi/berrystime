import { useState } from 'react';
import Head from 'next/head';

function toMins(t) {
  const p = t.split(':');
  return parseInt(p[0]) * 60 + parseInt(p[1]);
}

function toHHMM(m) {
  if (m <= 0) return '0:00';
  return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
}

function addMins(t, add) {
  const total = toMins(t) + add;
  return String(Math.floor(total / 60) % 24).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

const VALID = ['09:00', '09:15', '09:30', '09:45'];

export default function Home() {
  const [date, setDate] = useState('');
  const [work, setWork] = useState('');
  const [start, setStart] = useState('');
  const [finish, setFinish] = useState('');
  const [warn, setWarn] = useState('');
  const [res, setRes] = useState(null);

  function handleStart(val) {
    setStart(val);
    setWarn(val && !VALID.includes(val) ? 'Warning: Start time should be 9:00, 9:15, 9:30, or 9:45' : '');
  }

  function calc() {
    if (!date || !start || !finish) {
      alert('Please fill in date, start time, and finish time');
      return;
    }
    const wFinish = addMins(start, 450);
    const oStart = addMins(start, 480);
    const oHours = Math.max(0, toMins(finish) - toMins(oStart) - 15);
    setRes({ date, work, wStart: start, wFinish, oStart, oFinish: finish, oHours: toHHMM(oHours), total: toHHMM(450 + oHours) });
  }

  const inp = { width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', fontFamily: 'inherit' };
  const lbl = { display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '5px', color: '#333' };

  return (
    <>
      <Head>
        <title>Berrystime</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ background: '#fff', minHeight: '100vh', padding: '24px 16px' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>

          <h1 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '700', marginBottom: '4px' }}>
            <span style={{ color: '#2d6a2d' }}>Berry</span><span style={{ color: '#000' }}>stime</span>
          </h1>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '28px' }}>
            Your work hours, calculated automatically
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={lbl}>Date</label>
              <input style={inp} placeholder="e.g. 25" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label style={lbl}>What work</label>
              <input style={inp} placeholder="e.g. cleaning, planting, water system" value={work} onChange={e => setWork(e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Actual start time</label>
              <input style={inp} placeholder="HH:MM e.g. 10:15" value={start} onChange={e => handleStart(e.target.value)} />
              {warn && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0 0' }}>{warn}</p>}
            </div>
            <div>
              <label style={lbl}>Actual finish time</label>
              <input style={inp} placeholder="HH:MM e.g. 20:45" value={finish} onChange={e => setFinish(e.target.value)} />
            </div>
            <button onClick={calc} style={{ width: '100%', padding: '14px', background: '#2d6a2d', color: '#fff', fontSize: '16px', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Calculate
            </button>
          </div>

          {res && (
            <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{ background: '#fff', border: '2px solid #2d6a2d', borderRadius: '10px', padding: '14px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>White Paper — Work Paid by Hour</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'collapse', fontSize: '13px', minWidth: '380px' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Start</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Finish</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Eating break</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Extra breaks</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Hours minus breaks</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>What work</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '7px 8px' }}>{res.date}</td>
                        <td style={{ padding: '7px 8px' }}>{res.wStart}</td>
                        <td style={{ padding: '7px 8px' }}>{res.wFinish}</td>
                        <td style={{ padding: '7px 8px' }}>0:30</td>
                        <td style={{ padding: '7px 8px' }}></td>
                        <td style={{ padding: '7px 8px', fontWeight: '700' }}>7:30</td>
                        <td style={{ padding: '7px 8px' }}>{res.work}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '8px', fontStyle: 'italic' }}>Copy these values to your paper form</p>
              </div>

              <div style={{ background: '#fff3e0', border: '2px solid #e67e22', borderRadius: '10px', padding: '14px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Orange Paper — Extrawork Paid by Hour</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'collapse', fontSize: '13px', minWidth: '320px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.06)' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Start</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Finish</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Break</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Hours minus breaks</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>What work</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '7px 8px' }}>{res.date}</td>
                        <td style={{ padding: '7px 8px' }}>{res.oStart}</td>
                        <td style={{ padding: '7px 8px' }}>{res.oFinish}</td>
                        <td style={{ padding: '7px 8px' }}>0:15</td>
                        <td style={{ padding: '7px 8px', fontWeight: '700' }}>{res.oHours}</td>
                        <td style={{ padding: '7px 8px' }}>{res.work}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '8px', fontStyle: 'italic' }}>Copy these values to your paper form</p>
              </div>

              <div style={{ background: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '10px', padding: '14px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Weekly Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <span style={{ fontSize: '14px' }}>Working hours</span>
                    <span style={{ fontSize: '16px', fontWeight: '700' }}>7:30</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <span style={{ fontSize: '14px' }}>Extra hours</span>
                    <span style={{ fontSize: '16px', fontWeight: '700' }}>{res.oHours}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>Total hours</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#1976d2' }}>{res.total}</span>
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '8px', fontStyle: 'italic' }}>Copy these values to your paper form</p>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}