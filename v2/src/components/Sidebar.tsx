import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'

const TOOLS = [
  { path: '/dashboard',       icon: '◈', label: 'Dashboard',    sub: 'Home base' },
  { path: '/symptom-checker', icon: '◉', label: 'Symptoms',     sub: 'Research' },
  { path: '/interactions',    icon: '⬡', label: 'Interactions', sub: 'Safety check' },
  { path: '/pharmacy',        icon: '▤', label: 'Pharmacy',     sub: 'Finder' },
  { path: '/camera',          icon: '⊙', label: 'Camera',       sub: 'Visual read' },
  { path: '/history',         icon: '◫', label: 'History',      sub: 'Sessions' },
]

const TIER_COLORS: Record<string, string> = {
  free: '#9b9690', pro: '#1a3acc', max: '#7c3aed', team: '#0891b2', enterprise: '#059669'
}
const TIER_LABELS: Record<string, string> = {
  free: 'Free', pro: 'Pro', max: 'Max', team: 'Team', enterprise: 'Enterprise'
}

export default function Sidebar() {
  const loc = useLocation()
  const nav = useNavigate()
  const { user, signOut } = useAuth()
  const { tier } = useSubscription()

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 56, /* below nav */
      background: 'var(--white)',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
    }}>
      {/* Section heading */}
      <div style={{
        padding: '20px 20px 10px',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
        color: 'var(--mid-gray)',
      }}>Research Tools</div>

      {/* Tool nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' }}>
        {TOOLS.map(t => {
          const active = loc.pathname === t.path
          return (
            <Link key={t.path} to={t.path} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              background: active ? 'var(--off-white)' : 'transparent',
              borderLeft: active ? '2px solid var(--black)' : '2px solid transparent',
              borderRadius: '0 4px 4px 0',
              textDecoration: 'none',
              transition: 'all 0.1s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--off-white)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
              <span style={{ fontSize: 15, color: active ? 'var(--black)' : 'var(--dark-gray)', flexShrink: 0 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'var(--black)' : 'var(--dark-gray)', lineHeight: 1.2 }}>{t.label}</div>
                <div style={{ fontSize: 10, color: 'var(--mid-gray)', marginTop: 1 }}>{t.sub}</div>
              </div>
            </Link>
          )
        })}
      </nav>
      {/* Bottom Legal/Business Nav */}
      <div style={{ padding: '12px 10px', marginTop: 'auto' }}>
         {[
           { label: 'Policy Center', path: '/policy' },
           { label: 'Business Center', path: '/about' },
           { label: 'Support', path: '/support' },
           { label: 'Contact', path: '/contact' },
         ].map(l => (
           <Link key={l.label} to={l.path} style={{
             display: 'block', padding: '6px 12px', fontSize: 11, fontWeight: 500, color: 'var(--mid-gray)', textDecoration: 'none',
             borderRadius: 6, transition: 'all 0.1s', marginBottom: 2
           }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--off-white)'; e.currentTarget.style.color = 'var(--black)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--mid-gray)' }}>
             {l.label}
           </Link>
         ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px' }}>
        {/* Tier badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: TIER_COLORS[tier] || '#9b9690', flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dark-gray)' }}>
            {TIER_LABELS[tier] || tier}
          </span>
          {tier === 'free' && (
            <Link to="/pricing" style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--black)', textDecoration: 'none', border: '1px solid var(--border)', padding: '2px 7px' }}>Upgrade</Link>
          )}
        </div>
        {/* Account */}
        <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: 'var(--off-white)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'var(--dark-gray)', flexShrink: 0,
          }}>
            {user ? (user.name?.[0] || user.email[0]).toUpperCase() : '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--dark-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || user?.email?.split('@')[0] || 'Account'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--mid-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'Sign in'}</div>
          </div>
        </Link>
      </div>
    </aside>
  )
}
