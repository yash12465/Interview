'use client'

import { Briefcase, Info, Sparkles, Target, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState } from 'react'
import {
  checkPasswordStrength,
  PasswordStrengthMeter,
} from '@/components/auth/PasswordStrengthMeter'
import { RippleButton } from '@/components/ui/RippleButton'
import { getErrorMessage } from '@/lib/error-message'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<'candidate' | 'interviewer'>('candidate')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please provide your full name.')
      return
    }
    if (!email.trim()) {
      setError('Please provide a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    const { score } = checkPasswordStrength(password)
    if (score < 2) {
      setError('Please choose a stronger password containing numbers or uppercase letters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role: role, // 'candidate' or 'interviewer'. Admin is forbidden by trigger!
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${
            role === 'interviewer' ? '/app/interviewer' : '/app/candidate'
          }`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      // Check if session was created immediately (e.g. if email auto-confirm is enabled in Supabase)
      if (data.session) {
        if (role === 'interviewer') {
          router.push('/app/interviewer')
        } else {
          router.push('/app/candidate')
        }
      } else {
        // Email verification link / OTP sent
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(getErrorMessage(err, 'Failed to create your account. Please check your details.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
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
        <span className="eyebrow mt-4 mb-2 inline-block">CREATE YOUR ACCOUNT</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Join InterviewSetu
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-strong font-semibold underline hover:text-ink">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface-sunken/60 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'candidate'
                ? 'bg-surface text-brand-strong shadow-sm'
                : 'text-body hover:text-ink'
            }`}
          >
            <Target size={16} />
            <span>Candidate / Student</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('interviewer')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'interviewer'
                ? 'bg-surface text-success shadow-sm'
                : 'text-body hover:text-ink'
            }`}
          >
            <Briefcase size={16} />
            <span>Interviewer / Mentor</span>
          </button>
        </div>

        {/* Informational banner about selected role */}
        {role === 'interviewer' ? (
          <div className="mb-4 p-3.5 rounded-2xl bg-success-soft/80 border border-success-border/80 text-success text-xs flex items-start gap-2.5">
            <Info size={16} className="shrink-0" />
            <div>
              <strong className="block font-semibold">Interviewer Credential Review</strong>
              <span>
                Interviewer accounts are subject to credential verification before mock session
                bookings become publicly visible to candidates.
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3.5 rounded-2xl bg-brand-soft/80 border border-brand-tint/80 text-ink text-xs flex items-start gap-2.5">
            <Sparkles size={16} className="shrink-0" />
            <div>
              <strong className="block font-semibold">Adaptive AI Interview Preparation</strong>
              <span>
                Unlimited AI mock interviews, instant rubric feedback, question bank access, and
                expert mentor bookings.
              </span>
            </div>
          </div>
        )}

        {/* Register Card */}
        <div className="bg-surface py-8 px-6 sm:px-10 rounded-3xl border border-border/90 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-danger-soft border border-danger-border text-xs text-danger flex items-start gap-2">
              <TriangleAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="register-full-name" className="block text-xs font-bold text-body">
                Full Name
              </label>
              <input
                id="register-full-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'interviewer' ? 'Dr. / Er. Full Name' : 'Your full name'}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:border-brand focus:outline-none bg-surface-soft/40"
              />
            </div>

            <div>
              <label htmlFor="register-email-address" className="block text-xs font-bold text-body">
                Email Address
              </label>
              <input
                id="register-email-address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:border-brand focus:outline-none bg-surface-soft/40"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-xs font-bold text-body">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border text-sm focus:border-brand focus:outline-none bg-surface-soft/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-subtle hover:text-body focus:outline-none font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <PasswordStrengthMeter password={password} />
            </div>

            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-bold text-body"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border text-sm focus:border-brand focus:outline-none bg-surface-soft/40"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-subtle hover:text-body focus:outline-none font-medium"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <span className="text-xs text-danger block mt-1">Passwords do not match</span>
              )}
            </div>

            <div className="pt-2">
              <RippleButton variant="primary" size="md" fullWidth disabled={loading}>
                {loading
                  ? 'Creating your account...'
                  : role === 'interviewer'
                    ? 'Register as Interviewer →'
                    : 'Register as Candidate →'}
              </RippleButton>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-border-soft text-center text-xs text-subtle">
            <p>Admin accounts are invite-only and cannot be registered publicly.</p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:text-ink transition-colors">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
