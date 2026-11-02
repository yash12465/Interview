import Link from 'next/link'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { api } from '@/lib/api'
import type { InterviewTrack } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ExamsIndexPage() {
  const tracks = await api<InterviewTrack[]>('/tracks')
  const examTracks = tracks.filter((t) => t.category === 'Government' || t.category === 'Academic')

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/exams" />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-10">
          <span className="eyebrow mb-3">OFFICIAL EXAMINATIONS & NOTIFICATIONS</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            Government Recruitment & Competitive Exams
          </h1>
          <p className="mt-3 text-base sm:text-lg text-body max-w-3xl">
            Verified information on examination stages, interview applicability, conducting
            authorities, and syllabus guidelines. We only provide interview practice where the
            official recruitment notification mandates an interview stage.
          </p>
        </div>

        <div className="space-y-6">
          {examTracks.map((exam) => (
            <div
              key={exam.id}
              className="bg-surface p-7 rounded-3xl border border-border/90 shadow-sm hover:border-brand-tint transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border-soft">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="tag">{exam.category}</span>
                    <span className="text-xs text-subtle">
                      Authority: <b>{exam.officialAuthority || 'Official Board'}</b>
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-ink">{exam.title}</h2>
                  <p className="text-xs text-muted mt-1">
                    Last reviewed against official notification: {exam.lastReviewed}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-success-soft text-success text-xs font-bold px-3 py-1.5 rounded-full border border-success-border flex items-center gap-1">
                    ✓ Interview Stage Applicable
                  </span>
                  <Link
                    href={`/exams/${exam.slug}`}
                    className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-inverse text-xs font-bold transition-all shadow-sm inline-block"
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
                        ? 'bg-brand-soft/60 border-brand-tint text-ink font-medium'
                        : 'bg-surface-soft border-border/60 text-body'
                    }`}
                  >
                    <b className="block text-subtle text-xs uppercase font-bold tracking-wider mb-1">
                      STAGE {i + 1} {stage.hasInterview ? '· INTERVIEW' : ''}
                    </b>
                    <strong className="block text-sm text-ink mb-1">{stage.name}</strong>
                    <p className="text-xs leading-relaxed">{stage.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-muted flex items-center justify-between">
                <span>Applicability rule: {exam.applicabilityNote}</span>
                <Link
                  href={`/interview-tracks/${exam.slug}`}
                  className="text-brand-strong font-bold hover:underline"
                >
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
