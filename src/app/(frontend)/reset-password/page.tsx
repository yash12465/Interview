'use client'

import { TriangleAlert } from 'lucide-react'
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

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    const { score } = checkPasswordStrength(password)
    if (score < 2) {
      setError('Please choose a stronger password.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2500)
    } catch (err) {
      console.error('Password reset error:', err)
      setError(
        getErrorMessage(err, 'Failed to update your password. Please verify the reset link.'),
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
        <span className="eyebrow mt-4 mb-2 inline-block">SECURE CREDENTIAL UPDATE</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Set new password
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted max-w-sm mx-auto">
          Please choose a strong, unique password for your InterviewSetu account.
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

          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-success-soft text-success flex items-center justify-center text-2xl mx-auto">
                ✓
              </div>
              <h2 className="text-lg font-bold text-ink">Password updated successfully!</h2>
              <p className="text-xs sm:text-sm text-body leading-relaxed">
                Your credentials have been securely updated. You are being redirected to the sign-in
                page...
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-block text-xs font-bold text-brand-strong hover:text-ink"
                >
                  Proceed to Sign In now →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label
                  htmlFor="reset-password-new-password"
                  className="block text-xs font-bold text-body"
                >
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="reset-password-new-password"
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
                  htmlFor="reset-password-confirm-new-password"
                  className="block text-xs font-bold text-body"
                >
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="reset-password-confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
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
                  {loading ? 'Updating password...' : 'Update Password & Sign In →'}
                </RippleButton>
              </div>

              <div className="mt-4 pt-4 border-t border-border-soft text-center">
                <Link href="/login" className="text-xs font-bold text-muted hover:text-ink">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
