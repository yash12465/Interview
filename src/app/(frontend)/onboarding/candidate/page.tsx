'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RippleButton } from '@/components/ui/RippleButton'

export default function CandidateOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [choice, setChoice] = useState('')

  const steps = [
    {
      title: 'What are you preparing for?',
      sub: 'Choose the goal that matters most right now.',
      options: [
        'College placement or internship drive',
        'Private-sector job (Tech, Analytics, Product)',
        'Government recruitment interview (UPSC, State PSC, Bank PO)',
        'Higher education / MBA / PhD admissions',
        'Career transition or professional promotion',
        'General communication & interview confidence',
      ],
    },
    {
      title: 'Choose your primary preparation track',
      sub: 'You can add or switch tracks later without losing any progress.',
      options: [
        'Software Engineering & System Design',
        'Campus Placements & College Recruitment',
        'UPSC Personality Test (Civil Services)',
        'Banking Officer Interviews (SBI / IBPS PO)',
        'MBA Admissions & Case Interviews',
        'Communication, Delivery & Answer Structure',
      ],
    },
    {
      title: 'How much previous interview experience do you have?',
      sub: 'This helps us suggest a comfortable initial practice difficulty.',
      options: [
        'Beginner — little to no previous interview practice',
        'Practising — attended 1–3 previous interviews',
        'Experienced — preparing for an upcoming scheduled round',
      ],
    },
    {
      title: 'How would you like to practise?',
      sub: 'Choose your preferred spoken and text response mode.',
      options: [
        'English · Voice orb and speech recognition',
        'Hindi · Spoken voice and Hindi transcripts',
        'Hinglish · Conversational blend',
        'English · Text typing only',
      ],
    },
    {
      title: 'What is your current background?',
      sub: 'Context helps the AI interviewer customize questions to your stage.',
      options: [
        'Final-year student or fresh graduate',
        'Working professional (1–4 years experience)',
        'Senior professional (5+ years experience)',
        'Returning to the workforce or career transition',
      ],
    },
    {
      title: 'What skill would you most like to improve first?',
      sub: 'We will personalize your initial roadmap around this priority.',
      options: [
        'Explaining academic/work projects with clarity',
        'Structuring answers logically without rambling (STAR/PREP)',
        'Technical confidence and trade-off justification',
        'Handling difficult follow-up curveball questions',
        'General calmness and spoken delivery under pressure',
      ],
    },
  ]

  const current = steps[step - 1]

  const handleNext = () => {
    if (step === 6) {
      router.push('/app/candidate')
    } else {
      setStep(step + 1)
      setChoice('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8">
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="logo">
          <span className="logo-mark"><i /><i /><i /></span>
          <strong>Interview<span>Setu</span></strong>
        </Link>
        <Link href="/app/candidate" className="text-xs text-zinc-500 hover:text-zinc-800 font-semibold">
          Skip to workspace →
        </Link>
      </header>

      <main className="max-w-2xl mx-auto w-full my-8">
        <div className="bg-white p-7 sm:p-10 rounded-3xl border border-zinc-200/90 shadow-xl shadow-zinc-200/40">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              <span>Step {step} of 6</span>
              <span>{Math.round((step / 6) * 100)}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            {current.title}
          </h1>
          <p className="text-sm text-zinc-500 mt-1 mb-6">
            {current.sub}
          </p>

          <div className="space-y-2.5">
            {current.options.map((opt, idx) => (
              <button
                key={opt}
                type="button"
                onClick={() => setChoice(opt)}
                className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                  choice === opt
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <span>{opt}</span>
                {choice === opt && (
                  <span className="text-indigo-600 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => step > 1 && setStep(step - 1)}
              className="text-xs font-bold text-zinc-500 disabled:opacity-30 hover:text-zinc-800"
            >
              ← Back
            </button>

            <RippleButton
              variant="primary"
              size="md"
              disabled={!choice}
              onClick={handleNext}
            >
              {step === 6 ? 'Complete Onboarding & Build Plan →' : 'Continue →'}
            </RippleButton>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-zinc-400 py-4">
        Your choices personalize your practice prompts. You can modify them anytime in Settings.
      </footer>
    </div>
  )
}
