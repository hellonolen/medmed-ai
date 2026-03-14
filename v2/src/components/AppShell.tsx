import { ReactNode, useState } from 'react'
import Nav from './Nav'
import Sidebar from './Sidebar'
import GlobalFooter from './GlobalFooter'

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <div className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`} style={{ width: 220, position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}>
        <Sidebar />
      </div>
      
      <div className="main-content" style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: '100vh' }}>
        <div className="mobile-header">
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontStyle: 'italic', fontWeight: 300, letterSpacing: '-0.01em' }}>medmed</div>
          <button onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
        
        <Nav />
        <main style={{ flex: 1, paddingTop: 56, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        
        <GlobalFooter />
      </div>
    </div>
  )
}
