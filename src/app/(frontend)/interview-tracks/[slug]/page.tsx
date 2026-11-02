import { Info } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { api, apiOrNull } from '@/lib/api'
import type { InterviewTrack, QuestionItem, User } from '@/types'

export default async function TrackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const track = await apiOrNull<InterviewTrack>(`/tracks/${encodeURIComponent(slug)}`)

  if (!track) {
    notFound()
  }

  const [allMentors, allQuestions] = await Promise.all([
    api<User[]>(`/mentors?domain=${encodeURIComponent(track.category)}`),
    api<QuestionItem[]>(`/questions?trackSlug=${encodeURIComponent(track.slug)}`),
  ])
  const mentors = allMentors.slice(0, 3)
  const questions = allQuestions.slice(0, 4)

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/interview-tracks" />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted mb-6">
          <Link href="/" className="hover:text-brand-strong">
            Home
          </Link>
          <span>/</span>
          <Link href="/interview-tracks" className="hover:text-brand-strong">
            Tracks
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{track.title}</span>
        </div>

        {/* Track Hero Banner */}
        <div className="bg-surface-inverse text-inverse p-8 sm:p-12 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="eyebrow bg-surface/10 text-brand-tint border-surface/20 mb-4 inline-block">
              {track.category.toUpperCase()} RECRUITMENT TRACK
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 text-inverse">
              {track.title}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-inverse-muted max-w-2xl leading-relaxed">
              {track.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-inverse-muted">
              <span className="flex items-center gap-1.5 bg-surface/10 px-3 py-1.5 rounded-lg border border-surface/10">
                <i className="w-2 h-2 rounded-full bg-success-solid" />
                Official Selection Stages Verified
              </span>
              <span>
                Last reviewed: <b>{track.lastReviewed}</b>
              </span>
              {track.officialAuthority && (
                <span>
                  Authority: <b>{track.officialAuthority}</b>
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/app/candidate"
                className="button primary px-6 py-3.5 rounded-xl text-inverse font-bold inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                Start AI Practice for this Track →
              </Link>
              <Link
                href="/mentors"
                className="button secondary px-6 py-3.5 rounded-xl font-bold inline-flex items-center gap-2 bg-surface/10 text-inverse border-surface/20 hover:bg-surface/20 transition-colors"
              >
                Browse Verified Mentors
              </Link>
            </div>
          </div>
        </div>

        {/* Applicability Note Callout */}
        <div className="mt-8 p-5 bg-warning-soft/80 border border-warning-border/80 rounded-2xl flex items-start gap-3.5 text-sm text-warning">
          <Info size={20} className="shrink-0 text-info" />
          <div>
            <b className="font-semibold">Official Selection Process Applicability Note:</b>
            <p className="mt-0.5 text-warning">{track.applicabilityNote}</p>
          </div>
        </div>

        {/* Selection Stages Timeline */}
        <section className="mt-12">
          <div className="section-heading mb-6">
            <div>
              <span className="kicker">OFFICIAL PIPELINE</span>
              <h2 className="text-2xl font-bold text-ink">Stages in the Selection Process</h2>
            </div>
            <p className="text-sm text-body">
              We only show an interview preparation track when an interview is officially confirmed
              in the notification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {track.selectionStages.map((stg, i) => (
              <div
                key={stg.name}
                className={`p-6 rounded-2xl border transition-all ${
                  stg.hasInterview
                    ? 'bg-brand-soft/50 border-brand-tint shadow-sm'
                    : 'bg-surface border-border/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-3">
                  <span className="text-subtle">STAGE {i + 1}</span>
                  {stg.hasInterview ? (
                    <span className="bg-brand text-inverse px-2 py-0.5 rounded-md text-xs">
                      INTERVIEW STAGE
                    </span>
                  ) : (
                    <span className="text-muted bg-surface-sunken px-2 py-0.5 rounded-md text-xs">
                      WRITTEN / FILTER
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-ink text-lg">{stg.name}</h3>
                <p className="text-xs text-body mt-2 leading-relaxed">{stg.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Competencies & Question Preview */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-surface p-7 rounded-2xl border border-border/80 shadow-sm">
            <span className="kicker">WHAT INTERVIEWERS LOOK FOR</span>
            <h2 className="text-xl font-bold text-ink mt-1">Core Competency Rubric</h2>
            <p className="text-xs text-muted mt-1 mb-5">
              Practice scores are evaluated across these explicit dimensions.
            </p>

            <div className="space-y-3">
              {track.skills.map((s, idx) => (
                <div
                  key={s}
                  className="p-3.5 bg-surface-soft rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-brand-soft text-brand-strong font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-sm text-ink">{s}</span>
                  </div>
                  <span className="text-xs text-success font-bold bg-success-soft px-2 py-1 rounded">
                    Evaluated in AI Mock
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface p-7 rounded-2xl border border-border/80 shadow-sm">
            <span className="kicker">PREPARATION PROMPTS</span>
            <h2 className="text-xl font-bold text-ink mt-1">Frequent Practice Questions</h2>
            <p className="text-xs text-muted mt-1 mb-5">
              Expert-authored and reviewed public prompts.
            </p>

            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 bg-surface-soft hover:bg-brand-soft/50 rounded-xl border border-border/60 transition-colors"
                >
                  <span className="text-xs font-bold text-brand-strong uppercase">
                    {q.category} · {q.difficulty}
                  </span>
                  <h4 className="font-semibold text-sm text-ink mt-1">{q.title}</h4>
                  <p className="text-xs text-muted mt-1 line-clamp-1">{q.intent}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 text-right">
              <Link
                href="/question-bank"
                className="text-xs font-bold text-brand-strong hover:text-ink"
              >
                Explore full question bank →
              </Link>
            </div>
          </section>
        </div>

        {/* Mentors Available for this Track */}
        <section className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="kicker">1:1 HUMAN GUIDANCE</span>
              <h2 className="text-2xl font-bold text-ink">Mentors Covering This Track</h2>
            </div>
            <Link href="/mentors" className="text-sm font-bold text-brand-strong hover:underline">
              View all mentors →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentors.map((m) => (
              <div
                key={m.id}
                className="bg-surface p-6 rounded-2xl border border-border/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-brand text-inverse font-bold text-base flex items-center justify-center">
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
                  <h3 className="font-bold text-ink mt-3 text-lg">{m.name}</h3>
                  <p className="text-xs text-muted font-medium">{m.interviewerProfile?.title}</p>
                  <p className="text-xs text-body mt-3 line-clamp-3 leading-relaxed">
                    {m.interviewerProfile?.bio}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-soft flex items-center justify-between">
                  <div>
                    <span className="text-xs text-subtle block">Session from</span>
                    <b className="text-sm text-ink">₹{m.interviewerProfile?.hourlyRate}</b>
                  </div>
                  <Link
                    href={`/mentors/${m.id}`}
                    className="px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-inverse text-xs font-bold transition-all shadow-sm"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
