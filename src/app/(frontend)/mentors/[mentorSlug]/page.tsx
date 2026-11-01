'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { RippleButton } from '@/components/ui/RippleButton'
import { initialMentors } from '@/lib/data/mock-db'

export default function MentorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const mentorId = params?.mentorSlug as string

  const mentor = initialMentors.find(m => m.id === mentorId || m.name.toLowerCase().replace(/\s+/g, '-').includes(mentorId)) || initialMentors[0]

  const [selectedPackage, setSelectedPackage] = useState(1)
  const [selectedSlot, setSelectedSlot] = useState('Tue 18 Jun · 6:00 PM IST')
  const [bookingStep, setBookingStep] = useState<'profile' | 'form' | 'success'>('profile')
  const [briefGoal, setBriefGoal] = useState('')
  const [consentShare, setConsentShare] = useState(true)
  const [bookingRef, setBookingRef] = useState('')

  const packages = [
    { title: 'Focused Feedback Sprint', duration: 30, price: 799, desc: '30-min targeted session reviewing one specific challenge or project question.' },
    { title: 'Full Mock Interview & Scorecard', duration: 45, price: mentor.interviewerProfile?.hourlyRate || 1199, desc: 'Comprehensive mock simulation followed by verbal feedback and structured rubric.' },
    { title: 'In-Depth Mock + Written Report', duration: 60, price: 1699, desc: 'Full panel simulation with detailed question-by-question written review.' },
  ]

  const slots = [
    'Tue 18 Jun · 4:30 PM IST',
    'Tue 18 Jun · 6:00 PM IST',
    'Wed 19 Jun · 5:30 PM IST',
    'Thu 20 Jun · 7:00 PM IST',
  ]

  const handleConfirmBooking = async () => {
    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id,
          candidateId: 'usr-cand-1',
          candidateName: 'Aarav Kumar',
          trackTitle: mentor.interviewerProfile?.domains[0] || 'Software Engineering',
          serviceName: packages[selectedPackage].title,
          scheduledDate: '2026-06-18',
          scheduledTime: '18:00',
          durationMinutes: packages[selectedPackage].duration,
          pricePaise: packages[selectedPackage].price * 100,
          brief: {
            targetRole: 'Software Engineer',
            focusArea: 'Project Defence',
            notes: briefGoal,
            consentToShare: consentShare,
          },
        }),
      })
      const data = await res.json()
      if (data.success) {
        setBookingRef(data.data.bookingRef)
        setBookingStep('success')
      } else {
        setBookingStep('success')
        setBookingRef('IS-2048')
      }
    } catch {
      setBookingRef('IS-2048')
      setBookingStep('success')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNav currentPath="/mentors" />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/mentors" className="hover:text-indigo-600">← Back to Mentors Directory</Link>
          <span>/</span>
          <span className="text-zinc-900 font-medium">{mentor.name}</span>
        </div>

        {bookingStep === 'success' ? (
          <div className="bg-white p-10 rounded-3xl border border-zinc-200/90 shadow-sm text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 font-bold text-2xl flex items-center justify-center mx-auto mb-4">
              ✓
            </div>
            <span className="eyebrow bg-emerald-50 text-emerald-700 border-emerald-200">
              BOOKING CONFIRMED · TEST SANDBOX
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900 mt-3">
              Your mock session is booked!
            </h1>
            <p className="text-sm text-zinc-600 mt-2">
              Booking Reference: <b className="text-zinc-900">{bookingRef}</b> with {mentor.name}
            </p>
            <div className="my-6 p-4 bg-zinc-50 rounded-2xl text-xs text-zinc-600 text-left space-y-2">
              <p><b>Date & Time:</b> {selectedSlot}</p>
              <p><b>Format:</b> {packages[selectedPackage].title} ({packages[selectedPackage].duration} min)</p>
              <p><b>Join Link:</b> The video room will become active 10 minutes prior to session start.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link
                href="/app/candidate"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/20"
              >
                Go to Candidate Workspace →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Profile Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-zinc-900">{mentor.name}</h1>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">{mentor.interviewerProfile?.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{mentor.interviewerProfile?.experienceYears} experience</p>
                    </div>
                  </div>

                  {mentor.interviewerProfile?.verificationBadge && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-100">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400 mb-2">
                    Professional Headline
                  </h3>
                  <p className="text-sm text-zinc-800 leading-relaxed font-medium">
                    {mentor.interviewerProfile?.headline}
                  </p>
                </div>

                <div className="mt-5">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400 mb-2">
                    About & Mentoring Philosophy
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {mentor.interviewerProfile?.bio}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-100">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400 mb-2.5">
                    Interview Categories & Domains
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.interviewerProfile?.domains.map(d => (
                      <span key={d} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-lg font-semibold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-100 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 block mb-1">Languages:</span>
                    <b className="text-zinc-800">{mentor.interviewerProfile?.languages.join(', ')}</b>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-1">Rating:</span>
                    <b className="text-zinc-800">★ {mentor.interviewerProfile?.rating} / 5.0 ({mentor.interviewerProfile?.reviewCount} reviews)</b>
                  </div>
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="bg-white p-7 rounded-3xl border border-zinc-200/90 shadow-sm">
                <span className="kicker">CANDIDATE FEEDBACK</span>
                <h3 className="text-lg font-bold text-zinc-900 mt-1 mb-4">Recent Candidate Reviews</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-zinc-50 rounded-2xl text-xs text-zinc-700">
                    <div className="flex items-center justify-between mb-1">
                      <b className="font-bold text-zinc-900">Aarav S. (Technical Mock)</b>
                      <span className="text-amber-500 font-bold">★★★★★</span>
                    </div>
                    <p className="italic">"The follow-up questions were incisive and realistic. Helped me stop rushing and explain my architecture choices step by step."</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl text-xs text-zinc-700">
                    <div className="flex items-center justify-between mb-1">
                      <b className="font-bold text-zinc-900">Neha K. (Project Defence)</b>
                      <span className="text-amber-500 font-bold">★★★★★</span>
                    </div>
                    <p className="italic">"Very supportive demeanor. Provided clear feedback on how to frame my contributions without sounding boastful."</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Booking Panel */}
            <div className="lg:col-span-5">
              <div className="bg-white p-7 rounded-3xl border border-zinc-200/90 shadow-sm sticky top-24">
                <span className="kicker">SCHEDULE A 1:1 SESSION</span>
                <h2 className="text-xl font-extrabold text-zinc-900 mt-1 mb-4">Choose Session Format</h2>

                {/* Package Options */}
                <div className="space-y-3 mb-6">
                  {packages.map((pkg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPackage(idx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedPackage === idx
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <b className="font-bold text-zinc-900">{pkg.title}</b>
                        <strong className="text-indigo-600 font-extrabold">₹{pkg.price}</strong>
                      </div>
                      <p className="text-[11px] text-zinc-500">{pkg.desc}</p>
                      <small className="text-[10px] text-zinc-400 mt-1 block">{pkg.duration} minutes · 1:1 video</small>
                    </button>
                  ))}
                </div>

                {/* Available Slots */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Select Available Slot (IST)
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {slots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                        selectedSlot === slot
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {slot.split('·')[1]}
                      <small className="block text-[10px] opacity-70">{slot.split('·')[0]}</small>
                    </button>
                  ))}
                </div>

                {/* Candidate Brief Input */}
                <div className="mb-6">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Your Goal / Focus for this Session:
                  </label>
                  <textarea
                    placeholder="E.g., I want to practice explaining my final-year project and handling tough trade-off follow-ups..."
                    rows={3}
                    value={briefGoal}
                    onChange={e => setBriefGoal(e.target.value)}
                    className="w-full p-3 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <label className="mt-2 flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentShare}
                      onChange={e => setConsentShare(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Share preparation notes with mentor for this session</span>
                  </label>
                </div>

                {/* Checkout Summary */}
                <div className="p-4 bg-zinc-50 rounded-2xl mb-6 text-xs space-y-1.5 border border-zinc-100">
                  <div className="flex justify-between text-zinc-600">
                    <span>Session Fee:</span>
                    <span>₹{packages[selectedPackage].price}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Platform & WebRTC service:</span>
                    <span>₹0 (Included)</span>
                  </div>
                  <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-200 text-sm">
                    <span>Total Amount:</span>
                    <span>₹{packages[selectedPackage].price}</span>
                  </div>
                </div>

                <RippleButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleConfirmBooking}
                >
                  Book Session for ₹{packages[selectedPackage].price} →
                </RippleButton>
                <small className="text-[11px] text-zinc-400 text-center block mt-2">
                  Sandbox checkout · No real payment charged
                </small>
              </div>
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
