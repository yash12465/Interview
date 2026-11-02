'use client'

import { Lightbulb, Mail, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'
import { useState } from 'react'
import { RippleButton } from '@/components/ui/RippleButton'
import { getErrorMessage } from '@/lib/error-message'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please provide your email address.')
      return
    }

    setLoading(true)

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=/reset-password`

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      })

      if (resetError) {
        throw resetError
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Password reset error:', err)
      setError(
        getErrorMessage(
          err,
          'Failed to send password reset link. Please verify the email address.',
        ),
      )
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
        <span className="eyebrow mt-4 mb-2 inline-block">ACCOUNT RECOVERY</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Forgot your password?
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted max-w-sm mx-auto">
          Enter the email address associated with your InterviewSetu account and we will send you a
          secure password reset link.
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

          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-success-soft text-success flex items-center justify-center text-2xl mx-auto">
                <Mail size={20} />
              </div>
              <h2 className="text-lg font-bold text-ink">Reset link sent!</h2>
              <p className="text-xs sm:text-sm text-body leading-relaxed">
                We've sent a password reset link to:
                <strong className="block text-ink mt-1 font-semibold">{email}</strong>
              </p>
              <div className="p-3 bg-surface-soft rounded-xl border border-border/70 text-xs text-muted text-left">
                <Lightbulb size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                Click the link in the email to set a new password. If you don't see it within a few
                minutes, check your spam or promotional folder.
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-semibold text-brand-strong hover:text-ink"
                >
                  Resend or enter another email address
                </button>
                <Link href="/login" className="mt-2 text-xs font-bold text-muted hover:text-ink">
                  ← Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-password-email-address"
                  className="block text-xs font-bold text-body"
                >
                  Email Address
                </label>
                <input
                  id="forgot-password-email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:border-brand focus:outline-none bg-surface-soft/40"
                />
              </div>

              <div className="pt-2">
                <RippleButton variant="primary" size="md" fullWidth disabled={loading}>
                  {loading ? 'Sending link...' : 'Send Reset Link →'}
                </RippleButton>
              </div>

              <div className="mt-4 pt-4 border-t border-border-soft text-center">
                <Link href="/login" className="text-xs font-bold text-muted hover:text-ink">
                  ← Remember your password? Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
