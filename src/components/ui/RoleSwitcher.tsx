'use client'

import { Briefcase, ShieldCheck, Target } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export type CurrentRole = 'candidate' | 'interviewer' | 'admin'

interface RoleSwitcherProps {
  currentRole: CurrentRole
  userName?: string
}

export function RoleSwitcher({ currentRole, userName }: RoleSwitcherProps) {
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
      color: 'bg-brand-soft border-brand-tint text-brand-strong',
      dot: 'bg-brand',
      icon: Target,
    },
    interviewer: {
      badge: 'INTERVIEWER SPACE',
      name: userName || 'Riya Mehta',
      roleTitle: 'Verified Interviewer · Senior SWE',
      color: 'bg-success-soft border-success-border text-success',
      dot: 'bg-success-solid',
      icon: Briefcase,
    },
    admin: {
      badge: 'STAFF CONSOLE',
      name: userName || 'Super Admin',
      roleTitle: 'Platform Operator & Governance',
      color: 'bg-warning-soft border-warning-border text-warning',
      dot: 'bg-warning-solid',
      icon: ShieldCheck,
    },
  }[currentRole]

  return (
    <div className="relative inline-block text-left" ref={menuRef} style={{ zIndex: 60 }}>
      {/* Switcher Pill Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2.5 whitespace-nowrap px-3 py-1.5 rounded-full border border-border bg-surface/95 hover:bg-surface-soft text-body shadow-sm transition-all cursor-pointer text-xs font-semibold focus:outline-none"
        title="Switch between Candidate, Interviewer, and Staff Admin portals"
      >
        <span className={`w-2 h-2 rounded-full ${roleMeta.dot} animate-pulse`} />
        <span className="text-xs font-bold tracking-tight text-ink flex items-center gap-1.5">
          <roleMeta.icon size={16} />
          <span className="hidden sm:inline">{roleMeta.badge}:</span>
          <span className="font-medium text-body">{roleMeta.name}</span>
        </span>
        <span className="text-xs text-subtle bg-surface-sunken px-1.5 py-0.5 rounded font-mono">
          Switch ▾
        </span>
      </button>

      {/* Floating Menu Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-border shadow-lg p-2.5 z-50 text-ink animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border-soft flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold tracking-wider text-brand-strong uppercase block">
                Multi-Role Platform
              </span>
              <h4 className="text-xs font-bold text-ink m-0">Switch Workspace Flow</h4>
            </div>
            <span className="text-xs font-medium text-subtle bg-surface-sunken px-2 py-0.5 rounded-full">
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
                  localStorage.setItem(
                    'interviewsetu-prototype-v1',
                    JSON.stringify({ ...current, onboardingComplete: true }),
                  )
                } catch {}
                router.push('/app/candidate')
              }}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                currentRole === 'candidate'
                  ? 'bg-brand-soft/80 border-brand-tint shadow-xs'
                  : 'bg-surface border-transparent hover:bg-surface-soft hover:border-border'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand-strong flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                <Target size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-ink">Candidate Studio</strong>
                  {currentRole === 'candidate' ? (
                    <span className="text-xs font-bold bg-brand text-inverse px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-brand-strong font-semibold">Open →</span>
                  )}
                </div>
                <p className="text-xs text-muted m-0 leading-tight mt-0.5">
                  AI mock practice, rubric scorecards, question bank & mentor booking.
                </p>
                <small className="text-xs text-subtle block mt-1">Logged as: Aarav Kumar</small>
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
                  localStorage.setItem(
                    'interviewsetu-prototype-v1',
                    JSON.stringify({ ...current, interviewerStatus: 'approved' }),
                  )
                } catch {}
                router.push('/app/interviewer')
              }}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                currentRole === 'interviewer'
                  ? 'bg-success-soft/80 border-success-border shadow-xs'
                  : 'bg-surface border-transparent hover:bg-surface-soft hover:border-border'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-success-soft text-success flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                <Briefcase size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-ink">Interviewer Space</strong>
                  {currentRole === 'interviewer' ? (
                    <span className="text-xs font-bold bg-success-solid text-inverse px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-success font-semibold">Open →</span>
                  )}
                </div>
                <p className="text-xs text-muted m-0 leading-tight mt-0.5">
                  Conduct mock sessions, manage bookings, review candidates & payouts.
                </p>
                <small className="text-xs text-subtle block mt-1">
                  Logged as: Riya Mehta (Verified)
                </small>
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
                  ? 'bg-warning-soft/80 border-warning-border shadow-xs'
                  : 'bg-surface border-transparent hover:bg-surface-soft hover:border-border'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-warning-soft text-warning flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-ink">Staff Admin Console</strong>
                  {currentRole === 'admin' ? (
                    <span className="text-xs font-bold bg-warning-solid text-inverse px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-warning font-semibold">Open →</span>
                  )}
                </div>
                <p className="text-xs text-muted m-0 leading-tight mt-0.5">
                  Interviewer verification queue, operations, safety & rubrics management.
                </p>
                <small className="text-xs text-subtle block mt-1">Logged as: Super Admin</small>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-border-soft mt-1 flex items-center justify-between text-xs px-2 text-muted">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="hover:text-brand-strong font-medium transition-colors"
            >
              ← Public Home
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/staff"
                onClick={() => setOpen(false)}
                className="hover:text-brand-strong font-medium transition-colors"
                title="Staff admin control centre"
              >
                Staff Admin
              </Link>
              <span className="text-subtle" aria-hidden="true">
                ·
              </span>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-danger hover:underline font-semibold transition-colors"
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
