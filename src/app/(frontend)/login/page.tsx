'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RippleButton } from '@/components/ui/RippleButton'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('aarav@example.com')
  const [password, setPassword] = useState('candidate2026')
  const [role, setRole] = useState<'candidate' | 'interviewer' | 'admin'>('candidate')
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const roles = [
    {
      id: 'candidate' as const,
      title: 'Candidate / Interviewee',
      name: 'Aarav Kumar',
      email: 'aarav@example.com',
      pass: 'candidate2026',
      icon: '🎯',
      badge: 'B2C / Student & Professional',
      desc: 'AI mock interviews, rubric scorecards, learning academy & human mentor booking.',
      target: '/app/candidate',
      theme: 'border-indigo-500 bg-indigo-50/50 text-indigo-900',
    },
    {
      id: 'interviewer' as const,
      title: 'Interviewer / Mentor',
      name: 'Riya Mehta',
      email: 'riya.mehta@example.com',
      pass: 'interviewer2026',
      icon: '💼',
      badge: 'Verified Mentor & SWE',
      desc: 'Booking calendar, availability management, candidate history & structured scorecards.',
      target: '/app/interviewer',
      theme: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    },
    {
      id: 'admin' as const,
      title: 'Staff Admin / Operator',
      name: 'Super Admin',
      email: 'admin@interviewsetu.demo',
      pass: 'demopassword',
      icon: '🛡️',
      badge: 'Platform Governance & Safety',
      desc: 'Interviewer verification queue, operations, dispute resolution & Payload CMS.',
      target: '/staff',
      theme: 'border-slate-800 bg-slate-100 text-slate-900',
    },
  ]

  const selectRole = (targetRole: 'candidate' | 'interviewer' | 'admin') => {
    setRole(targetRole)
    const match = roles.find(r => r.id === targetRole)
    if (match) {
      setEmail(match.email)
      setPassword(match.pass)
    }
  }

  const directInstantLogin = (targetRole: 'candidate' | 'interviewer' | 'admin', targetPath: string) => {
    setLoading(true)
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('interviewsetu-prototype-v1')
        const current = saved ? JSON.parse(saved) : {}
        if (targetRole === 'candidate') {
          localStorage.setItem('interviewsetu-prototype-v1', JSON.stringify({ ...current, onboardingComplete: true }))
        } else if (targetRole === 'interviewer') {
          localStorage.setItem('interviewsetu-prototype-v1', JSON.stringify({ ...current, interviewerStatus: 'approved' }))
        }
      }
    } catch {}
    setTimeout(() => {
      router.push(targetPath)
    }, 300)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('interviewsetu-prototype-v1')
        const current = saved ? JSON.parse(saved) : {}
        if (role === 'candidate') {
          localStorage.setItem('interviewsetu-prototype-v1', JSON.stringify({ ...current, onboardingComplete: true }))
        } else if (role === 'interviewer') {
          localStorage.setItem('interviewsetu-prototype-v1', JSON.stringify({ ...current, interviewerStatus: 'approved' }))
        }
      }
    } catch {}
    setTimeout(() => {
      setLoading(false)
      if (role === 'admin') {
        router.push('/staff')
      } else if (role === 'interviewer') {
        router.push('/app/interviewer')
      } else {
        router.push('/app/candidate')
      }
    }, 400)
  }

  const currentRoleInfo = roles.find(r => r.id === role)!

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link href="/" className="logo inline-flex justify-center" aria-label="InterviewSetu home">
          <span className="logo-mark"><i /><i /><i /></span>
          <strong className="text-2xl text-zinc-900 font-extrabold">Interview<span>Setu</span></strong>
        </Link>
        <span className="eyebrow mt-4 mb-2 inline-block">UNIFIED MULTI-ROLE AUTHENTICATION</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Sign in to your InterviewSetu workspace
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          Choose which role persona you want to explore. Candidates, interviewers, and platform staff operate on one unified identity model.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Role Presets Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {roles.map(r => {
            const isSelected = role === r.id
            return (
              <div
                key={r.id}
                onClick={() => selectRole(r.id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? `${r.theme} ring-2 ring-indigo-500 shadow-md`
                    : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{r.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-zinc-200">
                      {r.id}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">{r.title}</h3>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{r.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-200/60 flex items-center justify-between">
                  <div>
                    <strong className="text-[11px] block text-zinc-900">{r.name}</strong>
                    <small className="text-[9px] text-zinc-400 block font-mono">{r.email}</small>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      directInstantLogin(r.id, r.target)
                    }}
                    className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    title={`Instant 1-click test login as ${r.name}`}
                  >
                    Instant ⚡
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Login Form Box */}
        <div className="bg-white py-8 px-6 shadow-xl shadow-zinc-200/50 rounded-3xl border border-zinc-200/80 sm:px-10">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentRoleInfo.icon}</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  Active Preset
                </span>
                <h4 className="text-sm font-bold text-zinc-900 m-0">
                  {currentRoleInfo.title} ({currentRoleInfo.name})
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => directInstantLogin(currentRoleInfo.id, currentRoleInfo.target)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all"
            >
              1-Click Demo Login →
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-zinc-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-zinc-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                <span>Remember me on this browser</span>
              </label>
              <button
                type="button"
                onClick={() => setForgotSent(true)}
                className="text-indigo-600 hover:underline font-semibold bg-transparent border-0 p-0 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {forgotSent && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                ✓ Password reset instructions sent to <b>{email}</b>.
              </div>
            )}

            <div className="pt-2">
              <RippleButton
                variant="primary"
                size="md"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Authenticating...' : `Sign in to ${currentRoleInfo.title.split('/')[0]} →`}
              </RippleButton>
            </div>
          </form>

          {/* Registration & Additional Options */}
          <div className="mt-8 pt-6 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-center">
            <Link
              href="/onboarding/candidate"
              className="p-2.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-zinc-700 font-semibold transition-all"
            >
              🎯 Register as New Candidate
            </Link>
            <Link
              href="/onboarding/interviewer"
              className="p-2.5 rounded-xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-zinc-700 font-semibold transition-all"
            >
              💼 Apply as Verified Interviewer
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-zinc-400">
            <Link href="/" className="hover:text-zinc-600 transition-colors">
              ← Return to homepage
            </Link>
            <Link href="/admin" className="hover:text-indigo-600 transition-colors font-medium">
              Payload CMS Admin Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
