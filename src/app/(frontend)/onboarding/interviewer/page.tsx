'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RippleButton } from '@/components/ui/RippleButton'

export default function InterviewerOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  // Form state
  const [legalName, setLegalName] = useState('Riya Mehta')
  const [displayName, setDisplayName] = useState('Riya Mehta')
  const [category, setCategory] = useState('Professional / Hiring practitioner')
  const [domains, setDomains] = useState<string[]>(['Software Engineering', 'Project Defence'])
  const [title, setTitle] = useState('Senior Software Engineer')
  const [experienceYears, setExperienceYears] = useState('6+ years')
  const [hourlyRate, setHourlyRate] = useState('1199')
  const [evidenceName, setEvidenceName] = useState('employment-letter-sample.pdf')
  const [bio, setBio] = useState('I help early-career engineers articulate technical decisions, reason through trade-offs, and handle rigorous follow-ups with poise.')

  const steps = [
    'Account & Identity',
    'Expertise & Categories',
    'Experience & Evidence',
    'Public Profile',
    'Services & Availability',
    'Review & Submit',
  ]

  const toggleDomain = (d: string) => {
    setDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl border border-zinc-200/90 shadow-xl max-w-lg text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 font-bold text-2xl flex items-center justify-center mx-auto mb-4">
            ✓
          </div>
          <span className="eyebrow bg-indigo-50 text-indigo-700 border-indigo-200 mb-2 inline-block">
            APPLICATION SUBMITTED · UNDER REVIEW
          </span>
          <h1 className="text-2xl font-extrabold text-zinc-900 mt-2">
            Thank you, {displayName}.
          </h1>
          <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
            Your interviewer verification application has been submitted to the trust and safety review team. Application Reference: <b className="text-zinc-900">DEMO-INT-2048</b>.
          </p>

          <div className="my-6 p-4 bg-zinc-50 rounded-2xl text-xs text-zinc-600 text-left space-y-2">
            <p><b>Status:</b> Under Review (Stage 2 of 3)</p>
            <p><b>Claimed Domains:</b> {domains.join(', ')}</p>
            <p><b>Evidence:</b> {evidenceName} (Secure private bucket)</p>
            <p className="text-zinc-400">Platform review verifies identity and qualifications before public profiles become active.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/app/interviewer"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/20"
            >
              Open Interviewer Workspace →
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 text-xs font-bold hover:bg-zinc-50 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="logo">
          <span className="logo-mark"><i /><i /><i /></span>
          <strong>Interview<span>Setu</span></strong>
        </Link>
        <span className="text-xs text-zinc-400">Interviewer Application</span>
      </header>

      <main className="max-w-3xl mx-auto w-full my-6">
        <div className="bg-white p-7 sm:p-10 rounded-3xl border border-zinc-200/90 shadow-xl">
          {/* Stepper Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3">
              <span>Step {step} of 6: {steps[step - 1]}</span>
              <span>{Math.round((step / 6) * 100)}%</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {steps.map((st, i) => (
                <div
                  key={st}
                  className={`h-1.5 rounded-full ${
                    step >= i + 1 ? 'bg-indigo-600' : 'bg-zinc-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900">Personal & Legal Identity</h2>
              <p className="text-xs text-zinc-500">Legal verification details remain strictly private and are never shown on your public profile.</p>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Legal / Full Name (Private)</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={e => setLegalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Public Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900">Expertise & Categories</h2>
              <p className="text-xs text-zinc-500">Select the interview categories you are qualified to conduct.</p>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-2">Mentor Category:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Professional / Hiring practitioner',
                    'Examination-cleared candidate',
                    'Subject-matter expert / Faculty',
                    'Communication & career coach',
                  ].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        category === cat
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <label className="text-xs font-bold text-zinc-700 block mb-2">Select Applicable Tracks:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Software Engineering',
                    'Project Defence',
                    'Campus Placements',
                    'UPSC Personality Test',
                    'MBA Admissions',
                    'Data Analytics',
                    'HR & Behavioural',
                  ].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDomain(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        domains.includes(d)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {domains.includes(d) ? `✓ ${d}` : `+ ${d}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900">Experience & Verification Proof</h2>
              <p className="text-xs text-zinc-500">
                To protect candidates, all claimed qualifications must be corroborated by private review.
              </p>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Total Years in Practice / Domain</label>
                <input
                  type="text"
                  value={experienceYears}
                  onChange={e => setExperienceYears(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50 text-center">
                <span className="text-2xl block mb-1">📄</span>
                <b className="text-xs text-zinc-800 block">Uploaded Evidence:</b>
                <span className="text-xs text-indigo-600 font-mono mt-1 inline-block">{evidenceName}</span>
                <p className="text-[11px] text-zinc-400 mt-1">PDF or image proof (Service ID, Employment letter, or Gazette notification)</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900">Candidate-Facing Profile</h2>
              <p className="text-xs text-zinc-500">This bio will be shown on the public mentors directory once verified.</p>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Short Biography & Approach</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900">Packages & Suggested Pricing</h2>
              <p className="text-xs text-zinc-500">Set candidate pricing for a standard 45-minute mock interview session.</p>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Session Fee (₹ INR)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Illustrative platform fee: 20%. Net payout: ₹{Math.round(Number(hourlyRate || 0) * 0.8)}
                </span>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900">Review & Declaration</h2>
              <p className="text-xs text-zinc-500">Confirm accuracy and agree to the platform code of conduct.</p>

              <div className="p-4 bg-zinc-50 rounded-2xl text-xs text-zinc-700 space-y-2">
                <p><b>Name:</b> {displayName} ({legalName})</p>
                <p><b>Category:</b> {category}</p>
                <p><b>Domains:</b> {domains.join(', ')}</p>
                <p><b>Session Fee:</b> ₹{hourlyRate}</p>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-zinc-600 cursor-pointer pt-2">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 mt-0.5" />
                <span>I certify that all educational, employment, and exam credentials submitted are authentic and accurate.</span>
              </label>
            </div>
          )}

          {/* Action buttons */}
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
              onClick={() => {
                if (step === 6) handleSubmit()
                else setStep(step + 1)
              }}
            >
              {step === 6 ? 'Submit Application for Review →' : 'Continue →'}
            </RippleButton>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-zinc-400 py-4">
        Interviewer verification is audited. Applications are usually reviewed within 48 hours.
      </footer>
    </div>
  )
}
