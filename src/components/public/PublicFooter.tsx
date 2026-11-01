import React from 'react'
import Link from 'next/link'

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <Link href="/" className="logo" aria-label="InterviewSetu home">
            <span className="logo-mark"><i /><i /><i /></span>
            <strong>Interview<span>Setu</span></strong>
          </Link>
          <p className="mt-4 text-sm text-zinc-500 max-w-sm leading-relaxed">
            India-first interview learning, AI interview practice and verified human mock-interview marketplace. Learn how to answer. Practise with confidence.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>All systems operational · LiveKit WebRTC & AI active</span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-xs tracking-wider uppercase text-zinc-900 mb-3">Interview Tracks</h4>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li><Link href="/interview-tracks/upsc-personality-test" className="hover:text-indigo-600">UPSC Personality Test</Link></li>
            <li><Link href="/interview-tracks/software-engineering" className="hover:text-indigo-600">Software Engineering</Link></li>
            <li><Link href="/interview-tracks/campus-placements" className="hover:text-indigo-600">Campus Placements</Link></li>
            <li><Link href="/interview-tracks/banking-officer" className="hover:text-indigo-600">Banking Officer</Link></li>
            <li><Link href="/interview-tracks/mba-admissions" className="hover:text-indigo-600">MBA Admissions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-xs tracking-wider uppercase text-zinc-900 mb-3">Learning & Practice</h4>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li><Link href="/learn" className="hover:text-indigo-600">Learning Academy</Link></li>
            <li><Link href="/question-bank" className="hover:text-indigo-600">Question Bank</Link></li>
            <li><Link href="/mentors" className="hover:text-indigo-600">Find a Mentor</Link></li>
            <li><Link href="/pricing" className="hover:text-indigo-600">Pricing & Plans</Link></li>
            <li><Link href="/for-colleges" className="hover:text-indigo-600">For Colleges & Institutions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-xs tracking-wider uppercase text-zinc-900 mb-3">Portals & Governance</h4>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li><Link href="/app/candidate" className="hover:text-indigo-600">Candidate Workspace</Link></li>
            <li><Link href="/app/interviewer" className="hover:text-indigo-600">Interviewer Workspace</Link></li>
            <li><Link href="/staff" className="hover:text-indigo-600">Admin Control Centre</Link></li>
            <li><Link href="/privacy" className="hover:text-indigo-600">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-indigo-600">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-200/80 max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <p>© 2026 InterviewSetu Technologies Pvt. Ltd. All rights reserved.</p>
        <p>A mock-interview score is a practice metric and does not represent an official hiring or selection guarantee.</p>
      </div>
    </footer>
  )
}
