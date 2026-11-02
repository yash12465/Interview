'use client'

import { TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { apiUrl } from '@/lib/api'
import type { BookingRecord } from '@/types'

export function AdminBookingsManager() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Selected booking for detailed inspection / action
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null)
  const [adminActionLoading, setAdminActionLoading] = useState(false)
  const [actionReason, setActionReason] = useState('Administrative operational override')

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(apiUrl('/bookings?role=admin'), { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setBookings(json.data)
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // KPI Calculations
  const total = bookings.length
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
  const pendingCount = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'slot_held',
  ).length
  const rescheduledCount = bookings.filter((b) => b.status === 'rescheduled').length
  const cancelledCount = bookings.filter(
    (b) => b.status === 'cancelled' || b.status === 'rejected',
  ).length
  const completedCount = bookings.filter((b) => b.status === 'completed').length
  const totalFeesPaise = bookings.reduce((sum, b) => sum + (b.platformFeePaise || 0), 0)

  // Filter bookings
  const filtered = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      b.bookingRef.toLowerCase().includes(search.toLowerCase()) ||
      b.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      b.mentorName.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    return true
  })

  // Admin Cancel Booking
  const handleAdminCancel = async () => {
    if (!selectedBooking) return
    setAdminActionLoading(true)

    try {
      const res = await fetch(apiUrl(`/bookings/${selectedBooking.id}/cancel`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: `Admin: ${actionReason}`,
          cancelledBy: 'admin',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        showToast(
          `Booking ${selectedBooking.bookingRef} cancelled. Slot released back to availability.`,
        )
        setSelectedBooking(null)
        fetchBookings()
      } else {
        showToast(data.error || 'Failed to cancel booking.', 'error')
      }
    } catch {
      showToast('Network error while performing admin cancellation.', 'error')
    } finally {
      setAdminActionLoading(false)
    }
  }

  // Admin Update Status (e.g. Complete or Resolve)
  const handleAdminStatusChange = async (newStatus: string) => {
    if (!selectedBooking) return
    setAdminActionLoading(true)

    try {
      const res = await fetch(apiUrl(`/bookings/${selectedBooking.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actor: 'Super Admin',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        showToast(`Booking ${selectedBooking.bookingRef} status updated to ${newStatus}.`)
        setSelectedBooking(null)
        fetchBookings()
      } else {
        showToast(data.error || 'Failed to update status.', 'error')
      }
    } catch {
      showToast('Network error while updating status.', 'error')
    } finally {
      setAdminActionLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <span className="text-xs font-bold text-brand-strong uppercase tracking-wider">
            ADMIN OPERATIONS · BOOKINGS & SESSIONS
          </span>
          <h1 className="text-2xl font-extrabold text-ink mt-0.5">Platform Interview Bookings</h1>
          <p className="text-xs text-muted mt-1">
            Monitor all scheduled mock sessions, verify database conflict guarantees, and manage
            administrative interventions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="px-4 py-2 rounded-xl border border-border text-body hover:bg-surface-soft text-xs font-semibold transition-colors self-start"
        >
          ↻ Refresh Records
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm">
          <span className="text-xs font-semibold text-muted uppercase">Total Bookings</span>
          <p className="text-xl font-extrabold text-ink mt-1">{total}</p>
          <span className="text-xs text-subtle">All recorded</span>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-success-border bg-success-soft/20 shadow-sm">
          <span className="text-xs font-semibold text-success uppercase">Confirmed</span>
          <p className="text-xl font-extrabold text-success mt-1">{confirmedCount}</p>
          <span className="text-xs text-success">Active sessions</span>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-brand-tint bg-brand-soft/20 shadow-sm">
          <span className="text-xs font-semibold text-brand-strong uppercase">
            Pending Requests
          </span>
          <p className="text-xl font-extrabold text-brand-strong mt-1">{pendingCount}</p>
          <span className="text-xs text-brand-strong">Awaiting acceptance</span>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-warning-border bg-warning-soft/20 shadow-sm">
          <span className="text-xs font-semibold text-warning uppercase">Rescheduled</span>
          <p className="text-xl font-extrabold text-warning mt-1">{rescheduledCount}</p>
          <span className="text-xs text-warning">Updated times</span>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-danger-border bg-danger-soft/20 shadow-sm">
          <span className="text-xs font-semibold text-danger uppercase">Cancelled</span>
          <p className="text-xl font-extrabold text-danger mt-1">{cancelledCount}</p>
          <span className="text-xs text-danger">Released slots</span>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm">
          <span className="text-xs font-semibold text-muted uppercase">Platform Fees</span>
          <p className="text-xl font-extrabold text-ink mt-1">
            ₹{(totalFeesPaise / 100).toFixed(0)}
          </p>
          <span className="text-xs text-subtle">{completedCount} completed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-border">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-body whitespace-nowrap">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-border text-xs text-ink bg-surface-soft focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="all">All Statuses ({total})</option>
            <option value="confirmed">Confirmed ({confirmedCount})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="rescheduled">Rescheduled ({rescheduledCount})</option>
            <option value="cancelled">Cancelled ({cancelledCount})</option>
            <option value="completed">Completed ({completedCount})</option>
          </select>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search booking ID, candidate, mentor..."
          className="w-full sm:w-80 px-3.5 py-1.5 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-subtle bg-surface rounded-3xl border border-border">
          Loading platform booking records from Supabase PostgreSQL...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-3xl border border-border">
          <p className="text-sm font-semibold text-body">No bookings match the selected criteria</p>
          <p className="text-xs text-muted mt-1">Try clearing the search query or status filter.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-soft/80 border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Interviewer</th>
                  <th className="py-3 px-4">Service & Track</th>
                  <th className="py-3 px-4">Scheduled (Local / UTC)</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-soft/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">{b.bookingRef}</td>
                    <td className="py-3.5 px-4">
                      <b className="text-ink block font-semibold">{b.candidateName}</b>
                      <span className="text-xs text-subtle font-mono">{b.candidateId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <b className="text-ink block font-semibold">{b.mentorName}</b>
                      <span className="text-xs text-subtle font-mono">{b.mentorId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-ink font-medium block">{b.serviceName}</span>
                      <span className="text-xs text-muted">{b.trackTitle}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-ink block">
                        {b.scheduledDate} {b.scheduledTime} IST
                      </span>
                      <span className="text-xs text-subtle font-mono">
                        {b.startUtc
                          ? `${new Date(b.startUtc).toISOString().slice(11, 16)} UTC`
                          : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-sunken text-body font-semibold">
                        {b.durationMinutes} min
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-ink">
                      ₹{(b.pricePaise / 100).toFixed(0)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-success-soft text-success'
                            : b.status === 'rescheduled'
                              ? 'bg-warning-soft text-warning'
                              : b.status === 'pending'
                                ? 'bg-brand-soft text-brand-strong'
                                : b.status === 'cancelled'
                                  ? 'bg-danger-soft text-danger'
                                  : 'bg-surface-sunken text-body'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1 rounded-lg border border-border text-body hover:bg-surface-sunken font-semibold text-xs transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect & Action Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-surface-inverse/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 max-w-lg w-full shadow-lg border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border-soft">
              <div>
                <span className="text-xs font-bold text-brand-strong uppercase tracking-wider">
                  ADMIN INSPECTION
                </span>
                <h3 className="font-bold text-base text-ink mt-0.5">
                  Booking {selectedBooking.bookingRef}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-subtle hover:text-body text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-surface-soft rounded-2xl border border-border/70">
                <div>
                  <span className="text-xs uppercase text-muted font-semibold block">
                    Candidate
                  </span>
                  <b className="text-ink">{selectedBooking.candidateName}</b>
                  <span className="text-xs text-subtle block font-mono">
                    {selectedBooking.candidateId}
                  </span>
                </div>
                <div>
                  <span className="text-xs uppercase text-muted font-semibold block">
                    Interviewer
                  </span>
                  <b className="text-ink">{selectedBooking.mentorName}</b>
                  <span className="text-xs text-subtle block font-mono">
                    {selectedBooking.mentorId}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-surface-soft rounded-2xl border border-border/70">
                <div className="flex justify-between">
                  <span className="text-muted">Scheduled Time:</span>
                  <b className="text-ink">
                    {selectedBooking.scheduledDate} at {selectedBooking.scheduledTime} (IST)
                  </b>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">UTC Range:</span>
                  <span className="font-mono text-xs text-body">
                    {selectedBooking.startUtc} → {selectedBooking.endUtc}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Duration:</span>
                  <span className="font-semibold text-ink">
                    {selectedBooking.durationMinutes} Minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Status:</span>
                  <span className="font-bold capitalize text-brand-strong">
                    {selectedBooking.status}
                  </span>
                </div>
                {selectedBooking.cancellationReason && (
                  <div className="pt-2 border-t border-border text-danger">
                    <b>Cancelled:</b> {selectedBooking.cancellationReason} (by{' '}
                    {selectedBooking.cancelledBy || 'system'})
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="admin-bookings-manager-admin-action-reason-for-audit-log"
                  className="block text-xs font-semibold text-body uppercase tracking-wider mb-1"
                >
                  Admin Action Reason (for audit log)
                </label>
                <input
                  id="admin-bookings-manager-admin-action-reason-for-audit-log"
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border-soft flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-body hover:text-ink"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedBooking.status !== 'cancelled' && (
                  <button
                    type="button"
                    disabled={adminActionLoading}
                    onClick={handleAdminCancel}
                    className="px-3.5 py-2 rounded-xl bg-danger-solid hover:bg-danger-solid/90 text-inverse font-semibold text-xs shadow-sm transition-all"
                  >
                    {adminActionLoading ? 'Processing...' : 'Admin Cancel & Release Slot'}
                  </button>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <button
                    type="button"
                    disabled={adminActionLoading}
                    onClick={() => handleAdminStatusChange('completed')}
                    className="px-3.5 py-2 rounded-xl bg-success-solid hover:bg-success-solid/90 text-inverse font-semibold text-xs shadow-sm transition-all"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
