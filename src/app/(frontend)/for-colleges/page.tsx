import { ChartColumn, Target, Users } from 'lucide-react'
import Link from 'next/link'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'

export default function ForCollegesPage() {
  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/for-colleges" />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-14 w-full">
        <div className="bg-surface-inverse text-inverse p-8 sm:p-14 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="eyebrow bg-surface/10 text-brand-tint border-surface/20 mb-3 inline-block">
              INSTITUTIONAL PLACEMENT SUITE
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-inverse tracking-tight mt-2">
              Empower every student in your campus to face interviews with calm confidence.
            </h1>
            <p className="mt-4 text-inverse-muted text-base leading-relaxed">
              InterviewSetu for Colleges enables placement cells and university training departments
              to deliver structured, scalable interview practice, benchmark candidate readiness, and
              pinpoint weak areas before recruitment drives start.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/contact"
                className="button primary px-6 py-3.5 rounded-xl font-bold inline-flex items-center text-inverse"
              >
                Schedule an Institutional Demo →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface p-7 rounded-3xl border border-border/90 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand-strong font-bold text-lg flex items-center justify-center mb-4">
              <ChartColumn size={20} />
            </div>
            <h3 className="font-bold text-lg text-ink">Placement Cohort Analytics</h3>
            <p className="text-xs text-body mt-2 leading-relaxed">
              Real-time dashboards show batch-wide practice consistency, skill distributions across
              technical, communication, and STAR dimensions without invading private personal
              transcripts.
            </p>
          </div>

          <div className="bg-surface p-7 rounded-3xl border border-border/90 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-success-soft text-success font-bold text-lg flex items-center justify-center mb-4">
              <Target size={20} />
            </div>
            <h3 className="font-bold text-lg text-ink">Company-Specific Tracks</h3>
            <p className="text-xs text-body mt-2 leading-relaxed">
              Configure custom assessment criteria for mass recruiters, consulting firms, core
              engineering, and high-growth product startups visiting your campus.
            </p>
          </div>

          <div className="bg-surface p-7 rounded-3xl border border-border/90 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand-strong font-bold text-lg flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-lg text-ink">Alumni Mentor Integration</h3>
            <p className="text-xs text-body mt-2 leading-relaxed">
              Invite your college alumni into private institutional mentor networks to conduct mock
              interviews and guide juniors through real selection rounds.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
