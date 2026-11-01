'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await fetch(apiUrl(`/bookings?role=candidate&userId=${candidateId}`), { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setBookings(json.data)
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [candidateId])

  // Filter bookings based on active tab
  const filtered = bookings.filter(b => {
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
          data.error || 'The requested new slot is not available or conflicts with an existing interview.'
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
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header with Title and Book Mentor Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            HUMAN MOCK SESSIONS & AVAILABILITY
          </span>
          <h1 className="text-2xl font-extrabold text-zinc-900 mt-0.5">My Interview Sessions</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track confirmed interviews, manage pending requests, and reschedule or cancel with automatic conflict prevention.
          </p>
        </div>
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors whitespace-nowrap self-start"
        >
          <span>+ Book a Mentor</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">
          {(['Upcoming', 'Pending', 'Completed', 'Cancelled'] as const).map(t => {
            const count = bookings.filter(b => {
              if (t === 'Upcoming') return b.status === 'confirmed' || b.status === 'rescheduled'
              if (t === 'Pending') return b.status === 'pending' || b.status === 'slot_held'
              if (t === 'Completed') return b.status === 'completed'
              if (t === 'Cancelled') return b.status === 'cancelled' || b.status === 'rejected'
              return false
            }).length

            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === t
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {t} {count > 0 && <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-zinc-200 rounded-full">{count}</span>}
              </button>
            )
          })}
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search mentor, reference..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Session Cards List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400 bg-white rounded-3xl border border-zinc-200">
          Loading sessions from Supabase database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200/90 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
            ∅
          </div>
          <h2 className="text-sm font-bold text-zinc-800">No {tab.toLowerCase()} sessions found</h2>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {tab === 'Upcoming'
              ? 'You have no interviews scheduled right now. Browse top verified mentors and book a tailored mock.'
              : `There are no sessions currently categorized under ${tab}.`}
          </p>
          {tab === 'Upcoming' && (
            <Link
              href="/mentors"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition-colors"
            >
              Explore Available Mentors →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => {
            const isConfirmed = booking.status === 'confirmed' || booking.status === 'rescheduled'
            const isPending = booking.status === 'pending' || booking.status === 'slot_held'
            const isCancelled = booking.status === 'cancelled' || booking.status === 'rejected'

            return (
              <div
                key={booking.id}
                className="bg-white p-6 rounded-3xl border border-zinc-200/90 shadow-sm hover:border-zinc-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                    {booking.mentorName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                        {booking.bookingRef}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : booking.status === 'rescheduled'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : booking.status === 'pending'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : booking.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-xs text-zinc-500">· {booking.trackTitle}</span>
                    </div>

                    <h2 className="text-base font-bold text-zinc-900">{booking.serviceName}</h2>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Interviewer: <b className="text-zinc-800">{booking.mentorName}</b>
                    </p>

                    <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1 text-zinc-700 font-semibold">
                        <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        {booking.scheduledDate}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-zinc-700 font-semibold">
                        <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {booking.scheduledTime} IST
                      </span>
                      <span>·</span>
                      <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[11px]">
                        {booking.durationMinutes} min
                      </span>
                      <span>·</span>
                      <span className="text-zinc-900 font-bold">
                        ₹{(booking.pricePaise / 100).toFixed(0)}
                      </span>
                    </div>

                    {booking.cancellationReason && (
                      <p className="text-xs text-rose-600 mt-2 bg-rose-50/50 p-2 rounded-xl">
                        <b>Cancellation Reason:</b> {booking.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end gap-2.5 flex-shrink-0">
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
                        className="px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors w-full sm:w-auto"
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
                        className="px-3.5 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors w-full sm:w-auto"
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
                      className="px-3.5 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors w-full sm:w-auto"
                    >
                      Withdraw Request
                    </button>
                  )}

                  {isCancelled && (
                    <Link
                      href={`/mentors/${booking.mentorId}`}
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors w-full sm:w-auto text-center"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
              <h2 className="font-bold text-base text-zinc-900">Reschedule Mock Interview</h2>
              <button
                type="button"
                onClick={() => setRescheduleBooking(null)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 mt-3">
              Rescheduling session <b className="text-zinc-900">{rescheduleBooking.bookingRef}</b> with {rescheduleBooking.mentorName}.
            </p>

            {rescheduleError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                ⚠️ {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    New Time (IST)
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <select
                    value={newDuration}
                    onChange={e => setNewDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl text-[11px] text-zinc-500 space-y-1">
                <p>• Reschedule will be validated against database conflict constraints in real time.</p>
                <p>• Both candidate and interviewer will receive an updated calendar notification.</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
              <h2 className="font-bold text-base text-zinc-900">Cancel Interview Session</h2>
              <button
                type="button"
                onClick={() => setCancelBooking(null)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 mt-3">
              Are you sure you want to cancel booking <b className="text-zinc-900">{cancelBooking.bookingRef}</b> on{' '}
              {cancelBooking.scheduledDate} with {cancelBooking.mentorName}?
            </p>

            {cancelError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                ⚠️ {cancelError}
              </div>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Schedule conflict">Schedule conflict</option>
                  <option value="Need more preparation time">Need more preparation time</option>
                  <option value="Already received job offer">Already received job offer</option>
                  <option value="Health / Personal emergency">Health / Personal emergency</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={cancelNotes}
                  onChange={e => setCancelNotes(e.target.value)}
                  placeholder="Provide any additional detail for the interviewer..."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl text-[11px] text-rose-800 space-y-1">
                <p>• Cancelling immediately releases the time slot for other candidates to book.</p>
                <p>• In-app cancellation notifications will be sent to the interviewer.</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setCancelBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
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
