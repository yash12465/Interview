import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ questionId: string }>
}) {
  const { questionId } = await params
  const q = InterviewSetuService.getQuestionById(questionId)

  if (!q) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/question-bank" />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/question-bank" className="hover:text-indigo-600">← Back to Question Bank</Link>
          <span>/</span>
          <span className="text-zinc-900 font-medium">{q.category}</span>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200/90 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-3">
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">
              {q.category} · {q.difficulty}
            </span>
            <span>Source: {q.sourceType === 'expert_authored' ? 'Expert Authored' : 'Public Historical'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-2">
            {q.title}
          </h1>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <span className="text-xs uppercase font-bold text-indigo-900 tracking-wider block mb-1">
                Interviewer Intent
              </span>
              <p className="text-sm text-indigo-950 leading-relaxed font-medium">
                {q.intent}
              </p>
            </div>

            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <span className="text-xs uppercase font-bold text-emerald-900 tracking-wider block mb-1">
                Recommended Framework
              </span>
              <p className="text-sm text-emerald-950 leading-relaxed font-mono font-medium">
                {q.framework}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-zinc-900 mb-3">Expected Answer Components</h2>
            <div className="space-y-2">
              {q.expectedComponents.map((comp, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 bg-zinc-50 rounded-xl text-xs text-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{comp}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 p-5 bg-amber-50/60 border border-amber-200/60 rounded-2xl">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-1">
              Common Pitfall to Avoid:
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {q.commonPitfalls}
            </p>
          </section>

          <section className="mt-8 p-5 bg-zinc-50 rounded-2xl border border-zinc-200/70">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Illustrative Sample Summary:
            </span>
            <p className="text-xs text-zinc-700 leading-relaxed italic">
              "{q.sampleAnswerSummary}"
            </p>
          </section>

          <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/question-bank" className="text-xs font-bold text-zinc-500 hover:text-zinc-800">
              ← Return to Question Bank
            </Link>
            <Link
              href="/app/candidate"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform"
            >
              Practise this Question in AI Studio →
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
