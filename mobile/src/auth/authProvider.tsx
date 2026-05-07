import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { clearToken, getToken, setToken } from './tokenStore'
import { meJwt, type AuthUser } from './auth'

type AuthState = {
  status: 'loading' | 'anon' | 'authed'
  token: string | null
  user: AuthUser | null
  signIn: (token: string) => Promise<void>
  signOut: () => Promise<void>
  refreshMe: () => Promise<void>
}

const AuthCtx = createContext<AuthState | null>(null)

export function useAuth() {
  const v = useContext(AuthCtx)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthState['status']>('loading')
  const [token, setTok] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  const refreshMe = useCallback(async () => {
    if (!token) return
    const res = await meJwt(token).catch(() => ({ user: null }))
    setUser(res.user ?? null)
  }, [token])

  const signIn = useCallback(async (newToken: string) => {
    await setToken(newToken)
    setTok(newToken)

    const res = await meJwt(newToken).catch(() => ({ user: null }))
    if (!res.user) {
      await clearToken()
      setTok(null)
      setUser(null)
      setStatus('anon')
      return
    }

    setUser(res.user)
    setStatus('authed')
  }, [])

  const signOut = useCallback(async () => {
    await clearToken()
    setTok(null)
    setUser(null)
    setStatus('anon')
  }, [])

  useEffect(() => {
    void (async () => {
      const t = await getToken()

      if (!t) {
        setTok(null)
        setUser(null)
        setStatus('anon')
        return
      }

      const res = await meJwt(t).catch(() => ({ user: null }))
      if (!res.user) {
        await clearToken()
        setTok(null)
        setUser(null)
        setStatus('anon')
        return
      }

      setTok(t)
      setUser(res.user)
      setStatus('authed')
    })()
  }, [])

  const value = useMemo(
    () => ({ status, token, user, signIn, signOut, refreshMe }),
    [status, token, user, signIn, signOut, refreshMe],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
