'use client'

import { Ban, Calendar, ClipboardList, TriangleAlert } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { apiUrl } from '@/lib/api'
import { useAuth } from '@/lib/supabase/use-auth'
import type { BookingRecord, MentorSlot } from '@/types'

export function InterviewerScheduleManager({
  viewMode = 'calendar',
}: {
  viewMode?: 'calendar' | 'bookings'
}) {
  const { user } = useAuth()
  const mentorId = user?.id || 'usr-mentor-1'

  const [activeTab, setActiveTab] = useState<'calendar' | 'bookings'>(viewMode)
  const [slots, setSlots] = useState<MentorSlot[]>([])
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingFilter, setBookingFilter] = useState<
    'Requests' | 'Upcoming' | 'Completed' | 'Cancelled'
  >('Requests')
  const [search, setSearch] = useState('')

  // Slot modal state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0])
  const [slotStartTime, setSlotStartTime] = useState('18:00')
  const [slotEndTime, setSlotEndTime] = useState('20:00')
  const [slotIsRecurring, setSlotIsRecurring] = useState(false)
  const [slotRecurringPattern] = useState('weekly')
  const [slotSubmitting, setSlotSubmitting] = useState(false)
  const [slotError, setSlotError] = useState<string | null>(null)

  // Block period modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0])
  const [blockStartTime, setBlockStartTime] = useState('10:00')
  const [blockEndTime, setBlockEndTime] = useState('14:00')
  const [blockReason, setBlockReason] = useState('Personal Out-of-Office / Unavailable')
  const [blockSubmitting, setBlockSubmitting] = useState(false)
  const [blockError, setBlockError] = useState<string | null>(null)

  // Reschedule state
  const [rescheduleBooking, setRescheduleBooking] = useState<BookingRecord | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('18:00')
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)

  // Cancel state
  const [cancelBooking, setCancelBooking] = useState<BookingRecord | null>(null)
  const [cancelReason, setCancelReason] = useState('Interviewer schedule conflict')
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  // Feedback Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [slotsRes, bookingsRes] = await Promise.all([
        fetch(apiUrl(`/mentors/${mentorId}/availability?duration=45`), { cache: 'no-store' }),
        fetch(apiUrl(`/bookings?role=interviewer&userId=${mentorId}`), { cache: 'no-store' }),
      ])

      const [slotsJson, bookingsJson] = await Promise.all([
        slotsRes.json().catch(() => ({})),
        bookingsRes.json().catch(() => ({})),
      ])

      if (slotsJson.success && slotsJson.data?.slots) {
        setSlots(slotsJson.data.slots)
      }
      if (bookingsJson.success && Array.isArray(bookingsJson.data)) {
        setBookings(bookingsJson.data)
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }, [mentorId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle Add Available Slot
  const handleAddSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSlotSubmitting(true)
    setSlotError(null)

    try {
      const res = await fetch(apiUrl(`/mentors/${mentorId}/slots`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: slotDate,
          startTime: slotStartTime,
          endTime: slotEndTime,
          timezone: 'Asia/Kolkata',
          isBlocked: false,
          isRecurring: slotIsRecurring,
          recurringPattern: slotIsRecurring ? slotRecurringPattern : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsSlotModalOpen(false)
        showToast('Available slot created successfully!')
        fetchData()
      } else {
        setSlotError(data.error || 'Failed to create slot.')
      }
    } catch {
      setSlotError('Network error while saving slot.')
    } finally {
      setSlotSubmitting(false)
    }
  }

  // Handle Block Time Period
  const handleBlockPeriodSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBlockSubmitting(true)
    setBlockError(null)

    try {
      const res = await fetch(apiUrl(`/mentors/${mentorId}/slots`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: blockDate,
          startTime: blockStartTime,
          endTime: blockEndTime,
          timezone: 'Asia/Kolkata',
          isBlocked: true,
          recurringPattern: blockReason,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsBlockModalOpen(false)
        showToast(
          `Time period blocked: ${blockStartTime} to ${blockEndTime} on ${blockDate}. Candidates cannot book this time.`,
        )
        fetchData()
      } else {
        setBlockError(data.error || 'Failed to block time period.')
      }
    } catch {
      setBlockError('Network error while blocking period.')
    } finally {
      setBlockSubmitting(false)
    }
  }

  // Handle Delete Slot
  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to remove this slot from your availability?')) return
    try {
      const res = await fetch(apiUrl(`/mentors/${mentorId}/slots/${slotId}`), {
        method: 'DELETE',
      })
      if (res.ok) {
        showToast('Slot removed from your calendar.')
        fetchData()
      } else {
        showToast('Failed to delete slot.', 'error')
      }
    } catch {
      showToast('Network error while deleting slot.', 'error')
    }
  }

  // Handle Booking Action (Accept, Reject)
  const handleBookingStatusChange = async (bookingId: string, status: 'confirmed' | 'rejected') => {
    try {
      const res = await fetch(apiUrl(`/bookings/${bookingId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actor: 'Interviewer' }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast(
          status === 'confirmed' ? 'Booking accepted and confirmed!' : 'Booking request declined.',
        )
        fetchData()
      } else {
        showToast(data.error || 'Failed to update booking status.', 'error')
      }
    } catch {
      showToast('Network error while updating booking.', 'error')
    }
  }

  // Handle Reschedule by Interviewer
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rescheduleBooking) return
    setRescheduleSubmitting(true)
    setRescheduleError(null)

    try {
      const res = await fetch(apiUrl(`/bookings/${rescheduleBooking.id}/reschedule`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate: rescheduleDate,
          newTime: rescheduleTime,
          timezone: 'Asia/Kolkata',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setRescheduleBooking(null)
        showToast(
          `Session rescheduled to ${rescheduleDate} at ${rescheduleTime}! Candidate has been notified.`,
        )
        fetchData()
      } else {
        setRescheduleError(
          data.error || 'Conflict detected: The selected time is already booked or blocked.',
        )
      }
    } catch {
      setRescheduleError('Network error while rescheduling.')
    } finally {
      setRescheduleSubmitting(false)
    }
  }

  // Handle Cancellation by Interviewer
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancelBooking) return
    setCancelSubmitting(true)

    try {
      const res = await fetch(apiUrl(`/bookings/${cancelBooking.id}/cancel`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason,
          cancelledBy: 'interviewer',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setCancelBooking(null)
        showToast('Session cancelled. Time slot released back to availability.')
        fetchData()
      } else {
        showToast(data.error || 'Failed to cancel session.', 'error')
      }
    } catch {
      showToast('Network error while cancelling session.', 'error')
    } finally {
      setCancelSubmitting(false)
    }
  }

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      b.bookingRef.toLowerCase().includes(search.toLowerCase()) ||
      b.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (bookingFilter === 'Requests') return b.status === 'pending' || b.status === 'slot_held'
    if (bookingFilter === 'Upcoming') return b.status === 'confirmed' || b.status === 'rescheduled'
    if (bookingFilter === 'Completed') return b.status === 'completed'
    if (bookingFilter === 'Cancelled') return b.status === 'cancelled' || b.status === 'rejected'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
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

      {/* Top Controls & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <span className="text-xs font-bold text-brand-strong uppercase tracking-wider">
            INTERVIEWER CONTROL PANEL
          </span>
          <h1 className="text-2xl font-extrabold text-ink mt-0.5">Availability & Sessions</h1>
          <p className="text-xs text-muted mt-1">
            Set open slots, block unavailable periods, manage booking requests, and prevent
            overlapping sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBlockModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-border text-body hover:bg-surface-soft font-semibold text-xs transition-colors"
          >
            <Ban size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            Block Time Period
          </button>
          <button
            type="button"
            onClick={() => setIsSlotModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-inverse font-semibold text-xs shadow-sm transition-colors"
          >
            + Add Available Slot
          </button>
        </div>
      </div>

      {/* Toggle View: Calendar vs Bookings */}
      <div className="flex gap-2 p-1 bg-surface-sunken rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'calendar' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
          }`}
        >
          <Calendar size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
          Availability Calendar & Slots ({slots.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'bookings' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
          }`}
        >
          <ClipboardList size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
          Bookings & Requests ({bookings.length})
        </button>
      </div>

      {/* VIEW 1: AVAILABILITY CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-5">
          <div className="p-4 bg-brand-soft/60 rounded-2xl border border-brand-tint text-xs text-ink flex justify-between items-center flex-wrap gap-2">
            <div>
              <b className="font-semibold block">Timezone: Asia/Kolkata (IST)</b>
              <span>
                Slots automatically support 30, 45, and 60-minute candidate interviews. Confirmed
                bookings lock out overlapping time.
              </span>
            </div>
            <span className="px-2.5 py-1 bg-brand-soft text-brand-strong rounded-lg text-xs font-bold">
              PostgreSQL Conflict Isolation Active
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-subtle bg-surface rounded-3xl border border-border">
              Loading calendar slots...
            </div>
          ) : slots.length === 0 ? (
            <div className="p-12 text-center bg-surface rounded-3xl border border-border">
              <p className="text-sm font-semibold text-body">No availability slots configured</p>
              <p className="text-xs text-muted mt-1">
                Add available hours or recurring schedules to allow candidates to book interviews
                with you.
              </p>
              <button
                type="button"
                onClick={() => setIsSlotModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-brand text-inverse text-xs font-semibold"
              >
                + Add Your First Slot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => {
                const isBlocked = slot.isBlocked
                const isBooked = slot.isBooked

                return (
                  <div
                    key={slot.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      isBlocked
                        ? 'bg-danger-soft/40 border-danger-border'
                        : isBooked
                          ? 'bg-surface-soft border-border'
                          : 'bg-surface border-border shadow-sm hover:border-brand-tint'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isBlocked
                              ? 'bg-danger-soft text-danger'
                              : isBooked
                                ? 'bg-surface-sunken text-body'
                                : 'bg-success-soft text-success'
                          }`}
                        >
                          {isBlocked ? 'Blocked Period' : isBooked ? 'Booked' : 'Available'}
                        </span>
                        {slot.isRecurring && (
                          <span className="ml-1.5 text-xs font-semibold text-brand-strong bg-brand-soft px-2 py-0.5 rounded-full border border-brand-tint">
                            Recurring Weekly
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-subtle hover:text-danger text-xs font-semibold p-1"
                        title="Remove slot"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-semibold text-muted">{slot.date}</p>
                      <h3 className="text-lg font-bold text-ink mt-0.5">
                        {slot.startTime} – {slot.endTime}
                      </h3>
                      <p className="text-xs text-muted mt-1">
                        Timezone: {slot.timezone}{' '}
                        {slot.recurringPattern ? `· ${slot.recurringPattern}` : ''}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-soft flex justify-between items-center text-xs">
                      <span className="text-muted text-xs">Supports 30/45/60 min</span>
                      <span
                        className={`font-semibold ${isBlocked ? 'text-danger' : isBooked ? 'text-body' : 'text-success'}`}
                      >
                        {isBlocked ? 'Unavailable' : isBooked ? 'Reserved' : 'Open for Booking'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: BOOKINGS & SESSIONS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2 p-1 bg-surface-sunken rounded-xl">
              {(['Requests', 'Upcoming', 'Completed', 'Cancelled'] as const).map((t) => {
                const count = bookings.filter((b) => {
                  if (t === 'Requests') return b.status === 'pending' || b.status === 'slot_held'
                  if (t === 'Upcoming')
                    return b.status === 'confirmed' || b.status === 'rescheduled'
                  if (t === 'Completed') return b.status === 'completed'
                  if (t === 'Cancelled') return b.status === 'cancelled' || b.status === 'rejected'
                  return false
                }).length

                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setBookingFilter(t)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      bookingFilter === t
                        ? 'bg-surface text-ink shadow-sm'
                        : 'text-muted hover:text-ink'
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

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, reference..."
              className="px-3.5 py-2 rounded-xl border border-border bg-surface text-xs text-ink placeholder-subtle focus:outline-none focus:ring-2 focus:ring-brand min-w-55"
            />
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center bg-surface rounded-3xl border border-border">
              <p className="text-sm font-semibold text-body">
                No {bookingFilter.toLowerCase()} found
              </p>
              <p className="text-xs text-muted mt-1">
                Sessions assigned to you will appear under their respective statuses.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((b) => {
                const isPending = b.status === 'pending' || b.status === 'slot_held'
                const isConfirmed = b.status === 'confirmed' || b.status === 'rescheduled'

                return (
                  <div
                    key={b.id}
                    className="bg-surface p-5 rounded-3xl border border-border/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-brand text-inverse font-bold text-sm flex items-center justify-center shrink-0">
                        {b.candidateName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs font-bold text-body bg-surface-sunken px-2 py-0.5 rounded">
                            {b.bookingRef}
                          </span>
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              b.status === 'confirmed'
                                ? 'bg-success-soft text-success border border-success-border'
                                : b.status === 'rescheduled'
                                  ? 'bg-warning-soft text-warning border border-warning-border'
                                  : b.status === 'pending'
                                    ? 'bg-brand-soft text-brand-strong border border-brand-tint'
                                    : 'bg-surface-sunken text-body'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-ink">{b.serviceName}</h3>
                        <p className="text-xs text-body">
                          Candidate: <b className="text-ink">{b.candidateName}</b> · {b.trackTitle}
                        </p>

                        <div className="flex items-center gap-2.5 mt-2 text-xs text-muted">
                          <span className="font-semibold text-body">
                            {b.scheduledDate} at {b.scheduledTime} IST
                          </span>
                          <span>·</span>
                          <span>{b.durationMinutes} min</span>
                          <span>·</span>
                          <span className="text-ink font-bold">
                            ₹{(b.pricePaise / 100).toFixed(0)}
                          </span>
                        </div>

                        {b.cancellationReason && (
                          <p className="text-xs text-danger mt-2 bg-danger-soft/60 p-2 rounded-xl">
                            <b>Cancellation:</b> {b.cancellationReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleBookingStatusChange(b.id, 'confirmed')}
                            className="px-4 py-2 rounded-xl bg-success-solid hover:bg-success-solid/90 text-inverse font-semibold text-xs shadow-sm transition-colors"
                          >
                            ✓ Accept Request
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBookingStatusChange(b.id, 'rejected')}
                            className="px-3.5 py-2 rounded-xl border border-danger-border text-danger hover:bg-danger-soft font-semibold text-xs transition-colors"
                          >
                            ✕ Decline
                          </button>
                        </>
                      )}

                      {isConfirmed && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleBooking(b)
                              setRescheduleDate(b.scheduledDate)
                              setRescheduleTime(b.scheduledTime)
                              setRescheduleError(null)
                            }}
                            className="px-3 py-1.5 rounded-xl border border-border text-body hover:bg-surface-soft font-semibold text-xs transition-colors"
                          >
                            Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCancelBooking(b)
                              setCancelReason('Interviewer emergency')
                            }}
                            className="px-3 py-1.5 rounded-xl border border-danger-border text-danger hover:bg-danger-soft font-semibold text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Available Slot */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 bg-surface-inverse/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 max-w-md w-full shadow-lg border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border-soft">
              <h3 className="font-bold text-base text-ink">Add Available Time Slot</h3>
              <button
                type="button"
                onClick={() => setIsSlotModalOpen(false)}
                className="text-subtle hover:text-body text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {slotError && (
              <div className="mt-3 p-3 rounded-xl bg-danger-soft border border-danger-border text-danger text-xs">
                <TriangleAlert size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                {slotError}
              </div>
            )}

            <form onSubmit={handleAddSlotSubmit} className="space-y-4 mt-4">
              <div>
                <label
                  htmlFor="interviewer-schedule-manager-date-2"
                  className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                >
                  Date
                </label>
                <input
                  id="interviewer-schedule-manager-date-2"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="interviewer-schedule-manager-start-time-ist"
                    className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                  >
                    Start Time (IST)
                  </label>
                  <input
                    id="interviewer-schedule-manager-start-time-ist"
                    type="time"
                    required
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label
                    htmlFor="interviewer-schedule-manager-end-time-ist"
                    className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                  >
                    End Time (IST)
                  </label>
                  <input
                    id="interviewer-schedule-manager-end-time-ist"
                    type="time"
                    required
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-body cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={slotIsRecurring}
                  onChange={(e) => setSlotIsRecurring(e.target.checked)}
                  className="rounded border-border-strong text-brand-strong focus:ring-brand"
                />
                <span>Repeat weekly on this weekday (Recurring availability)</span>
              </label>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-body hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={slotSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-inverse font-semibold text-xs shadow-sm transition-all"
                >
                  {slotSubmitting ? 'Creating...' : 'Create Open Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Block Time Period */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 bg-surface-inverse/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 max-w-md w-full shadow-lg border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border-soft">
              <h3 className="font-bold text-base text-ink">Block Unavailable Time Period</h3>
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="text-subtle hover:text-body text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {blockError && (
              <div className="mt-3 p-3 rounded-xl bg-danger-soft border border-danger-border text-danger text-xs">
                <TriangleAlert size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                {blockError}
              </div>
            )}

            <form onSubmit={handleBlockPeriodSubmit} className="space-y-4 mt-4">
              <div>
                <label
                  htmlFor="interviewer-schedule-manager-date"
                  className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                >
                  Date
                </label>
                <input
                  id="interviewer-schedule-manager-date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="interviewer-schedule-manager-block-from"
                    className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                  >
                    Block From
                  </label>
                  <input
                    id="interviewer-schedule-manager-block-from"
                    type="time"
                    required
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label
                    htmlFor="interviewer-schedule-manager-block-to"
                    className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                  >
                    Block To
                  </label>
                  <input
                    id="interviewer-schedule-manager-block-to"
                    type="time"
                    required
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="interviewer-schedule-manager-reason-note"
                  className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                >
                  Reason / Note
                </label>
                <input
                  id="interviewer-schedule-manager-reason-note"
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Travel, Focus Work, Doctor Appointment"
                  className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <p className="text-xs text-muted">
                Any candidate attempting to book an interview during this time range will be blocked
                and shown unavailable.
              </p>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-body hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={blockSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-danger-solid hover:bg-danger-solid/90 text-inverse font-semibold text-xs shadow-sm transition-all"
                >
                  {blockSubmitting ? 'Blocking...' : 'Confirm Block Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reschedule by Interviewer */}
      {rescheduleBooking && (
        <div className="fixed inset-0 bg-surface-inverse/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 max-w-md w-full shadow-lg border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border-soft">
              <h3 className="font-bold text-base text-ink">Reschedule Session</h3>
              <button
                type="button"
                onClick={() => setRescheduleBooking(null)}
                className="text-subtle hover:text-body text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-body mt-3">
              Rescheduling session with{' '}
              <b className="text-ink">{rescheduleBooking.candidateName}</b> (
              {rescheduleBooking.bookingRef}).
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
                  htmlFor="interviewer-schedule-manager-new-date"
                  className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                >
                  New Date
                </label>
                <input
                  id="interviewer-schedule-manager-new-date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label
                  htmlFor="interviewer-schedule-manager-new-time-ist"
                  className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                >
                  New Time (IST)
                </label>
                <input
                  id="interviewer-schedule-manager-new-time-ist"
                  type="time"
                  required
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
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
                  disabled={rescheduleSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-inverse font-semibold text-xs shadow-sm transition-all"
                >
                  {rescheduleSubmitting ? 'Validating...' : 'Confirm New Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cancel by Interviewer */}
      {cancelBooking && (
        <div className="fixed inset-0 bg-surface-inverse/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 max-w-md w-full shadow-lg border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border-soft">
              <h3 className="font-bold text-base text-ink">Cancel Interview Session</h3>
              <button
                type="button"
                onClick={() => setCancelBooking(null)}
                className="text-subtle hover:text-body text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-body mt-3">
              Are you sure you want to cancel session with candidate{' '}
              <b className="text-ink">{cancelBooking.candidateName}</b> on{' '}
              {cancelBooking.scheduledDate}?
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4 mt-4">
              <div>
                <label
                  htmlFor="interviewer-schedule-manager-reason-for-cancellation"
                  className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                >
                  Reason for Cancellation
                </label>
                <input
                  id="interviewer-schedule-manager-reason-for-cancellation"
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Unavoidable conflict, emergency"
                  className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setCancelBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-body hover:text-ink"
                >
                  Keep Session
                </button>
                <button
                  type="submit"
                  disabled={cancelSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-danger-solid hover:bg-danger-solid/90 text-inverse font-semibold text-xs shadow-sm transition-all"
                >
                  {cancelSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
