import { ReactNode, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ClaudeSidebar from './ClaudeSidebar'

export default function ClaudeChatShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Auto-close sidebar on mobile navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--off-white)', fontFamily: 'var(--font-sans)', color: 'var(--black)', position: 'relative' }}>
      <div className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`} style={{ width: 260, position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}>
        <ClaudeSidebar />
      </div>

      <main className="main-content" style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div className="mobile-header transparent">
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontStyle: 'italic', fontWeight: 300, letterSpacing: '-0.01em', paddingLeft: 8 }}>medmed</div>
          <button onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
        {children}
      </main>
    </div>
  )
}
