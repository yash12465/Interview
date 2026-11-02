'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  type Accent,
  APPEARANCE_KEY,
  type Appearance,
  DEFAULT_APPEARANCE,
  isAccent,
  isTheme,
  type Theme,
} from './appearance-config'

export type { Accent, Appearance, Theme }

function read(): Appearance {
  const d = document.documentElement.dataset
  return {
    theme: isTheme(d.theme) ? d.theme : DEFAULT_APPEARANCE.theme,
    accent: isAccent(d.accent) ? d.accent : DEFAULT_APPEARANCE.accent,
  }
}

const listeners = new Set<() => void>()
let snapshot: Appearance | null = null

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  const next = read()
  if (!snapshot || snapshot.theme !== next.theme || snapshot.accent !== next.accent) snapshot = next
  return snapshot
}

export function useAppearance() {
  const appearance = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_APPEARANCE)

  const setAppearance = useCallback((patch: Partial<Appearance>) => {
    const next = { ...read(), ...patch }
    document.documentElement.dataset.theme = next.theme
    document.documentElement.dataset.accent = next.accent
    try {
      localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next))
    } catch {}
    for (const cb of listeners) cb()
  }, [])

  return { ...appearance, setAppearance }
}
