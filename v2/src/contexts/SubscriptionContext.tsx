import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from './AuthContext'

type Tier = 'free' | 'pro' | 'max' | 'team' | 'enterprise'

interface SubCtx {
  tier: Tier
  isPaid: boolean
  isTeam: boolean
  canUseCamera: boolean
  seats: number
}

const Ctx = createContext<SubCtx>({ tier: 'free', isPaid: false, isTeam: false, canUseCamera: false, seats: 1 })

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const tier = (user?.tier as Tier) || 'free'
  const isPaid = tier !== 'free'
  const isTeam = tier === 'team' || tier === 'enterprise'
  const canUseCamera = tier !== 'free'
  // Seats come from the JWT payload if present; default 1
  const seats = 1

  return (
    <Ctx.Provider value={{ tier, isPaid, isTeam, canUseCamera, seats }}>
      {children}
    </Ctx.Provider>
  )
}

export const useSubscription = () => useContext(Ctx)
