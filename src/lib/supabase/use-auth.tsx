'use client'

import type { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { clearDemoRoleCookie } from '@/lib/demo-role'
import type { UserRole } from '@/types'
import type { UserRow } from '@/types/profile'
import { createClient } from './client'

interface AuthContextType {
  user: User | null
  session: Session | null
  role: 'candidate' | 'interviewer' | 'admin'
  profile: UserRow | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: 'candidate',
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserRow | null>(null)
  const [role, setRole] = useState<'candidate' | 'interviewer' | 'admin'>('candidate')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [supabase] = useState(createClient)

  const fetchProfile = useCallback(
    async (currentUser: User) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (error) console.warn('Profile lookup failed, using auth metadata:', error.message)
        if (data) {
          setProfile(data)
          setRole(data.role)
        } else {
          // Fallback to metadata if public.users is syncing
          const metaRole: UserRole = currentUser.user_metadata?.role || 'candidate'
          setRole(metaRole)
        }
      } catch (e) {
        console.error('Error fetching profile:', e)
      }
    },
    [supabase],
  )

  useEffect(() => {
    async function initAuth() {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession()
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      if (initialSession?.user) {
        await fetchProfile(initialSession.user)
      }
      setLoading(false)

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        if (newSession?.user) {
          await fetchProfile(newSession.user)
        } else {
          setProfile(null)
          setRole('candidate')
        }
        setLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    initAuth()
  }, [fetchProfile, supabase])

  const signOut = async () => {
    setLoading(true)
    clearDemoRoleCookie()
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setLoading(false)
    router.push('/login')
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, role, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
