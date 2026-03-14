import { Link } from 'react-router-dom'

export default function GlobalFooter() {
  return (
    <footer style={{
      width: '100%',
      padding: '32px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 20,
      flexWrap: 'wrap',
      boxSizing: 'border-box'
    }}>
      <span style={{ fontSize: 11, color: 'var(--mid-gray)', fontWeight: 500 }}>
        © {new Date().getFullYear()} MedMed.AI • All rights reserved
      </span>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {[
          { label: 'Policy Center', path: '/policy' },
          { label: 'Business Center', path: '/about' },
          { label: 'Support', path: '/support' },
          { label: 'Contact', path: '/contact' },
        ].map(l => (
          <Link 
            key={l.label} 
            to={l.path} 
            style={{ 
              fontSize: 11, 
              fontWeight: 500, 
              color: 'var(--mid-gray)', 
              textDecoration: 'none',
              transition: 'color 0.1s',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--mid-gray)'}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </footer>
  )
}
