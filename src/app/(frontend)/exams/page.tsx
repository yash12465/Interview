import React from 'react'
import Link from 'next/link'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { initialTracks } from '@/lib/data/mock-db'

export default function ExamsIndexPage() {
  const examTracks = initialTracks.filter(t => t.category === 'Government' || t.category === 'Academic')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/exams" />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-10">
          <span className="eyebrow mb-3">OFFICIAL EXAMINATIONS & NOTIFICATIONS</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
            Government Recruitment & Competitive Exams
          </h1>
          <p className="mt-3 text-base sm:text-lg text-zinc-600 max-w-3xl">
            Verified information on examination stages, interview applicability, conducting authorities, and syllabus guidelines. We only provide interview practice where the official recruitment notification mandates an interview stage.
          </p>
        </div>

        <div className="space-y-6">
          {examTracks.map(exam => (
            <div
              key={exam.id}
              className="bg-white p-7 rounded-3xl border border-zinc-200/90 shadow-sm hover:border-indigo-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="tag">{exam.category}</span>
                    <span className="text-xs text-zinc-400">Authority: <b>{exam.officialAuthority || 'Official Board'}</b></span>
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900">{exam.title}</h2>
                  <p className="text-xs text-zinc-500 mt-1">Last reviewed against official notification: {exam.lastReviewed}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    ✓ Interview Stage Applicable
                  </span>
                  <Link
                    href={`/exams/${exam.slug}`}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/20 inline-block"
                  >
                    View Selection Process →
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                {exam.selectionStages.map((stage, i) => (
                  <div
                    key={stage.name}
                    className={`p-4 rounded-xl border text-xs ${
                      stage.hasInterview
                        ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950 font-medium'
                        : 'bg-zinc-50 border-zinc-200/60 text-zinc-600'
                    }`}
                  >
                    <b className="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                      STAGE {i + 1} {stage.hasInterview ? '· INTERVIEW' : ''}
                    </b>
                    <strong className="block text-sm text-zinc-900 mb-1">{stage.name}</strong>
                    <p className="text-[11px] leading-relaxed">{stage.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-zinc-500 flex items-center justify-between">
                <span>Applicability rule: {exam.applicabilityNote}</span>
                <Link href={`/interview-tracks/${exam.slug}`} className="text-indigo-600 font-bold hover:underline">
                  Start AI Practice for {exam.title.split(' ')[0]} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
