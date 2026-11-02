'use client'

import { Briefcase, ShieldCheck, Target, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import { Suspense, useState } from 'react'
import { RippleButton } from '@/components/ui/RippleButton'
import { setDemoRoleCookie } from '@/lib/demo-role'
import { getErrorMessage } from '@/lib/error-message'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || ''

  const supabase = createClient()

  const [email, setEmail] = useState('aarav@example.com')
  const [password, setPassword] = useState('candidate2026')
  const [showPassword, setShowPassword] = useState(false)
  const [rolePreset, setRolePreset] = useState<'candidate' | 'interviewer' | 'admin'>('candidate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null)

  const roles = [
    {
      id: 'candidate' as const,
      title: 'Candidate / Interviewee',
      name: 'Aarav Kumar',
      email: 'aarav@example.com',
      pass: 'candidate2026',
      icon: Target,
      badge: 'B2C / Student & Professional',
      desc: 'AI mock interviews, rubric scorecards, learning academy & human mentor booking.',
      target: '/app/candidate',
      theme: 'border-brand bg-brand-soft/50 text-ink',
    },
    {
      id: 'interviewer' as const,
      title: 'Interviewer / Mentor',
      name: 'Riya Mehta',
      email: 'riya.mehta@example.com',
      pass: 'interviewer2026',
      icon: Briefcase,
      badge: 'Verified Mentor & SWE',
      desc: 'Booking calendar, availability management, candidate history & structured scorecards.',
      target: '/app/interviewer',
      theme: 'border-success bg-success-soft/50 text-success',
    },
    {
      id: 'admin' as const,
      title: 'Staff Admin / Operator',
      name: 'Super Admin',
      email: 'admin@interviewsetu.demo',
      pass: 'demopassword',
      icon: ShieldCheck,
      badge: 'Platform Governance & Safety',
      desc: 'Interviewer verification queue, operations, dispute resolution & platform oversight.',
      target: '/staff',
      theme: 'border-brand bg-brand-soft/50 text-ink',
    },
  ]

  const currentRoleInfo = roles.find((r) => r.id === rolePreset) || roles[0]

  const selectRole = (id: 'candidate' | 'interviewer' | 'admin') => {
    setRolePreset(id)
    const r = roles.find((x) => x.id === id)
    if (r) {
      setEmail(r.email)
      setPassword(r.pass)
    }
    setError(null)
    setUnconfirmedEmail(null)
  }

  const navigateAfterLogin = (userRole: string, defaultTarget?: string) => {
    if (redirectTo) {
      router.push(redirectTo)
      return
    }

    if (defaultTarget) {
      router.push(defaultTarget)
      return
    }

    if (userRole === 'admin') {
      router.push('/staff')
    } else if (userRole === 'interviewer') {
      router.push('/app/interviewer')
    } else {
      router.push('/app/candidate')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setUnconfirmedEmail(null)

    if (!email.trim()) {
      setError('Please provide your email address.')
      return
    }
    if (!password) {
      setError('Please provide your password.')
      return
    }

    // Demo personas aren't Supabase users: sign them in the same way as the Instant buttons
    // (sets the demo-role cookie the middleware checks) instead of sending a request that fails.
    const demo = roles.find((r) => r.email === email.trim() && r.pass === password)
    if (demo) {
      directInstantLogin(demo.id, demo.target)
      return
    }

    setLoading(true)

    try {
      // 1. Attempt Supabase Auth login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        if (signInError.message.toLowerCase().includes('email not confirmed')) {
          setUnconfirmedEmail(email.trim())
          throw new Error(
            'Your email address has not been confirmed yet. Please verify it to sign in.',
          )
        }

        throw signInError
      }

      // 2. Fetch role from user table or user_metadata
      let determinedRole = data.user?.user_metadata?.role || 'candidate'

      const { data: profileData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileData?.role) {
        determinedRole = profileData.role
      }

      navigateAfterLogin(determinedRole)
    } catch (err) {
      console.error('Login error:', err)
      setError(getErrorMessage(err, 'Invalid email or password. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const directInstantLogin = (roleId: 'candidate' | 'interviewer' | 'admin', target: string) => {
    setRolePreset(roleId)
    const r = roles.find((x) => x.id === roleId)
    if (r) {
      setEmail(r.email)
      setPassword(r.pass)
    }
    setDemoRoleCookie(roleId)
    navigateAfterLogin(roleId, target)
  }

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link href="/" className="logo inline-flex justify-center" aria-label="InterviewSetu home">
          <span className="logo-mark">
            <i />
            <i />
            <i />
          </span>
          <strong className="text-2xl text-ink font-extrabold">
            Interview<span>Setu</span>
          </strong>
        </Link>
        <span className="eyebrow mt-4 mb-2 inline-block">UNIFIED MULTI-ROLE AUTHENTICATION</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Sign in to your InterviewSetu workspace
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted max-w-md mx-auto">
          Sign in with your email and password. Candidates, interviewers, and platform staff operate
          on one secure identity layer.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Role Presets Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {roles.map((r) => {
            const isSelected = rolePreset === r.id
            return (
              <div
                key={r.id}
                className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? `${r.theme} ring-2 ring-brand shadow-md`
                    : 'bg-surface border-border hover:border-border-strong text-body shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <r.icon size={24} className="text-brand-strong" />
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface/80 border border-border">
                      {r.id}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-ink">{r.title}</h3>
                  <p className="text-xs text-muted mt-1 leading-snug">{r.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <strong className="text-xs block text-ink">{r.name}</strong>
                    <small className="text-xs text-subtle block font-mono break-all">
                      {r.email}
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      directInstantLogin(r.id, r.target)
                    }}
                    className="relative z-10 shrink-0 text-xs font-bold px-2 py-1 rounded bg-brand hover:bg-brand-hover text-inverse transition-colors"
                    title={`Instant 1-click test login as ${r.name}`}
                  >
                    Instant
                  </button>
                </div>
                {/* Covers the card so the whole card fills in this role's details; "Instant" sits above it. */}
                <button
                  type="button"
                  className="absolute inset-0 cursor-pointer rounded-2xl"
                  onClick={() => selectRole(r.id)}
                  aria-pressed={isSelected}
                  aria-label={`Use the ${r.title} demo account`}
                />
              </div>
            )
          })}
        </div>

        {/* Login Form Box */}
        <div className="bg-surface py-8 px-6 shadow-lg rounded-3xl border border-border/80 sm:px-10">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-soft">
            <div className="flex items-center gap-3">
              <currentRoleInfo.icon size={24} className="text-brand-strong" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-strong block">
                  Active Persona Preset
                </span>
                <h4 className="text-sm font-bold text-ink m-0">{currentRoleInfo.title}</h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => directInstantLogin(currentRoleInfo.id, currentRoleInfo.target)}
              className="text-xs font-bold text-brand-strong hover:text-ink bg-brand-soft border border-brand-tint px-3 py-1.5 rounded-xl transition-all"
            >
              1-Click Demo Login →
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-danger-soft border border-danger-border text-xs text-danger flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <TriangleAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
              {unconfirmedEmail && (
                <div className="pt-1">
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(unconfirmedEmail)}`}
                    className="inline-block text-xs font-bold text-brand-strong underline hover:text-ink"
                  >
                    Enter 6-digit verification code or resend email →
                  </Link>
                </div>
              )}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="login-email-address" className="block text-xs font-bold text-body">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="login-email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:border-brand focus:outline-none bg-surface-soft/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-body">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border text-sm focus:border-brand focus:outline-none bg-surface-soft/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-subtle hover:text-body focus:outline-none font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-body cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-brand-strong" />
                <span>Remember me on this browser</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-brand-strong hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <RippleButton variant="primary" size="md" fullWidth disabled={loading}>
                {loading
                  ? 'Authenticating with Supabase...'
                  : `Sign in to ${currentRoleInfo.title.split('/')[0]} →`}
              </RippleButton>
            </div>
          </form>

          {/* Registration Options */}
          <div className="mt-8 pt-6 border-t border-border-soft grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-center">
            <Link
              href="/register"
              className="p-2.5 rounded-xl border border-border hover:border-brand-tint hover:bg-brand-soft/30 text-body font-semibold transition-all"
            >
              <Target size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              Register as New Candidate
            </Link>
            <Link
              href="/register"
              className="p-2.5 rounded-xl border border-border hover:border-success-border hover:bg-success-soft/30 text-body font-semibold transition-all"
            >
              <Briefcase size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
              Register as Interviewer
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-subtle">
            <Link href="/" className="hover:text-body transition-colors">
              ← Return to homepage
            </Link>
            <Link href="/staff" className="hover:text-brand-strong transition-colors font-medium">
              Staff Admin Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-muted">
          Loading sign in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
