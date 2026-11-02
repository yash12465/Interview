'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { RippleButton } from '@/components/ui/RippleButton'
import { SettingsLink } from '@/components/ui/SettingsLink'
import { useAuth } from '@/lib/supabase/use-auth'
import { useEscapeKey } from '@/lib/use-escape-key'

export function PublicNav({ currentPath = '/' }: { currentPath?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  useEscapeKey(() => setModalOpen(false))
  const { user, role, signOut, loading } = useAuth()

  const navLinks = [
    { href: '/interview-tracks', label: 'Explore Tracks' },
    { href: '/exams', label: 'Exams & Stages' },
    { href: '/learn', label: 'Learning Academy' },
    { href: '/question-bank', label: 'Question Bank' },
    { href: '/mentors', label: 'Find Mentors' },
    { href: '/pricing', label: 'Pricing' },
  ]

  const dashboardPath =
    role === 'admin' ? '/staff' : role === 'interviewer' ? '/app/interviewer' : '/app/candidate'

  return (
    <>
      <div className="announcement">
        <span />
        <p>AI practice + real 1:1 guidance — one connected preparation journey.</p>
        <Link href="/#method">See how it works</Link>
      </div>

      <header className="site-header">
        <Link href="/" className="logo" aria-label="InterviewSetu home">
          <span className="logo-mark">
            <i />
            <i />
            <i />
          </span>
          <strong>
            Interview<span>Setu</span>
          </strong>
        </Link>

        <nav className={`desktop-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                currentPath === link.href ? 'active-nav-link text-brand-strong font-bold' : ''
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <SettingsLink />
          {!loading && user ? (
            <div className="flex items-center gap-2">
              <Link
                href={dashboardPath}
                className="font-bold text-xs sm:text-sm text-brand-strong bg-brand-soft border border-brand-tint hover:bg-brand-tint/40 px-3 py-1.5 rounded-xl transition-all"
              >
                Dashboard →
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-xs sm:text-sm font-semibold text-body hover:text-ink px-2 py-1.5"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="login font-bold text-body hover:text-brand-strong px-3 py-2"
              >
                Log in
              </Link>
              <RippleButton variant="primary" size="md" onClick={() => setModalOpen(true)}>
                Get started
              </RippleButton>
            </>
          )}
        </div>

        <button
          type="button"
          className="icon-button menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {mobileMenuOpen ? (
              <path d="m6 6 12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </header>

      {modalOpen && (
        // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click is a pointer shortcut; Escape (useEscapeKey) closes it from the keyboard.
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button
              type="button"
              className="icon-button modal-close"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <span className="eyebrow">CHOOSE YOUR PATH</span>
            <h2 id="modal-title">How will you use InterviewSetu?</h2>
            <p>
              Choose your pathway to begin. All user roles share the same unified platform identity.
            </p>
            <div className="role-grid">
              <Link
                href="/register"
                className="role-card text-left"
                onClick={() => setModalOpen(false)}
              >
                <b>Prepare for interviews</b>
                <span>
                  Practise with AI, build structured answers, track progress and book verified
                  mentors.
                </span>
                <em>Register as candidate →</em>
              </Link>
              <Link
                href="/register"
                className="role-card text-left"
                onClick={() => setModalOpen(false)}
              >
                <b>Become an interviewer</b>
                <span>
                  Apply to conduct structured mock interviews in your domain of experience.
                </span>
                <em>Apply as interviewer →</em>
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-border-soft flex justify-between items-center text-xs text-muted">
              <span>
                Already have an account?{' '}
                <Link href="/login" className="text-brand-strong font-semibold underline">
                  Sign in
                </Link>
              </span>
              <Link href="/staff" className="text-subtle hover:text-body">
                Staff portal →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
