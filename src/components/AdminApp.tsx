'use client'

import type React from 'react'
import { useState } from 'react'
import { useAuth } from '@/lib/supabase/use-auth'

import { AdminUserManagement } from './admin/AdminUserManagement'
import { AdminVerificationQueue } from './admin/AdminVerificationQueue'
import { AdminBookingsManager } from './booking/AdminBookingsManager'
import { usePrototypeState } from './PrototypeState'
import { AppearanceSettings } from './ui/AppearanceSettings'
import { NotificationBell } from './ui/NotificationBell'
import { RoleSwitcher } from './ui/RoleSwitcher'

type Page =
  | 'overview'
  | 'users'
  | 'verification'
  | 'candidates'
  | 'catalogue'
  | 'stages'
  | 'questions'
  | 'content'
  | 'ai'
  | 'rubrics'
  | 'bookings'
  | 'payments'
  | 'moderation'
  | 'analytics'
  | 'notifications'
  | 'permissions'
  | 'audit'
  | 'settings'

function AIcon({ name }: { name: string }) {
  const p: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 7" />,
    book: (
      <>
        <path d="M4 5a3 3 0 0 1 3-3h5v18H7a3 3 0 0 0-3 2ZM20 5a3 3 0 0 0-3-3h-5v18h5a3 3 0 0 1 3 2Z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 13.5v-3l2-1-2-3-2 1a8 8 0 0 0-3-1.7L14 3h-4L9.6 5A8 8 0 0 0 7 6.5L5 5.5l-2 3 2 2v3l-2 2 2 3 2-1a8 8 0 0 0 3 1.7l.4 2h4l.4-2a8 8 0 0 0 3-1.7l2 1 2-3-2-2Z" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {p[name] || p.settings}
    </svg>
  )
}
const Btn = ({
  children,
  onClick,
  quiet = false,
  danger = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  quiet?: boolean
  danger?: boolean
}) => (
  <button
    type="button"
    className={`admin-btn ${quiet ? 'quiet' : ''} ${danger ? 'danger' : ''}`}
    onClick={onClick}
  >
    {children}
  </button>
)

const nav: [Page, string, string, string][] = [
  ['overview', 'Overview', 'grid', 'OPERATIONS'],
  ['users', 'Users', 'users', 'PEOPLE'],
  ['verification', 'Interviewer Verification', 'shield', 'PEOPLE'],
  ['candidates', 'Candidates', 'users', 'PEOPLE'],
  ['catalogue', 'Exam & Role Catalogue', 'book', 'CONTENT'],
  ['stages', 'Interview Stages', 'settings', 'CONTENT'],
  ['questions', 'Question Bank', 'book', 'CONTENT'],
  ['content', 'Learning Content', 'book', 'CONTENT'],
  ['ai', 'AI Configuration', 'settings', 'INTELLIGENCE'],
  ['rubrics', 'Evaluation Rubrics', 'check', 'INTELLIGENCE'],
  ['bookings', 'Bookings & Sessions', 'calendar', 'OPERATIONS'],
  ['payments', 'Payments & Refunds', 'card', 'OPERATIONS'],
  ['moderation', 'Reports & Moderation', 'shield', 'GOVERNANCE'],
  ['analytics', 'Analytics', 'chart', 'GOVERNANCE'],
  ['notifications', 'Notifications', 'bell', 'GOVERNANCE'],
  ['permissions', 'Permissions & Roles', 'lock', 'GOVERNANCE'],
  ['audit', 'Audit Logs', 'book', 'GOVERNANCE'],
  ['settings', 'Platform Settings', 'settings', 'GOVERNANCE'],
]

function Login({ done, exit }: { done: () => void; exit: () => void }) {
  const [error, setError] = useState(false)
  return (
    <div className="admin-login">
      <section>
        <button type="button" className="admin-brand" onClick={exit}>
          <span>IS</span>
          <b>InterviewSetu</b>
        </button>
        <div>
          <span>SECURE STAFF PORTAL</span>
          <h1>
            Operational clarity,
            <br />
            without compromise.
          </h1>
          <p>
            Manage verification, safety, content and platform operations from one permission-aware
            workspace.
          </p>
          <div className="login-signal">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        <small>Authorised platform staff only · All sensitive actions are audited</small>
      </section>
      <main>
        <div className="secure-mark">
          <AIcon name="lock" />
        </div>
        <span>INVITATION-ONLY ACCESS</span>
        <h1>Staff sign in</h1>
        <p>Use your authorised platform account.</p>
        {error && (
          <div className="login-error">
            Access could not be verified. Check your credentials or contact an administrator.
          </div>
        )}
        <label>
          Work email
          <input defaultValue="admin@interviewsetu.demo" />
        </label>
        <label>
          Password
          <input type="password" defaultValue="demopassword" />
        </label>
        <div className="login-row">
          <label>
            <input type="checkbox" defaultChecked /> Remember this device
          </label>
          <button
            type="button"
            onClick={() =>
              alert('Password reset instructions sent to registered administrator email.')
            }
          >
            Forgot password?
          </button>
        </div>
        <Btn onClick={done}>
          Sign in to demo console <AIcon name="arrow" />
        </Btn>
        <button type="button" className="sso-button" onClick={() => setError(true)}>
          Continue with authorised SSO
        </button>
        <small>
          This prototype does not create a real staff session. Payload Admin authentication remains
          platform-managed.
        </small>
      </main>
    </div>
  )
}

function ActionModal({
  title,
  copy,
  close,
  complete,
  danger = false,
}: {
  title: string
  copy: string
  close: () => void
  complete: () => void
  danger?: boolean
}) {
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(false)

  if (done)
    return (
      <div className="admin-modal">
        <div className="modal-success">
          <span>
            <AIcon name="check" />
          </span>
          <h2>Action recorded</h2>
          <p>
            The prototype status and audit preview have been updated with reason: "
            {reason || 'Verified by admin'}".
          </p>
          <Btn onClick={complete}>Done</Btn>
        </div>
      </div>
    )

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click is a pointer shortcut; Escape (useEscapeKey) closes it from the keyboard.
    <div className="admin-modal" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <section role="dialog" aria-modal="true" aria-labelledby="admin-action-title">
        <span className={danger ? 'danger' : ''}>
          <AIcon name={danger ? 'shield' : 'check'} />
        </span>
        <h2 id="admin-action-title">{title}</h2>
        <p>{copy}</p>
        <label>
          Reason / internal note
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Required for the audit trail (e.g. Identity documents match official gazette)"
          />
        </label>
        <div>
          <Btn quiet onClick={close}>
            Cancel
          </Btn>
          <Btn danger={danger} onClick={() => setDone(true)}>
            {danger ? 'Confirm restricted action' : 'Confirm action'}
          </Btn>
        </div>
      </section>
    </div>
  )
}

function Shell({
  page,
  setPage,
  children,
}: {
  page: Page
  setPage: (p: Page) => void
  children: React.ReactNode
}) {
  const { signOut } = useAuth()
  let group = ''
  return (
    <div className="admin-shell">
      <aside>
        <button type="button" className="admin-brand" onClick={() => setPage('overview')}>
          <span>IS</span>
          <b>InterviewSetu</b>
          <em>ADMIN</em>
        </button>
        <nav>
          {nav.map(([p, l, i, g]) => {
            const heading = g !== group
            group = g
            return (
              <div key={p}>
                {heading && <small>{g}</small>}
                <button
                  type="button"
                  className={page === p ? 'active' : ''}
                  onClick={() => setPage(p)}
                >
                  <AIcon name={i} />
                  <span>{l}</span>
                  {p === 'verification' && <i>8</i>}
                  {p === 'moderation' && <i>3</i>}
                </button>
              </div>
            )
          })}
        </nav>
        <footer className="admin-aside-footer">
          <button type="button" className="admin-user-btn" onClick={() => setPage('settings')}>
            <span>SA</span>
            <div>
              <b>Super Admin</b>
              <small>Full access · Demo</small>
            </div>
          </button>
          <button type="button" className="admin-signout-btn" onClick={() => signOut()}>
            Sign out
          </button>
        </footer>
      </aside>
      <section>
        <header>
          <div>
            <small>ADMIN CONTROL CENTRE</small>
            <b>{nav.find((n) => n[0] === page)?.[1]}</b>
          </div>
          <RoleSwitcher currentRole="admin" userName="Super Admin" />
          <label>
            <AIcon name="search" />
            <input placeholder="Search users, bookings, references" />
          </label>
          <NotificationBell customUserId="usr-admin-1" />
          <button
            type="button"
            className="admin-avatar"
            onClick={() => setPage('settings')}
            aria-label="Open settings"
          >
            SA
          </button>
        </header>
        <main className="page-enter" key={page}>
          {children}
        </main>
      </section>
    </div>
  )
}
const Title = ({
  eye,
  title,
  copy,
  action,
}: {
  eye: string
  title: string
  copy: string
  action?: React.ReactNode
}) => (
  <div className="admin-title">
    <div>
      <span>{eye}</span>
      <h1>{title}</h1>
      <p>{copy}</p>
    </div>
    {action}
  </div>
)

function Overview({ go, act }: { go: (p: Page) => void; act: (x: string) => void }) {
  const [timeframe, setTimeframe] = useState('Last 30 days')

  return (
    <>
      <Title
        eye="PLATFORM OPERATIONS"
        title="Good morning, Admin."
        copy="Here’s what needs attention across InterviewSetu."
        action={
          <>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--brand-tint)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                background: 'var(--surface)',
                cursor: 'pointer',
              }}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>All time</option>
            </select>
            <Btn onClick={() => act('Export platform operations report')}>Export demo report</Btn>
          </>
        }
      />
      <div className="admin-kpis">
        {[
          ['2,486', 'Total candidates', '+126 this month', 'users'],
          ['74', 'Active interviewers', '68 verified', 'verification'],
          ['8', 'Applications pending', 'Oldest: 3 days', 'verification'],
          ['1,204', 'Interviews completed', '30-day demo', 'analytics'],
          ['31', 'Upcoming sessions', 'Next 7 days', 'bookings'],
          ['3', 'Reported issues', '2 high priority', 'moderation'],
        ].map((x, i) => (
          <button type="button" onClick={() => go(x[3] as Page)} key={x[1]}>
            <span className={`ak${i}`}>
              <AIcon name={['users', 'shield', 'card', 'check', 'calendar', 'bell'][i]} />
            </span>
            <div>
              <strong>{x[0]}</strong>
              <b>{x[1]}</b>
              <small>{x[2]}</small>
            </div>
            <AIcon name="arrow" />
          </button>
        ))}
      </div>
      <div className="admin-overview-grid">
        <section className="admin-trend">
          <div className="admin-block-head">
            <div>
              <span>PLATFORM ACTIVITY · {timeframe.toUpperCase()}</span>
              <h2>Practice continues to grow steadily</h2>
            </div>
            <select>
              <option>Completed interviews</option>
              <option>Registrations</option>
            </select>
          </div>
          <div className="admin-line-chart">
            <svg
              role="img"
              aria-label="Platform activity trend over the period"
              viewBox="0 0 700 220"
              preserveAspectRatio="none"
            >
              <path
                className="fill"
                d="M10 185 L100 172 L190 150 L280 158 L370 118 L460 105 L550 72 L690 48 L690 220 L10 220Z"
              />
              <path
                className="line"
                d="M10 185 L100 172 L190 150 L280 158 L370 118 L460 105 L550 72 L690 48"
              />
            </svg>
          </div>
          <footer>
            <span>1 Jun</span>
            <span>8 Jun</span>
            <span>15 Jun</span>
            <span>22 Jun</span>
            <span>30 Jun</span>
          </footer>
        </section>
        <section className="admin-funnel">
          <span>PREPARATION FUNNEL · DEMO</span>
          <h2>From signup to repeat practice</h2>
          {[
            ['Signed up', '2,486', 100],
            ['Onboarding complete', '2,012', 81],
            ['First practice', '1,604', 65],
            ['Repeat practice', '986', 40],
          ].map((x) => (
            <div key={x[0]}>
              <span>
                <b>{x[0]}</b>
                <small>
                  {x[1]} · {x[2]}%
                </small>
              </span>
              <i>
                <em style={{ width: `${x[2]}%` }} />
              </i>
            </div>
          ))}
        </section>
      </div>
      <div className="admin-overview-grid lower">
        <section className="verification-queue">
          <div className="admin-block-head">
            <div>
              <span>VERIFICATION QUEUE</span>
              <h2>8 applications need review</h2>
            </div>
            <button type="button" onClick={() => go('verification')}>
              View queue
            </button>
          </div>
          {[
            ['RM', 'Riya Mehta', 'Professional', 'Software & IT', 'Submitted 3d ago'],
            ['AK', 'Arjun Khanna', 'Faculty', 'Teaching & Academia', 'Submitted 2d ago'],
            ['PS', 'Priya Shah', 'Exam-cleared', 'Government', 'Submitted 1d ago'],
          ].map((x) => (
            <button type="button" onClick={() => go('verification')} key={x[1]}>
              <span>{x[0]}</span>
              <div>
                <b>{x[1]}</b>
                <small>
                  {x[2]} · {x[3]}
                </small>
              </div>
              <em>{x[4]}</em>
              <AIcon name="arrow" />
            </button>
          ))}
        </section>
        <section className="operations-panel">
          <span>BOOKING OPERATIONS</span>
          <h2>Today’s sessions</h2>
          {[
            ['10:30', 'Technical Mock', 'Confirmed'],
            ['14:00', 'UPSC Personality', 'In progress'],
            ['18:00', 'Project Defence', 'Attention'],
          ].map((x) => (
            <div key={x[0]}>
              <b>{x[0]}</b>
              <span>{x[1]}</span>
              <em className={x[2] === 'Attention' ? 'warn' : ''}>{x[2]}</em>
            </div>
          ))}
          <button type="button" onClick={() => go('bookings')}>
            Open session operations <AIcon name="arrow" />
          </button>
        </section>
      </div>
      <section className="admin-alert">
        <AIcon name="shield" />
        <div>
          <b>3 moderation items require attention</b>
          <p>
            Two candidate reports and one disputed booking are waiting for an authorised reviewer.
          </p>
        </div>
        <Btn danger onClick={() => act('Open moderation review')}>
          Review safely
        </Btn>
      </section>
    </>
  )
}

function Catalogue({ page, act }: { page: Page; act: (x: string, d?: boolean) => void }) {
  const config: Record<string, [string, string, string]> = {
    catalogue: [
      'CATALOGUE',
      'Exam & role catalogue',
      'Configure valid interview-preparation tracks without implying universal selection stages.',
    ],
    stages: [
      'SELECTION CONFIGURATION',
      'Interview stages',
      'Define stage applicability, official source notes and review dates.',
    ],
    questions: [
      'CONTENT OPERATIONS',
      'Question bank manager',
      'Review, tag and publish practice questions with source metadata.',
    ],
    content: [
      'LEARNING CONTENT',
      'Academy content',
      'Manage lessons, categories, review status and publishing workflows.',
    ],
    ai: [
      'AI GOVERNANCE',
      'AI configuration',
      'Control prompt versions, safety boundaries and model behaviour without exposing secrets.',
    ],
    rubrics: [
      'EVALUATION',
      'Evaluation rubrics',
      'Configure track-specific dimensions, descriptors and candidate-facing definitions.',
    ],
  }
  const [eye, title, copy] = config[page]
  const rows =
    page === 'catalogue'
      ? [
          [
            'TRK-001',
            'UPSC Personality Test',
            'Government',
            'Interview applicable',
            'Reviewed 02 Jun',
          ],
          ['TRK-014', 'Software Engineering', 'Professional', 'Active', 'Reviewed 10 Jun'],
          [
            'TRK-021',
            'Banking Officer Interviews',
            'Banking',
            'Notification-dependent',
            'Review due',
          ],
        ]
      : page === 'questions'
        ? [
            [
              'Q-1042',
              'Explain a difficult technical decision.',
              'Software',
              'Published',
              'Reviewed',
            ],
            [
              'Q-1043',
              'Tell me about a challenge you handled.',
              'Behavioural',
              'Published',
              'Reviewed',
            ],
            ['Q-1044', 'Why this role?', 'General', 'Draft', 'Needs review'],
          ]
        : page === 'content'
          ? [
              ['LES-104', 'Build a confident introduction', 'Foundations', 'Published', '12 min'],
              ['LES-118', 'Explain project decisions', 'Communication', 'In review', '15 min'],
              ['LES-126', 'Balanced reasoning', 'Government', 'Draft', '16 min'],
            ]
          : page === 'ai'
            ? [
                ['CFG-01', 'Realistic Mock', 'v2.4', 'Active', 'Updated 12 Jun'],
                ['CFG-02', 'Guided Practice', 'v1.9', 'Active', 'Updated 08 Jun'],
                ['CFG-03', 'Panel Simulation', 'v0.8', 'Testing', 'Updated 14 Jun'],
              ]
            : page === 'rubrics'
              ? [
                  ['RUB-01', 'Software Engineering', '5 dimensions', 'Active', 'v3'],
                  ['RUB-07', 'Communication', '4 dimensions', 'Active', 'v2'],
                  ['RUB-12', 'UPSC Personality', '6 dimensions', 'Review due', 'v1'],
                ]
              : [
                  ['STG-01', 'Personality Test', 'UPSC CSE', 'Applicable', 'Source reviewed'],
                  [
                    'STG-08',
                    'Personal Interview',
                    'Bank Officer',
                    'Configurable',
                    'Notification check',
                  ],
                  ['STG-14', 'Technical Round', 'Software roles', 'Active', 'Admin-defined'],
                ]

  return (
    <>
      <Title
        eye={eye}
        title={title}
        copy={copy}
        action={
          <Btn onClick={() => act(`Create new item in ${title.toLowerCase()}`)}>+ Add new</Btn>
        }
      />
      <div className="admin-filters">
        <label>
          <AIcon name="search" />
          <input placeholder={`Search ${title.toLowerCase()}`} />
        </label>
        <button type="button" onClick={() => act(`Filter categories in ${title}`)}>
          All categories ⌄
        </button>
        <button type="button" onClick={() => act(`Filter statuses in ${title}`)}>
          All statuses ⌄
        </button>
        <button type="button" onClick={() => act(`Sort by updated date in ${title}`)}>
          Last updated ⌄
        </button>
      </div>
      <section className="admin-table content-table">
        <header>
          <span>ID</span>
          <span>Name / title</span>
          <span>Category / version</span>
          <span>Status</span>
          <span>Review metadata</span>
          <span />
        </header>
        {rows.map((x) => (
          <button type="button" onClick={() => act(`Edit details for ${x[1]}`)} key={x[0]}>
            {x.map((v, i) => (
              <span className={i === 3 ? 'status-cell' : ''} key={v}>
                {v}
              </span>
            ))}
            <b>•••</b>
          </button>
        ))}
      </section>
      <div className="admin-empty-note">
        <AIcon name={page === 'ai' ? 'lock' : 'check'} />
        <div>
          <b>
            {page === 'ai'
              ? 'Secrets are never shown in configuration records.'
              : 'Changes require review before they affect published experiences.'}
          </b>
          <p>
            {page === 'catalogue'
              ? 'Official-stage notes and review dates remain visible to prevent misleading catalogue claims.'
              : 'This prototype records actions locally; durable content connection is scheduled for Phase 6.'}
          </p>
        </div>
      </div>
    </>
  )
}

function Operations({ page, act }: { page: Page; act: (x: string, d?: boolean) => void }) {
  const isPay = page === 'payments'
  const rows = isPay
    ? [
        ['PAY-8821', 'IS-2048', '₹1,199', 'Demo paid', '18 Jun'],
        ['PAY-8814', 'IS-2039', '₹799', 'Refund requested', '17 Jun'],
        ['PAY-8802', 'IS-2022', '₹1,199', 'Demo paid', '15 Jun'],
      ]
    : [
        ['IS-2048', 'Aarav S.', 'Technical Mock', '18 Jun · 18:00', 'Confirmed'],
        ['IS-2051', 'Neha K.', 'Project Defence', '19 Jun · 17:30', 'Requested'],
        ['IS-2039', 'Vikram R.', 'Data Analytics', '17 Jun · 14:00', 'Disputed'],
      ]

  return (
    <>
      <Title
        eye="OPERATIONS"
        title={isPay ? 'Payments & refunds' : 'Bookings & sessions'}
        copy={
          isPay
            ? 'Review demo transactions, configured fees and refund requests.'
            : 'Monitor booking status, session health and operational exceptions.'
        }
        action={
          <Btn
            quiet
            onClick={() =>
              act(isPay ? 'Export payment transactions report' : 'Export session operations report')
            }
          >
            Export permitted report
          </Btn>
        }
      />
      <div className="admin-kpis compact">
        {(isPay
          ? [
              ['₹2.8L', 'Demo gross'],
              ['₹56K', 'Platform fees'],
              ['₹18K', 'Pending payout'],
              ['2', 'Refund requests'],
            ]
          : [
              ['31', 'Upcoming'],
              ['4', 'In progress'],
              ['1,204', 'Completed'],
              ['3', 'Needs attention'],
            ]
        ).map((x, i) => (
          <button type="button" key={x[1]} onClick={() => act(`Filter by metric: ${x[1]}`)}>
            <span className={`ak${i}`}>
              <AIcon name={isPay ? 'card' : 'calendar'} />
            </span>
            <div>
              <strong>{x[0]}</strong>
              <b>{x[1]}</b>
            </div>
          </button>
        ))}
      </div>
      <div className="admin-filters">
        <label>
          <AIcon name="search" />
          <input placeholder="Search reference or user" />
        </label>
        <button type="button" onClick={() => act('Filter by date range')}>
          Date range ⌄
        </button>
        <button type="button" onClick={() => act('Filter by status')}>
          Status ⌄
        </button>
      </div>
      <section className="admin-table operations-table">
        <header>
          {(isPay
            ? ['Payment', 'Booking', 'Amount', 'Status', 'Date', '']
            : ['Booking', 'Candidate', 'Format', 'Date / time', 'Status', '']
          ).map((x) => (
            <span key={x}>{x}</span>
          ))}
        </header>
        {rows.map((x) => (
          <button
            type="button"
            onClick={() => act(`Inspect operational record ${x[0]}`)}
            key={x[0]}
          >
            {x.map((v, i) => (
              <span className={i === 3 || i === 4 ? 'status-cell' : ''} key={v}>
                {v}
              </span>
            ))}
            <b>•••</b>
          </button>
        ))}
      </section>
      <section className="operation-warning">
        <AIcon name="shield" />
        <div>
          <b>High-impact actions require confirmation and a reason.</b>
          <p>Refunds, cancellations and payout changes create an immutable audit preview.</p>
        </div>
        <Btn
          danger
          onClick={() => act(isPay ? 'Review refund request' : 'Resolve disputed booking', true)}
        >
          Open exception
        </Btn>
      </section>
    </>
  )
}

function Governance({ page, act }: { page: Page; act: (x: string, d?: boolean) => void }) {
  const [settingsTab, setSettingsTab] = useState('General')
  if (page === 'analytics')
    return (
      <>
        <Title
          eye="PLATFORM ANALYTICS"
          title="Product health"
          copy="Demo metrics with explicit timeframe and no predictive hiring claims."
        />
        <div className="admin-kpis">
          {[
            ['68%', 'Onboarding completion', '30 days'],
            ['64%', 'First practice rate', '30 days'],
            ['40%', 'Repeat practice', '30 days'],
            ['92%', 'Session completion', '30 days'],
            ['4.7', 'Mentor satisfaction', '12 reviews'],
            ['2.1%', 'Issue rate', '30 days'],
          ].map((x, i) => (
            <button type="button" key={x[1]} onClick={() => act(`Inspect analytics for ${x[1]}`)}>
              <span className={`ak${i}`}>
                <AIcon name="chart" />
              </span>
              <div>
                <strong>{x[0]}</strong>
                <b>{x[1]}</b>
                <small>{x[2]}</small>
              </div>
            </button>
          ))}
        </div>
        <section className="analytics-admin">
          <div className="admin-block-head">
            <div>
              <span>ACTIVITY TREND</span>
              <h2>Candidates and sessions by week</h2>
            </div>
            <button type="button" onClick={() => act('Change analytics timeframe')}>
              Last 90 days ⌄
            </button>
          </div>
          <div className="multi-bars">
            {[45, 61, 54, 73, 68, 86, 78, 92].map((x, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static chart data that never reorders and may repeat values.
              <span key={i}>
                <i style={{ height: `${x}%` }} />
                <em style={{ height: `${x * 0.7}%` }} />
                <small>W{i + 1}</small>
              </span>
            ))}
          </div>
          <div className="chart-key">
            <span>
              <i />
              Candidate activity
            </span>
            <span>
              <i />
              Completed sessions
            </span>
          </div>
        </section>
      </>
    )

  if (page === 'permissions')
    return (
      <>
        <Title
          eye="ACCESS CONTROL"
          title="Permissions & roles"
          copy="Least-privilege access for operational staff."
          action={<Btn onClick={() => act('Invite authorised staff member')}>Invite staff</Btn>}
        />
        <div className="role-grid-admin">
          {[
            ['Super Admin', '3 members', 'Full platform access'],
            ['Verification Reviewer', '5 members', 'Applications and evidence'],
            ['Content Manager', '4 members', 'Catalogue, questions, learning'],
            ['Operations Specialist', '3 members', 'Bookings, payments, disputes'],
          ].map((x) => (
            <section key={x[0]}>
              <span>
                <AIcon name="lock" />
              </span>
              <h2>{x[0]}</h2>
              <b>{x[1]}</b>
              <p>{x[2]}</p>
              <button type="button" onClick={() => act(`Edit ${x[0]} permissions`, true)}>
                Review permissions
              </button>
            </section>
          ))}
        </div>
      </>
    )

  if (page === 'audit')
    return (
      <>
        <Title
          eye="GOVERNANCE"
          title="Audit logs"
          copy="Sensitive access and platform changes are recorded."
          action={
            <Btn quiet onClick={() => act('Export immutable audit log')}>
              Export audit log
            </Btn>
          }
        />
        <div className="admin-filters">
          <label>
            <AIcon name="search" />
            <input placeholder="Search actor, action or resource" />
          </label>
          <button type="button" onClick={() => act('Filter audit log by action type')}>
            Action type ⌄
          </button>
          <button type="button" onClick={() => act('Filter audit log by date')}>
            Date range ⌄
          </button>
        </div>
        <section className="audit-list">
          {[
            [
              '10:42',
              'S. Admin',
              'Approved interviewer application',
              'DEMO-INT-2034',
              'Verification',
            ],
            [
              '09:18',
              'M. Reviewer',
              'Viewed private evidence',
              'DEMO-INT-2048',
              'Sensitive access',
            ],
            ['Yesterday', 'O. Specialist', 'Updated booking status', 'IS-2039', 'Operations'],
            ['14 Jun', 'C. Manager', 'Published lesson revision', 'LES-118', 'Content'],
          ].map((x) => (
            <div key={x[0]}>
              <span>{x[0]}</span>
              <div>
                <b>{x[2]}</b>
                <small>
                  {x[1]} · {x[3]}
                </small>
              </div>
              <em>{x[4]}</em>
              <button type="button" onClick={() => act(`Inspect audit log details: ${x[2]}`)}>
                Details
              </button>
            </div>
          ))}
        </section>
      </>
    )

  if (page === 'moderation')
    return (
      <>
        <Title
          eye="TRUST & SAFETY"
          title="Reports & moderation"
          copy="Review reports consistently without casual or celebratory language."
        />
        <div className="admin-tabs">
          <button type="button" className="active">
            Open reports <i>3</i>
          </button>
          <button type="button" onClick={() => act('Switch to In review moderation tab')}>
            In review
          </button>
          <button type="button" onClick={() => act('Switch to Resolved moderation tab')}>
            Resolved
          </button>
          <button type="button" onClick={() => act('Switch to Appeals moderation tab')}>
            Appeals
          </button>
        </div>
        <section className="moderation-list">
          {[
            ['HIGH', 'REP-1042', 'Disputed session conduct', 'Booking IS-2039', 'Submitted today'],
            [
              'MEDIUM',
              'REP-1038',
              'Question content concern',
              'Question Q-1014',
              'Submitted yesterday',
            ],
            ['MEDIUM', 'REP-1032', 'Review response concern', 'Review REV-882', 'Submitted 2d ago'],
          ].map((x) => (
            <button type="button" onClick={() => act(`Review ${x[1]}: ${x[2]}`, true)} key={x[1]}>
              <em className={x[0].toLowerCase()}>{x[0]}</em>
              <b>{x[1]}</b>
              <span>
                <strong>{x[2]}</strong>
                <small>{x[3]}</small>
              </span>
              <i>{x[4]}</i>
              <AIcon name="arrow" />
            </button>
          ))}
        </section>
      </>
    )

  if (page === 'notifications')
    return (
      <>
        <Title
          eye="PLATFORM COMMUNICATIONS"
          title="Admin notifications"
          copy="Operational alerts and configurable platform notices."
          action={<Btn onClick={() => act('Create platform notice')}>Create notice</Btn>}
        />
        <section className="audit-list">
          {[
            [
              'Today',
              'System',
              'Verification queue threshold reached',
              '8 pending applications',
              'Operations',
            ],
            ['Today', 'Payments', 'Refund request needs review', 'PAY-8814', 'Finance'],
            ['Yesterday', 'Trust & Safety', 'New report submitted', 'REP-1042', 'Moderation'],
          ].map((x) => (
            <div key={x[3]}>
              <span>{x[0]}</span>
              <div>
                <b>{x[2]}</b>
                <small>
                  {x[1]} · {x[3]}
                </small>
              </div>
              <em>{x[4]}</em>
              <button type="button" onClick={() => act(`Open notification item: ${x[2]}`)}>
                Open
              </button>
            </div>
          ))}
        </section>
      </>
    )

  return (
    <>
      <Title
        eye="PLATFORM CONFIGURATION"
        title="Platform settings"
        copy="Core operational defaults and policy references."
      />
      <div className="settings-layout admin-settings">
        <aside>
          {[
            'General',
            'Appearance',
            'Booking policies',
            'Payments & fees',
            'Verification',
            'Privacy & retention',
            'Feature controls',
            'Maintenance',
          ].map((x) => (
            <button
              type="button"
              className={settingsTab === x ? 'active' : ''}
              onClick={() =>
                x === 'General' || x === 'Appearance'
                  ? setSettingsTab(x)
                  : act(`View settings section: ${x}`)
              }
              key={x}
            >
              {x}
            </button>
          ))}
        </aside>
        <section>
          {settingsTab === 'Appearance' ? (
            <>
              <span className="label">APPEARANCE</span>
              <h2>Appearance</h2>
              <AppearanceSettings />
            </>
          ) : (
            <>
              <span className="label">GENERAL</span>
              <h2>Platform defaults</h2>
              <div className="profile-form">
                <label>
                  Platform name
                  <input defaultValue="InterviewSetu" />
                </label>
                <label>
                  Default timezone
                  <select>
                    <option>Asia/Kolkata (IST)</option>
                  </select>
                </label>
                <label>
                  Support email
                  <input defaultValue="support@example.demo" />
                </label>
                <label>
                  Default language
                  <select>
                    <option>English</option>
                  </select>
                </label>
                <label className="full">
                  Candidate guidance notice
                  <textarea defaultValue="Practice metrics are guidance and do not predict selection outcomes." />
                </label>
              </div>
              <div className="save-row">
                <Btn onClick={() => act('Save platform settings')}>Save settings</Btn>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  )
}

export default function AdminApp({ exit = () => (location.href = '/') }: { exit?: () => void }) {
  const { data, update } = usePrototypeState()
  const { role } = useAuth()
  const [logged, setLogged] = useState(role === 'admin')
  const [page, setPage] = useState<Page>('overview')
  const [action, setAction] = useState<{ title: string; danger: boolean } | null>(null)

  if (!logged) return <Login done={() => setLogged(true)} exit={exit} />
  const act = (title: string, danger = false) => setAction({ title, danger })
  const view =
    page === 'overview' ? (
      <Overview go={setPage} act={act} />
    ) : page === 'users' || page === 'candidates' ? (
      <AdminUserManagement />
    ) : page === 'verification' ? (
      <AdminVerificationQueue />
    ) : ['catalogue', 'stages', 'questions', 'content', 'ai', 'rubrics'].includes(page) ? (
      <Catalogue page={page} act={act} />
    ) : page === 'bookings' ? (
      <AdminBookingsManager />
    ) : page === 'payments' ? (
      <Operations page={page} act={act} />
    ) : (
      <Governance page={page} act={act} />
    )

  return (
    <Shell page={page} setPage={setPage}>
      {view}
      {page === 'audit' && data.auditEvents.length > 0 && (
        <section className="shared-audit">
          <span>LIVE PROTOTYPE EVENTS</span>
          {data.auditEvents.map((event, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: audit events are display-only strings that can repeat; nothing is keyed to them.
            <div key={`${event}-${i}`}>
              <b>{event}</b>
              <small>Shared browser state · just now</small>
            </div>
          ))}
        </section>
      )}
      {action && (
        <ActionModal
          title={action.title}
          danger={action.danger}
          copy="Review the impact, add a reason, and confirm. This prototype never silently performs a high-impact action."
          close={() => setAction(null)}
          complete={() => {
            const title = action.title.toLowerCase()
            update(
              title.includes('approve interviewer')
                ? { interviewerStatus: 'approved' }
                : title.includes('more information')
                  ? { interviewerStatus: 'needs-information' }
                  : title.includes('not approve')
                    ? { interviewerStatus: 'not-approved' }
                    : title.includes('refund')
                      ? { bookingStatus: 'refunded' }
                      : {},
              `Admin: ${action.title}`,
            )
            setAction(null)
          }}
        />
      )}
    </Shell>
  )
}
