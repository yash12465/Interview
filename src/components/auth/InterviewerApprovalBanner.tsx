'use client'

import { Hourglass } from 'lucide-react'
import { useAuth } from '@/lib/supabase/use-auth'

export function InterviewerApprovalBanner() {
  const { profile, role } = useAuth()

  if (role !== 'interviewer') return null

  const verificationStatus = profile?.interviewer_profile?.verificationStatus || profile?.status

  if (verificationStatus !== 'under_review' && verificationStatus !== 'draft') {
    return null
  }

  return (
    <div className="mb-6 p-4 rounded-2xl bg-warning-soft border border-warning-border/80 text-warning shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <Hourglass size={20} className="shrink-0" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-warning">
            Account Under Review (Trust & Safety Verification)
          </h4>
          <p className="text-xs text-warning mt-0.5 leading-relaxed">
            Your interviewer credentials and domain background are currently being evaluated by the
            platform compliance team. You can explore the cockpit and manage availability slots now;
            your public profile and candidate bookings will activate immediately upon approval.
          </p>
        </div>
      </div>
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-warning-soft/70 text-warning shrink-0">
        Review in progress
      </span>
    </div>
  )
}
