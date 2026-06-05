import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

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

export default function Home() {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [work, setWork] = useState('')
  const [start, setStart] = useState('')
  const [finish, setFinish] = useState('')
  const [res, setRes] = useState(null)
  const [activeFeature, setActiveFeature] = useState(0)
  const [animStep, setAnimStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setAnimStep(s => (s + 1) % 4), 1800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(s => (s + 1) % 3), 3000)
    return () => clearInterval(t)
  }, [])

  function calc() {
    if (!date || !start || !finish) { alert('Please fill in date, start time, and finish time'); return }
    const wFinish = addMins(start, 450)
    const oStart = addMins(start, 480)
    const oMins = Math.max(0, toMins(finish) - toMins(oStart) - 15)
    setRes({ date, work, wStart: start, wFinish, oStart, oFinish: finish, oHours: toHHMM(oMins), total: toHHMM(450 + oMins) })
  }

  const workerFeatures = [
    { icon: '⏱', title: 'Calculate hours instantly', desc: 'Enter actual start and finish time. All 3 paper forms filled automatically.' },
    { icon: '📋', title: 'Track the full month', desc: 'See all 31 days in one view. Add, edit, and save each working day.' },
    { icon: '📊', title: 'Weekly summary auto-built', desc: 'Your weekly totals calculate automatically as you add daily entries.' },
  ]

  const staffFeatures = [
    { icon: '👥', title: 'View all workers', desc: 'See every worker\'s timesheet in one admin panel.' },
    { icon: '✅', title: 'Verify hours', desc: 'Approve working hours before they go to payroll.' },
    { icon: '📤', title: 'Export reports', desc: 'Download reports for the housemaster and payroll team.' },
  ]

  const animCards = [
    { label: 'Start time', value: '10:15', color: '#2d6a2d' },
    { label: 'White paper', value: '7:30 hrs', color: '#2d6a2d' },
    { label: 'Extra hours', value: '3:15 hrs', color: '#b45309' },
    { label: 'Total today', value: '10:45', color: '#1565c0' },
  ]

  return (
    <>
      <Head>
        <title>Rannikon — Work Hours Made Easy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#fafaf9;color:#1a1a18;-webkit-font-smoothing:antialiased}
        a{text-decoration:none;color:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatA{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0) rotate(2deg)}50%{transform:translateY(-14px) rotate(-1deg)}}
        @keyframes floatC{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
        @keyframes shimmer{0%{opacity:0.4}50%{opacity:1}100%{opacity:0.4}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        .anim0{animation:floatA 5s ease-in-out infinite}
        .anim1{animation:floatB 4s ease-in-out infinite}
        .anim2{animation:floatC 6s ease-in-out infinite}
        .nav-btn:hover{background:#f0f0ec!important}
        .cta-btn:hover{background:#235223!important;transform:translateY(-1px)}
        .cta-btn{transition:all 0.2s}
        .feature-tab{transition:all 0.2s;cursor:pointer}
        .feature-tab:hover{background:#f0f7f0!important}
        .calc-inp:focus{border-color:#2d6a2d!important;outline:none;box-shadow:0 0 0 3px rgba(45,106,45,0.12)}
        .card-hover:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,0.1)!important}
        .card-hover{transition:all 0.25s}
        .fade-up{animation:fadeUp 0.7s ease both}
        .dot-pulse{animation:pulse 2s infinite}
        @media(max-width:768px){
          .hero-grid{flex-direction:column!important}
          .features-grid{flex-direction:column!important}
          .nav-links{display:none!important}
          .hero-visual{display:none!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{background:'rgba(250,250,249,0.92)',backdropFilter:'blur(12px)',borderBottom:'1px solid #e8e8e3',position:'sticky',top:0,zIndex:200,padding:'0 24px'}}>
        <div style={{maxWidth:'1080px',margin:'0 auto',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'34px',height:'34px',background:'#2d6a2d',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{color:'#fff',fontWeight:'800',fontSize:'15px',letterSpacing:'-0.5px'}}>R</span>
            </div>
            <span style={{fontWeight:'800',fontSize:'19px',letterSpacing:'-0.5px'}}>Rannikon</span>
          </div>
          <div className="nav-links" style={{display:'flex',gap:'28px',alignItems:'center'}}>
            {['Features','How it works','Calculator'].map(l => (
              <a key={l} href={'#'+l.toLowerCase().replace(' ','-')} style={{fontSize:'14px',fontWeight:'500',color:'#555',transition:'color 0.15s'}}
                onMouseEnter={e=>e.target.style.color='#2d6a2d'} onMouseLeave={e=>e.target.style.color='#555'}>{l}</a>
            ))}
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button className="nav-btn" onClick={()=>router.push('/login')} style={{padding:'8px 16px',background:'transparent',border:'1px solid #ddd',borderRadius:'8px',fontSize:'14px',fontWeight:'500',cursor:'pointer',color:'#333',transition:'background 0.15s'}}>Sign in</button>
            <button className="cta-btn" onClick={()=>router.push('/register')} style={{padding:'8px 16px',background:'#2d6a2d',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer',color:'#fff'}}>Get started</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{background:'linear-gradient(160deg,#f2f8f2 0%,#fafaf9 45%,#f8f4ee 100%)',padding:'72px 24px 60px',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',top:'-60px',right:'-60px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(45,106,45,0.07) 0%,transparent 65%)',borderRadius:'50%',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'-40px',left:'-80px',width:'320px',height:'320px',background:'radial-gradient(circle,rgba(21,101,192,0.05) 0%,transparent 65%)',borderRadius:'50%',pointerEvents:'none'}}/>

        <div className="hero-grid" style={{maxWidth:'1080px',margin:'0 auto',display:'flex',alignItems:'center',gap:'56px'}}>
          <div style={{flex:'1',minWidth:'280px'}}>
            <div className="fade-up" style={{display:'inline-flex',alignItems:'center',gap:'7px',background:'#e8f5e9',border:'1px solid #c8e6c9',borderRadius:'20px',padding:'5px 14px',marginBottom:'22px'}}>
              <span className="dot-pulse" style={{width:'7px',height:'7px',background:'#2d6a2d',borderRadius:'50%',display:'inline-block'}}/>
              <span style={{fontSize:'12px',fontWeight:'600',color:'#2d6a2d'}}>500+ workers already using Rannikon</span>
            </div>
            <h1 className="fade-up" style={{fontSize:'clamp(30px,5vw,54px)',fontWeight:'800',lineHeight:'1.08',letterSpacing:'-1.5px',marginBottom:'18px',animationDelay:'0.1s'}}>
              Farm work hours,<br/><span style={{color:'#2d6a2d'}}>done in seconds</span>
            </h1>
            <p className="fade-up" style={{fontSize:'17px',color:'#555',lineHeight:'1.7',marginBottom:'30px',maxWidth:'420px',animationDelay:'0.2s'}}>
              Enter your start and finish time. Rannikon automatically calculates and fills all your paper forms — white paper, orange paper, and weekly summary. Zero mistakes.
            </p>
            <div className="fade-up" style={{display:'flex',gap:'12px',flexWrap:'wrap',animationDelay:'0.3s'}}>
              <button className="cta-btn" onClick={()=>router.push('/register')} style={{padding:'13px 26px',background:'#2d6a2d',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer',color:'#fff'}}>
                Create free account
              </button>
              <a href="#calculator" style={{padding:'13px 26px',background:'#fff',border:'1px solid #e0e0dc',borderRadius:'10px',fontSize:'15px',fontWeight:'600',color:'#333',display:'inline-block',transition:'background 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#f5f5f0'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                Try calculator
              </a>
            </div>
            <div style={{display:'flex',gap:'32px',marginTop:'36px',flexWrap:'wrap'}}>
              {[['500+','Workers'],['3','Papers auto-filled'],['0','Errors']].map(([n,l])=>(
                <div key={l}>
                  <div style={{fontSize:'22px',fontWeight:'800',color:'#2d6a2d',letterSpacing:'-0.5px'}}>{n}</div>
                  <div style={{fontSize:'12px',color:'#999',marginTop:'2px'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ANIMATED VISUAL */}
          <div className="hero-visual" style={{flex:'1',minWidth:'300px',position:'relative',height:'400px',display:'flex',justifyContent:'center',alignItems:'center'}}>

            {/* Main white paper card */}
            <div className="anim0" style={{position:'absolute',left:'0',top:'20px',background:'#fff',border:'1px solid #e0e0dc',borderRadius:'18px',padding:'20px 22px',width:'240px',boxShadow:'0 12px 40px rgba(0,0,0,0.08)'}}>
              <div style={{fontSize:'10px',fontWeight:'700',color:'#2d6a2d',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'12px'}}>White paper</div>
              {[['Date','4'],['Start time','10:30'],['Finish time','17:30'],['Eating break','30 min'],['Hours','7:30']].map(([l,v],i)=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:i<4?'1px solid #f0f0ec':'none'}}>
                  <span style={{fontSize:'12px',color:'#888'}}>{l}</span>
                  <span style={{fontSize:'12px',fontWeight:'600',color:l==='Hours'?'#2d6a2d':'#1a1a18'}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:'10px',background:'#e8f5e9',borderRadius:'8px',padding:'6px 10px',textAlign:'center'}}>
                <span style={{fontSize:'11px',color:'#2d6a2d',fontWeight:'600'}}>Auto-calculated ✓</span>
              </div>
            </div>

            {/* Orange paper card */}
            <div className="anim1" style={{position:'absolute',right:'0',top:'40px',background:'#fff8f0',border:'1px solid #fde0b0',borderRadius:'18px',padding:'20px 22px',width:'210px',boxShadow:'0 12px 40px rgba(0,0,0,0.08)'}}>
              <div style={{fontSize:'10px',fontWeight:'700',color:'#b45309',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'12px'}}>Orange paper</div>
              {[['Start','18:30'],['Finish','21:15'],['Break','0:15'],['Extra hrs','2:30']].map(([l,v],i)=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:i<3?'1px solid #fde8c0':'none'}}>
                  <span style={{fontSize:'12px',color:'#c08040'}}>{l}</span>
                  <span style={{fontSize:'12px',fontWeight:'600',color:l==='Extra hrs'?'#b45309':'#1a1a18'}}>{v}</span>
                </div>
              ))}
            </div>

            {/* Weekly summary card */}
            <div className="anim2" style={{position:'absolute',bottom:'10px',left:'50%',transform:'translateX(-50%)',background:'#e8f0fc',border:'1px solid #b3c9f0',borderRadius:'18px',padding:'16px 20px',width:'220px',boxShadow:'0 12px 40px rgba(0,0,0,0.08)'}}>
              <div style={{fontSize:'10px',fontWeight:'700',color:'#1565c0',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'10px'}}>Weekly summary</div>
              {[['Working hours','7:30'],['Extra hours','2:30'],['Total','10:00']].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}>
                  <span style={{fontSize:'12px',color:'#3a6aaa'}}>{l}</span>
                  <span style={{fontSize:'13px',fontWeight:'700',color:'#1565c0'}}>{v}</span>
                </div>
              ))}
            </div>

            {/* Animated step indicator */}
            <div style={{position:'absolute',top:'-10px',right:'30px',background:'#2d6a2d',borderRadius:'12px',padding:'8px 14px',boxShadow:'0 8px 24px rgba(45,106,45,0.3)'}}>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.75)',marginBottom:'2px'}}>Calculated in</div>
              <div style={{fontSize:'16px',fontWeight:'800',color:'#fff'}}>0.1 seconds</div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURE TABS */}
      <section id="features" style={{padding:'80px 24px',background:'#fff'}}>
        <div style={{maxWidth:'1080px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <h2 style={{fontSize:'clamp(22px,4vw,40px)',fontWeight:'800',letterSpacing:'-0.8px',marginBottom:'10px'}}>Built for everyone at the farm</h2>
            <p style={{fontSize:'16px',color:'#666',maxWidth:'440px',margin:'0 auto',lineHeight:'1.6'}}>Whether you pick berries or manage the team — Rannikon has you covered</p>
          </div>

          <div className="features-grid" style={{display:'flex',gap:'24px',alignItems:'flex-start'}}>

            {/* Workers */}
            <div style={{flex:'1',background:'#fafaf8',border:'1px solid #e8e8e3',borderRadius:'20px',padding:'32px',minWidth:'280px'}}>
              <div style={{fontSize:'28px',marginBottom:'14px'}}>👷</div>
              <h3 style={{fontSize:'20px',fontWeight:'800',letterSpacing:'-0.3px',marginBottom:'20px'}}>For workers</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'0'}}>
                {workerFeatures.map((f,i)=>(
                  <div key={i} className="feature-tab" onClick={()=>setActiveFeature(i)}
                    style={{padding:'14px',borderRadius:'12px',background:activeFeature===i?'#e8f5e9':'transparent',marginBottom:'4px',border:activeFeature===i?'1px solid #c8e6c9':'1px solid transparent'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:activeFeature===i?'6px':'0'}}>
                      <span style={{fontSize:'18px'}}>{f.icon}</span>
                      <span style={{fontSize:'14px',fontWeight:'600',color:'#1a1a18'}}>{f.title}</span>
                    </div>
                    {activeFeature===i && <p style={{fontSize:'13px',color:'#555',lineHeight:'1.5',paddingLeft:'28px',animation:'slideIn 0.2s ease'}}>{f.desc}</p>}
                  </div>
                ))}
              </div>
              <button className="cta-btn" onClick={()=>router.push('/register')} style={{marginTop:'20px',width:'100%',padding:'12px',background:'#2d6a2d',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',fontSize:'14px',cursor:'pointer'}}>
                Register as worker
              </button>
            </div>

            {/* Center divider */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',paddingTop:'80px',gap:'8px',opacity:0.4}}>
              <div style={{width:'1px',height:'60px',background:'#ccc'}}/>
              <span style={{fontSize:'11px',color:'#999',fontWeight:'500'}}>AND</span>
              <div style={{width:'1px',height:'60px',background:'#ccc'}}/>
            </div>

            {/* Supervisors */}
            <div style={{flex:'1',background:'#1a1a18',border:'1px solid #333',borderRadius:'20px',padding:'32px',minWidth:'280px'}}>
              <div style={{fontSize:'28px',marginBottom:'14px'}}>👔</div>
              <h3 style={{fontSize:'20px',fontWeight:'800',letterSpacing:'-0.3px',marginBottom:'20px',color:'#fff'}}>For supervisors</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'24px'}}>
                {staffFeatures.map((f,i)=>(
                  <div key={i} style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                    <div style={{width:'32px',height:'32px',background:'rgba(45,106,45,0.25)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'16px'}}>{f.icon}</div>
                    <div>
                      <div style={{fontSize:'14px',fontWeight:'600',color:'#fff',marginBottom:'3px'}}>{f.title}</div>
                      <div style={{fontSize:'12px',color:'#888',lineHeight:'1.4'}}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'12px 16px',textAlign:'center'}}>
                <span style={{fontSize:'13px',color:'#888',fontWeight:'500'}}>Admin panel — coming soon</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{padding:'80px 24px',background:'#f5f5f0'}}>
        <div style={{maxWidth:'1080px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <h2 style={{fontSize:'clamp(22px,4vw,40px)',fontWeight:'800',letterSpacing:'-0.8px',marginBottom:'10px'}}>How it works</h2>
            <p style={{fontSize:'16px',color:'#666',maxWidth:'400px',margin:'0 auto'}}>Three steps to perfectly filled paper forms every day</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'20px'}}>
            {[
              {n:'01',icon:'📝',t:'Enter your times',d:'Open the app, find today\'s date, and type your actual start time and finish time.'},
              {n:'02',icon:'⚡',t:'Rannikon calculates',d:'All columns for white paper, orange paper, and weekly summary fill instantly and automatically.'},
              {n:'03',icon:'✅',t:'Copy to paper form',d:'See the exact values to write on your paper forms. Correct every time, zero math errors.'},
            ].map(({n,icon,t,d})=>(
              <div key={n} className="card-hover" style={{background:'#fff',border:'1px solid #e8e8e3',borderRadius:'16px',padding:'28px',boxShadow:'0 4px 16px rgba(0,0,0,0.04)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
                  <div style={{width:'40px',height:'40px',background:'#e8f5e9',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>{icon}</div>
                  <span style={{fontSize:'12px',fontWeight:'700',color:'#2d6a2d',fontFamily:'monospace'}}>{n}</span>
                </div>
                <h3 style={{fontSize:'17px',fontWeight:'700',letterSpacing:'-0.2px',marginBottom:'8px'}}>{t}</h3>
                <p style={{fontSize:'14px',color:'#666',lineHeight:'1.6'}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator" style={{padding:'80px 24px',background:'#fff'}}>
        <div style={{maxWidth:'480px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'36px'}}>
            <h2 style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:'800',letterSpacing:'-0.8px',marginBottom:'10px'}}>Try the calculator</h2>
            <p style={{fontSize:'15px',color:'#666'}}>No account needed. See your forms filled instantly.</p>
          </div>
          <div style={{background:'#fafaf8',border:'1px solid #e8e8e3',borderRadius:'20px',padding:'28px'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              {[
                {l:'Date',ph:'e.g. 25',v:date,fn:e=>setDate(e.target.value)},
                {l:'What work',ph:'e.g. cleaning, planting, water system',v:work,fn:e=>setWork(e.target.value)},
                {l:'Actual start time',ph:'HH:MM e.g. 10:15',v:start,fn:e=>setStart(e.target.value)},
                {l:'Actual finish time',ph:'HH:MM e.g. 20:45',v:finish,fn:e=>setFinish(e.target.value)},
              ].map(({l,ph,v,fn})=>(
                <div key={l}>
                  <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'5px',color:'#333'}}>{l}</label>
                  <input className="calc-inp" style={{width:'100%',padding:'11px 13px',fontSize:'15px',border:'1px solid #ddd',borderRadius:'9px',background:'#fff',fontFamily:'inherit',transition:'border-color 0.15s'}} placeholder={ph} value={v} onChange={fn}/>
                </div>
              ))}
              <button className="cta-btn" onClick={calc} style={{width:'100%',padding:'13px',background:'#2d6a2d',color:'#fff',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer',marginTop:'4px'}}>
                Calculate my hours →
              </button>
            </div>

            {res && (
              <div style={{marginTop:'24px',display:'flex',flexDirection:'column',gap:'12px'}}>
                <div style={{background:'#fff',border:'2px solid #2d6a2d',borderRadius:'14px',padding:'16px'}}>
                  <p style={{fontSize:'11px',fontWeight:'700',color:'#2d6a2d',letterSpacing:'0.6px',textTransform:'uppercase',marginBottom:'12px'}}>White paper</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                    {[['Start',res.wStart],['Finish',res.wFinish],['Hours','7:30']].map(([l,v])=>(
                      <div key={l} style={{textAlign:'center',background:'#f5f5f2',borderRadius:'8px',padding:'8px 4px'}}>
                        <div style={{fontSize:'10px',color:'#888',marginBottom:'3px'}}>{l}</div>
                        <div style={{fontSize:'15px',fontWeight:'700'}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{background:'#fff3e0',border:'2px solid #e67e22',borderRadius:'14px',padding:'16px'}}>
                  <p style={{fontSize:'11px',fontWeight:'700',color:'#b45309',letterSpacing:'0.6px',textTransform:'uppercase',marginBottom:'12px'}}>Orange paper</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                    {[['Start',res.oStart],['Finish',res.oFinish],['Hours',res.oHours]].map(([l,v])=>(
                      <div key={l} style={{textAlign:'center',background:'rgba(255,255,255,0.6)',borderRadius:'8px',padding:'8px 4px'}}>
                        <div style={{fontSize:'10px',color:'#c08040',marginBottom:'3px'}}>{l}</div>
                        <div style={{fontSize:'15px',fontWeight:'700',color:'#b45309'}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{background:'#e3f2fd',border:'2px solid #1565c0',borderRadius:'14px',padding:'16px',textAlign:'center'}}>
                  <p style={{fontSize:'11px',fontWeight:'700',color:'#1565c0',letterSpacing:'0.6px',textTransform:'uppercase',marginBottom:'6px'}}>Total hours today</p>
                  <p style={{fontSize:'32px',fontWeight:'800',color:'#1565c0',letterSpacing:'-1px'}}>{res.total}</p>
                </div>
                <p style={{fontSize:'12px',color:'#999',textAlign:'center'}}>
                  Want to save all your days?{' '}
                  <a href="/register" style={{color:'#2d6a2d',fontWeight:'600'}}>Create a free account →</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{padding:'80px 24px',background:'#2d6a2d',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-80px',right:'-80px',width:'400px',height:'400px',background:'rgba(255,255,255,0.04)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',bottom:'-60px',left:'-60px',width:'300px',height:'300px',background:'rgba(255,255,255,0.03)',borderRadius:'50%'}}/>
        <div style={{maxWidth:'560px',margin:'0 auto',textAlign:'center',position:'relative'}}>
          <h2 style={{fontSize:'clamp(22px,4vw,40px)',fontWeight:'800',color:'#fff',letterSpacing:'-0.8px',marginBottom:'14px',lineHeight:'1.1'}}>
            Stop calculating manually.<br/>Start using Rannikon.
          </h2>
          <p style={{fontSize:'16px',color:'rgba(255,255,255,0.7)',marginBottom:'32px',lineHeight:'1.6'}}>
            Join 500+ workers at Rannikon Puutarha. Free forever for workers.
          </p>
          <button className="cta-btn" onClick={()=>router.push('/register')} style={{padding:'15px 36px',background:'#fff',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer',color:'#2d6a2d',boxShadow:'0 8px 32px rgba(0,0,0,0.15)'}}>
            Create your free account →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#111110',padding:'36px 24px'}}>
        <div style={{maxWidth:'1080px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'28px',height:'28px',background:'#2d6a2d',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{color:'#fff',fontWeight:'800',fontSize:'12px'}}>R</span>
            </div>
            <span style={{fontWeight:'700',fontSize:'15px',color:'#fff'}}>Rannikon</span>
          </div>
          <div style={{display:'flex',gap:'20px'}}>
            {[['Sign in','/login'],['Register','/register']].map(([l,h])=>(
              <a key={l} href={h} style={{fontSize:'13px',color:'#666',transition:'color 0.15s'}}
                onMouseEnter={e=>e.target.style.color='#aaa'} onMouseLeave={e=>e.target.style.color='#666'}>{l}</a>
            ))}
          </div>
          <p style={{fontSize:'12px',color:'#444'}}>Built for Rannikon Puutarha · {new Date().getFullYear()}</p>
        </div>
      </footer>

    </>
  )
}