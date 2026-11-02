'use client'

import { Check, ShieldCheck, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicNav } from '@/components/public/PublicNav'
import { PageLoadState } from '@/components/ui/LoadState'
import { apiUrl } from '@/lib/api'
import { useAuth } from '@/lib/supabase/use-auth'
import { useApi } from '@/lib/use-api'
import type { BookingRecord, MentorSlot, User } from '@/types'

export default function MentorProfilePage() {
  const { data, loading, error } = useApi<User[]>('/mentors')
  if (!data || data.length === 0)
    return <PageLoadState currentPath="/mentors" loading={loading} error={error} />
  return <MentorProfileView initialMentors={data} />
}

function MentorProfileView({ initialMentors }: { initialMentors: User[] }) {
  const params = useParams()
  const { user, profile } = useAuth()
  const mentorId = params?.mentorSlug as string

  const mentor =
    initialMentors.find(
      (m) => m.id === mentorId || m.name.toLowerCase().replace(/\s+/g, '-').includes(mentorId),
    ) || initialMentors[0]

  // Booking options
  const [duration, setDuration] = useState<30 | 45 | 60>(45)
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-03')
  const [selectedSlot, setSelectedSlot] = useState<MentorSlot | null>(null)
  const [bookingStep, setBookingStep] = useState<'details' | 'brief' | 'success'>('details')

  // Candidate brief inputs
  const [targetRole, setTargetRole] = useState(
    mentor.interviewerProfile?.domains[0] || 'Software Engineering',
  )
  const [focusArea, setFocusArea] = useState('System Design & Architecture')
  const [notes, setNotes] = useState('')
  const [consentShare, setConsentShare] = useState(true)

  // API State
  const [slots, setSlots] = useState<(MentorSlot & { isAvailable: boolean; reason?: string })[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null)

  // Package definitions
  const packages = {
    30: {
      title: 'Focused Sprint',
      price: 799,
      desc: 'Targeted 30-min session reviewing a specific challenge, code question or resume.',
    },
    45: {
      title: 'Full Mock Interview',
      price: mentor.interviewerProfile?.hourlyRate || 1199,
      desc: 'Complete 45-min panel interview simulation with verbal breakdown & scorecard.',
    },
    60: {
      title: 'Deep Dive & Defence',
      price: 1699,
      desc: 'Comprehensive 60-min simulation with detailed feedback on architecture trade-offs.',
    },
  }

  // Fetch dynamic availability
  const fetchAvailability = useCallback(
    async (selectedDuration: number) => {
      try {
        setLoadingSlots(true)
        const res = await fetch(
          apiUrl(`/mentors/${mentor.id}/availability?duration=${selectedDuration}`),
        )
        const json = await res.json()
        if (json.success && json.data?.slots) {
          setSlots(json.data.slots)
          // Auto-select first available slot
          const firstAvail = json.data.slots.find((s: (typeof slots)[number]) => s.isAvailable)
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
    },
    [mentor.id],
  )

  useEffect(() => {
    fetchAvailability(duration)
  }, [duration, fetchAvailability])

  // Get unique available dates
  const availableDates = Array.from(new Set(slots.map((s) => s.date))).sort()
  const slotsForDate = slots.filter((s) => s.date === selectedDate)

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
          data.error ||
            'The selected time slot is no longer available. Please select another slot.',
        )
      }
    } catch {
      setBookingError("Couldn't reach booking service. Please check your network and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col font-sans">
      <PublicNav currentPath="/mentors" />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center gap-2 text-xs text-muted mb-6">
          <Link href="/mentors" className="hover:text-brand-strong transition-colors">
            ← Back to Mentors Directory
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{mentor.name}</span>
        </div>

        {bookingStep === 'success' && confirmedBooking ? (
          <div className="bg-surface p-10 rounded-3xl border border-border/90 shadow-sm text-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-success-soft text-success font-bold text-2xl flex items-center justify-center mx-auto mb-4">
              ✓
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-success-soft text-success border border-success-border">
              BOOKING CONFIRMED · POSTGRESQL SECURED
            </span>
            <h1 className="text-2xl font-extrabold text-ink mt-3">Your mock session is booked!</h1>
            <p className="text-sm text-body mt-2">
              Booking ID:{' '}
              <b className="text-ink font-mono text-base">{confirmedBooking.bookingRef}</b> with{' '}
              {mentor.name}
            </p>

            <div className="my-6 p-5 bg-surface-soft rounded-2xl text-xs text-body text-left space-y-2.5 border border-border/70">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted">Service:</span>
                <span className="font-semibold text-ink">
                  {confirmedBooking.serviceName} ({confirmedBooking.durationMinutes} min)
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted">Date & Time:</span>
                <span className="font-semibold text-ink">
                  {confirmedBooking.scheduledDate} at {confirmedBooking.scheduledTime} (IST)
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted">Duration:</span>
                <span className="font-semibold text-ink">
                  {confirmedBooking.durationMinutes} Minutes
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-success-soft text-success">
                  Confirmed
                </span>
              </div>
            </div>

            <p className="text-xs text-muted mb-6">
              A calendar invite and in-app notification have been sent to you and {mentor.name}. The
              video room becomes active 10 minutes prior to session start.
            </p>

            <div className="flex gap-3 justify-center">
              <Link
                href="/app/candidate"
                className="px-5 py-2.5 rounded-xl bg-brand text-inverse font-medium text-xs hover:bg-brand-hover shadow-sm transition-colors"
              >
                Go to Candidate Dashboard →
              </Link>
              <Link
                href="/mentors"
                className="px-5 py-2.5 rounded-xl border border-border text-body font-medium text-xs hover:bg-surface-soft transition-colors"
              >
                Browse More Mentors
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Interviewer Profile & Credentials */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-surface p-6 rounded-3xl border border-border/90 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand text-inverse font-bold text-xl flex items-center justify-center shadow-md">
                    {mentor.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-ink">{mentor.name}</h1>
                    <p className="text-xs text-muted">
                      {mentor.interviewerProfile?.title || 'Senior Engineering Mentor'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success-soft px-2 py-0.5 rounded-full border border-success-border">
                        <Check className="size-3" strokeWidth={3} />
                        Verified Interviewer
                      </span>
                      <span className="text-xs text-body font-medium">
                        ★ {mentor.interviewerProfile?.rating || 4.9}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border-soft space-y-4">
                  <div>
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Expertise & Domains
                    </h2>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {mentor.interviewerProfile?.domains.map((d) => (
                        <span
                          key={d}
                          className="px-2.5 py-1 rounded-lg bg-surface-sunken text-body text-xs font-medium"
                        >
                          {d}
                        </span>
                      )) || <span className="text-xs text-muted">Software Engineering</span>}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
                      About Mentor
                    </h2>
                    <p className="text-xs text-body mt-1 leading-relaxed">
                      {mentor.interviewerProfile?.bio ||
                        'Senior engineering mentor with 8+ years conducting system design and project defence interviews across top tier tech product firms.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-surface-soft rounded-xl text-center">
                      <p className="text-lg font-bold text-ink">
                        {mentor.interviewerProfile?.experienceYears || '8+'} yrs
                      </p>
                      <p className="text-xs text-muted">Experience</p>
                    </div>
                    <div className="p-3 bg-surface-soft rounded-xl text-center">
                      <p className="text-lg font-bold text-ink">
                        {mentor.interviewerProfile?.completedSessions || 42}
                      </p>
                      <p className="text-xs text-muted">Interviews Held</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantees card */}
              <div className="bg-brand-soft/50 p-5 rounded-2xl border border-brand-tint text-xs text-ink space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-ink">
                  <ShieldCheck className="size-4 text-brand-strong" />
                  InterviewSetu Booking Protection
                </div>
                <p className="text-brand-strong/80 leading-relaxed text-xs">
                  • Guaranteed conflict prevention: No double bookings allowed.
                  <br />• Free rescheduling up to 12 hours before session start.
                  <br />• Immediate slot release if session is cancelled.
                </p>
              </div>
            </div>

            {/* Right Column: Dynamic Availability & Booking Engine */}
            <div className="lg:col-span-2">
              <div className="bg-surface p-8 rounded-3xl border border-border/90 shadow-sm">
                {/* Step Indicator */}
                <div className="flex items-center justify-between pb-6 border-b border-border-soft mb-6">
                  <div>
                    <span className="text-xs font-bold text-brand-strong uppercase tracking-wider">
                      Step {bookingStep === 'details' ? '1 of 2' : '2 of 2'}
                    </span>
                    <h2 className="text-xl font-bold text-ink mt-0.5">
                      {bookingStep === 'details'
                        ? 'Select Duration & Available Slot'
                        : 'Interview Context & Confirmation'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${bookingStep === 'details' ? 'bg-brand' : 'bg-success-solid'}`}
                    />
                    <span
                      className={`w-3 h-3 rounded-full ${bookingStep === 'brief' ? 'bg-brand' : 'bg-surface-sunken'}`}
                    />
                  </div>
                </div>

                {bookingError && (
                  <div className="mb-6 p-4 rounded-2xl bg-danger-soft border border-danger-border text-danger text-xs flex items-start gap-3 animate-shake">
                    <TriangleAlert size={16} />
                    <div>
                      <b className="font-semibold block">Booking Conflict / Notice:</b>
                      <span>{bookingError}</span>
                    </div>
                  </div>
                )}

                {bookingStep === 'details' ? (
                  <div className="space-y-6">
                    {/* Duration Selector: 30, 45, 60 min */}
                    <fieldset className="min-w-0">
                      <legend className="block text-xs font-semibold text-body uppercase tracking-wider mb-2">
                        1. Choose Interview Duration
                      </legend>
                      <div className="grid grid-cols-3 gap-3">
                        {([30, 45, 60] as const).map((d) => {
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
                                  ? 'border-brand bg-brand-soft/50 shadow-sm ring-1 ring-brand'
                                  : 'border-border hover:border-border-strong bg-surface'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-ink text-sm">{d} Minutes</span>
                                <span
                                  className={`text-xs font-bold ${isSelected ? 'text-brand-strong' : 'text-body'}`}
                                >
                                  ₹{pkg.price}
                                </span>
                              </div>
                              <p className="text-xs text-muted mt-1 line-clamp-1">{pkg.title}</p>
                            </button>
                          )
                        })}
                      </div>
                    </fieldset>

                    {/* Date Selector */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-body uppercase tracking-wider">
                          2. Select Date ({slots.length} available slots)
                        </span>
                        <span className="text-xs text-muted font-medium">
                          Timezone: Asia/Kolkata (IST)
                        </span>
                      </div>

                      {loadingSlots ? (
                        <div className="p-8 text-center text-xs text-subtle bg-surface-soft rounded-2xl">
                          Scanning mentor calendar & verifying real-time conflict locks...
                        </div>
                      ) : availableDates.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted bg-surface-soft rounded-2xl">
                          No open slots found for {duration} min duration. Please check alternate
                          durations or dates.
                        </div>
                      ) : (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {availableDates.map((dateStr) => {
                            const dateObj = new Date(dateStr)
                            const isSelected = selectedDate === dateStr
                            const dayName = dateObj.toLocaleDateString('en-US', {
                              weekday: 'short',
                            })
                            const monthDay = dateObj.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })

                            return (
                              <button
                                key={dateStr}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(dateStr)
                                  setSelectedSlot(null)
                                }}
                                className={`shrink-0 px-4 py-2.5 rounded-xl border text-center transition-all ${
                                  isSelected
                                    ? 'bg-surface-inverse text-inverse border-surface-inverse shadow-sm'
                                    : 'bg-surface text-body border-border hover:border-border-strong'
                                }`}
                              >
                                <span className="block text-xs uppercase font-semibold tracking-wider opacity-80">
                                  {dayName}
                                </span>
                                <span className="block text-xs font-bold mt-0.5">{monthDay}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Time Slot Grid */}
                    {slotsForDate.length > 0 && (
                      <fieldset className="min-w-0">
                        <legend className="block text-xs font-semibold text-body uppercase tracking-wider mb-2">
                          3. Choose Time Slot
                        </legend>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {slotsForDate.map((slot) => {
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
                                    ? 'bg-surface-sunken text-subtle border-border cursor-not-allowed line-through'
                                    : isSelected
                                      ? 'border-brand bg-brand text-inverse font-bold shadow-md ring-2 ring-brand-tint'
                                      : 'border-border hover:border-brand hover:bg-brand-soft/30 text-ink'
                                }`}
                              >
                                <span className="text-xs font-medium block">
                                  {slot.startTime} – {slot.endTime}
                                </span>
                                <span
                                  className={`text-xs mt-0.5 block ${isSelected ? 'text-inverse-muted' : isAvailable ? 'text-success font-semibold' : 'text-subtle'}`}
                                >
                                  {isAvailable ? '✓ Available' : 'Booked'}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </fieldset>
                    )}

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-border-soft flex justify-between items-center">
                      <div>
                        <span className="text-xs text-muted">Total session fee:</span>
                        <p className="text-lg font-extrabold text-ink">
                          ₹{packages[duration].price}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!selectedSlot}
                        onClick={() => setBookingStep('brief')}
                        className={`px-6 py-3 rounded-xl font-semibold text-xs transition-all ${
                          selectedSlot
                            ? 'bg-brand text-inverse hover:bg-brand-hover shadow-md'
                            : 'bg-surface-sunken text-subtle cursor-not-allowed'
                        }`}
                      >
                        Next: Share Context →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Brief & Final Confirmation */
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="p-4 bg-surface-soft rounded-2xl border border-border/80 flex justify-between items-center text-xs">
                      <div>
                        <b className="text-ink block font-semibold">
                          {packages[duration].title} ({duration} min)
                        </b>
                        <span className="text-body">
                          {selectedSlot?.date} at {selectedSlot?.startTime} IST with {mentor.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookingStep('details')}
                        className="text-brand-strong font-medium hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor="mentor-target-role-company"
                        className="block text-xs font-semibold text-body uppercase tracking-wider mb-1.5"
                      >
                        Target Role / Company
                      </label>
                      <input
                        id="mentor-target-role-company"
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. SDE 2 at Google, Backend Engineer at Razorpay"
                        className="w-full px-4 py-2.5 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mentor-primary-focus-area"
                        className="block text-xs font-semibold text-body uppercase tracking-wider mb-1.5"
                      >
                        Primary Focus Area
                      </label>
                      <select
                        id="mentor-primary-focus-area"
                        value={focusArea}
                        onChange={(e) => setFocusArea(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand bg-surface"
                      >
                        <option value="System Design & Architecture">
                          System Design & Architecture Trade-offs
                        </option>
                        <option value="Data Structures & Algorithms">
                          Data Structures & Algorithm Optimization
                        </option>
                        <option value="Project Defence & Architecture">
                          Project Defence & Deep Technical Questioning
                        </option>
                        <option value="Behavioral & Leadership Principles">
                          Behavioral & Leadership Principles (STAR method)
                        </option>
                        <option value="Resume & Portfolio Walkthrough">
                          Resume Walkthrough & Gap Explanation
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="mentor-notes-context-for-interviewer-optional"
                        className="block text-xs font-semibold text-body uppercase tracking-wider mb-1.5"
                      >
                        Notes & Context for Interviewer (Optional)
                      </label>
                      <textarea
                        id="mentor-notes-context-for-interviewer-optional"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Share any specific projects, github links or topics you want the interviewer to drill into..."
                        className="w-full px-4 py-2.5 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>

                    <label className="flex items-start gap-2.5 text-xs text-body cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={consentShare}
                        onChange={(e) => setConsentShare(e.target.checked)}
                        className="mt-0.5 rounded border-border-strong text-brand-strong focus:ring-brand"
                      />
                      <span>
                        I consent to sharing my profile context and interview scorecard with
                        verified interviewer {mentor.name}.
                      </span>
                    </label>

                    <div className="pt-4 border-t border-border-soft flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setBookingStep('details')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-body hover:text-ink"
                      >
                        ← Back to Slots
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleConfirmBooking}
                        className="px-7 py-3 rounded-xl bg-brand hover:bg-brand-hover text-inverse font-semibold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
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
