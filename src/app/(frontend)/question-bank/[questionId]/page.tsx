import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { apiOrNull } from '@/lib/api'
import type { QuestionItem } from '@/types'

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ questionId: string }>
}) {
  const { questionId } = await params
  const q = await apiOrNull<QuestionItem>(`/questions/${encodeURIComponent(questionId)}`)

  if (!q) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/question-bank" />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center gap-2 text-xs text-muted mb-6">
          <Link href="/question-bank" className="hover:text-brand-strong">
            ← Back to Question Bank
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{q.category}</span>
        </div>

        <div className="bg-surface p-8 sm:p-10 rounded-3xl border border-border/90 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-subtle mb-3">
            <span className="bg-brand-soft text-brand-strong px-3 py-1 rounded-full uppercase tracking-wider text-xs">
              {q.category} · {q.difficulty}
            </span>
            <span>
              Source: {q.sourceType === 'expert_authored' ? 'Expert Authored' : 'Public Historical'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight mt-2">
            {q.title}
          </h1>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-brand-soft/50 rounded-2xl border border-brand-tint">
              <span className="text-xs uppercase font-bold text-ink tracking-wider block mb-1">
                Interviewer Intent
              </span>
              <p className="text-sm text-ink leading-relaxed font-medium">{q.intent}</p>
            </div>

            <div className="p-5 bg-success-soft/50 rounded-2xl border border-success-border">
              <span className="text-xs uppercase font-bold text-success tracking-wider block mb-1">
                Recommended Framework
              </span>
              <p className="text-sm text-success leading-relaxed font-mono font-medium">
                {q.framework}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-ink mb-3">Expected Answer Components</h2>
            <div className="space-y-2">
              {q.expectedComponents.map((comp, idx) => (
                <div
                  key={comp}
                  className="flex items-start gap-2.5 p-3 bg-surface-soft rounded-xl text-xs text-ink"
                >
                  <span className="w-5 h-5 rounded-full bg-brand text-inverse font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <span>{comp}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 p-5 bg-warning-soft/60 border border-warning-border/60 rounded-2xl">
            <h3 className="font-bold text-xs uppercase tracking-wider text-warning mb-1">
              Common Pitfall to Avoid:
            </h3>
            <p className="text-xs text-warning leading-relaxed">{q.commonPitfalls}</p>
          </section>

          <section className="mt-8 p-5 bg-surface-soft rounded-2xl border border-border/70">
            <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">
              Illustrative Sample Summary:
            </span>
            <p className="text-xs text-body leading-relaxed italic">"{q.sampleAnswerSummary}"</p>
          </section>

          <div className="mt-10 pt-6 border-t border-border-soft flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/question-bank" className="text-xs font-bold text-muted hover:text-ink">
              ← Return to Question Bank
            </Link>
            <Link
              href="/app/candidate"
              className="px-6 py-3 rounded-xl bg-brand text-inverse text-xs font-bold shadow-md hover:scale-105 transition-transform"
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
