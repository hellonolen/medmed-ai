import { useState } from 'react'
import AppShell from '../components/AppShell'
import { apiChat } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

type PharmacyResult = { name: string; address: string; phone?: string; details?: string; type?: string }

export default function Pharmacy() {
  const { user } = useAuth()
  const [zip, setZip] = useState('')
  const [filter, setFilter] = useState<'all' | '24hr' | 'compound'>('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PharmacyResult[] | null>(null)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState<string | null>(null)

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!zip.trim()) return
    setLoading(true); setError(null); setResults(null)
    const filterText = filter === '24hr' ? '24-hour pharmacies only' : filter === 'compound' ? 'compounding pharmacies only' : 'all pharmacies'
    const prompt = `Find pharmacies near ZIP code ${zip}. Show ${filterText}.
Return a JSON array of up to 8 pharmacies, each with: name, address, phone, details (hours or specialty), type.
Also provide a brief one-sentence summary of the area's pharmacy options.
Format: {"results": [...], "answer": "..."}`
    try {
      const res = await apiChat(prompt, [], user?.id)
      // Try to extract JSON
      const jsonMatch = res.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          setResults(parsed.results || [])
          setSummary(parsed.answer || '')
        } catch {
          // Plain text fallback
          setSummary(res.content)
          setResults([])
        }
      } else {
        setSummary(res.content)
        setResults([])
      }
    } catch {
      setError('Search failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <div className="tag" style={{ marginBottom: 8 }}>Tool</div>
        <h1 style={{ marginBottom: 8 }}>Pharmacy Finder</h1>
        <p style={{ fontSize: 13.5, color: 'var(--dark-gray)', marginBottom: 32, lineHeight: 1.7 }}>
          Find pharmacies near you by ZIP code. Filter by 24-hour availability or compounding services.
        </p>

        <form onSubmit={search} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
            <input
              type="text" value={zip} required maxLength={10}
              onChange={e => setZip(e.target.value)}
              placeholder="ZIP code or city name"
              style={{ flex: 1, padding: '12px 14px', border: '1px solid var(--border)', borderRight: 'none', background: 'var(--off-white)', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 300, color: 'var(--black)', outline: 'none', borderRadius: 0 }}
            />
            <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: loading ? 'var(--light-gray)' : 'var(--black)', color: loading ? 'var(--mid-gray)' : 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['all', '24hr', 'compound'] as const).map(f => (
              <button key={f} type="button" onClick={() => setFilter(f)} style={{ padding: '6px 14px', border: `1px solid ${filter === f ? 'var(--black)' : 'var(--border)'}`, background: filter === f ? 'var(--black)' : 'var(--white)', color: filter === f ? 'var(--white)' : 'var(--dark-gray)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                {f === 'all' ? 'All Pharmacies' : f === '24hr' ? '24 Hours' : 'Compounding'}
              </button>
            ))}
          </div>
        </form>

        {error && <div style={{ marginBottom: 16, padding: '12px 16px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 13, color: '#7f1d1d' }}>{error}</div>}

        {loading && (
          <div style={{ padding: '40px 32px', border: '1px solid var(--border)', background: 'var(--white)', textAlign: 'center' }}>
            <div className="tag" style={{ marginBottom: 8 }}>Searching</div>
            <p style={{ fontSize: 13, color: 'var(--mid-gray)' }}>Looking for pharmacies near {zip}…</p>
          </div>
        )}

        {results !== null && !loading && (
          <>
            {summary && <p style={{ fontSize: 13.5, color: 'var(--dark-gray)', marginBottom: 20, lineHeight: 1.7, borderLeft: '2px solid var(--border)', paddingLeft: 16 }}>{summary}</p>}
            {results.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--mid-gray)' }}>No specific listings found. The summary above contains relevant information.</p>}
            {results.map((r, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '18px 0', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{r.name}</div>
                  {r.address && <div style={{ fontSize: 12.5, color: 'var(--dark-gray)', marginBottom: 2 }}>{r.address}</div>}
                  {r.details && <div style={{ fontSize: 12, color: 'var(--mid-gray)' }}>{r.details}</div>}
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  {r.phone && <div style={{ fontSize: 12.5, color: 'var(--dark-gray)' }}>{r.phone}</div>}
                  {r.type && <div className="tag" style={{ marginTop: 4 }}>{r.type}</div>}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 20, padding: '12px 16px', border: '1px solid var(--border)', background: 'var(--off-white)', fontSize: 11, color: 'var(--mid-gray)' }}>
              Results are system-generated and may not reflect current hours or availability. Always call ahead to confirm.
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
