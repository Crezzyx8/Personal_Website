import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Clapperboard, TrendingUp, Package, LayoutDashboard, Activity, Pause, Play, RotateCcw, Camera, ChevronRight, Users } from 'lucide-react'
import OfficeDepartments from './OfficeDepartments'
import './AiOffice.css'

const OfficeScene = lazy(() => import('./OfficeScene'))
const divisions = [
  { id: 'clipping', name: 'Content Studio', icon: Clapperboard, text: 'Dari video panjang ke konten pendek.', color: '#8bb9d2' },
  { id: 'trading', name: 'Trading Research', icon: TrendingUp, text: 'Riset aset dan skenario perdagangan.', color: '#b4a2dd' },
  { id: 'products', name: 'Digital Products', icon: Package, text: 'Ubah ide menjadi draft produk digital.', color: '#a2c4a8' },
]
const agents = [
  { name: 'Producer', division: 'clipping', role: 'Mengatur brief, pemilihan klip, dan alur produksi.' },
  { name: 'Editor & QA', division: 'clipping', role: 'Editing, subtitle, review hasil, dan publikasi sesuai konfigurasi worker.' },
  { name: 'Market Analyst', division: 'trading', role: 'Membaca data pasar dan struktur harga aset.' },
  { name: 'Risk Researcher', division: 'trading', role: 'Menyusun skenario entry, TP, dan SL untuk ditinjau.' },
  { name: 'Product Strategist', division: 'products', role: 'Menyusun ide, target pembeli, dan struktur produk.' },
  { name: 'Product Writer', division: 'products', role: 'Membuat draft konten dan materi produk digital.' },
]
const timeFormat = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })

export default function AiOffice() {
  const [page, setPage] = useState('overview')
  const [selected, setSelected] = useState(null)
  const [paused, setPaused] = useState(false)
  const [cameraView, setCameraView] = useState('isometric')
  const [resetKey, setResetKey] = useState(0)
  const [now, setNow] = useState(() => new Date())
  const [connection, setConnection] = useState('checking')
  const [jobs, setJobs] = useState([])
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    let timer
    async function poll() {
      try {
        const response = await fetch('/office-api/production/jobs', { signal: controller.signal })
        if (!response.ok) throw new Error('offline')
        const data = await response.json()
        if (!Array.isArray(data.jobs)) throw new Error('invalid')
        if (!controller.signal.aborted) { setJobs(data.jobs); setConnection('online') }
      } catch {
        if (!controller.signal.aborted) setConnection('offline')
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(poll, 10000)
      }
    }
    poll()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [])
  const current = divisions.find(item => item.id === page)
  const title = current?.name || 'Filbert AI Office'
  let statusText = 'Mengecek worker'
  if (connection === 'online') statusText = 'Worker terhubung'
  if (connection === 'offline') statusText = 'Worker belum terhubung'
  let jobCount = '—'
  if (connection === 'online') jobCount = jobs.filter(job => !['completed', 'failed', 'rendered'].includes(job.status)).length

  function navigate(id) { setPage(id); setSelected(null) }

  return <div className="fh-office">
    <aside className="fh-sidebar">
      <Link to="/" className="fh-brand"><span className="fh-monogram">F.</span><span>Filbert Office<small>PERSONAL AI WORKSPACE</small></span></Link>
      <nav aria-label="Navigasi AI Office">
        <button className={page === 'overview' ? 'active' : ''} aria-current={page === 'overview' ? 'page' : undefined} onClick={() => navigate('overview')}><LayoutDashboard size={18} /> Dashboard</button>
        <p className="fh-nav-label">DEPARTMENTS</p>
        {divisions.map(({ id, name, icon: Icon, color }) => <button key={id} className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={18} style={{ color }} />{name}<ChevronRight size={14} /></button>)}
      </nav>
      <Link className="fh-back" to="/"><ArrowLeft size={16} /> Website personal <ArrowUpRight size={14} /></Link>
      <div className="fh-owner"><span>FH</span><div>Filbert Huang<small>Workspace owner</small></div></div>
    </aside>
    <main className="fh-main">
      <header className="fh-header"><div className="fh-breadcrumb">Workspace <ChevronRight size={13} /><strong>{title}</strong></div><div className="fh-header-end"><span className={'fh-status ' + connection}><i />{statusText}</span><time>{timeFormat.format(now)} WIB</time></div></header>
      {page === 'overview' ? <>
        <section id="office-floor" className="fh-stage" aria-label="Kantor virtual">
          <div className="fh-stage-heading">
            <div className="fh-stage-title">
              <span>VIRTUAL HEADQUARTERS</span>
              <h1>{title}</h1>
              <small>{divisions.length} divisi · {agents.length} peran</small>
            </div>
            <span className="fh-orbit-hint">Drag untuk putar · Scroll untuk zoom</span>
          </div>
          <Suspense fallback={<div className="fh-scene-loading">Menyiapkan kantor 3D…</div>}>
            <OfficeScene agents={agents} onSelect={setSelected} paused={paused} cameraView={cameraView} resetKey={resetKey} />
          </Suspense>
          {selected && (
            <section className="fh-agent-detail" aria-label="Detail agent" aria-live="polite">
              <div>
                <p className="fh-eyebrow">{divisions.find(division => division.id === selected.division).name}</p>
                <h2>{selected.name}</h2>
                <p>{selected.role}</p>
              </div>
              <button onClick={() => navigate(selected.division)}>Buka divisi <ArrowUpRight size={15} /></button>
              <button onClick={() => setSelected(null)}>Tutup</button>
            </section>
          )}
          <div className="fh-stage-caption">
            <div className="fh-scene-controls" role="group" aria-label="Kontrol kantor 3D">
              <button onClick={() => setCameraView('isometric')} aria-pressed={cameraView === 'isometric'}><Camera size={15} /> Isometrik</button>
              <button onClick={() => setCameraView('front')} aria-pressed={cameraView === 'front'}>Depan</button>
              <button onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? 'Lanjut' : 'Jeda'}</button>
              <button onClick={() => setResetKey(value => value + 1)}><RotateCcw size={15} /> Reset</button>
            </div>
          </div>
        </section>
        <div className="fh-lower-grid"><section><div className="fh-section-heading"><h2>Your departments</h2><span>03 teams</span></div><div className="fh-division-grid">{divisions.map(({ id, name, icon: Icon, color, text }, index) => <button key={id} className="fh-division-card" onClick={() => navigate(id)}><div><span className="fh-icon" style={{ color }}><Icon size={21} /></span><span className="fh-card-number">0{index + 1}</span></div><h3>{name}</h3><p>{text}</p><footer>Buka workspace <ArrowUpRight size={16} /></footer></button>)}</div></section>
          <section className="fh-activity"><div className="fh-section-heading"><h2><Activity size={16} /> Aktivitas produksi</h2><span>{jobCount} berjalan</span></div>{connection !== 'online' && <p>Hubungkan worker untuk melihat aktivitas produksi asli.</p>}{connection === 'online' && jobs.length === 0 && <p>Belum ada pekerjaan. Mulai dari Content Studio.</p>}{connection === 'online' && jobs.slice(0, 3).map(job => <div key={job.id} className="fh-job"><strong>{job.clip_title || job.url}</strong><p>{job.message || job.status}</p></div>)}</section></div>
        <section className="fh-team"><div className="fh-section-heading"><h2><Users size={16} /> Meet your team</h2><span>Pilih peran untuk detail</span></div><div className="fh-agent-list">{agents.map(agent => <button key={agent.name} onClick={() => {
          setSelected(agent)
          document.getElementById('office-floor')?.scrollIntoView({ block: 'nearest' })
        }}><span>{agent.name[0]}</span><div><strong>{agent.name}</strong><small>{divisions.find(d => d.id === agent.division).name}</small></div><ChevronRight size={14} /></button>)}</div></section>
      </> : (
        <section className="fh-department-workspace">
          <div className="fh-page-heading">
            <div><h1>{title}</h1><p>{current?.text}</p></div>
            <button className="fh-home-link" onClick={() => navigate('overview')}><ArrowLeft size={15} /> Kembali ke kantor 3D</button>
          </div>
          <OfficeDepartments activeDepartment={page} hideNavigation />
        </section>
      )}
      <footer className="fh-footer"><span>FILBERT OFFICE</span><span>Animasi 3D adalah visualisasi. Eksekusi mengikuti kemampuan worker yang terhubung.</span></footer>
    </main>
  </div>
}
