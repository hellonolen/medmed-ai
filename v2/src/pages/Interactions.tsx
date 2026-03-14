import { useState } from 'react'
import AppShell from '../components/AppShell'
import Footer from '../components/Footer'
import { apiChat } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function Interactions() {
  const { user } = useAuth()
  const [drugs, setDrugs] = useState(['', ''])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const setDrug = (i: number, v: string) => setDrugs(prev => prev.map((d, idx) => idx === i ? v : d))
  const addDrug = () => setDrugs(prev => [...prev, ''])
  const rmDrug = (i: number) => setDrugs(prev => prev.filter((_, idx) => idx !== i))
  const validDrugs = drugs.filter(d => d.trim())

  const check = async () => {
    if (validDrugs.length < 2) return
    setLoading(true); setError(null); setResult(null)
    const prompt = `Research report request: Interactions check.
Medications to analyze: ${validDrugs.join(', ')}

Please provide:
1. Summary of any known interactions between these items
2. Severity overview for each interaction (Mild / Moderate / Severe / Contraindicated)
3. Mechanism behind each interaction
4. What to watch for
5. Suggested guidance (e.g. separate doses, avoid combination, consult specialist)

Format response clearly with sections. Always include informational disclaimers.`
    try {
      const res = await apiChat(prompt, [], user?.id)
      setResult(res.content)
    } catch {
      setError('Check failed. Please try again.')
    } finally { setLoading(false) }
  }

  const reset = () => { setDrugs(['', '']); setResult(null); setError(null) }

  const inp: React.CSSProperties = {
    flex: 1, padding: '11px 12px', border: '1px solid var(--border)',
    background: 'var(--off-white)', fontFamily: 'var(--font-sans)', fontSize: 14,
    fontWeight: 300, color: 'var(--black)', outline: 'none', borderRadius: 0,
  }

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div className="tag" style={{ marginBottom: 8 }}>Research Tool</div>
              <h1>Interactions</h1>
              <p style={{ fontSize: 13.5, color: 'var(--dark-gray)', marginTop: 8, maxWidth: 480, lineHeight: 1.7 }}>
                Enter two or more medications to check for known interactions and guidance.
              </p>
            </div>
            {result && <button onClick={reset} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid-gray)', cursor: 'pointer', background: 'none', border: 'none' }}>← New Check</button>}
          </div>

          {error && <div style={{ marginBottom: 16, padding: '12px 16px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 13, color: '#7f1d1d' }}>{error}</div>}

          {!result && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {drugs.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mid-gray)', width: 72, flexShrink: 0 }}>Item {i + 1}</span>
                    <input
                      type="text" value={d} onChange={e => setDrug(i, e.target.value)}
                      placeholder={i === 0 ? 'e.g. Warfarin 5mg' : i === 1 ? 'e.g. Aspirin 81mg' : 'Add another item'}
                      style={inp}
                      onKeyDown={e => { if (e.key === 'Enter') check() }}
                    />
                    {drugs.length > 2 && (
                      <button onClick={() => rmDrug(i)} style={{ padding: '8px', border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--mid-gray)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                <button onClick={addDrug} style={{ padding: '9px 16px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dark-gray)', cursor: 'pointer' }}>+ Add Item</button>
                <button onClick={check} disabled={validDrugs.length < 2 || loading} style={{ padding: '9px 24px', background: validDrugs.length >= 2 && !loading ? 'var(--black)' : 'var(--light-gray)', color: validDrugs.length >= 2 && !loading ? 'var(--white)' : 'var(--mid-gray)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: validDrugs.length >= 2 ? 'pointer' : 'not-allowed' }}>
                  {loading ? 'Checking…' : 'Check Interactions'}
                </button>
              </div>

              {loading && (
                <div style={{ padding: '40px 32px', border: '1px solid var(--border)', background: 'var(--white)', textAlign: 'center' }}>
                  <div className="tag" style={{ marginBottom: 8 }}>Analyzing</div>
                  <p style={{ fontSize: 13, color: 'var(--mid-gray)' }}>Cross-referencing research data…</p>
                </div>
              )}
            </>
          )}

          {result && (
            <div>
              <div style={{ marginBottom: 20, padding: '12px 16px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 12.5, color: 'var(--dark-gray)' }}>
                <strong>Items checked:</strong> {validDrugs.join(' · ')}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8, color: 'var(--dark-gray)', borderBottom: '1px solid var(--border)', paddingBottom: 28, marginBottom: 20 }}>
                {result}
              </div>
              <div style={{ padding: '14px 16px', border: '1px solid var(--border)', background: 'var(--off-white)', fontSize: 11.5, color: 'var(--mid-gray)', lineHeight: 1.65 }}>
                This information is for educational purposes only. Always consult a care provider before changing medications.
              </div>
              <button onClick={reset} style={{ marginTop: 20, padding: '11px 24px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dark-gray)', cursor: 'pointer' }}>New Check</button>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </AppShell>
  )
}
