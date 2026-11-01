'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from './client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  role: 'candidate' | 'interviewer' | 'admin'
  profile: any | null
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
  const [profile, setProfile] = useState<any | null>(null)
  const [role, setRole] = useState<'candidate' | 'interviewer' | 'admin'>('candidate')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        setRole(data.role as 'candidate' | 'interviewer' | 'admin')
      } else {
        // Fallback to metadata if public.users is syncing
        const metaRole = (currentUser.user_metadata?.role as any) || 'candidate'
        setRole(metaRole)
      }
    } catch (e) {
      console.error('Error fetching profile:', e)
    }
  }

  useEffect(() => {
    async function initAuth() {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      if (initialSession?.user) {
        await fetchProfile(initialSession.user)
      }
      setLoading(false)

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
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
  }, [])

  const signOut = async () => {
    setLoading(true)
    document.cookie = 'interviewsetu_demo_role=; path=/; max-age=0'
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
    <AuthContext.Provider value={{ user, session, role, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
