'use client'

import { Calendar, Clock, Search, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { apiUrl } from '@/lib/api'
import { useAuth } from '@/lib/supabase/use-auth'
import type { BookingRecord } from '@/types'

export function CandidateSessionsManager() {
  const { user } = useAuth()
  const candidateId = user?.id || 'usr-cand-1'

  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'Upcoming' | 'Pending' | 'Completed' | 'Cancelled'>('Upcoming')
  const [search, setSearch] = useState('')

  // Reschedule state
  const [rescheduleBooking, setRescheduleBooking] = useState<BookingRecord | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('18:00')
  const [newDuration, setNewDuration] = useState<number>(45)
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)

  // Cancel state
  const [cancelBooking, setCancelBooking] = useState<BookingRecord | null>(null)
  const [cancelReason, setCancelReason] = useState('Schedule conflict')
  const [cancelNotes, setCancelNotes] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  // Feedback toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(apiUrl(`/bookings?role=candidate&userId=${candidateId}`), {
        cache: 'no-store',
      })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setBookings(json.data)
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }, [candidateId])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Filter bookings based on active tab
  const filtered = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      b.bookingRef.toLowerCase().includes(search.toLowerCase()) ||
      b.mentorName.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (tab === 'Upcoming') {
      return b.status === 'confirmed' || b.status === 'rescheduled'
    }
    if (tab === 'Pending') {
      return b.status === 'pending' || b.status === 'slot_held'
    }
    if (tab === 'Completed') {
      return b.status === 'completed'
    }
    if (tab === 'Cancelled') {
      return b.status === 'cancelled' || b.status === 'rejected'
    }
    return true
  })

  // Submit Reschedule
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rescheduleBooking || !newDate || !newTime) return

    setRescheduleLoading(true)
    setRescheduleError(null)

    try {
      const res = await fetch(apiUrl(`/bookings/${rescheduleBooking.id}/reschedule`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate,
          newTime,
          newDurationMinutes: newDuration,
          timezone: 'Asia/Kolkata',
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setRescheduleBooking(null)
        showToast(`Session successfully rescheduled to ${newDate} at ${newTime}!`)
        fetchBookings()
      } else {
        setRescheduleError(
          data.error ||
            'The requested new slot is not available or conflicts with an existing interview.',
        )
      }
    } catch {
      setRescheduleError('Network error while requesting reschedule.')
    } finally {
      setRescheduleLoading(false)
    }
  }

  // Submit Cancellation
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancelBooking) return

    setCancelLoading(true)
    setCancelError(null)

    const finalReason = cancelNotes ? `${cancelReason}: ${cancelNotes}` : cancelReason

    try {
      const res = await fetch(apiUrl(`/bookings/${cancelBooking.id}/cancel`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: finalReason,
          cancelledBy: 'candidate',
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setCancelBooking(null)
        showToast('Session cancelled. The slot has been released back to the calendar.')
        fetchBookings()
      } else {
        setCancelError(data.error || 'Failed to cancel session.')
      }
    } catch {
      setCancelError('Network error while cancelling session.')
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-success-solid text-inverse'
              : 'bg-danger-solid text-inverse'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : <TriangleAlert size={16} />}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header with Title and Book Mentor Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <span className="text-xs font-bold text-brand-strong uppercase tracking-wider">
            HUMAN MOCK SESSIONS & AVAILABILITY
          </span>
          <h1 className="text-2xl font-extrabold text-ink mt-0.5">My Interview Sessions</h1>
          <p className="text-xs text-muted mt-1">
            Track confirmed interviews, manage pending requests, and reschedule or cancel with
            automatic conflict prevention.
          </p>
        </div>
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-inverse font-semibold text-xs shadow-sm transition-colors whitespace-nowrap self-start"
        >
          <span>+ Book a Mentor</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 p-1 bg-surface-sunken rounded-xl">
          {(['Upcoming', 'Pending', 'Completed', 'Cancelled'] as const).map((t) => {
            const count = bookings.filter((b) => {
              if (t === 'Upcoming') return b.status === 'confirmed' || b.status === 'rescheduled'
              if (t === 'Pending') return b.status === 'pending' || b.status === 'slot_held'
              if (t === 'Completed') return b.status === 'completed'
              if (t === 'Cancelled') return b.status === 'cancelled' || b.status === 'rejected'
              return false
            }).length

            return (
              <button
                type="button"
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === t ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {t}{' '}
                {count > 0 && (
                  <span className="ml-1 text-xs px-1.5 py-0.2 bg-surface-sunken rounded-full">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="relative min-w-60">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentor, reference..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl border border-border bg-surface text-xs text-ink placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <Search className="size-4 text-subtle absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Session Cards List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-subtle bg-surface rounded-3xl border border-border">
          Loading sessions from Supabase database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-3xl border border-border/90 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-surface-sunken text-subtle flex items-center justify-center mx-auto mb-3 text-lg font-bold">
            ∅
          </div>
          <h2 className="text-sm font-bold text-ink">No {tab.toLowerCase()} sessions found</h2>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            {tab === 'Upcoming'
              ? 'You have no interviews scheduled right now. Browse top verified mentors and book a tailored mock.'
              : `There are no sessions currently categorized under ${tab}.`}
          </p>
          {tab === 'Upcoming' && (
            <Link
              href="/mentors"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-brand-soft text-brand-strong font-semibold text-xs hover:bg-brand-tint/40 transition-colors"
            >
              Explore Available Mentors →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const isConfirmed = booking.status === 'confirmed' || booking.status === 'rescheduled'
            const isPending = booking.status === 'pending' || booking.status === 'slot_held'
            const isCancelled = booking.status === 'cancelled' || booking.status === 'rejected'

            return (
              <div
                key={booking.id}
                className="bg-surface p-6 rounded-3xl border border-border/90 shadow-sm hover:border-border-strong transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand text-inverse font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                    {booking.mentorName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-bold text-body bg-surface-sunken px-2 py-0.5 rounded">
                        {booking.bookingRef}
                      </span>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          booking.status === 'confirmed'
                            ? 'bg-success-soft text-success border border-success-border'
                            : booking.status === 'rescheduled'
                              ? 'bg-warning-soft text-warning border border-warning-border'
                              : booking.status === 'pending'
                                ? 'bg-brand-soft text-brand-strong border border-brand-tint'
                                : booking.status === 'cancelled'
                                  ? 'bg-danger-soft text-danger border border-danger-border'
                                  : 'bg-surface-sunken text-body'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-xs text-muted">· {booking.trackTitle}</span>
                    </div>

                    <h2 className="text-base font-bold text-ink">{booking.serviceName}</h2>
                    <p className="text-xs text-body mt-0.5">
                      Interviewer: <b className="text-ink">{booking.mentorName}</b>
                    </p>

                    <div className="flex items-center gap-3 mt-2.5 text-xs text-muted font-medium flex-wrap">
                      <span className="flex items-center gap-1 text-body font-semibold">
                        <Calendar className="size-3.5 text-subtle" />
                        {booking.scheduledDate}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-body font-semibold">
                        <Clock className="size-3.5 text-subtle" />
                        {booking.scheduledTime} IST
                      </span>
                      <span>·</span>
                      <span className="bg-surface-sunken text-body px-2 py-0.5 rounded text-xs">
                        {booking.durationMinutes} min
                      </span>
                      <span>·</span>
                      <span className="text-ink font-bold">
                        ₹{(booking.pricePaise / 100).toFixed(0)}
                      </span>
                    </div>

                    {booking.cancellationReason && (
                      <p className="text-xs text-danger mt-2 bg-danger-soft/50 p-2 rounded-xl">
                        <b>Cancellation Reason:</b> {booking.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end gap-2.5 shrink-0">
                  {isConfirmed && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleBooking(booking)
                          setNewDate(booking.scheduledDate)
                          setNewTime(booking.scheduledTime)
                          setNewDuration(booking.durationMinutes)
                          setRescheduleError(null)
                        }}
                        className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-body hover:bg-surface-soft transition-colors w-full sm:w-auto"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCancelBooking(booking)
                          setCancelReason('Schedule conflict')
                          setCancelNotes('')
                          setCancelError(null)
                        }}
                        className="px-3.5 py-2 rounded-xl border border-danger-border text-xs font-semibold text-danger hover:bg-danger-soft transition-colors w-full sm:w-auto"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => {
                        setCancelBooking(booking)
                        setCancelReason('Candidate withdrew request')
                        setCancelNotes('')
                        setCancelError(null)
                      }}
                      className="px-3.5 py-2 rounded-xl border border-danger-border text-xs font-semibold text-danger hover:bg-danger-soft transition-colors w-full sm:w-auto"
                    >
                      Withdraw Request
                    </button>
                  )}

                  {isCancelled && (
                    <Link
                      href={`/mentors/${booking.mentorId}`}
                      className="px-3.5 py-2 rounded-xl bg-brand-soft text-brand-strong text-xs font-semibold hover:bg-brand-tint/40 transition-colors w-full sm:w-auto text-center"
                    >
                      Rebook Slot
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div className="fixed inset-0 bg-surface-inverse/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 max-w-md w-full shadow-lg border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border-soft">
              <h2 className="font-bold text-base text-ink">Reschedule Mock Interview</h2>
              <button
                type="button"
                onClick={() => setRescheduleBooking(null)}
                className="text-subtle hover:text-body text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-body mt-3">
              Rescheduling session <b className="text-ink">{rescheduleBooking.bookingRef}</b> with{' '}
              {rescheduleBooking.mentorName}.
            </p>

            {rescheduleError && (
              <div className="mt-3 p-3 rounded-xl bg-danger-soft border border-danger-border text-danger text-xs">
                <TriangleAlert size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 mt-4">
              <div>
                <label
                  htmlFor="candidate-sessions-manager-new-date"
                  className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                >
                  New Date
                </label>
                <input
                  id="candidate-sessions-manager-new-date"
                  type="date"
                  required
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="candidate-sessions-manager-new-time-ist"
                    className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                  >
                    New Time (IST)
                  </label>
                  <input
                    id="candidate-sessions-manager-new-time-ist"
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div>
                  <label
                    htmlFor="candidate-sessions-manager-duration"
                    className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                  >
                    Duration
                  </label>
                  <select
                    id="candidate-sessions-manager-duration"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand bg-surface"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-surface-soft rounded-xl text-xs text-muted space-y-1">
                <p>
                  • Reschedule will be validated against database conflict constraints in real time.
                </p>
                <p>
                  • Both candidate and interviewer will receive an updated calendar notification.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-body hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-inverse font-semibold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {rescheduleLoading ? 'Checking Availability...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelBooking && (
        <div className="fixed inset-0 bg-surface-inverse/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 max-w-md w-full shadow-lg border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border-soft">
              <h2 className="font-bold text-base text-ink">Cancel Interview Session</h2>
              <button
                type="button"
                onClick={() => setCancelBooking(null)}
                className="text-subtle hover:text-body text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-body mt-3">
              Are you sure you want to cancel booking{' '}
              <b className="text-ink">{cancelBooking.bookingRef}</b> on{' '}
              {cancelBooking.scheduledDate} with {cancelBooking.mentorName}?
            </p>

            {cancelError && (
              <div className="mt-3 p-3 rounded-xl bg-danger-soft border border-danger-border text-danger text-xs">
                <TriangleAlert size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                {cancelError}
              </div>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-4 mt-4">
              <div>
                <label
                  htmlFor="candidate-sessions-manager-reason-for-cancellation"
                  className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                >
                  Reason for Cancellation
                </label>
                <select
                  id="candidate-sessions-manager-reason-for-cancellation"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand bg-surface"
                >
                  <option value="Schedule conflict">Schedule conflict</option>
                  <option value="Need more preparation time">Need more preparation time</option>
                  <option value="Already received job offer">Already received job offer</option>
                  <option value="Health / Personal emergency">Health / Personal emergency</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="candidate-sessions-manager-additional-notes-optional"
                  className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                >
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="candidate-sessions-manager-additional-notes-optional"
                  rows={2}
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Provide any additional detail for the interviewer..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="p-3 bg-danger-soft/60 rounded-xl text-xs text-danger space-y-1">
                <p>• Cancelling immediately releases the time slot for other candidates to book.</p>
                <p>• In-app cancellation notifications will be sent to the interviewer.</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setCancelBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-body hover:text-ink"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="px-5 py-2.5 rounded-xl bg-danger-solid hover:bg-danger-solid/90 text-inverse font-semibold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
