import AppShell from '../components/AppShell'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Link, useNavigate } from 'react-router-dom'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free Trial', pro: 'Pro', max: 'Max', team: 'Team', enterprise: 'Enterprise'
}

export default function Account() {
  const { user, signOut, trialExpiresAt, isTrialExpired } = useAuth()
  const { tier, isPaid } = useSubscription()
  const nav = useNavigate()

  if (!user) {
    return (
      <AppShell>
        <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ marginBottom: 20, fontSize: 14, color: 'var(--dark-gray)' }}>Sign in to view your account.</p>
          <Link to="/login" style={{ padding: '10px 24px', background: 'var(--black)', color: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'inline-block' }}>Sign In</Link>
        </div>
      </AppShell>
    )
  }

  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="tag">{label}</span>
      <span style={{ fontSize: 13.5, color: 'var(--dark-gray)' }}>{value}</span>
    </div>
  )

  const handleSignOut = () => { signOut(); nav('/') }

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          <div className="tag" style={{ marginBottom: 8 }}>Account</div>
          <h1 style={{ marginBottom: 40 }}>{user.name || user.email.split('@')[0]}</h1>

          {/* Plan status banner */}
          {tier === 'free' && (
            <div style={{ marginBottom: 32, padding: '18px 20px', border: `1px solid ${isTrialExpired ? '#fca5a5' : 'var(--border)'}`, background: isTrialExpired ? '#fff5f5' : 'var(--white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="tag" style={{ marginBottom: 4, color: isTrialExpired ? '#7f1d1d' : undefined }}>
                  {isTrialExpired ? 'Trial Ended' : 'Free Trial Active'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--dark-gray)' }}>
                  {trialExpiresAt && !isTrialExpired
                    ? `Expires ${new Date(trialExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                    : isTrialExpired ? 'Upgrade to continue using medmed.ai'
                    : 'Upgrade anytime'}
                </div>
              </div>
              <Link to="/pricing" style={{ padding: '9px 20px', background: 'var(--black)', color: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'inline-block' }}>Upgrade</Link>
            </div>
          )}

          {/* Profile */}
          <section style={{ marginBottom: 36 }}>
            <div style={{ fontWeight: 600, fontSize: 10, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--mid-gray)', paddingBottom: 12, borderBottom: '2px solid var(--black)', marginBottom: 4 }}>Profile</div>
            {row('Name', user.name || '—')}
            {row('Email', user.email)}
            {row('Member since', user.memberSince ? new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—')}
            {user.referralCode && row('Referral code', <code style={{ fontSize: 12, background: 'var(--off-white)', padding: '2px 6px', border: '1px solid var(--border)' }}>{user.referralCode}</code>)}
          </section>

          {/* Plan */}
          <section style={{ marginBottom: 36 }}>
            <div style={{ fontWeight: 600, fontSize: 10, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--mid-gray)', paddingBottom: 12, borderBottom: '2px solid var(--black)', marginBottom: 4 }}>Plan</div>
            {row('Current plan', <span style={{ fontWeight: 600 }}>{PLAN_LABELS[tier] || tier}</span>)}
            {isPaid && row('Billing', <Link to="/pricing" style={{ textDecoration: 'underline', color: 'var(--dark-gray)' }}>Manage subscription</Link>)}
            {row('Upgrade', <Link to="/pricing" style={{ textDecoration: 'underline', color: 'var(--dark-gray)' }}>View all plans</Link>)}
          </section>

          {/* Security */}
          <section style={{ marginBottom: 36 }}>
            <div style={{ fontWeight: 600, fontSize: 10, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--mid-gray)', paddingBottom: 12, borderBottom: '2px solid var(--black)', marginBottom: 4 }}>Security</div>
            {row('Password', (
              <Link to="/reset-password" style={{ textDecoration: 'underline', color: 'var(--dark-gray)' }}>Change password</Link>
            ))}
          </section>

          {/* Support */}
          <section style={{ marginBottom: 40 }}>
            <div style={{ fontWeight: 600, fontSize: 10, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--mid-gray)', paddingBottom: 12, borderBottom: '2px solid var(--black)', marginBottom: 4 }}>Support</div>
            {row('Help', <a href="mailto:support@medmed.ai" style={{ textDecoration: 'underline', color: 'var(--dark-gray)' }}>support@medmed.ai</a>)}
            {row('Privacy Policy', <Link to="/privacy" style={{ textDecoration: 'underline', color: 'var(--dark-gray)' }}>View</Link>)}
            {row('Terms of Service', <Link to="/terms" style={{ textDecoration: 'underline', color: 'var(--dark-gray)' }}>View</Link>)}
          </section>

          <button onClick={handleSignOut} style={{ padding: '11px 24px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dark-gray)', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
        <Footer />
      </div>
    </AppShell>
  )
}
