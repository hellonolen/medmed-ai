import { useState } from 'react'
import AppShell from '../components/AppShell'
import Footer from '../components/Footer'
import { apiChat } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const BODY_SYSTEMS = ['Head & Neurological', 'Respiratory', 'Cardiovascular', 'Digestive', 'Musculoskeletal', 'Skin & Dermatology', 'Urinary', 'Hormonal / Endocrine']

const SYMPTOMS: Record<string, string[]> = {
  'Head & Neurological': ['Headache', 'Dizziness', 'Confusion', 'Memory problems', 'Blurred vision', 'Numbness / tingling'],
  'Respiratory': ['Cough', 'Shortness of breath', 'Wheezing', 'Chest tightness', 'Runny nose', 'Sore throat'],
  'Cardiovascular': ['Chest pain', 'Palpitations', 'Rapid heartbeat', 'Swollen ankles', 'Fatigue'],
  'Digestive': ['Nausea', 'Vomiting', 'Stomach pain', 'Diarrhea', 'Constipation', 'Bloating', 'Heartburn'],
  'Musculoskeletal': ['Joint pain', 'Back pain', 'Muscle weakness', 'Stiffness', 'Swelling'],
  'Skin & Dermatology': ['Rash', 'Itching', 'Redness', 'Hives', 'Bruising', 'Dry skin'],
  'Urinary': ['Frequent urination', 'Burning urination', 'Blood in urine', 'Lower back pain'],
  'Hormonal / Endocrine': ['Excessive thirst', 'Unexplained weight change', 'Fatigue', 'Hot flashes', 'Hair loss'],
}

const DURATIONS = ['Today', '2–3 days', 'This week', '2–4 weeks', 'Over a month', 'Several months']
const SEVERITIES = ['Mild', 'Moderate', 'Severe']

type Stage = 'build' | 'analyzing' | 'result'

export default function SymptomChecker() {
  const { user } = useAuth()
  const [system, setSystem] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState('')
  const [notes, setNotes] = useState('')
  const [stage, setStage] = useState<Stage>('build')
  const [result, setResult] = useState('')
  const [error, setError] = useState<string | null>(null)

  const toggle = (s: string) =>
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const analyze = async () => {
    if (!selected.length) return
    setStage('analyzing')
    setError(null)
    const prompt = `Research report request:
System: ${system || 'Multiple'}
Symptoms: ${selected.join(', ')}
Duration: ${duration || 'Unspecified'}
Severity: ${severity || 'Unspecified'}
Additional notes: ${notes || 'None'}

Please provide:
1. Possible considerations (list 2–4 with brief explanation)
2. Warning signs that require immediate attention
3. Self-care guidance where appropriate
4. When to consult a specialist or care provider

Format clearly with headers. Include appropriate informational disclaimers.`
    try {
      const res = await apiChat(prompt, [], user?.id)
      setResult(res.content)
      setStage('result')
    } catch {
      setError('Analysis failed. Please try again.')
      setStage('build')
    }
  }

  const reset = () => { setSystem(''); setSelected([]); setDuration(''); setSeverity(''); setNotes(''); setResult(''); setStage('build') }

  const pill = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{
      padding: '7px 14px', fontSize: 12.5,
      border: `1px solid ${active ? 'var(--black)' : 'var(--border)'}`,
      background: active ? 'var(--black)' : 'var(--white)',
      color: active ? 'var(--white)' : 'var(--dark-gray)',
      cursor: 'pointer', transition: 'all 0.1s',
    }}>{label}</button>
  )

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ flex: 1, maxWidth: 760, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div className="tag" style={{ marginBottom: 8 }}>Research Tool</div>
              <h1>Symptoms</h1>
              <p style={{ fontSize: 13.5, color: 'var(--dark-gray)', marginTop: 8, maxWidth: 480, lineHeight: 1.7 }}>
                Select symptoms and get a structured overview of possible considerations — for informational purposes only.
              </p>
            </div>
            {stage === 'result' && (
              <button onClick={reset} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid-gray)', cursor: 'pointer', background: 'none', border: 'none' }}>
                ← Start Over
              </button>
            )}
          </div>

          {error && <div style={{ marginBottom: 16, padding: '12px 16px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 13, color: '#7f1d1d' }}>{error}</div>}

          {stage === 'build' && (
            <>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 28, marginBottom: 28 }}>
                <div className="tag" style={{ marginBottom: 14 }}>1 — Focus Area</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {BODY_SYSTEMS.map(s => pill(s, system === s, () => { setSystem(system === s ? '' : s); setSelected([]) }))}
                </div>
              </div>

              {system && (
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 28, marginBottom: 28 }}>
                  <div className="tag" style={{ marginBottom: 14 }}>2 — Symptoms <span style={{ fontWeight: 400 }}>(select all that apply)</span></div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(SYMPTOMS[system] || []).map(s => pill(s, selected.includes(s), () => toggle(s)))}
                  </div>
                </div>
              )}

              {selected.length > 0 && (
                <>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 28, marginBottom: 28 }}>
                    <div className="tag" style={{ marginBottom: 14 }}>3 — Duration</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {DURATIONS.map(d => pill(d, duration === d, () => setDuration(duration === d ? '' : d)))}
                    </div>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 28, marginBottom: 28 }}>
                    <div className="tag" style={{ marginBottom: 14 }}>4 — Impact</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {SEVERITIES.map(s => pill(s, severity === s, () => setSeverity(severity === s ? '' : s)))}
                    </div>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 28, marginBottom: 28 }}>
                    <div className="tag" style={{ marginBottom: 10 }}>5 — Additional context <span style={{ fontWeight: 400 }}>(optional)</span></div>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any other details — medications, recent activity, etc." rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--off-white)', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 300, color: 'var(--black)', outline: 'none', resize: 'vertical', borderRadius: 0 }} />
                  </div>
                  <button onClick={analyze} style={{ padding: '13px 32px', background: 'var(--black)', color: 'var(--white)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
                    Run Research Analysis
                  </button>
                </>
              )}
            </>
          )}

          {stage === 'analyzing' && (
            <div style={{ padding: '60px 32px', border: '1px solid var(--border)', background: 'var(--white)', textAlign: 'center' }}>
              <div className="tag" style={{ marginBottom: 12 }}>Analyzing</div>
              <h3 style={{ marginBottom: 8 }}>Reviewing information…</h3>
              <p style={{ fontSize: 13, color: 'var(--mid-gray)' }}>Cross-referencing research data. This takes a moment.</p>
            </div>
          )}

          {stage === 'result' && (
            <div>
              <div style={{ marginBottom: 20, padding: '14px 16px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 12.5, color: 'var(--dark-gray)' }}>
                <strong>Focus:</strong> {selected.join(', ')} · {duration} · {severity}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8, color: 'var(--dark-gray)', borderBottom: '1px solid var(--border)', paddingBottom: 28, marginBottom: 24 }}>
                {result}
              </div>
              <div style={{ padding: '14px 16px', border: '1px solid var(--border)', background: 'var(--off-white)', fontSize: 11.5, color: 'var(--mid-gray)', lineHeight: 1.65 }}>
                This analysis is for informational purposes only and is not a diagnosis. Always consult a qualified care provider.
              </div>
              <button onClick={reset} style={{ marginTop: 20, padding: '11px 24px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dark-gray)', cursor: 'pointer' }}>New Research</button>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </AppShell>
  )
}
