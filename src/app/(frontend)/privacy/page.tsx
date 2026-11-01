import React from 'react'
import Link from 'next/link'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/privacy" />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-14 w-full">
        <span className="eyebrow mb-3">DATA INTEGRITY & PRIVACY</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
          Privacy Policy & Data Rights
        </h1>
        <p className="mt-2 text-xs text-zinc-400">
          Last revised: 31 October 2026 · Aligned with applicable Indian digital privacy norms
        </p>

        <div className="mt-10 bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200/90 shadow-sm space-y-6 text-xs text-zinc-700 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-2">1. Introduction & Scope</h2>
            <p>
              InterviewSetu Technologies Pvt. Ltd. ("InterviewSetu", "we", "us") respects the autonomy and privacy of every candidate, interviewer, and visitor. This policy explains what information we collect, how it is processed for mock interview feedback, and the rights you maintain over your data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-2">2. Data We Collect</h2>
            <p>
              <b>Candidate Account & Preparation Data:</b> Name, email, target examination/role, self-reported experience, practice goals, transcripts of AI interview practice sessions, rubric scores, and saved notes.
            </p>
            <p className="mt-1">
              <b>Interviewer Verification Data:</b> Legal name, contact details, identity verification proof, degrees, employment evidence documents. Verification documents are strictly private and accessible only to authorized platform verification staff.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-2">3. Video & Audio Recording Consent</h2>
            <p>
              Recording of live 1:1 human mock interview sessions is <b>OFF BY DEFAULT</b>. A session is never recorded unless all participants have explicitly provided prior informed consent through the session room interface. If consent is granted, a persistent visual indicator remains active during the entire recording.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-2">4. AI Processing Safeguards</h2>
            <p>
              User answers and transcripts are processed exclusively to evaluate relevance, answer structure, factual accuracy, and communication clarity against versioned rubrics. We do not evaluate facial attractiveness, accent, or socioeconomic background.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900 mb-2">5. Data Deletion & Export</h2>
            <p>
              Candidates may request a complete export of their account history or request permanent account deletion via the Settings panel at any time.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
