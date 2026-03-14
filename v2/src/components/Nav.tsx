import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Nav() {
  const loc = useLocation()
  const { isAuthed } = useAuth()

  const isApp = [
    '/dashboard', '/symptom-checker', '/interactions',
    '/pharmacy', '/camera', '/history', '/account',
  ].includes(loc.pathname)

  return (
    <nav className="nav" style={{ position: 'fixed', top: 0, left: isApp ? 220 : 0, right: 0, zIndex: 90 }}>
      {/* Logo — bigger and always readable */}
        <Link
          to={isAuthed ? '/dashboard' : '/'}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--black)',
            textDecoration: 'none',
          }}
        >
          medmed.ai
        </Link>

      {isApp ? (
        /* App nav — show current section label + account */
        <ul className="nav-links">
          <li>
            <Link to="/dashboard" style={{
              fontSize: 11.5, color: loc.pathname === '/dashboard' ? 'var(--black)' : 'var(--mid-gray)',
              fontWeight: loc.pathname === '/dashboard' ? 600 : 400,
            }}>Dashboard</Link>
          </li>
          <li><Link to="/history" style={{ fontSize: 11.5, color: 'var(--mid-gray)' }}>History</Link></li>
          <li><Link to="/account" style={{ fontSize: 11.5, color: 'var(--mid-gray)' }}>Account</Link></li>
        </ul>
      ) : (
        /* Marketing nav */
        <ul className="nav-links">
          <li><Link to="/how-it-works" style={{ fontSize: 12, color: 'var(--dark-gray)' }}>How It Works</Link></li>
          <li><Link to="/pricing" style={{ fontSize: 12, color: 'var(--dark-gray)' }}>Pricing</Link></li>
          <li><Link to="/about" style={{ fontSize: 12, color: 'var(--dark-gray)' }}>About</Link></li>
          {isAuthed
            ? <li><Link to="/dashboard" className="btn-nav">Open Dashboard</Link></li>
            : <>
                <li><Link to="/login" style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-gray)' }}>Sign In</Link></li>
                <li><Link to="/dashboard" className="btn-nav">Try it Free</Link></li>
              </>
          }
        </ul>
      )}
    </nav>
  )
}
