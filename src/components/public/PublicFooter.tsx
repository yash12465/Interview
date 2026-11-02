import Link from 'next/link'

const columns = [
  {
    title: 'Interview Tracks',
    links: [
      { href: '/interview-tracks/upsc-personality-test', label: 'UPSC Personality Test' },
      { href: '/interview-tracks/software-engineering', label: 'Software Engineering' },
      { href: '/interview-tracks/campus-placements', label: 'Campus Placements' },
      { href: '/interview-tracks/banking-officer', label: 'Banking Officer' },
      { href: '/interview-tracks/mba-admissions', label: 'MBA Admissions' },
    ],
  },
  {
    title: 'Learning & Practice',
    links: [
      { href: '/learn', label: 'Learning Academy' },
      { href: '/question-bank', label: 'Question Bank' },
      { href: '/mentors', label: 'Find a Mentor' },
      { href: '/pricing', label: 'Pricing & Plans' },
      { href: '/for-colleges', label: 'For Colleges & Institutions' },
    ],
  },
  {
    title: 'Portals & Governance',
    links: [
      { href: '/app/candidate', label: 'Candidate Workspace' },
      { href: '/app/interviewer', label: 'Interviewer Workspace' },
      { href: '/staff', label: 'Admin Control Centre' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  },
]

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <div className="site-footer-brand">
          <Link href="/" className="logo" aria-label="InterviewSetu home">
            <span className="logo-mark">
              <i />
              <i />
              <i />
            </span>
            <strong>
              Interview<span>Setu</span>
            </strong>
          </Link>
          <p>
            India-first interview learning, AI interview practice and verified human mock-interview
            marketplace. Learn how to answer. Practise with confidence.
          </p>
          <div className="site-footer-status">
            <i />
            <span>All systems operational · LiveKit WebRTC & AI active</span>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="site-footer-col">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="site-footer-bottom">
        <p>© 2026 InterviewSetu Technologies Pvt. Ltd. All rights reserved.</p>
        <p>
          A mock-interview score is a practice metric and does not represent an official hiring or
          selection guarantee.
        </p>
      </div>
    </footer>
  )
}
