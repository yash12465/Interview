import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/terms" />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-14 w-full">
        <span className="eyebrow mb-3">TERMS OF SERVICE</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
          Platform Terms & Conditions
        </h1>
        <p className="mt-2 text-xs text-subtle">Last revised: 31 October 2026</p>

        <div className="mt-10 bg-surface p-8 sm:p-10 rounded-3xl border border-border/90 shadow-sm space-y-6 text-xs text-body leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-ink mb-2">
              1. Practice & Educational Disclaimer
            </h2>
            <p>
              InterviewSetu is an educational training and practice platform.{' '}
              <b>
                Mock interview scores, AI evaluations, and mentor scorecards are practice metrics
                and do NOT constitute a guarantee, prediction, or warranty of official selection,
                rank, employment, or job placement.
              </b>{' '}
              Neither InterviewSetu nor its mentors represent any official government examination
              board, recruiting agency, or enterprise hiring panel.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink mb-2">
              2. Interviewer Conduct & Declarations
            </h2>
            <p>
              Mentors agree to uphold the highest standards of professional mentorship, provide
              constructive, evidence-based feedback, and refrain from making deceptive guarantees
              regarding examination or hiring outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink mb-2">
              3. Bookings, Cancellations & Refunds
            </h2>
            <p>
              Candidates may reschedule a session up to 24 hours prior to the scheduled start time
              without penalty. In the event of an interviewer no-show, the candidate is entitled to
              a full refund or rebooking credit.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
