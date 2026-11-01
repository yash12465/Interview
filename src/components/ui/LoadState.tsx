import React from 'react'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'

/** Inline status line for lists while data loads from the backend. */
export function InlineLoadState({ loading, error }: { loading: boolean; error: string | null }) {
  if (error) {
    return (
      <p className="text-sm text-rose-600 py-6" role="alert">
        Couldn&apos;t reach the API: {error}
      </p>
    )
  }
  if (loading) {
    return (
      <p className="text-sm text-zinc-500 py-6" aria-live="polite">
        Loading…
      </p>
    )
  }
  return null
}

/** Full-page placeholder for detail pages that can't render without data. */
export function PageLoadState({
  currentPath,
  loading,
  error,
}: {
  currentPath: string
  loading: boolean
  error: string | null
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath={currentPath} />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        <InlineLoadState loading={loading} error={error ?? (loading ? null : 'Not found')} />
      </main>
      <PublicFooter />
    </div>
  )
}
