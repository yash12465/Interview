'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type PrototypeData = {
  onboardingComplete: boolean
  completedMocks: number
  lessonComplete: boolean
  savedQuestions: number
  interviewerStatus: 'draft' | 'pending' | 'needs-information' | 'approved' | 'not-approved'
  bookingStatus: 'requested' | 'confirmed' | 'completed' | 'disputed' | 'refunded'
  feedbackSubmitted: boolean
  reducedMotion: boolean
  captions: boolean
  notifications: boolean
  auditEvents: string[]
}

const initial: PrototypeData = {
  onboardingComplete: false,
  completedMocks: 8,
  lessonComplete: false,
  savedQuestions: 1,
  interviewerStatus: 'draft',
  bookingStatus: 'requested',
  feedbackSubmitted: false,
  reducedMotion: false,
  captions: true,
  notifications: true,
  auditEvents: [],
}

type Store = {
  data: PrototypeData
  update: (patch: Partial<PrototypeData>, event?: string) => void
  reset: () => void
}

const Context = createContext<Store | null>(null)
const key = 'interviewsetu-prototype-v1'

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(initial)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) setData({ ...initial, ...JSON.parse(saved) })
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch {}
    document.documentElement.dataset.reducedMotion = data.reducedMotion ? 'true' : 'false'
  }, [data])
  const update = (patch: Partial<PrototypeData>, event?: string) =>
    setData((current) => ({
      ...current,
      ...patch,
      auditEvents: event ? [event, ...current.auditEvents].slice(0, 20) : current.auditEvents,
    }))
  const reset = () => {
    setData(initial)
    try {
      localStorage.removeItem(key)
    } catch {}
  }
  return <Context.Provider value={{ data, update, reset }}>{children}</Context.Provider>
}

export function usePrototypeState() {
  const value = useContext(Context)
  if (!value) throw new Error('usePrototypeState must be used inside PrototypeProvider')
  return value
}
