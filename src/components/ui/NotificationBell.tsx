'use client'

import { Bell, Info } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { apiUrl } from '@/lib/api'
import { useAuth } from '@/lib/supabase/use-auth'
import type { NotificationItem } from '@/types'

export function NotificationBell({ customUserId }: { customUserId?: string }) {
  const { user } = useAuth()
  const userId = customUserId || user?.id || 'usr-cand-1'

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(apiUrl(`/notifications?userId=${userId}`))
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data)
      }
    } catch {
      // Fallback silent
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await fetch(apiUrl(`/notifications/${id}/read`), { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch {}
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead)
    for (const n of unread) {
      markAsRead(n.id)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2 rounded-xl text-body hover:text-ink hover:bg-surface-sunken transition-colors focus:outline-none"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-xs font-bold text-inverse bg-brand rounded-full animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-2xl shadow-lg border border-border/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 bg-surface-soft border-b border-border">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-wider uppercase text-body">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-brand-soft text-brand-strong rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-brand-strong hover:text-ink font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border-soft">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-subtle">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-subtle">
                <p className="text-sm font-medium text-body">No notifications yet</p>
                <p className="text-xs mt-1">
                  Updates on your sessions and booking requests will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`w-full text-left p-3.5 hover:bg-surface-soft/80 transition-colors cursor-pointer flex gap-3 items-start ${!n.isRead ? 'bg-brand-soft/30' : ''}`}
                >
                  <span className="block mt-0.5 shrink-0">
                    {n.type.includes('confirm') ? (
                      <span className="w-6 h-6 rounded-full bg-success-soft text-success flex items-center justify-center text-xs">
                        ✓
                      </span>
                    ) : n.type.includes('cancel') ? (
                      <span className="w-6 h-6 rounded-full bg-danger-soft text-danger flex items-center justify-center text-xs">
                        ✕
                      </span>
                    ) : n.type.includes('reschedule') ? (
                      <span className="w-6 h-6 rounded-full bg-warning-soft text-warning flex items-center justify-center text-xs">
                        ↺
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center">
                        <Info size={14} />
                      </span>
                    )}
                  </span>
                  <span className="block flex-1 min-w-0">
                    <span className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-semibold ${!n.isRead ? 'text-ink' : 'text-body'}`}
                      >
                        {n.title}
                      </span>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand shrink-0" />}
                    </span>
                    <span className="block text-xs text-body mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </span>
                    <span className="text-xs text-subtle mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
