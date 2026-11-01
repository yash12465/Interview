'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { initialMentors } from '@/lib/data/mock-db'

export default function MentorsIndexPage() {
  const [selectedDomain, setSelectedDomain] = useState('All')
  const domains = ['All', 'Software Engineering', 'MBA Admissions', 'UPSC Personality Test', 'Campus Placements', 'Data Analytics']

  const filtered = initialMentors.filter(m => {
    if (selectedDomain === 'All') return true
    return m.interviewerProfile?.domains.some(d => d.toLowerCase().includes(selectedDomain.toLowerCase()))
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/mentors" />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-10 text-center sm:text-left">
          <span className="eyebrow mb-3">VERIFIED HUMAN GUIDANCE</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
            Practise 1:1 with Experienced Mentors
          </h1>
          <p className="mt-3 text-base sm:text-lg text-zinc-600 max-w-3xl">
            Book structured mock interviews with professionals, examination rankers, and faculty specialists. Every mentor profile carries admin-verified evidence and strict platform conduct guidelines.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {domains.map(d => (
              <button
                key={d}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedDomain === d
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
                onClick={() => setSelectedDomain(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(m => (
            <div
              key={m.id}
              className="bg-white p-7 rounded-3xl border border-zinc-200/90 shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                    {m.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {m.interviewerProfile?.verificationBadge && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-zinc-900 mt-4">{m.name}</h3>
                <p className="text-xs text-indigo-600 font-bold mt-0.5">{m.interviewerProfile?.title}</p>
                <p className="text-xs text-zinc-500 mt-1">{m.interviewerProfile?.headline}</p>

                <p className="text-xs text-zinc-600 mt-3.5 line-clamp-3 leading-relaxed">
                  {m.interviewerProfile?.bio}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.interviewerProfile?.domains.map(d => (
                    <span key={d} className="bg-zinc-100 text-zinc-700 text-[11px] px-2.5 py-0.5 rounded-md font-medium">
                      {d}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                  <span>★ <b>{m.interviewerProfile?.rating}</b> ({m.interviewerProfile?.reviewCount} reviews)</span>
                  <span>•</span>
                  <span>{m.interviewerProfile?.languages.join(', ')}</span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <small className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                    From
                  </small>
                  <b className="text-base text-zinc-900 font-extrabold">₹{m.interviewerProfile?.hourlyRate}</b>
                </div>

                <Link
                  href={`/mentors/${m.id}`}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/20 inline-block"
                >
                  Book Session →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Callout to become an interviewer */}
        <div className="mt-16 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="eyebrow bg-white/10 text-cyan-300 border-white/20 mb-2 inline-block">
              JOIN OUR VERIFIED MENTOR NETWORK
            </span>
            <h2 className="text-2xl font-bold mt-1 text-white">
              Are you an experienced professional or exam ranker?
            </h2>
            <p className="text-xs text-zinc-300 mt-1.5 max-w-xl">
              Conduct structured mock interviews, provide actionable feedback scorecards, and earn transparently on your own schedule.
            </p>
          </div>
          <Link
            href="/onboarding/interviewer"
            className="px-6 py-3.5 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-bold transition-colors flex-shrink-0"
          >
            Apply to Become an Interviewer →
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
