import type { Metadata } from 'next'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { AppearanceSettings } from '@/components/ui/AppearanceSettings'

export const metadata: Metadata = { title: 'Settings · InterviewSetu' }

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-soft">
      <PublicNav currentPath="/settings" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted">Choose how InterviewSetu looks on this device.</p>
        <section className="mt-8 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-7">
          <h2 className="mb-6 text-lg font-bold text-ink">Appearance</h2>
          <AppearanceSettings />
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
