'use client'

import type React from 'react'
import { useState } from 'react'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { RippleButton } from '@/components/ui/RippleButton'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [inquiryType, setInquiryType] = useState('Candidate Inquiry')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col">
      <PublicNav currentPath="/contact" />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-14 w-full">
        <span className="eyebrow mb-3">GET IN TOUCH</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
          We’re here to help you prepare.
        </h1>
        <p className="mt-3 text-base sm:text-lg text-body">
          Have questions about interview tracks, institutional partnerships, or interviewer
          verification? Reach out to our team.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface p-8 rounded-3xl border border-border/90 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-sm text-ink mb-1">Candidate Support</h3>
              <p className="text-xs text-muted">support@interviewsetu.in</p>
              <p className="text-xs text-subtle mt-1">
                For help with AI mocks, session bookings, or refunds.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm text-ink mb-1">Interviewer & Mentor Verification</h3>
              <p className="text-xs text-muted">mentors@interviewsetu.in</p>
              <p className="text-xs text-subtle mt-1">
                Application status, credential verification, and payouts.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm text-ink mb-1">Colleges & Corporate Partnerships</h3>
              <p className="text-xs text-muted">partnerships@interviewsetu.in</p>
              <p className="text-xs text-subtle mt-1">
                Institutional pilot requests, campus placement suites.
              </p>
            </div>
          </div>

          <div className="bg-surface p-8 rounded-3xl border border-border/90 shadow-sm">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-success-soft text-success rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-ink">Message Received!</h3>
                <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto">
                  Thank you, <b>{name}</b>. Your inquiry regarding <b>{inquiryType}</b> has been
                  logged. Our support team will reply to <b>{email}</b> within 24 hours.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false)
                      setName('')
                      setEmail('')
                      setMessage('')
                    }}
                    className="text-xs font-semibold text-brand-strong hover:text-ink"
                  >
                    Send another message →
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-lg text-ink mb-4">Send a Message</h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="contact-your-name"
                      className="text-xs font-bold text-body block mb-1"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-your-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aarav Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email-address"
                      className="text-xs font-bold text-body block mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email-address"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-inquiry-type"
                      className="text-xs font-bold text-body block mb-1"
                    >
                      Inquiry Type
                    </label>
                    <select
                      id="contact-inquiry-type"
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand focus:outline-none bg-surface"
                    >
                      <option>Candidate Inquiry</option>
                      <option>Interviewer Verification</option>
                      <option>College / Institutional Pilot</option>
                      <option>Report Content / Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="text-xs font-bold text-body block mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      className="w-full p-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-brand focus:outline-none"
                    />
                  </div>
                  <RippleButton variant="primary" size="md" fullWidth type="submit">
                    Send Inquiry →
                  </RippleButton>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
