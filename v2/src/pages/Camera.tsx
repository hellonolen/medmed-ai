import { useRef, useState, useEffect, useCallback } from 'react'
import AppShell from '../components/AppShell'
import Footer from '../components/Footer'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Link } from 'react-router-dom'
import { apiVisual } from '../lib/api'

type Stage = 'idle' | 'streaming' | 'captured' | 'analyzing' | 'result'

interface Analysis {
  summary: string; confidence: string; detail: string; action: string; urgency: string
}

const URGENCY_COLOR: Record<string, string> = { Low: '#059669', Moderate: '#d97706', High: '#dc2626' }

export default function Camera() {
  const { canUseCamera, tier } = useSubscription()
  const isPro = canUseCamera

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [stage, setStage] = useState<Stage>('idle')
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null)
  const [capturedB64, setCapturedB64] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [camError, setCamError] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [facing, setFacing] = useState<'user' | 'environment'>('environment')

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = facing) => {
    try {
      stopStream()
      setCamError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      setStage('streaming')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Camera access denied. Please allow permissions and try again.'
      setCamError(msg)
    }
  }, [facing])

  useEffect(() => () => stopStream(), [])

  const capture = () => {
    const video = videoRef.current; const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const url = canvas.toDataURL('image/jpeg', 0.85)
    const b64 = url.split(',')[1]
    setCapturedUrl(url); setCapturedB64(b64)
    stopStream(); setStage('captured')
  }

  const analyze = async () => {
    if (!capturedB64) return
    setStage('analyzing'); setAnalysisError(null)
    try {
      const res = await apiVisual(capturedB64)
      const text = res.content || ''
      const summaryMatch = text.match(/(?:Assessment|Summary|Condition)[:\s]+([^\n]+)/i)
      const confidenceMatch = text.match(/(?:Confidence)[:\s]+([^\n]+)/i)
      const urgencyMatch = text.match(/(?:Urgency)[:\s]+([^\n]+)/i)
      const actionMatch = text.match(/(?:Recommendation|Action|Guidance)[:\s]+([^\n]+)/i)
      setAnalysis({
        summary: summaryMatch?.[1]?.trim() || text.split('\n')[0] || 'Analysis complete',
        confidence: confidenceMatch?.[1]?.trim() || 'Moderate',
        urgency: urgencyMatch?.[1]?.trim() || 'Low',
        action: actionMatch?.[1]?.trim() || 'Consult a care provider for proper evaluation.',
        detail: text,
      })
      setStage('result')
    } catch {
      setAnalysisError('Analysis failed. Please try again.')
      setStage('captured')
    }
  }

  const reset = () => { setCapturedUrl(null); setCapturedB64(null); setAnalysis(null); setAnalysisError(null); setStage('idle') }
  const flipCamera = () => { const next = facing === 'user' ? 'environment' : 'user'; setFacing(next); startCamera(next) }

  if (!isPro) {
    return (
      <AppShell>
        <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div className="tag" style={{ marginBottom: 16 }}>Pro Feature</div>
          <h1 style={{ marginBottom: 16 }}>Visualization</h1>
          <p style={{ fontSize: 14, color: 'var(--dark-gray)', lineHeight: 1.75, marginBottom: 32 }}>
            Point your camera at a skin concern, wound, rash, or label and get a research-assisted visual report. Available on Pro and above.
          </p>
          <div style={{ border: '1px solid var(--border)', padding: '28px 32px', background: 'var(--white)', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
              {['Skin & rash focus', 'Wound review', 'Label reader', '45-sec video research'].map(f => (
                <div key={f} style={{ fontSize: 12, color: 'var(--dark-gray)', textAlign: 'center', maxWidth: 80 }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>◉</div>{f}
                </div>
              ))}
            </div>
            <Link to="/checkout?plan=pro" style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--black)', color: 'var(--white)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Upgrade to Pro — $20/mo
            </Link>
          </div>
          <div style={{ fontSize: 11, color: 'var(--mid-gray)' }}>3-day free trial included. Current plan: <strong>{tier}</strong></div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ flex: 1, maxWidth: 780, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div className="tag" style={{ marginBottom: 8 }}>Research Tool</div>
              <h1>Visualization</h1>
            </div>
            {(stage === 'result' || stage === 'captured') && (
              <button onClick={reset} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid-gray)', cursor: 'pointer', background: 'none', border: 'none' }}>
                ← New Analysis
              </button>
            )}
          </div>

          {camError && <div style={{ margin: '16px 0', padding: '14px 16px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 13, color: '#7f1d1d' }}>⚠ {camError}</div>}
          {analysisError && <div style={{ margin: '16px 0', padding: '14px 16px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 13, color: '#7f1d1d' }}>{analysisError}</div>}

          {stage === 'idle' && (
            <div style={{ border: '1px solid var(--border)', background: 'var(--off-white)' }}>
              <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 24, color: 'var(--mid-gray)' }}>◉</div>
                <h3 style={{ marginBottom: 12 }}>Point. Capture. Understand.</h3>
                <p style={{ fontSize: 13.5, color: 'var(--dark-gray)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 28px' }}>Use your camera to analyze skin concerns, rashes, wounds, or labels. Best in good lighting.</p>
                <button onClick={() => startCamera()} style={{ padding: '13px 32px', background: 'var(--black)', color: 'var(--white)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Enable Camera</button>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[{ icon: '◑', label: 'Skin & Rash' }, { icon: '⬡', label: 'Wound Check' }, { icon: '▤', label: 'Labels' }, { icon: '◈', label: 'Video (45s)' }].map((u, i) => (
                  <div key={u.label} style={{ padding: '20px 16px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, marginBottom: 8, color: 'var(--dark-gray)' }}>{u.icon}</div>
                    <div className="tag">{u.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage === 'streaming' && (
            <div style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ position: 'relative', background: '#000' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxHeight: 460, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: 220, height: 220, border: '1.5px solid rgba(255,255,255,0.5)' }} />
                </div>
                <button onClick={flipCamera} title="Flip camera" style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⟳</button>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', gap: 12, justifyContent: 'center', background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => { stopStream(); setStage('idle') }} style={{ padding: '10px 20px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dark-gray)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={capture} style={{ padding: '10px 28px', background: 'var(--black)', color: 'var(--white)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Capture Photo</button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {stage === 'captured' && capturedUrl && (
            <div style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
              <img src={capturedUrl} alt="Captured" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '16px 20px', display: 'flex', gap: 12, justifyContent: 'center', background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => startCamera()} style={{ padding: '10px 20px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dark-gray)', cursor: 'pointer' }}>Retake</button>
                <button onClick={analyze} style={{ padding: '10px 28px', background: 'var(--black)', color: 'var(--white)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Analyze Image</button>
              </div>
            </div>
          )}

          {stage === 'analyzing' && (
            <div style={{ border: '1px solid var(--border)', padding: '60px 32px', textAlign: 'center', background: 'var(--white)' }}>
              {capturedUrl && <img src={capturedUrl} alt="" style={{ width: 120, height: 90, objectFit: 'cover', opacity: 0.4, marginBottom: 24, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />}
              <div className="tag" style={{ marginBottom: 12 }}>Analyzing</div>
              <h3 style={{ marginBottom: 8 }}>Processing image…</h3>
              <p style={{ fontSize: 13, color: 'var(--mid-gray)' }}>Researching data based on visual content. This takes a moment.</p>
            </div>
          )}

          {stage === 'result' && analysis && capturedUrl && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', border: '1px solid var(--border)', marginBottom: 20 }}>
                <img src={capturedUrl} alt="Analyzed" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 160 }} />
                <div style={{ padding: '24px', borderLeft: '1px solid var(--border)', background: 'var(--white)' }}>
                  <div className="tag" style={{ marginBottom: 8 }}>Research Result</div>
                  <h2 style={{ marginBottom: 12 }}>{analysis.summary}</h2>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div><div className="tag" style={{ marginBottom: 4 }}>Confidence</div><div style={{ fontSize: 13 }}>{analysis.confidence}</div></div>
                    <div><div className="tag" style={{ marginBottom: 4 }}>Urgency</div><div style={{ fontSize: 13, color: URGENCY_COLOR[analysis.urgency] || 'var(--mid-gray)', fontWeight: 600 }}>{analysis.urgency}</div></div>
                  </div>
                </div>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
                <div className="tag" style={{ marginBottom: 10 }}>Report Details</div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: 'var(--dark-gray)', lineHeight: 1.7 }}>{analysis.detail}</div>
              </div>
              <div style={{ marginTop: 20, padding: '14px 16px', border: '1px solid var(--border)', background: 'var(--off-white)', fontSize: 11.5, color: 'var(--mid-gray)', lineHeight: 1.65 }}>
                This is research-assisted visual analysis for informational purposes only. It is not a diagnosis. Always consult a qualified care provider for evaluation.
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                <button onClick={reset} style={{ padding: '10px 20px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dark-gray)', cursor: 'pointer' }}>New Analysis</button>
                <button onClick={() => startCamera()} style={{ padding: '10px 24px', background: 'var(--black)', color: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>Retake Photo</button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </AppShell>
  )
}
