'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { PublicNav } from '@/components/public/PublicNav'
import { PublicFooter } from '@/components/public/PublicFooter'
import { RippleButton } from '@/components/ui/RippleButton'
import { useApi } from '@/lib/use-api'
import { apiUrl } from '@/lib/api'
import { PageLoadState } from '@/components/ui/LoadState'
import { useAuth } from '@/lib/supabase/use-auth'
import type { User, MentorSlot } from '@/types'

export default function MentorProfilePage() {
  const { data, loading, error } = useApi<User[]>('/mentors')
  if (!data || data.length === 0) return <PageLoadState currentPath="/mentors" loading={loading} error={error} />
  return <MentorProfileView initialMentors={data} />
}

function MentorProfileView({ initialMentors }: { initialMentors: User[] }) {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const mentorId = params?.mentorSlug as string

  const mentor = initialMentors.find(
    m => m.id === mentorId || m.name.toLowerCase().replace(/\s+/g, '-').includes(mentorId)
  ) || initialMentors[0]

  // Booking options
  const [duration, setDuration] = useState<30 | 45 | 60>(45)
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-03')
  const [selectedSlot, setSelectedSlot] = useState<MentorSlot | null>(null)
  const [bookingStep, setBookingStep] = useState<'details' | 'brief' | 'success'>('details')

  // Candidate brief inputs
  const [targetRole, setTargetRole] = useState(mentor.interviewerProfile?.domains[0] || 'Software Engineering')
  const [focusArea, setFocusArea] = useState('System Design & Architecture')
  const [notes, setNotes] = useState('')
  const [consentShare, setConsentShare] = useState(true)

  // API State
  const [slots, setSlots] = useState<(MentorSlot & { isAvailable: boolean; reason?: string })[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null)

  // Package definitions
  const packages = {
    30: { title: 'Focused Sprint', price: 799, desc: 'Targeted 30-min session reviewing a specific challenge, code question or resume.' },
    45: { title: 'Full Mock Interview', price: mentor.interviewerProfile?.hourlyRate || 1199, desc: 'Complete 45-min panel interview simulation with verbal breakdown & scorecard.' },
    60: { title: 'Deep Dive & Defence', price: 1699, desc: 'Comprehensive 60-min simulation with detailed feedback on architecture trade-offs.' },
  }

  // Fetch dynamic availability
  const fetchAvailability = async (selectedDuration: number) => {
    try {
      setLoadingSlots(true)
      const res = await fetch(apiUrl(`/mentors/${mentor.id}/availability?duration=${selectedDuration}`))
      const json = await res.json()
      if (json.success && json.data?.slots) {
        setSlots(json.data.slots)
        // Auto-select first available slot
        const firstAvail = json.data.slots.find((s: any) => s.isAvailable)
        if (firstAvail) {
          setSelectedDate(firstAvail.date)
          setSelectedSlot(firstAvail)
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    fetchAvailability(duration)
  }, [duration, mentor.id])

  // Get unique available dates
  const availableDates = Array.from(new Set(slots.map(s => s.date))).sort()
  const slotsForDate = slots.filter(s => s.date === selectedDate)

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      setBookingError('Please select an available time slot before continuing.')
      return
    }

    setSubmitting(true)
    setBookingError(null)

    const candidateId = user?.id || 'usr-cand-1'
    const candidateName = profile?.name || user?.user_metadata?.name || 'Aarav Kumar'

    try {
      const res = await fetch(apiUrl('/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id,
          candidateId,
          candidateName,
          trackTitle: targetRole,
          serviceName: packages[duration].title,
          scheduledDate: selectedSlot.date,
          scheduledTime: selectedSlot.startTime,
          durationMinutes: duration,
          pricePaise: packages[duration].price * 100,
          slotId: selectedSlot.id,
          timezone: selectedSlot.timezone || 'Asia/Kolkata',
          brief: {
            targetRole,
            focusArea,
            notes,
            consentToShare: consentShare,
          },
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setConfirmedBooking(data.data)
        setBookingStep('success')
      } else {
        // Show conflict or error message
        setBookingError(
          data.error || 'The selected time slot is no longer available. Please select another slot.'
        )
      }
    } catch {
      setBookingError("Couldn't reach booking service. Please check your network and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNav currentPath="/mentors" />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/mentors" className="hover:text-indigo-600 transition-colors">← Back to Mentors Directory</Link>
          <span>/</span>
          <span className="text-zinc-900 font-medium">{mentor.name}</span>
        </div>

        {bookingStep === 'success' && confirmedBooking ? (
          <div className="bg-white p-10 rounded-3xl border border-zinc-200/90 shadow-sm text-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 font-bold text-2xl flex items-center justify-center mx-auto mb-4">
              ✓
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              BOOKING CONFIRMED · POSTGRESQL SECURED
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900 mt-3">
              Your mock session is booked!
            </h1>
            <p className="text-sm text-zinc-600 mt-2">
              Booking ID: <b className="text-zinc-900 font-mono text-base">{confirmedBooking.bookingRef}</b> with {mentor.name}
            </p>

            <div className="my-6 p-5 bg-zinc-50 rounded-2xl text-xs text-zinc-700 text-left space-y-2.5 border border-zinc-200/70">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                <span className="text-zinc-500">Service:</span>
                <span className="font-semibold text-zinc-900">{confirmedBooking.serviceName} ({confirmedBooking.durationMinutes} min)</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                <span className="text-zinc-500">Date & Time:</span>
                <span className="font-semibold text-zinc-900">{confirmedBooking.scheduledDate} at {confirmedBooking.scheduledTime} (IST)</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                <span className="text-zinc-500">Duration:</span>
                <span className="font-semibold text-zinc-900">{confirmedBooking.durationMinutes} Minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Confirmed</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mb-6">
              A calendar invite and in-app notification have been sent to you and {mentor.name}. The video room becomes active 10 minutes prior to session start.
            </p>

            <div className="flex gap-3 justify-center">
              <Link
                href="/app/candidate"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 shadow-sm transition-colors"
              >
                Go to Candidate Dashboard →
              </Link>
              <Link
                href="/mentors"
                className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors"
              >
                Browse More Mentors
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Interviewer Profile & Credentials */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xl flex items-center justify-center shadow-md">
                    {mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-zinc-900">{mentor.name}</h1>
                    <p className="text-xs text-zinc-500">{mentor.interviewerProfile?.title || 'Senior Engineering Mentor'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        Verified Interviewer
                      </span>
                      <span className="text-xs text-zinc-600 font-medium">★ {mentor.interviewerProfile?.rating || 4.9}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-100 space-y-4">
                  <div>
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Expertise & Domains</h2>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {mentor.interviewerProfile?.domains.map(d => (
                        <span key={d} className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-medium">
                          {d}
                        </span>
                      )) || <span className="text-xs text-zinc-500">Software Engineering</span>}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">About Mentor</h2>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      {mentor.interviewerProfile?.bio ||
                        'Senior engineering mentor with 8+ years conducting system design and project defence interviews across top tier tech product firms.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-zinc-50 rounded-xl text-center">
                      <p className="text-lg font-bold text-zinc-900">{mentor.interviewerProfile?.experienceYears || '8+'} yrs</p>
                      <p className="text-[11px] text-zinc-500">Experience</p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl text-center">
                      <p className="text-lg font-bold text-zinc-900">{mentor.interviewerProfile?.completedSessions || 42}</p>
                      <p className="text-[11px] text-zinc-500">Interviews Held</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantees card */}
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-indigo-950">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  InterviewSetu Booking Protection
                </div>
                <p className="text-indigo-800/80 leading-relaxed text-[11px]">
                  • Guaranteed conflict prevention: No double bookings allowed.<br/>
                  • Free rescheduling up to 12 hours before session start.<br/>
                  • Immediate slot release if session is cancelled.
                </p>
              </div>
            </div>

            {/* Right Column: Dynamic Availability & Booking Engine */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-sm">
                {/* Step Indicator */}
                <div className="flex items-center justify-between pb-6 border-b border-zinc-100 mb-6">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Step {bookingStep === 'details' ? '1 of 2' : '2 of 2'}</span>
                    <h2 className="text-xl font-bold text-zinc-900 mt-0.5">
                      {bookingStep === 'details' ? 'Select Duration & Available Slot' : 'Interview Context & Confirmation'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${bookingStep === 'details' ? 'bg-indigo-600' : 'bg-emerald-500'}`} />
                    <span className={`w-3 h-3 rounded-full ${bookingStep === 'brief' ? 'bg-indigo-600' : 'bg-zinc-200'}`} />
                  </div>
                </div>

                {bookingError && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-shake">
                    <span className="text-base leading-none">⚠️</span>
                    <div>
                      <b className="font-semibold block">Booking Conflict / Notice:</b>
                      <span>{bookingError}</span>
                    </div>
                  </div>
                )}

                {bookingStep === 'details' ? (
                  <div className="space-y-6">
                    {/* Duration Selector: 30, 45, 60 min */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                        1. Choose Interview Duration
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {([30, 45, 60] as const).map(d => {
                          const pkg = packages[d]
                          const isSelected = duration === d
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setDuration(d)
                                setSelectedSlot(null)
                              }}
                              className={`p-3.5 rounded-2xl border text-left transition-all ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-zinc-900 text-sm">{d} Minutes</span>
                                <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600' : 'text-zinc-600'}`}>
                                  ₹{pkg.price}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{pkg.title}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Date Selector */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          2. Select Date ({slots.length} available slots)
                        </label>
                        <span className="text-[11px] text-zinc-500 font-medium">Timezone: Asia/Kolkata (IST)</span>
                      </div>

                      {loadingSlots ? (
                        <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 rounded-2xl">
                          Scanning mentor calendar & verifying real-time conflict locks...
                        </div>
                      ) : availableDates.length === 0 ? (
                        <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-50 rounded-2xl">
                          No open slots found for {duration} min duration. Please check alternate durations or dates.
                        </div>
                      ) : (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {availableDates.map(dateStr => {
                            const dateObj = new Date(dateStr)
                            const isSelected = selectedDate === dateStr
                            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                            const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                            return (
                              <button
                                key={dateStr}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(dateStr)
                                  setSelectedSlot(null)
                                }}
                                className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-center transition-all ${
                                  isSelected
                                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                                }`}
                              >
                                <span className="block text-[10px] uppercase font-semibold tracking-wider opacity-80">{dayName}</span>
                                <span className="block text-xs font-bold mt-0.5">{monthDay}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Time Slot Grid */}
                    {slotsForDate.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                          3. Choose Time Slot
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {slotsForDate.map(slot => {
                            const isSelected = selectedSlot?.id === slot.id
                            const isAvailable = slot.isAvailable

                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => isAvailable && setSelectedSlot(slot)}
                                className={`p-3 rounded-xl border text-center transition-all ${
                                  !isAvailable
                                    ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-md ring-2 ring-indigo-200'
                                    : 'border-zinc-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-zinc-800'
                                }`}
                              >
                                <span className="text-xs font-medium block">
                                  {slot.startTime} – {slot.endTime}
                                </span>
                                <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-indigo-100' : isAvailable ? 'text-emerald-600 font-semibold' : 'text-zinc-400'}`}>
                                  {isAvailable ? '✓ Available' : 'Booked'}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-zinc-500">Total session fee:</span>
                        <p className="text-lg font-extrabold text-zinc-900">₹{packages[duration].price}</p>
                      </div>

                      <button
                        type="button"
                        disabled={!selectedSlot}
                        onClick={() => setBookingStep('brief')}
                        className={`px-6 py-3 rounded-xl font-semibold text-xs transition-all ${
                          selectedSlot
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
                            : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                        }`}
                      >
                        Next: Share Context →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Brief & Final Confirmation */
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex justify-between items-center text-xs">
                      <div>
                        <b className="text-zinc-900 block font-semibold">{packages[duration].title} ({duration} min)</b>
                        <span className="text-zinc-600">{selectedSlot?.date} at {selectedSlot?.startTime} IST with {mentor.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookingStep('details')}
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Target Role / Company
                      </label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={e => setTargetRole(e.target.value)}
                        placeholder="e.g. SDE 2 at Google, Backend Engineer at Razorpay"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Primary Focus Area
                      </label>
                      <select
                        value={focusArea}
                        onChange={e => setFocusArea(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="System Design & Architecture">System Design & Architecture Trade-offs</option>
                        <option value="Data Structures & Algorithms">Data Structures & Algorithm Optimization</option>
                        <option value="Project Defence & Architecture">Project Defence & Deep Technical Questioning</option>
                        <option value="Behavioral & Leadership Principles">Behavioral & Leadership Principles (STAR method)</option>
                        <option value="Resume & Portfolio Walkthrough">Resume Walkthrough & Gap Explanation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Notes & Context for Interviewer (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Share any specific projects, github links or topics you want the interviewer to drill into..."
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <label className="flex items-start gap-2.5 text-xs text-zinc-600 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={consentShare}
                        onChange={e => setConsentShare(e.target.checked)}
                        className="mt-0.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        I consent to sharing my profile context and interview scorecard with verified interviewer {mentor.name}.
                      </span>
                    </label>

                    <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setBookingStep('details')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                      >
                        ← Back to Slots
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleConfirmBooking}
                        className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Locking Slot & Booking...
                          </>
                        ) : (
                          `Confirm & Book Session · ₹${packages[duration].price}`
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
