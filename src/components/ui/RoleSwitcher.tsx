'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export type CurrentRole = 'candidate' | 'interviewer' | 'admin'

interface RoleSwitcherProps {
  currentRole: CurrentRole
  userName?: string
  subtitle?: string
}

export function RoleSwitcher({ currentRole, userName, subtitle }: RoleSwitcherProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [open])

  const roleMeta = {
    candidate: {
      badge: 'CANDIDATE STUDIO',
      name: userName || 'Aarav Kumar',
      roleTitle: 'Software Engineering Track',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      dot: 'bg-indigo-600',
      icon: '🎯',
    },
    interviewer: {
      badge: 'INTERVIEWER SPACE',
      name: userName || 'Riya Mehta',
      roleTitle: 'Verified Interviewer · Senior SWE',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      dot: 'bg-emerald-600',
      icon: '💼',
    },
    admin: {
      badge: 'STAFF CONSOLE',
      name: userName || 'Super Admin',
      roleTitle: 'Platform Operator & Governance',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      dot: 'bg-amber-600',
      icon: '🛡️',
    },
  }[currentRole]

  return (
    <div className="relative inline-block text-left" ref={menuRef} style={{ zIndex: 60 }}>
      {/* Switcher Pill Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white/95 hover:bg-slate-50 text-slate-700 shadow-sm transition-all cursor-pointer text-xs font-semibold focus:outline-none"
        title="Switch between Candidate, Interviewer, and Staff Admin portals"
      >
        <span className={`w-2 h-2 rounded-full ${roleMeta.dot} animate-pulse`} />
        <span className="text-[11px] font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
          <span>{roleMeta.icon}</span>
          <span className="hidden sm:inline">{roleMeta.badge}:</span>
          <span className="font-medium text-slate-600">{roleMeta.name}</span>
        </span>
        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
          Switch ▾
        </span>
      </button>

      {/* Floating Menu Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
          style={{ minWidth: '320px' }}
        >
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-extrabold tracking-wider text-indigo-600 uppercase block">
                Multi-Role Platform
              </span>
              <h4 className="text-xs font-bold text-slate-900 m-0">Switch Workspace Flow</h4>
            </div>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              3 Connected Portals
            </span>
          </div>

          <div className="py-2 space-y-1.5">
            {/* Candidate Option */}
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                try {
                  const saved = localStorage.getItem('interviewsetu-prototype-v1')
                  const current = saved ? JSON.parse(saved) : {}
                  localStorage.setItem('interviewsetu-prototype-v1', JSON.stringify({ ...current, onboardingComplete: true }))
                } catch {}
                router.push('/app/candidate')
              }}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                currentRole === 'candidate'
                  ? 'bg-indigo-50/80 border-indigo-200 shadow-xs'
                  : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-900">Candidate Studio</strong>
                  {currentRole === 'candidate' ? (
                    <span className="text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-indigo-600 font-semibold">Open →</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 m-0 leading-tight mt-0.5">
                  AI mock practice, rubric scorecards, question bank & mentor booking.
                </p>
                <small className="text-[9px] text-slate-400 block mt-1">Logged as: Aarav Kumar</small>
              </div>
            </button>

            {/* Interviewer Option */}
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                try {
                  const saved = localStorage.getItem('interviewsetu-prototype-v1')
                  const current = saved ? JSON.parse(saved) : {}
                  localStorage.setItem('interviewsetu-prototype-v1', JSON.stringify({ ...current, interviewerStatus: 'approved' }))
                } catch {}
                router.push('/app/interviewer')
              }}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                currentRole === 'interviewer'
                  ? 'bg-emerald-50/80 border-emerald-200 shadow-xs'
                  : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                💼
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-900">Interviewer Space</strong>
                  {currentRole === 'interviewer' ? (
                    <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-semibold">Open →</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 m-0 leading-tight mt-0.5">
                  Conduct mock sessions, manage bookings, review candidates & payouts.
                </p>
                <small className="text-[9px] text-slate-400 block mt-1">Logged as: Riya Mehta (Verified)</small>
              </div>
            </button>

            {/* Staff Admin Option */}
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                router.push('/staff')
              }}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-amber-50/80 border-amber-200 shadow-xs'
                  : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                🛡️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-900">Staff Admin Console</strong>
                  {currentRole === 'admin' ? (
                    <span className="text-[9px] font-bold bg-amber-600 text-white px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 font-semibold">Open →</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 m-0 leading-tight mt-0.5">
                  Interviewer verification queue, operations, safety & rubrics management.
                </p>
                <small className="text-[9px] text-slate-400 block mt-1">Logged as: Super Admin</small>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 mt-1 flex items-center justify-between text-[11px] px-2 text-slate-500">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="hover:text-indigo-600 font-medium transition-colors"
            >
              ← Public Home
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="hover:text-indigo-600 font-medium transition-colors"
                title="Payload CMS backend administration"
              >
                Payload CMS
              </Link>
              <span className="text-slate-300">·</span>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-rose-600 hover:text-rose-700 font-semibold transition-colors"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
