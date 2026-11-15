import { useCallback, useEffect, useState } from 'react'
import { Clapperboard, Package, TrendingUp } from 'lucide-react'
import DigitalProductsDepartment from './DigitalProductsDepartment'
import './OfficeDepartments.css'

const api = '/office-api'
const prices = new Intl.NumberFormat('id-ID', { maximumSignificantDigits: 9 })
const dates = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta',
})

async function request(path, body, signal) {
  const options = { signal }
  if (body) {
    Object.assign(options, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }
  const response = await fetch(api + path, options)
  const result = await response.json().catch(() => null)
  if (!response.ok || !result) {
    throw new Error(typeof result?.detail === 'string'
      ? result.detail : 'Worker tidak merespons. Cek terminal backend.')
  }
  return result
}

function ClippingDepartment() {
  const [status, setStatus] = useState(null)
  const [connection, setConnection] = useState('')
  const [error, setError] = useState('')
  const [url, setUrl] = useState('')
  const [rights, setRights] = useState(false)
  const [sending, setSending] = useState(false)

  const refresh = useCallback(async (signal) => {
    try {
      const result = await request('/production/jobs', null, signal)
      if (!signal?.aborted) {
        setStatus(result)
        setConnection('')
      }
    } catch {
      if (!signal?.aborted) setConnection('Worker belum terhubung.')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let timer
    async function poll() {
      await refresh(controller.signal)
      if (!controller.signal.aborted) timer = setTimeout(poll, 4000)
    }
    poll()
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [refresh])

  async function submit(event) {
    event.preventDefault()
    setSending(true)
    setError('')
    try {
      await request('/production/jobs', { url, rights_confirmed: rights })
      setUrl('')
      await refresh()
    } catch (problem) {
      setError(problem.message)
    } finally {
      setSending(false)
    }
  }

  const active = status?.jobs.some(job => !['rendered', 'completed', 'failed'].includes(job.status))
  return <>
    <h2>Content Studio</h2>
    <p>Link YouTube → transkrip → pilihan klip → review → render → YouTube.</p>
    <p role="status">{connection || (status
      ? `Whisper ${status.whisper_configured ? 'tersedia' : 'perlu model'} · YouTube OAuth ${status.youtube_configured ? 'dikonfigurasi' : 'belum dikonfigurasi'}`
      : 'Mengecek worker…')}</p>
    <form onSubmit={submit}>
      <label>Link video sumber
        <input type="url" required value={url} placeholder="https://www.youtube.com/watch?v=…"
          onChange={event => setUrl(event.target.value)} />
      </label>
      <label className="od-rights">
        <input type="checkbox" checked={rights} required onChange={event => setRights(event.target.checked)} />
        Gua punya hak untuk mengolah dan mengunggah video ini.
      </label>
      <button disabled={sending || active || Boolean(connection) || !status?.whisper_configured}>
        {active ? 'Worker sedang memproses' : 'Proses video'}
      </button>
    </form>
    {error && <p role="alert">{error}</p>}
    <ul className="od-jobs" aria-label="Riwayat produksi">
      {status?.jobs.map(job => <li key={job.id}>
        <strong>{job.clip_title || job.url}</strong>
        <p>{job.message}</p>
        {job.clip_ready && <a href={`${api}/production/jobs/${job.id}/clip`} target="_blank" rel="noreferrer">Buka klip</a>}
        {job.youtube_id && <a href={`https://studio.youtube.com/video/${encodeURIComponent(job.youtube_id)}/edit`}
          target="_blank" rel="noreferrer">YouTube Studio</a>}
      </li>)}
    </ul>
  </>
}

function TradingDepartment() {
  const [market, setMarket] = useState('gate')
  const [symbol, setSymbol] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setResult(null)
    setError('')
    try {
      setResult(await request('/market/analyze', { market, symbol: symbol.trim() }))
    } catch (problem) {
      setError(problem.message)
    } finally {
      setLoading(false)
    }
  }

  return <>
    <h2>Trading Research</h2>
    <form onSubmit={submit}>
      <label>Pasar
        <select value={market} onChange={event => setMarket(event.target.value)}>
          <option value="gate">Gate USDT Perpetual</option>
          <option value="us">Saham Amerika</option>
          <option value="idx">Saham Indonesia</option>
        </select>
      </label>
      <label>Nama aset atau ticker
        <input required maxLength={40} placeholder="Bitcoin, RUNE, NVDA, atau BBCA"
          value={symbol} onChange={event => setSymbol(event.target.value)} />
      </label>
      <button disabled={loading || !symbol.trim()}>{loading ? 'Mengambil candle…' : 'Analisis aset'}</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {result && <div className="od-results" aria-live="polite">
      <h3>{result.symbol} · {prices.format(result.close)}</h3>
      <p>{result.source} · Candle {result.interval} · Data {dates.format(new Date(result.timestamp * 1000))} WIB</p>
      {result.opening_range && <div className="od-results">
        <h3>Opening Range Breakout · Day Trader Skill</h3>
        <p>Sesi {result.opening_range.session} (New York) · {result.opening_range.status}</p>
        {result.opening_range.entry != null && <dl>
          <dt>Entry pemicu long</dt><dd>{prices.format(result.opening_range.entry)}</dd>
          <dt>TP</dt><dd>{prices.format(result.opening_range.tp)}</dd>
          <dt>SL</dt><dd>{prices.format(result.opening_range.sl)}</dd>
        </dl>}
        {result.opening_range.trigger && <p>Breakout tercatat pukul {result.opening_range.trigger.time} ET
          pada harga penutupan {prices.format(result.opening_range.trigger.close)}.</p>}
      </div>}
      {result.opening_range && <h3>Setup harian Office</h3>}
      <p>Entry berlaku jika candle berikutnya tutup melewati batas range. Hitung ulang jika harga eksekusi berbeda dari level entry.</p>
      <div className="od-table"><table>
        <thead><tr><th scope="col">Skenario</th><th scope="col">Entry pemicu</th><th scope="col">Take profit</th><th scope="col">Stop loss</th></tr></thead>
        <tbody>{result.setups.map(setup => <tr key={setup.side}>
          <th scope="row">{setup.side}</th>
          <td>{prices.format(setup.entry)}</td>
          <td>{prices.format(setup.tp)}</td>
          <td>{prices.format(setup.sl)}</td>
        </tr>)}</tbody>
      </table></div>
      <p>Range 21 candle · SL sejauh rata-rata true range 14 candle · TP 2× jarak SL sebelum biaya.</p>
    </div>}
  </>
}

export default function OfficeDepartments({ activeDepartment, hideNavigation = false }) {
  const [localDepartment, setDepartment] = useState('clipping')
  const department = activeDepartment || localDepartment
  return <section className="od-panel" aria-label="Departemen AI Office">
    <div hidden={hideNavigation} className="od-nav" role="group" aria-label="Pilih departemen">
      <button type="button" aria-pressed={department === 'clipping'} onClick={() => setDepartment('clipping')}>
        <Clapperboard size={18} /> Content Studio
      </button>
      <button type="button" aria-pressed={department === 'trading'} onClick={() => setDepartment('trading')}>
        <TrendingUp size={18} /> Trading Research
      </button>
      <button type="button" aria-pressed={department === 'products'} onClick={() => setDepartment('products')}>
        <Package size={18} /> Digital Products
      </button>
    </div>
    <div hidden={department !== 'clipping'}><ClippingDepartment /></div>
    <div hidden={department !== 'trading'}><TradingDepartment /></div>
    <div hidden={department !== 'products'}><DigitalProductsDepartment request={request} /></div>
  </section>
}
