'use client'

import type { ReactNode } from 'react'
import { type Accent, type Theme, useAppearance } from '@/lib/appearance'

const THEMES: { value: Theme; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Match your device setting' },
  { value: 'light', label: 'Light', hint: 'Always light' },
  { value: 'dark', label: 'Dark', hint: 'Always dark' },
]

const ACCENTS: { value: Accent; label: string; hint: string }[] = [
  { value: 'blue', label: 'Blue', hint: 'Calm and focused' },
  { value: 'warm', label: 'Warm', hint: 'Ink with saffron highlights' },
]

// Miniature page drawn with the tokens of the given theme and accent (data-* re-scopes them).
// Omit `theme` to inherit the page's colour scheme.
function Preview({ theme, accent }: { theme?: Theme; accent: Accent }) {
  const half = theme === 'system'
  const pane = (scheme?: 'light' | 'dark') => (
    <div
      data-theme={scheme}
      data-accent={accent}
      className="flex flex-1 flex-col gap-1.5 p-2.5"
      style={{ background: 'var(--surface-soft)' }}
    >
      <span className="h-1.5 w-10 rounded-full" style={{ background: 'var(--text)' }} />
      <span className="h-1.5 w-14 rounded-full" style={{ background: 'var(--border-strong)' }} />
      <span className="mt-auto h-3 w-9 rounded" style={{ background: 'var(--brand)' }} />
    </div>
  )
  return (
    <div className="flex h-16 overflow-hidden rounded-md border border-border">
      {half ? (
        <>
          {pane('light')}
          {pane('dark')}
        </>
      ) : (
        pane(theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : undefined)
      )}
    </div>
  )
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  preview,
}: {
  label: string
  value: T
  options: { value: T; label: string; hint: string }[]
  onChange: (v: T) => void
  preview: (v: T) => ReactNode
}) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-3 text-sm font-semibold text-ink">{label}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((o) => {
          const active = o.value === value
          return (
            <label
              key={o.value}
              className={`flex cursor-pointer flex-col gap-2.5 rounded-lg border bg-surface p-3 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus ${
                active ? 'border-brand shadow-sm' : 'border-border hover:border-border-strong'
              }`}
            >
              <input
                type="radio"
                name={label}
                value={o.value}
                checked={active}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {preview(o.value)}
              <span className="flex items-center justify-between gap-2">
                <span>
                  <span className="block text-sm font-semibold text-ink">{o.label}</span>
                  <span className="block text-xs text-muted">{o.hint}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                    active ? 'border-brand bg-brand' : 'border-border-strong'
                  }`}
                >
                  {active && <span className="size-1.5 rounded-full bg-inverse" />}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function AppearanceSettings() {
  const { theme, accent, setAppearance } = useAppearance()
  return (
    <div className="flex flex-col gap-7">
      <OptionGroup
        label="Theme"
        value={theme}
        options={THEMES}
        onChange={(t) => setAppearance({ theme: t })}
        preview={(t) => <Preview theme={t} accent={accent} />}
      />
      <OptionGroup
        label="Accent colour"
        value={accent}
        options={ACCENTS}
        onChange={(a) => setAppearance({ accent: a })}
        preview={(a) => <Preview accent={a} />}
      />
      <p className="m-0 text-xs text-muted">Saved on this device. Applies to every page.</p>
    </div>
  )
}
