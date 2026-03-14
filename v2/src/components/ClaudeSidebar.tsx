import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ClaudeSidebar() {
  const { user } = useAuth()
  
  return (
    <aside style={{
      width: 260,
      minHeight: '100vh',
      background: 'var(--white)', // Exact V2 sidebar color
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Brand */}
      <Link to="/" style={{
        fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, 
        letterSpacing: '-0.02em', color: 'var(--black)', textDecoration: 'none', 
        marginBottom: 24, paddingLeft: 8
      }}>
        medmed
      </Link>
      
      {/* New Chat Button */}
      <Link to="/chat" onClick={() => window.location.reload()} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', marginBottom: 24,
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: 14, color: 'var(--black)', textDecoration: 'none',
        transition: 'background 0.1s', borderRadius: 6
      }} onMouseEnter={e => e.currentTarget.style.background = '#ebeae8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        <span>New chat</span>
      </Link>
      
      {/* History (Placeholder/Recent) */}
      <div style={{ flex: 1, overflowY: 'auto', paddingLeft: 8, paddingRight: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--mid-gray)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Recent</p>
        <p style={{ fontSize: 13, color: 'var(--dark-gray)' }}>History is empty</p>
      </div>
      
        {/* Bottom Pinned Nav (Requested Links) */}
      <div style={{ padding: '16px 8px 8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
         {/* User Account / Login */}
         <Link to={user ? "/account" : "/login"} style={{
             display: 'flex', alignItems: 'center', gap: 10, padding: '8px', 
             marginTop: 12, textDecoration: 'none', borderRadius: 6, transition: 'background 0.1s'
           }} onMouseEnter={e => e.currentTarget.style.background = '#ebeae8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
             <div style={{
               width: 28, height: 28, borderRadius: '50%', background: 'var(--white)',
               border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
               fontSize: 11, fontWeight: 700, color: 'var(--black)'
             }}>
               {user ? (user.name?.[0] || user.email[0]).toUpperCase() : '?'}
             </div>
             <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--black)' }}>
               {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Sign in'}
             </div>
         </Link>
      </div>
    </aside>
  )
}
