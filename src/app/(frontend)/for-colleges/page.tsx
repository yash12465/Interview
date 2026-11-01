import React from 'react'
import Link from 'next/link'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { RippleButton } from '@/components/ui/RippleButton'

export default function ForCollegesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/for-colleges" />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-14 w-full">
        <div className="bg-gradient-to-br from-[#111a2e] via-[#1a233a] to-[#251d54] text-white p-8 sm:p-14 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="eyebrow bg-white/10 text-cyan-300 border-white/20 mb-3 inline-block">
              INSTITUTIONAL PLACEMENT SUITE
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
              Empower every student in your campus to face interviews with calm confidence.
            </h1>
            <p className="mt-4 text-zinc-300 text-base leading-relaxed">
              InterviewSetu for Colleges enables placement cells and university training departments to deliver structured, scalable interview practice, benchmark candidate readiness, and pinpoint weak areas before recruitment drives start.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/contact"
                className="button primary px-6 py-3.5 rounded-xl font-bold inline-flex items-center text-white"
              >
                Schedule an Institutional Demo →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-3xl border border-zinc-200/90 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg flex items-center justify-center mb-4">
              📊
            </div>
            <h3 className="font-bold text-lg text-zinc-900">Placement Cohort Analytics</h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Real-time dashboards show batch-wide practice consistency, skill distributions across technical, communication, and STAR dimensions without invading private personal transcripts.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-zinc-200/90 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-lg flex items-center justify-center mb-4">
              🎯
            </div>
            <h3 className="font-bold text-lg text-zinc-900">Company-Specific Tracks</h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Configure custom assessment criteria for mass recruiters, consulting firms, core engineering, and high-growth product startups visiting your campus.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-zinc-200/90 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 font-bold text-lg flex items-center justify-center mb-4">
              🤝
            </div>
            <h3 className="font-bold text-lg text-zinc-900">Alumni Mentor Integration</h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Invite your college alumni into private institutional mentor networks to conduct mock interviews and guide juniors through real selection rounds.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
