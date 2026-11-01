'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/contact" />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-14 w-full">
        <span className="eyebrow mb-3">GET IN TOUCH</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
          We’re here to help you prepare.
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-600">
          Have questions about interview tracks, institutional partnerships, or interviewer verification? Reach out to our team.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 mb-1">Candidate Support</h3>
              <p className="text-xs text-zinc-500">support@interviewsetu.in</p>
              <p className="text-xs text-zinc-400 mt-1">For help with AI mocks, session bookings, or refunds.</p>
            </div>

            <div>
              <h3 className="font-bold text-sm text-zinc-900 mb-1">Interviewer & Mentor Verification</h3>
              <p className="text-xs text-zinc-500">mentors@interviewsetu.in</p>
              <p className="text-xs text-zinc-400 mt-1">Application status, credential verification, and payouts.</p>
            </div>

            <div>
              <h3 className="font-bold text-sm text-zinc-900 mb-1">Colleges & Corporate Partnerships</h3>
              <p className="text-xs text-zinc-500">partnerships@interviewsetu.in</p>
              <p className="text-xs text-zinc-400 mt-1">Institutional pilot requests, campus placement suites.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-sm">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Message Received!</h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  Thank you, <b>{name}</b>. Your inquiry regarding <b>{inquiryType}</b> has been logged. Our support team will reply to <b>{email}</b> within 24 hours.
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
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Send another message →
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-lg text-zinc-900 mb-4">Send a Message</h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Aarav Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="aarav@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Inquiry Type</label>
                    <select
                      value={inquiryType}
                      onChange={e => setInquiryType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option>Candidate Inquiry</option>
                      <option>Interviewer Verification</option>
                      <option>College / Institutional Pilot</option>
                      <option>Report Content / Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Message</label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      className="w-full p-3 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <RippleButton
                    variant="primary"
                    size="md"
                    fullWidth
                    type="submit"
                  >
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

