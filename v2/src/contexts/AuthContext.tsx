import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiSignin, apiSignup, getToken, setToken, clearToken, decodeToken, type UserPayload } from '../lib/api'

interface AuthCtx {
  user: UserPayload | null
  token: string | null
  isAuthed: boolean
  trialExpiresAt: string | null
  isTrialExpired: boolean
  signIn: (email: string, pw: string) => Promise<void>
  signUp: (name: string, email: string, pw: string) => Promise<void>
  signOut: () => void
  error: string | null
  loading: boolean
}

const Ctx = createContext<AuthCtx>({
  user: null, token: null, isAuthed: false,
  trialExpiresAt: null, isTrialExpired: false,
  signIn: async () => {}, signUp: async () => {}, signOut: () => {},
  error: null, loading: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Restore session on mount
  useEffect(() => {
    const stored = getToken()
    if (!stored) return
    const payload = decodeToken(stored)
    if (!payload) { clearToken(); return }
    // Check expiry
    if ((payload.exp as number) < Math.floor(Date.now() / 1000)) { clearToken(); return }
    setTokenState(stored)
    setUser({
      id: payload.sub as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      tier: payload.tier as string,
      trialExpires: payload.trialExpires as string | undefined,
    })
  }, [])

  const storeSession = (tok: string, u: UserPayload) => {
    setToken(tok)
    setTokenState(tok)
    setUser(u)
  }

  const signIn = async (email: string, pw: string) => {
    setError(null); setLoading(true)
    try {
      const { token: tok, user: u } = await apiSignin(email, pw)
      storeSession(tok, u)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed')
      throw e
    } finally { setLoading(false) }
  }

  const signUp = async (name: string, email: string, pw: string) => {
    setError(null); setLoading(true)
    try {
      const { token: tok, user: u } = await apiSignup(name, email, pw)
      storeSession(tok, u)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign up failed')
      throw e
    } finally { setLoading(false) }
  }

  const signOut = () => {
    clearToken(); setTokenState(null); setUser(null); setError(null)
  }

  const trialExpiresAt = user?.trialExpires || null
  const isTrialExpired = trialExpiresAt ? new Date(trialExpiresAt) < new Date() : false

  return (
    <Ctx.Provider value={{ user, token, isAuthed: !!user, trialExpiresAt, isTrialExpired, signIn, signUp, signOut, error, loading }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
