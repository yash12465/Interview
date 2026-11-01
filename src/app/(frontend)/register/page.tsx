import React from 'react'
import Link from 'next/link'

export default function RegisterIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 sm:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="logo inline-flex justify-center" aria-label="InterviewSetu home">
          <span className="logo-mark"><i /><i /><i /></span>
          <strong className="text-2xl text-zinc-900 font-extrabold">Interview<span>Setu</span></strong>
        </Link>
        <span className="eyebrow mt-4 mb-2 inline-block">CREATE YOUR ACCOUNT</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
          How do you want to use InterviewSetu?
        </h1>
        <p className="mt-2 text-xs text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-semibold underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="space-y-4">
          <Link
            href="/onboarding/candidate"
            className="block p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                🎯
              </div>
              <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                Start Candidate Setup →
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mt-4">
              I want to prepare for interviews
            </h2>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Practise with adaptive AI interviewers, get instant rubric scorecards, study answer frameworks in the learning lab, and optionally book human mentors.
            </p>
          </Link>

          <Link
            href="/onboarding/interviewer"
            className="block p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl font-bold">
                💼
              </div>
              <span className="text-xs font-bold text-violet-600 group-hover:translate-x-1 transition-transform">
                Start Interviewer Application →
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mt-4">
              I want to conduct mock interviews
            </h2>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Join as a verified mentor or interview practitioner. Conduct mock interviews, write structured scorecards, and earn transparent fees.
            </p>
          </Link>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-400">
          <p>Admin accounts are invite-only and cannot be registered publicly.</p>
        </div>
      </div>
    </div>
  )
}
