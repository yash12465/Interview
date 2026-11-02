'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { InlineLoadState } from '@/components/ui/LoadState'
import { useApi } from '@/lib/use-api'
import type { User } from '@/types'

export default function MentorsIndexPage() {
  const [selectedDomain, setSelectedDomain] = useState('All')
  const { data, loading, error } = useApi<User[]>('/mentors')
  const initialMentors = data ?? []
  const domains = [
    'All',
    'Software Engineering',
    'MBA Admissions',
    'UPSC Personality Test',
    'Campus Placements',
    'Data Analytics',
  ]

  const filtered = initialMentors.filter((m) => {
    if (selectedDomain === 'All') return true
    return m.interviewerProfile?.domains.some((d) =>
      d.toLowerCase().includes(selectedDomain.toLowerCase()),
    )
  })

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/mentors" />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-10 text-center sm:text-left">
          <span className="eyebrow mb-3">VERIFIED HUMAN GUIDANCE</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            Practise 1:1 with Experienced Mentors
          </h1>
          <p className="mt-3 text-base sm:text-lg text-body max-w-3xl">
            Book structured mock interviews with professionals, examination rankers, and faculty
            specialists. Every mentor profile carries admin-verified evidence and strict platform
            conduct guidelines.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {domains.map((d) => (
              <button
                type="button"
                key={d}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedDomain === d
                    ? 'bg-brand text-inverse border-brand font-bold'
                    : 'bg-surface text-body border-border hover:bg-surface-soft'
                }`}
                onClick={() => setSelectedDomain(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <InlineLoadState loading={loading} error={error} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-surface p-7 rounded-3xl border border-border/90 shadow-sm flex flex-col justify-between hover:border-brand-tint hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-brand text-inverse font-extrabold text-lg flex items-center justify-center shadow-md">
                    {m.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  {m.interviewerProfile?.verificationBadge && (
                    <span className="bg-success-soft text-success text-xs px-2.5 py-1 rounded-full font-bold border border-success-border flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-ink mt-4">{m.name}</h3>
                <p className="text-xs text-brand-strong font-bold mt-0.5">
                  {m.interviewerProfile?.title}
                </p>
                <p className="text-xs text-muted mt-1">{m.interviewerProfile?.headline}</p>

                <p className="text-xs text-body mt-3.5 line-clamp-3 leading-relaxed">
                  {m.interviewerProfile?.bio}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.interviewerProfile?.domains.map((d) => (
                    <span
                      key={d}
                      className="bg-surface-sunken text-body text-xs px-2.5 py-0.5 rounded-md font-medium"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                  <span>
                    ★ <b>{m.interviewerProfile?.rating}</b> ({m.interviewerProfile?.reviewCount}{' '}
                    reviews)
                  </span>
                  <span>•</span>
                  <span>{m.interviewerProfile?.languages.join(', ')}</span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-border-soft flex items-center justify-between">
                <div>
                  <small className="text-xs uppercase font-bold text-subtle block tracking-wider">
                    From
                  </small>
                  <b className="text-base text-ink font-extrabold">
                    ₹{m.interviewerProfile?.hourlyRate}
                  </b>
                </div>

                <Link
                  href={`/mentors/${m.id}`}
                  className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-inverse text-xs font-bold transition-all shadow-sm inline-block"
                >
                  Book Session →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Callout to become an interviewer */}
        <div className="mt-16 bg-surface-inverse text-inverse p-8 sm:p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="eyebrow bg-surface/10 text-brand-tint border-surface/20 mb-2 inline-block">
              JOIN OUR VERIFIED MENTOR NETWORK
            </span>
            <h2 className="text-2xl font-bold mt-1 text-inverse">
              Are you an experienced professional or exam ranker?
            </h2>
            <p className="text-xs text-inverse-muted mt-1.5 max-w-xl">
              Conduct structured mock interviews, provide actionable feedback scorecards, and earn
              transparently on your own schedule.
            </p>
          </div>
          <Link
            href="/onboarding/interviewer"
            className="px-6 py-3.5 rounded-xl bg-surface text-ink hover:bg-surface-sunken text-xs font-bold transition-colors shrink-0"
          >
            Apply to Become an Interviewer →
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
