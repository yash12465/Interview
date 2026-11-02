'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { InlineLoadState } from '@/components/ui/LoadState'
import { useApi } from '@/lib/use-api'
import type { InterviewTrack } from '@/types'

export default function InterviewTracksPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const { data, loading, error } = useApi<InterviewTrack[]>('/tracks')
  const initialTracks = data ?? []
  const categories = ['All', 'Government', 'Technical', 'College', 'Academic', 'Skills']

  const filtered =
    selectedCategory === 'All'
      ? initialTracks
      : initialTracks.filter((t) => t.category === selectedCategory)

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/interview-tracks" />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-10 text-center sm:text-left">
          <span className="eyebrow mb-3">CURATED SELECTION STAGES</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            Interview Tracks & Preparation Frameworks
          </h1>
          <p className="mt-3 text-base sm:text-lg text-body max-w-3xl">
            Explore official recruitment stages and interview applicability. Practise with
            track-specific rubrics, verified question patterns, and experienced mentors.
          </p>

          <div className="category-bar mt-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                type="button"
                key={c}
                className={selectedCategory === c ? 'active font-bold' : ''}
                onClick={() => setSelectedCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <InlineLoadState loading={loading} error={error} />
        <div className="track-grid">
          {filtered.map((t, i) => (
            <article key={t.id} className="relative group hover:border-brand transition-all">
              <div className={`track-icon tone-${i % 4}`}>{t.icon}</div>
              <span className="tag">{t.category}</span>
              <h3 className="text-xl font-bold mt-2 text-ink">{t.title}</h3>
              <p className="text-body text-sm mt-2 line-clamp-3">{t.copy}</p>

              <div className="mt-4">
                <small className="text-xs uppercase font-bold text-subtle tracking-wider">
                  Key Competencies
                </small>
                <div className="skill-list mt-1.5 flex flex-wrap gap-1.5">
                  {t.skills.map((s) => (
                    <span
                      key={s}
                      className="bg-surface-sunken text-body text-xs px-2.5 py-1 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="format-row mt-6 pt-4 border-t border-border-soft flex items-center justify-between text-xs text-muted">
                <span>
                  <i className="inline-block w-1.5 h-1.5 rounded-full bg-success-solid mr-1.5" /> AI
                  Mock Ready
                </span>
                <span>{t.availableMentorsCount} Mentors Online</span>
              </div>

              <div className="mt-5 flex gap-2">
                <Link
                  href={`/interview-tracks/${t.slug}`}
                  className="flex-1 text-center py-2.5 px-3 rounded-xl bg-brand hover:bg-brand-hover text-inverse text-xs font-bold transition-all shadow-sm"
                >
                  View Track Details →
                </Link>
                <Link
                  href="/app/candidate"
                  className="py-2.5 px-3 rounded-xl bg-brand-soft hover:bg-brand-tint/40 text-brand-strong text-xs font-bold transition-colors"
                >
                  Practise
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
