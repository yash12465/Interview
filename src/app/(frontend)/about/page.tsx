import React from 'react'
import Link from 'next/link'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/about" />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-14 w-full">
        <span className="eyebrow mb-3">ABOUT INTERVIEWSETU</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
          Learn how to answer. Practise with confidence. Improve with every interview.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
          InterviewSetu is India's dedicated interview preparation ecosystem. We unite adaptive AI conversational practice, verified recruitment frameworks, and vetted human mock-interview mentors under one transparent standard.
        </p>

        <div className="mt-12 space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200/90 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Our Core Principles</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 rounded-2xl">
                <b className="text-sm text-zinc-900 block mb-1">Practice Scores are Educational</b>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We never claim practice scores guarantee official exam ranks or hiring decisions. A score reflects structure, clarity, and relevance against an open rubric.
                </p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl">
                <b className="text-sm text-zinc-900 block mb-1">Human Dignity & Fair Evaluation</b>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We never evaluate candidates on facial expressions, physical attractiveness, or socio-economic signals. Answer substance and structured reasoning matter.
                </p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl">
                <b className="text-sm text-zinc-900 block mb-1">Verified Official Stages</b>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We verify each exam notification before marking an interview stage as applicable. If a post has no interview, we explicitly display that.
                </p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl">
                <b className="text-sm text-zinc-900 block mb-1">Private & Consensual</b>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Candidate transcripts, resumes, and recordings remain private. Mentors only view materials that candidates explicitly share for that booked session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
