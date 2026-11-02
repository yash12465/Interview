'use client'

import { TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import { Suspense, useEffect, useState } from 'react'
import { RippleButton } from '@/components/ui/RippleButton'
import { getErrorMessage } from '@/lib/error-message'
import { createClient } from '@/lib/supabase/client'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!email) {
      setError('Please provide your email address.')
      return
    }
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: 'signup',
      })

      if (verifyError) {
        // Also try 'email' type in case of signin OTP
        const { error: secondError } = await supabase.auth.verifyOtp({
          email,
          token: otp.trim(),
          type: 'email',
        })
        if (secondError) {
          throw secondError
        }
      }

      setSuccessMsg('Email verified successfully! Redirecting to your workspace...')
      const userRole = data?.user?.user_metadata?.role || 'candidate'
      setTimeout(() => {
        if (userRole === 'interviewer') {
          router.push('/app/interviewer')
        } else {
          router.push('/app/candidate')
        }
      }, 1200)
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid or expired verification code.'))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || !email) return
    setError(null)
    setSuccessMsg(null)
    setResending(true)

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (resendError) throw resendError

      setSuccessMsg('A fresh verification code and link has been dispatched to your email.')
      setCooldown(60)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to resend verification email.'))
    } finally {
      setResending(false)
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
        <span className="eyebrow mt-4 mb-2 inline-block">EMAIL VERIFICATION</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Verify your email address
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted max-w-sm mx-auto">
          We sent a verification link and a 6-digit OTP code to:
          <b className="block text-ink mt-1 font-semibold">{email || 'your email'}</b>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 sm:px-10 rounded-3xl border border-border/90 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-soft border border-danger-border text-xs text-danger flex items-start gap-2">
              <TriangleAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-success-soft border border-success-border text-xs text-success flex items-start gap-2">
              <span className="font-bold shrink-0">✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {!initialEmail && (
              <div>
                <label
                  htmlFor="verify-email-your-email"
                  className="text-xs font-bold text-body block mb-1"
                >
                  Your Email
                </label>
                <input
                  id="verify-email-your-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:border-brand focus:outline-none"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="verify-email-6-digit-verification-code-otp"
                className="text-xs font-bold text-body block mb-1"
              >
                6-Digit Verification Code (OTP)
              </label>
              <input
                id="verify-email-6-digit-verification-code-otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full px-4 py-3 rounded-xl border border-border text-center tracking-widest text-lg font-mono font-bold focus:border-brand focus:outline-none"
              />
              <span className="text-xs text-subtle block mt-1">
                You can also simply click the confirmation link in the email.
              </span>
            </div>

            <RippleButton
              variant="primary"
              size="md"
              fullWidth
              disabled={loading || otp.length < 6}
            >
              {loading ? 'Verifying...' : 'Verify Code & Continue →'}
            </RippleButton>
          </form>

          <div className="mt-6 pt-6 border-t border-border-soft text-center">
            <span className="text-xs text-muted block mb-2">Didn't receive the email?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="text-xs font-bold text-brand-strong hover:text-ink disabled:opacity-50"
            >
              {resending
                ? 'Resending...'
                : cooldown > 0
                  ? `Resend available in ${cooldown}s`
                  : 'Resend verification email'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs font-bold text-muted hover:text-ink">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-muted">
          Loading verification...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
