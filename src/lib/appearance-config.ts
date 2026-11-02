// Server-safe appearance constants (layout.tsx imports these). The hook is in appearance.ts.

export const THEMES = ['system', 'light', 'dark'] as const
export const ACCENTS = ['blue', 'warm'] as const

export type Theme = (typeof THEMES)[number]
export type Accent = (typeof ACCENTS)[number]
export type Appearance = { theme: Theme; accent: Accent }

export const APPEARANCE_KEY = 'interviewsetu-appearance'
export const DEFAULT_APPEARANCE: Appearance = { theme: 'system', accent: 'blue' }

export const isTheme = (v: unknown): v is Theme => THEMES.includes(v as Theme)
export const isAccent = (v: unknown): v is Accent => ACCENTS.includes(v as Accent)

// Runs in <head> before first paint, so keep it dependency-free. Ignores unknown saved values.
export const appearanceInitScript = `try{var a=JSON.parse(localStorage.getItem('${APPEARANCE_KEY}')||'{}'),d=document.documentElement;if(${JSON.stringify(THEMES)}.indexOf(a.theme)>-1)d.dataset.theme=a.theme;if(${JSON.stringify(ACCENTS)}.indexOf(a.accent)>-1)d.dataset.accent=a.accent}catch(e){}`
