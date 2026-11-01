'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { RippleButton } from '@/components/ui/RippleButton'

export function PublicNav({ currentPath = '/' }: { currentPath?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const navLinks = [
    { href: '/interview-tracks', label: 'Explore Tracks' },
    { href: '/exams', label: 'Exams & Stages' },
    { href: '/learn', label: 'Learning Academy' },
    { href: '/question-bank', label: 'Question Bank' },
    { href: '/mentors', label: 'Find Mentors' },
    { href: '/pricing', label: 'Pricing' },
  ]

  return (
    <>
      <div className="announcement">
        <span />
        <p>AI practice + real 1:1 guidance — one connected preparation journey.</p>
        <Link href="/#method">See how it works</Link>
      </div>

      <header className="site-header">
        <Link href="/" className="logo" aria-label="InterviewSetu home">
          <span className="logo-mark"><i /><i /><i /></span>
          <strong>Interview<span>Setu</span></strong>
        </Link>

        <nav className={`desktop-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={currentPath === link.href ? 'active-nav-link text-indigo-600 font-bold' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/login" className="login font-bold text-zinc-700 hover:text-indigo-600 px-3 py-2">
            Log in
          </Link>
          <RippleButton variant="primary" size="md" onClick={() => setModalOpen(true)}>
            Get started
          </RippleButton>
        </div>

        <button
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
        <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={e => e.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            <span className="eyebrow">CHOOSE YOUR PATH</span>
            <h2 id="modal-title">How will you use InterviewSetu?</h2>
            <p>Choose your pathway to begin. All user roles share the same unified platform identity.</p>
            <div className="role-grid">
              <Link
                href="/onboarding/candidate"
                className="role-card text-left"
                onClick={() => setModalOpen(false)}
              >
                <b>Prepare for interviews</b>
                <span>Practise with AI, build structured answers, track progress and book verified mentors.</span>
                <em>Continue as candidate →</em>
              </Link>
              <Link
                href="/onboarding/interviewer"
                className="role-card text-left"
                onClick={() => setModalOpen(false)}
              >
                <b>Become an interviewer</b>
                <span>Apply to conduct structured mock interviews in your domain of experience.</span>
                <em>View application →</em>
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center text-xs text-zinc-500">
              <span>Already have an account? <Link href="/login" className="text-indigo-600 font-semibold underline">Sign in</Link></span>
              <Link href="/staff" className="text-zinc-400 hover:text-zinc-600">Staff portal →</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
