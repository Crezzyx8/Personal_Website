import { useState } from 'react'

const sections = [
  ['product', 'Draft produk'],
  ['whop', 'Listing Whop'],
  ['threads', 'Konten Threads'],
]

export default function DigitalProductsDepartment({ request }) {
  const [idea, setIdea] = useState('AI Automation Starter Kit')
  const [audience, setAudience] = useState('English-speaking solo creators new to automation')
  const [brief, setBrief] = useState('')
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await request('/digital-products/draft', { idea, audience, brief })
      setDraft(result)
    } catch (problem) {
      setError(problem.message)
    } finally {
      setLoading(false)
    }
  }

  function downloadDraft() {
    const markdown = sections.map(([key, label]) => `# ${label}\n\n${draft[key]}`).join('\n\n')
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'digital-product-draft.md'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <>
      <h2>Digital Products</h2>
      <p>Buat draft produk digital, listing Whop, dan konten Threads. Hasil bisa lu unduh untuk diedit di Obsidian.</p>
      <form onSubmit={submit}>
        <label>Ide produk
          <input value={idea} minLength={3} maxLength={200} required onChange={event => setIdea(event.target.value)} />
        </label>
        <label>Target pembeli
          <input value={audience} minLength={3} maxLength={200} required onChange={event => setAudience(event.target.value)} />
        </label>
        <label>Isi atau batasan produk (opsional)
          <textarea rows={3} value={brief} maxLength={1200} onChange={event => setBrief(event.target.value)} />
        </label>
        <button disabled={loading}>{loading ? 'Ollama sedang menulis…' : 'Buat draft'}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {draft && <div className="od-results od-drafts">
        <button type="button" onClick={downloadDraft}>Unduh Markdown</button>
        {sections.map(([key, label]) => <details key={key}>
          <summary>{label}</summary>
          <pre>{draft[key]}</pre>
        </details>)}
      </div>}
    </>
  )
}
