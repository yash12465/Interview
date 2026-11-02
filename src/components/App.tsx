'use client'

import {
  Briefcase,
  Building2,
  CodeXml,
  GraduationCap,
  Landmark,
  type LucideIcon,
  MessageCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useEscapeKey } from '@/lib/use-escape-key'
import CandidateApp from './CandidateApp'
import InterviewerApp from './InterviewerApp'
import { SettingsLink } from './ui/SettingsLink'

type Track = {
  title: string
  category: string
  slug: string
  copy: string
  skills: string[]
  icon: LucideIcon
}

const tracks: Track[] = [
  {
    title: 'UPSC Personality Test',
    slug: 'upsc-personality-test',
    category: 'Government',
    copy: 'DAF-linked discussion, balanced reasoning and situational questions.',
    skills: ['DAF', 'Current affairs', 'Judgement'],
    icon: Landmark,
  },
  {
    title: 'Campus Placements',
    slug: 'campus-placements',
    category: 'College',
    copy: 'Build confidence across project, technical and behavioural rounds.',
    skills: ['Introduction', 'Projects', 'HR rounds'],
    icon: GraduationCap,
  },
  {
    title: 'Software Engineering',
    slug: 'software-engineering',
    category: 'Technical',
    copy: 'Explain your thinking across fundamentals, systems and project defence.',
    skills: ['Technical', 'Projects', 'Trade-offs'],
    icon: CodeXml,
  },
  {
    title: 'Banking Officer Interviews',
    slug: 'banking-officer',
    category: 'Government',
    copy: 'Banking fundamentals, customer scenarios and personal interview practice.',
    skills: ['Banking', 'Scenarios', 'Awareness'],
    icon: Building2,
  },
  {
    title: 'MBA Admissions',
    slug: 'mba-admissions',
    category: 'Academic',
    copy: 'Connect your motivation, experience and goals into a clear narrative.',
    skills: ['Goals', 'Academics', 'Cases'],
    icon: Briefcase,
  },
  {
    title: 'Communication & Structure',
    slug: 'communication-and-structure',
    category: 'Skills',
    copy: 'Turn scattered thoughts into clear, specific and memorable answers.',
    skills: ['Clarity', 'Structure', 'Follow-ups'],
    icon: MessageCircle,
  },
]

const pills = [
  'Software Engineering',
  'UPSC Personality Test',
  'Self-Introduction',
  'Campus Placements',
  'Business Analyst',
  'Communication Practice',
  'State PSC Interviews',
  'MBA Interviews',
  'Technical Interviews',
  'SSB Interview Practice',
  'PhD & Research',
  'Project Defence',
  'Bank PO Interview Prep',
  '1:1 Mentor Guidance',
]

function Icon({ name }: { name: 'arrow' | 'play' | 'check' | 'menu' | 'close' }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    play: <path d="m9 7 8 5-8 5V7Z" />,
    check: <path d="m5 12 4 4L19 7" />,
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  )
}

function Logo() {
  return (
    <a className="logo" href="/" aria-label="InterviewSetu home">
      <span className="logo-mark">
        <i />
        <i />
        <i />
      </span>
      <strong>
        Interview<span>Setu</span>
      </strong>
    </a>
  )
}

function Button({
  children,
  variant = 'primary',
  onClick,
  href,
  icon = true,
}: {
  children: React.ReactNode
  variant?: string
  onClick?: (e: React.MouseEvent) => void
  href?: string
  icon?: boolean
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([])
  const nextId = useRef(0)
  // Rendered as either <a> or <button type="button">; the intersection type fits both refs.
  const btnRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null)

  const handlePointer = (e: React.MouseEvent) => {
    const el = btnRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = ++nextId.current
      setRipples((r) => [...r, { id, x, y, size }])
      setTimeout(() => setRipples((r) => r.filter((it) => it.id !== id)), 600)
    }
    if (onClick) onClick(e)
  }

  const cls = `button ${variant}`
  const content = (
    <>
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {children}
        {icon && <Icon name="arrow" />}
      </span>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="water-ripple"
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
              transform: 'translate(-50%, -50%) scale(0)',
            }}
          />
        ))}
      </span>
    </>
  )
  return href ? (
    <a ref={btnRef} className={cls} href={href} onClick={handlePointer}>
      {content}
    </a>
  ) : (
    <button type="button" ref={btnRef} className={cls} onClick={handlePointer}>
      {content}
    </button>
  )
}

function Modal({
  type,
  close,
  startCandidate,
  startInterviewer,
}: {
  type: 'start' | 'mentor'
  close: () => void
  startCandidate: () => void
  startInterviewer: () => void
}) {
  useEscapeKey(close)

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click is a pointer shortcut; Escape (useEscapeKey) closes it from the keyboard.
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button
          type="button"
          className="icon-button modal-close"
          onClick={close}
          aria-label="Close"
        >
          <Icon name="close" />
        </button>
        {type === 'start' ? (
          <>
            <span className="eyebrow">CHOOSE YOUR PATH</span>
            <h2 id="modal-title">How will you use InterviewSetu?</h2>
            <p>
              Choose a path to begin. Candidates, interviewers and administrators share one unified
              identity.
            </p>
            <div className="role-grid">
              <button type="button" onClick={startCandidate}>
                <b>Prepare for interviews</b>
                <span>Practise with AI, build structured answers and meet relevant mentors.</span>
                <em>Continue as candidate →</em>
              </button>
              <button type="button" onClick={startInterviewer}>
                <b>Become an interviewer</b>
                <span>Apply to conduct structured mock interviews in your domain.</span>
                <em>View application →</em>
              </button>
            </div>
            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--brand-tint)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
              }}
            >
              <span>
                Already registered?{' '}
                <a href="/login" style={{ color: 'var(--brand-strong)', fontWeight: 700 }}>
                  Sign in
                </a>
              </span>
              <a href="/staff" style={{ color: 'var(--text-subtle)' }}>
                Staff Portal →
              </a>
            </div>
          </>
        ) : (
          <>
            <span className="eyebrow">HOW IT WORKS</span>
            <h2 id="modal-title">One session. Clear next steps.</h2>
            <div className="modal-steps">
              {[
                'Choose a relevant verified mentor',
                'Select date and session format',
                'Share your preparation goal',
                'Attend your mock interview in secure room',
                'Receive focused rubric feedback',
              ].map((x, i) => (
                <div key={x}>
                  <span>{i + 1}</span>
                  <b>{x}</b>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <Button href="/mentors">Explore all mentors</Button>
              <Button variant="secondary" onClick={close}>
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [experience, setExperience] = useState<'public' | 'candidate' | 'interviewer'>('public')
  const [candidateEntry, setCandidateEntry] = useState<'new' | 'returning'>('new')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState('')
  const [mobile, setMobile] = useState(false)
  const [modal, setModal] = useState<'start' | 'mentor' | null>(null)
  const [demo, setDemo] = useState(0)
  const categories = ['All', 'Government', 'College', 'Technical', 'Academic', 'Skills']
  const filtered = category === 'All' ? tracks : tracks.filter((t) => t.category === category)

  const choosePill = (pill: string) => {
    if (pill.includes('Mentor')) {
      document.querySelector('#mentors')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      const track = tracks.find(
        (t) => t.title.includes(pill) || pill.includes(t.title.split(' ')[0]),
      )
      setCategory(track?.category || 'All')
      setSelected(track?.title || pill)
      document.querySelector('#tracks')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (experience === 'candidate') {
    return (
      <CandidateApp startFresh={candidateEntry === 'new'} exit={() => setExperience('public')} />
    )
  }
  if (experience === 'interviewer') {
    return <InterviewerApp exit={() => setExperience('public')} />
  }

  return (
    <div id="top">
      <div className="announcement">
        <span />
        <p>AI practice + real 1:1 guidance — one connected preparation journey.</p>
        <a href="#method">See how it works</a>
      </div>

      <header>
        <Logo />
        <nav className={mobile ? 'open' : ''}>
          <a href="/interview-tracks" onClick={() => setMobile(false)}>
            Explore tracks
          </a>
          {/* biome-ignore lint/a11y/useValidAnchor: in-page section link; onClick only closes the mobile menu. */}
          <a href="#method" onClick={() => setMobile(false)}>
            How it works
          </a>
          <a href="/learn" onClick={() => setMobile(false)}>
            Learning academy
          </a>
          <a href="/question-bank" onClick={() => setMobile(false)}>
            Question bank
          </a>
          <a href="/mentors" onClick={() => setMobile(false)}>
            Find mentors
          </a>
          <a href="/pricing" onClick={() => setMobile(false)}>
            Pricing
          </a>
        </nav>
        <div className="header-actions">
          <SettingsLink />
          <a className="login" href="/login">
            Log in
          </a>
          <Button onClick={() => setModal('start')}>Get started</Button>
        </div>
        <button
          type="button"
          className="icon-button menu"
          onClick={() => setMobile(!mobile)}
          aria-label="Toggle menu"
        >
          <Icon name={mobile ? 'close' : 'menu'} />
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <i /> AI-POWERED PRACTICE · HUMAN GUIDANCE
            </span>
            <h1>
              Prepare for
              <br />
              <em>what’s next.</em>
            </h1>
            <p>
              Explore the interview that matters to you. Practise with AI, build stronger answers,
              and get personal guidance from relevant people.
            </p>
            <div className="hero-actions">
              <Button onClick={() => setModal('start')}>Start practising</Button>
              <Button variant="secondary" href="#tracks">
                Explore interview tracks
              </Button>
            </div>
            <small>
              Practise at your pace <b>·</b> Learn from feedback <b>·</b> Meet a mentor when you
              need one
            </small>
            <ul className="hero-topics" aria-label="Interviews you can prepare for">
              {pills.map((p) => (
                <li key={p}>
                  <button type="button" onClick={() => choosePill(p)}>
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tracks Section with Sticky Category Explorer */}
        <section className="tracks section" id="tracks">
          <div className="section-heading">
            <div>
              <span className="kicker">EXPLORE TRACKS</span>
              <h2>
                Find the path that fits
                <br />
                your next step.
              </h2>
            </div>
            <p>
              Choose a category to see focused practice, learning tools and mentor guidance for that
              interview type.
            </p>
          </div>
          <div className="category-bar" role="tablist">
            {categories.map((c) => (
              <button
                type="button"
                role="tab"
                aria-selected={category === c}
                className={category === c ? 'active' : ''}
                onClick={() => {
                  setCategory(c)
                  setSelected('')
                }}
                key={c}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="track-meta">
            <span>{filtered.length} preparation tracks</span>
            <small>Selection stages vary. Tracks are listed only where officially relevant.</small>
          </div>
          <div className="track-grid">
            {filtered.map((t, i) => (
              <article key={t.title} className={selected === t.title ? 'selected' : ''}>
                <div className={`track-icon tone-${i % 4}`}>
                  <t.icon />
                </div>
                <span className="tag">{t.category}</span>
                <h3>{t.title}</h3>
                <p>{t.copy}</p>
                <small>YOU’LL PRACTISE</small>
                <div className="skill-list">
                  {t.skills.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <div className="format-row">
                  <span>
                    <i /> AI practice
                  </span>
                  <span>
                    <i /> Learning lab
                  </span>
                </div>
                <div className="track-actions">
                  <button type="button" onClick={() => setModal('start')}>
                    Practise <Icon name="arrow" />
                  </button>
                  <a href={`/interview-tracks/${t.slug}`}>Details</a>
                </div>
              </article>
            ))}
          </div>
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button variant="secondary" href="/interview-tracks">
              View all tracks & selection stages
            </Button>
          </div>
        </section>

        {/* 1:1 Guidance Section */}
        <section className="mentor-wrap section" id="mentors">
          <div className="mentor-band">
            <div className="mentor-copy">
              <span className="kicker light">PERSONAL GUIDANCE, WHEN YOU NEED IT</span>
              <h2>Practise one-to-one with someone who understands your goal.</h2>
              <p>
                Get a realistic mock interview, thoughtful follow-ups and feedback from a relevant
                professional or subject specialist.
              </p>
              <ul>
                {[
                  'Match by exam, role or skill',
                  'Choose a language and session format',
                  'Leave with specific next steps',
                ].map((x) => (
                  <li key={x}>
                    <span>
                      <Icon name="check" />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mentor-actions">
                <Button href="/mentors">Find a mentor</Button>
                <button type="button" onClick={() => setModal('mentor')} className="text-button">
                  How sessions work
                </button>
              </div>
            </div>
            <div className="mentor-visual">
              <div className="mentor-orbit" />
              <div className="profile-card">
                <div className="photo">
                  <Image
                    src="https://images.unsplash.com/photo-1758691737605-69a0e78bd193?crop=faces&fit=crop&w=300&h=300&q=85"
                    alt="Smiling professional mentor example"
                    width={72}
                    height={72}
                  />
                  <span />
                </div>
                <small>PROFILE EXAMPLE</small>
                <h3>Interview mentor</h3>
                <p>
                  Software Engineering
                  <br />& Project Defence
                </p>
                <div>
                  <span>English</span>
                  <span>Hindi</span>
                </div>
              </div>
              <div className="session-card">
                <small>YOUR SESSION FOCUS</small>
                <h3>Explaining projects</h3>
                <div className="mini-wave">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <p>Strengths, gaps and clear next practice steps.</p>
              </div>
              <div className="availability">
                <small>SAMPLE AVAILABILITY</small>
                <b>Tue, 18 June</b>
                <div>
                  <span>4:30</span>
                  <span>6:00</span>
                  <span>7:30</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The InterviewSetu Method */}
        <section className="method section" id="method">
          <div className="section-heading center">
            <div>
              <span className="kicker">THE INTERVIEWSETU METHOD</span>
              <h2>Learn. Practise. Improve.</h2>
            </div>
            <p>
              Not just more questions—a connected way to understand what works, try it, and get
              better.
            </p>
          </div>
          <div className="method-grid">
            {[
              [
                '01',
                'Learn the intent',
                'Understand what the interviewer is looking for and shape your own authentic response.',
              ],
              [
                '02',
                'Practise out loud',
                'Answer adaptive prompts in a calm, realistic, simulated interview space.',
              ],
              [
                '03',
                'Improve with evidence',
                'Review specific observations, study weak areas and retry with purpose.',
              ],
            ].map((x, i) => (
              <button
                type="button"
                key={x[1]}
                className={demo === i ? 'active' : ''}
                onClick={() => setDemo(i)}
              >
                <span>{x[0]}</span>
                <h3>{x[1]}</h3>
                <p>{x[2]}</p>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
          <div className="demo-panel">
            <div className="demo-copy">
              <span className="tag">SIMULATED PRACTICE</span>
              <h3>
                {
                  [
                    'What makes a strong answer?',
                    'Tell me about a challenge you handled.',
                    'Your next improvement is clear.',
                  ][demo]
                }
              </h3>
              <p>
                {
                  [
                    'Start with intent, then use a structure that supports clarity—not a script to memorise.',
                    'Take a moment. Build your answer with context, your action, the reason and the outcome.',
                    'You gave useful context. Make your personal action more specific in your next response.',
                  ][demo]
                }
              </p>
              <button type="button" onClick={() => setModal('start')}>
                <Icon name="play" /> Preview this step
              </button>
            </div>
            <div className="wave-stage">
              <div className="orb">
                <span />
              </div>
              <div className="wave">
                {Array.from({ length: 24 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static chart data that never reorders and may repeat values.
                  <i key={i} style={{ '--h': `${18 + ((i * 17) % 54)}%` } as React.CSSProperties} />
                ))}
              </div>
              <small>{['LEARNING LAB', 'LISTENING', 'FEEDBACK READY'][demo]}</small>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section
          className="section"
          style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}
        >
          <div className="section-heading center">
            <div>
              <span className="kicker">FREQUENTLY ASKED QUESTIONS</span>
              <h2>Clear answers to common questions</h2>
            </div>
            <p>Everything you need to know about practice scores, AI rooms, and mentor sessions.</p>
          </div>

          <div style={{ display: 'grid', gap: '12px', marginTop: '30px' }}>
            {[
              {
                q: 'Does an AI mock interview score guarantee official selection?',
                a: 'No. A mock score is purely a structured educational diagnostic against an explicit rubric. It evaluates answer relevance, structure, technical reasoning, and clarity. It does not represent an official score or selection guarantee.',
              },
              {
                q: 'Are live mentor sessions recorded by default?',
                a: 'Recording is strictly OFF by default. It can only be activated when both the candidate and mentor explicitly give informed consent, and a persistent visual indicator remains on during the entire recording.',
              },
              {
                q: 'How are mentors verified on InterviewSetu?',
                a: 'Every mentor submits identity and employment/exam clearing documentation (such as service ID, appointment letter, or gazette notification). Authorised platform staff verify credentials before any public profile can accept bookings.',
              },
              {
                q: 'Can I practise by text if my microphone is not available?',
                a: 'Yes. The AI Interview Studio supports both real-time voice and typed response modes. You can switch between speech and text at any point during your practice session.',
              },
            ].map((faq) => (
              <details
                key={faq.q}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--brand-tint)',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  cursor: 'pointer',
                }}
              >
                <summary
                  style={{
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text)',
                    listStyle: 'none',
                  }}
                >
                  {faq.q}
                </summary>
                <p
                  style={{
                    marginTop: '10px',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta section" id="pricing">
          <span className="kicker light">YOUR NEXT ANSWER STARTS HERE</span>
          <h2>
            Preparation feels different
            <br />
            when every step connects.
          </h2>
          <p>Choose a track, practise at your pace, and know exactly what to work on next.</p>
          <Button onClick={() => setModal('start')}>Start your preparation</Button>
        </section>
      </main>

      <footer className="landing-footer">
        <Logo />
        <p>Learn how to answer. Practise with confidence. Improve with every interview.</p>
        <div>
          <a href="/interview-tracks">Tracks</a>
          <a href="/learn">Academy</a>
          <a href="/question-bank">Questions</a>
          <a href="/mentors">Mentors</a>
          <a href="/pricing">Pricing</a>
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="#top">Back to top ↑</a>
        </div>
        <small>© 2026 InterviewSetu · Full Full-Stack Production Release</small>
      </footer>

      {modal && (
        <Modal
          type={modal}
          close={() => setModal(null)}
          startCandidate={() => {
            setModal(null)
            setCandidateEntry('new')
            setExperience('candidate')
          }}
          startInterviewer={() => {
            setModal(null)
            setExperience('interviewer')
          }}
        />
      )}
    </div>
  )
}
