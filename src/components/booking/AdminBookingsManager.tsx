'use client'

import React, { useState, useEffect } from 'react'
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

  const fetchBookings = async () => {
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
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // KPI Calculations
  const total = bookings.length
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const pendingCount = bookings.filter(b => b.status === 'pending' || b.status === 'slot_held').length
  const rescheduledCount = bookings.filter(b => b.status === 'rescheduled').length
  const cancelledCount = bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length
  const completedCount = bookings.filter(b => b.status === 'completed').length
  const totalFeesPaise = bookings.reduce((sum, b) => sum + (b.platformFeePaise || 0), 0)

  // Filter bookings
  const filtered = bookings.filter(b => {
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
        showToast(`Booking ${selectedBooking.bookingRef} cancelled. Slot released back to availability.`)
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
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            ADMIN OPERATIONS · BOOKINGS & SESSIONS
          </span>
          <h1 className="text-2xl font-extrabold text-zinc-900 mt-0.5">Platform Interview Bookings</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitor all scheduled mock sessions, verify database conflict guarantees, and manage administrative interventions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold transition-colors self-start"
        >
          ↻ Refresh Records
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase">Total Bookings</span>
          <p className="text-xl font-extrabold text-zinc-900 mt-1">{total}</p>
          <span className="text-[10px] text-zinc-400">All recorded</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase">Confirmed</span>
          <p className="text-xl font-extrabold text-emerald-800 mt-1">{confirmedCount}</p>
          <span className="text-[10px] text-emerald-600">Active sessions</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-sm">
          <span className="text-[11px] font-semibold text-indigo-700 uppercase">Pending Requests</span>
          <p className="text-xl font-extrabold text-indigo-800 mt-1">{pendingCount}</p>
          <span className="text-[10px] text-indigo-600">Awaiting acceptance</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-700 uppercase">Rescheduled</span>
          <p className="text-xl font-extrabold text-amber-800 mt-1">{rescheduledCount}</p>
          <span className="text-[10px] text-amber-600">Updated times</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-700 uppercase">Cancelled</span>
          <p className="text-xl font-extrabold text-rose-800 mt-1">{cancelledCount}</p>
          <span className="text-[10px] text-rose-600">Released slots</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase">Platform Fees</span>
          <p className="text-xl font-extrabold text-zinc-900 mt-1">₹{(totalFeesPaise / 100).toFixed(0)}</p>
          <span className="text-[10px] text-zinc-400">{completedCount} completed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-zinc-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-zinc-600 whitespace-nowrap">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          onChange={e => setSearch(e.target.value)}
          placeholder="Search booking ID, candidate, mentor..."
          className="w-full sm:w-80 px-3.5 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400 bg-white rounded-3xl border border-zinc-200">
          Loading platform booking records from Supabase PostgreSQL...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200">
          <p className="text-sm font-semibold text-zinc-700">No bookings match the selected criteria</p>
          <p className="text-xs text-zinc-500 mt-1">Try clearing the search query or status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
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
              <tbody className="divide-y divide-zinc-100">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">{b.bookingRef}</td>
                    <td className="py-3.5 px-4">
                      <b className="text-zinc-800 block font-semibold">{b.candidateName}</b>
                      <span className="text-[10px] text-zinc-400 font-mono">{b.candidateId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <b className="text-zinc-800 block font-semibold">{b.mentorName}</b>
                      <span className="text-[10px] text-zinc-400 font-mono">{b.mentorId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-zinc-900 font-medium block">{b.serviceName}</span>
                      <span className="text-[10px] text-zinc-500">{b.trackTitle}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-zinc-800 block">{b.scheduledDate} {b.scheduledTime} IST</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{b.startUtc ? new Date(b.startUtc).toISOString().slice(11, 16) + ' UTC' : '—'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold">{b.durationMinutes} min</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900">₹{(b.pricePaise / 100).toFixed(0)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'rescheduled'
                            ? 'bg-amber-100 text-amber-800'
                            : b.status === 'pending'
                            ? 'bg-indigo-100 text-indigo-800'
                            : b.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-semibold text-[11px] transition-colors"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">ADMIN INSPECTION</span>
                <h3 className="font-bold text-base text-zinc-900 mt-0.5">Booking {selectedBooking.bookingRef}</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-zinc-400 hover:text-zinc-600 text-sm font-bold">✕</button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/70">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Candidate</span>
                  <b className="text-zinc-900">{selectedBooking.candidateName}</b>
                  <span className="text-[10px] text-zinc-400 block font-mono">{selectedBooking.candidateId}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Interviewer</span>
                  <b className="text-zinc-900">{selectedBooking.mentorName}</b>
                  <span className="text-[10px] text-zinc-400 block font-mono">{selectedBooking.mentorId}</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/70">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Scheduled Time:</span>
                  <b className="text-zinc-900">{selectedBooking.scheduledDate} at {selectedBooking.scheduledTime} (IST)</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">UTC Range:</span>
                  <span className="font-mono text-[11px] text-zinc-700">{selectedBooking.startUtc} → {selectedBooking.endUtc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Duration:</span>
                  <span className="font-semibold text-zinc-900">{selectedBooking.durationMinutes} Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span className="font-bold capitalize text-indigo-700">{selectedBooking.status}</span>
                </div>
                {selectedBooking.cancellationReason && (
                  <div className="pt-2 border-t border-zinc-200 text-rose-700">
                    <b>Cancelled:</b> {selectedBooking.cancellationReason} (by {selectedBooking.cancelledBy || 'system'})
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Admin Action Reason (for audit log)
                </label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-zinc-100 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedBooking.status !== 'cancelled' && (
                  <button
                    type="button"
                    disabled={adminActionLoading}
                    onClick={handleAdminCancel}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    {adminActionLoading ? 'Processing...' : 'Admin Cancel & Release Slot'}
                  </button>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <button
                    type="button"
                    disabled={adminActionLoading}
                    onClick={() => handleAdminStatusChange('completed')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
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
