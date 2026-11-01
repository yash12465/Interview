'use client'

import { useState } from 'react'
import { Phase3Page } from './CandidatePhase3'
import { usePrototypeState } from './PrototypeState'
import { RoleSwitcher } from './ui/RoleSwitcher'

type Page = 'dashboard' | 'setup' | 'session' | 'report' | 'history' | 'progress' | 'preparation' | 'tracks' | 'academy' | 'lesson' | 'answerLab' | 'questions' | 'question' | 'profile' | 'saved' | 'sessions' | 'sessionDetail' | 'notifications' | 'billing' | 'settings'

const nav: [Page, string, string][] = [
  ['dashboard', 'Overview', 'grid'], ['preparation', 'My Preparation', 'calendar'],
  ['setup', 'AI Interview Studio', 'mic'], ['history', 'Interview History', 'clock'],
  ['progress', 'My Progress', 'chart'], ['tracks', 'My Tracks', 'target'],
  ['academy', 'Learning Academy', 'book'], ['answerLab', 'Answer Learning Lab', 'edit'],
  ['questions', 'Question Bank', 'help'], ['sessions', 'My Sessions', 'users'],
  ['profile', 'Resume & Profile', 'user'], ['saved', 'Saved Items', 'bookmark'],
  ['notifications', 'Notifications', 'bell'], ['billing', 'Billing & Plan', 'card'],
  ['settings', 'Settings', 'settings'],
]

function CIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
    mic: <><rect x="8" y="3" width="8" height="13" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m15 9 6-6M17 3h4v4"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    check: <path d="m5 12 4 4L19 7"/>,
    home: <><path d="m3 11 9-8 9 8v10H3Z"/><path d="M9 21v-6h6v6"/></>,
    pause: <><path d="M9 5v14M15 5v14"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    book: <><path d="M4 5a3 3 0 0 1 3-3h5v18H7a3 3 0 0 0-3 2ZM20 5a3 3 0 0 0-3-3h-5v18h5a3 3 0 0 1 3 2Z"/></>,
    edit: <><path d="m4 20 4-1 11-11-3-3L5 16Z"/><path d="m14 7 3 3"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1.3 1-1.3 2M12 17h.01"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    bookmark: <path d="M6 4h12v17l-6-4-6 4Z"/>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l2-1-2-3-2 1.2a8 8 0 0 0-2.6-1.5L14 4h-4l-.4 2.2A8 8 0 0 0 7 7.7L5 6.5l-2 3 2 1v3l-2 1 2 3 2-1.2a8 8 0 0 0 2.6 1.5L10 20h4l.4-2.2a8 8 0 0 0 2.6-1.5l2 1.2 2-3Z"/></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name] || paths.grid}</svg>
}

function AppButton({ children, onClick, quiet = false, disabled = false }: { children: React.ReactNode; onClick?: () => void; quiet?: boolean; disabled?: boolean }) {
  return <button className={`app-button ${quiet ? 'quiet' : ''}`} onClick={onClick} disabled={disabled}>{children}</button>
}

function Onboarding({ done, exit }: { done: () => void; exit: () => void }) {
  const [step, setStep] = useState(1)
  const [choice, setChoice] = useState('')
  const content = [
    { title: 'What are you preparing for?', sub: 'Choose the goal that matters most right now.', options: ['College placement or internship', 'Private-sector job', 'Government recruitment interview', 'Higher education / MBA / PhD', 'Career transition or promotion', 'Other'] },
    { title: 'Choose your preparation track', sub: 'You can add or switch tracks later without losing progress.', options: ['Software Engineering', 'Data Analyst', 'Business Analyst', 'UPSC Personality Test', 'Banking Officer Interview', 'I’m not sure yet'] },
    { title: 'How much have you practised?', sub: 'This helps us suggest a comfortable starting difficulty.', options: ['Beginner — little interview practice', 'Practising — some previous interviews', 'Experienced — preparing for a specific round'] },
    { title: 'How would you like to practise?', sub: 'Choose your preferred language and response format.', options: ['English · Voice and text', 'Hindi · Voice and text', 'Hinglish · Voice and text', 'English · Text only'] },
    { title: 'Tell us a little about your background', sub: 'Optional context makes prompts more relevant. You can skip this step.', options: ['Student or fresher', 'Working professional', 'Returning to work', 'Prefer to add this later'] },
    { title: 'What would you most like to improve?', sub: 'We’ll use this to build your first preparation plan.', options: ['Explain projects clearly', 'Answer structure', 'Technical confidence', 'Communication clarity', 'Subject knowledge', 'Confidence through practice'] },
  ][step - 1]
  const next = () => { if (step === 6) done(); else { setStep(step + 1); setChoice('') } }
  return <div className="onboard">
    <div className="onboard-top"><button onClick={exit} className="brand-compact"><span>IS</span> InterviewSetu</button><button onClick={exit}>Save & exit</button></div>
    <div className="onboard-progress"><i style={{ width: `${step / 6 * 100}%` }} /></div>
    <main className="onboard-card">
      <div className="step-meta"><span>STEP {step} OF 6</span><b>{['Goal', 'Track', 'Experience', 'Language & format', 'Background', 'Timeline'][step - 1]}</b></div>
      <h1>{content.title}</h1><p>{content.sub}</p>
      {step === 2 && <div className="onboard-search"><CIcon name="search" /><input placeholder="Search tracks" /></div>}
      <div className="choice-grid">{content.options.map((o, i) => <button className={choice === o ? 'selected' : ''} onClick={() => setChoice(o)} key={o}><span>{String(i + 1).padStart(2, '0')}</span><b>{o}</b>{choice === o && <i><CIcon name="check" /></i>}</button>)}</div>
      {step === 2 && <small className="stage-note">Interview stages vary by recruitment notification. Tracks are shown only where relevant.</small>}
      <div className="onboard-actions"><AppButton quiet onClick={() => step > 1 ? setStep(step - 1) : exit()}>{step > 1 ? 'Back' : 'Exit'}</AppButton><AppButton onClick={next} disabled={!choice}>{step === 6 ? 'Build my preparation plan' : 'Continue'} <CIcon name="arrow" /></AppButton></div>
    </main>
    <aside className="onboard-help"><span>Why we ask</span><p>Your choices personalise sample questions and recommendations. You can edit them any time.</p></aside>
  </div>
}

function Shell({ page, setPage, exit, children }: { page: Page; setPage: (p: Page) => void; exit: () => void; children: React.ReactNode }) {
  return <div className="candidate-shell">
    <aside className="app-sidebar">
      <button className="app-logo" onClick={exit}><span>IS</span><b>InterviewSetu</b></button>
      <div className="workspace-label">CANDIDATE SPACE</div>
      <nav>{nav.map(([key, label, icon]) => <button key={key} className={page === key || (key==='academy'&&page==='lesson') || (key==='questions'&&page==='question') || (key==='sessions'&&page==='sessionDetail') ? 'active' : ''} onClick={() => setPage(key)}><CIcon name={icon} /><span>{label}</span>{key === 'setup' && <i>AI</i>}</button>)}</nav>
      <div className="sidebar-bottom"><button onClick={() => setPage('profile')}><span className="avatar">AK</span><span><b>Aarav Kumar</b><small>Software Engineering</small></span></button><button onClick={() => { window.location.href = '/login' }}>Sign out</button></div>
    </aside>
    <section className="app-workspace">
      <header className="app-topbar">
        <div><small>CANDIDATE / {nav.find(n => n[0] === page)?.[1].toUpperCase()}</small></div>
        <RoleSwitcher currentRole="candidate" userName="Aarav Kumar" />
        <label><CIcon name="search"/><input placeholder="Search your preparation" /></label>
        <button className="top-icon" onClick={() => setPage('notifications')}><CIcon name="bell"/><i>2</i></button>
        <span className="avatar" onClick={() => setPage('profile')} style={{ cursor: 'pointer' }}>AK</span>
      </header>
      <main className="app-main page-enter" key={page}>{children}</main>
    </section>
  </div>
}

function Dashboard({ go }: { go: (p: Page) => void }) {
  return <>
    <div className="app-page-title"><div><p>MONDAY, 16 JUNE</p><h1>Good morning, Aarav.</h1><span>Your next step is to practise explaining your project clearly.</span></div><div><AppButton quiet onClick={() => go('preparation')}>View preparation plan</AppButton><AppButton onClick={() => go('setup')}>Start an AI mock <CIcon name="arrow"/></AppButton></div></div>
    <div className="track-context"><span>ACTIVE TRACK</span><button onClick={() => go('tracks')}>Software Engineering <b>⌄</b></button></div>
    <div className="kpi-row">{[['8','Mock interviews','2 this month'],['165','Practice minutes','35 this week'],['3','Topics to revisit','View priorities'],['6/10','Learning plan','60% complete']].map((x,i)=><button key={x[1]} onClick={()=>go(i===2?'progress':i===3?'preparation':'history')}><span className={`kpi-icon k${i}`}><CIcon name={['mic','clock','target','check'][i]}/></span><div><strong>{x[0]}</strong><b>{x[1]}</b><small>{x[2]}</small></div></button>)}</div>
    <div className="dashboard-grid">
      <section className="continue-card"><span className="label">CONTINUE YOUR PREPARATION</span><h2>Explain your project with clarity</h2><p>Build a concise story around the problem, your contribution, trade-offs and outcome.</p><div className="progress-line"><i style={{width:'62%'}} /></div><div className="continue-meta"><span><small>CURRENT PLAN</small><b>6 of 10 steps complete</b></span><span><small>NEXT ACTIVITY</small><b>12 min · Guided practice</b></span></div><AppButton onClick={() => go('setup')}>Continue practice <CIcon name="arrow"/></AppButton></section>
      <section className="next-card"><div className="mini-orb"/><span className="label">RECOMMENDED NEXT STEP</span><h3>Give clearer project explanations</h3><p>Your recent answers describe the team’s work well. Add more detail about your own decisions.</p><button onClick={() => go('setup')}>Practise this skill <CIcon name="arrow"/></button></section>
    </div>
    <section className="practice-choices"><div className="block-title"><h2>Choose your next practice</h2><button onClick={()=>go('preparation')}>View full plan</button></div><div>{[['05','Quick question','Warm up with one focused prompt.'],['20','AI mock interview','Practise a realistic sequence.'],['1:1','Human mentor session','Get personalised human feedback.']].map((x,i)=><button key={x[1]} onClick={()=>go(i<2?'setup':'preparation')}><strong>{x[0]}<small>{i<2?' MIN':''}</small></strong><h3>{x[1]}</h3><p>{x[2]}</p><CIcon name="arrow"/></button>)}</div></section>
    <div className="dashboard-grid lower"><section className="trend-card"><div className="block-title"><div><span className="label">PRACTICE TREND</span><h2>Structure is becoming clearer</h2></div><select><option>Last 6 sessions</option></select></div><div className="chart"><div className="chart-lines"/>{[48,55,52,63,68,74].map((v,i)=><span key={i} style={{height:`${v}%`}}><i>{v}</i></span>)}</div><div className="chart-labels"><span>May 04</span><span>May 12</span><span>May 19</span><span>May 28</span><span>Jun 07</span><span>Jun 14</span></div></section><section className="skills-card"><span className="label">SKILL BREAKDOWN</span><h2>Current focus areas</h2>{[['Relevance',78],['Structure',74],['Specificity',61],['Communication',82]].map(x=><div key={x[0]}><span><b>{x[0]}</b><small>{x[1]} / 100</small></span><i><em style={{width:`${x[1]}%`}}/></i></div>)}<button onClick={()=>go('progress')}>View detailed progress <CIcon name="arrow"/></button></section></div>
  </>
}

function AISetup({ start }: { start: () => void }) {
  const [track, setTrack] = useState('Software Engineering')
  const [mode, setMode] = useState('Realistic Mock')
  const [duration, setDuration] = useState('20 min')
  const [topic, setTopic] = useState('Project explanation')
  const [lang, setLang] = useState('English')
  const [level, setLevel] = useState('Intermediate')
  const [saved, setSaved] = useState(false)

  const cycleTrack = () => {
    const list = ['Software Engineering', 'Campus Placements', 'UPSC Personality Test', 'Banking Officer']
    const nextIdx = (list.indexOf(track) + 1) % list.length
    setTrack(list[nextIdx])
  }
  const cycleLang = () => {
    const list = ['English', 'Hindi', 'Hinglish']
    const nextIdx = (list.indexOf(lang) + 1) % list.length
    setLang(list[nextIdx])
  }
  const cycleLevel = () => {
    const list = ['Beginner', 'Intermediate', 'Advanced']
    const nextIdx = (list.indexOf(level) + 1) % list.length
    setLevel(list[nextIdx])
  }

  return (
    <>
      <div className="app-page-title">
        <div>
          <p>AI INTERVIEW STUDIO</p>
          <h1>Set up your next mock</h1>
          <span>Choose a format that matches what you want to practise today.</span>
        </div>
      </div>
      <div className="setup-layout">
        <div className="setup-form">
          <section>
            <span className="step-number">01</span>
            <div>
              <h2>Select your track</h2>
              <button className="select-field" onClick={cycleTrack}>
                {track} <b>⌄</b>
              </button>
            </div>
          </section>
          <section>
            <span className="step-number">02</span>
            <div>
              <h2>Choose interview mode</h2>
              <div className="option-cards">
                {['Learn-As-You-Go','Realistic Mock','Technical Deep Dive','Behavioural / HR','Panel Simulation','Resume-Based'].map(x => (
                  <button className={mode === x ? 'active' : ''} onClick={() => setMode(x)} key={x}>
                    <b>{x}</b>
                    <small>{x === 'Realistic Mock' ? 'Feedback at the end for a natural flow.' : 'Focused prompts with guided practice.'}</small>
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section>
            <span className="step-number">03</span>
            <div>
              <h2>Focus topics</h2>
              <div className="topic-chips">
                {['Project explanation','OOP & fundamentals','DBMS','DSA reasoning','Teamwork'].map(x => (
                  <button className={topic === x ? 'active' : ''} onClick={() => setTopic(x)} key={x}>
                    {x}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section>
            <span className="step-number">04</span>
            <div>
              <h2>Duration</h2>
              <div className="topic-chips">
                {['5 min sprint','10 min','20 min','30 min'].map(x => (
                  <button className={duration === x ? 'active' : ''} onClick={() => setDuration(x)} key={x}>
                    {x}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section>
            <span className="step-number">05</span>
            <div>
              <h2>Language & difficulty</h2>
              <div className="dual-fields">
                <button className="select-field" onClick={cycleLang}>
                  {lang} <b>⌄</b>
                </button>
                <button className="select-field" onClick={cycleLevel}>
                  {level} <b>⌄</b>
                </button>
              </div>
              <div className="demo-notice">
                Simulated AI interview with real-time turn analysis and rubric evaluation.
              </div>
            </div>
          </section>
        </div>
        <aside className="setup-summary">
          <span className="label">YOUR INTERVIEW</span>
          <h2>Ready when you are.</h2>
          <dl>
            <div><dt>Track</dt><dd>{track}</dd></div>
            <div><dt>Mode</dt><dd>{mode}</dd></div>
            <div><dt>Focus</dt><dd>{topic}</dd></div>
            <div><dt>Duration</dt><dd>{duration}</dd></div>
            <div><dt>Language</dt><dd>{lang}</dd></div>
            <div><dt>Difficulty</dt><dd>{level}</dd></div>
          </dl>
          <AppButton onClick={start}>Start interview <CIcon name="arrow"/></AppButton>
          <button className="save-setup" onClick={() => setSaved(true)}>
            {saved ? '✓ Setup saved for later' : 'Save setup for later'}
          </button>
          <small>Your demo answers remain in this browser session.</small>
        </aside>
      </div>
    </>
  )
}

function InterviewRoom({ complete, exit }: { complete: () => void; exit: () => void }) {
  const [state, setState] = useState<'ready'|'listening'|'saved'|'paused'>('ready')
  const [question, setQuestion] = useState(1)
  const [typed, setTyped] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [repeating, setRepeating] = useState(false)

  const questions = [
    'Tell me about a project where you made an important technical decision.',
    'What trade-off led you to choose that approach over alternative architectures?',
    'How did you measure whether your solution worked in production?'
  ]

  const handleRepeat = () => {
    setRepeating(true)
    setTimeout(() => setRepeating(false), 1500)
  }

  const save = () => {
    setState('saved')
    setTimeout(() => {
      if (question === 3) complete()
      else {
        setQuestion(question + 1)
        setState('ready')
        setTypedText('')
      }
    }, 900)
  }

  return (
    <div className="interview-room">
      <header>
        <button className="app-logo" onClick={exit}><span>IS</span><b>InterviewSetu</b></button>
        <div>
          <span>Software Engineering</span>
          <b>Realistic mock · Live AI session</b>
        </div>
        <div>
          <span>QUESTION {question} OF 3</span>
          <strong>08:42</strong>
          <button onClick={() => setState(state === 'paused' ? 'ready' : 'paused')}>
            <CIcon name="pause"/>
          </button>
          <button onClick={complete}>End interview</button>
        </div>
      </header>
      <main>
        <section className="interview-stage">
          <div className="room-status">
            <i className={state}/>
            {state === 'listening' ? 'Listening' : state === 'saved' ? 'Answer saved' : state === 'paused' ? 'Interview paused' : 'AI interviewer ready'}
          </div>
          <div className="room-orb"><span/><i/><em/></div>
          <div className="question-box">
            <small>CURRENT QUESTION</small>
            <h1>{questions[question - 1]}</h1>
            <button onClick={handleRepeat}>
              {repeating ? '🔊 Replaying question...' : 'Repeat question'}
            </button>
          </div>
          {state === 'paused' ? (
            <div className="paused-panel">
              <h2>Take your time.</h2>
              <p>Your place is saved. Resume whenever you’re ready.</p>
              <AppButton onClick={() => setState('ready')}>Resume interview</AppButton>
            </div>
          ) : (
            <div className="answer-controls">
              <button
                className={`mic-control ${state}`}
                onClick={() => state === 'listening' ? save() : setState('listening')}
                aria-label={state === 'listening' ? 'Stop and save answer' : 'Start speaking'}
              >
                <CIcon name={state === 'saved' ? 'check' : 'mic'}/>
              </button>
              <b>{state === 'listening' ? 'Stop and save answer' : state === 'saved' ? 'Response saved' : 'Start speaking'}</b>
              <span>or</span>
              <button onClick={() => setTyped(!typed)}>Type your answer</button>
              <button onClick={save}>I’m not sure</button>
            </div>
          )}
          {typed && (
            <div className="typed-answer">
              <textarea
                value={typedText}
                onChange={e => setTypedText(e.target.value)}
                placeholder="Type your answer here…"
                autoFocus
              />
              <div>
                <button onClick={() => setTyped(false)}>Cancel</button>
                <AppButton onClick={() => { setTyped(false); save() }}>Save answer</AppButton>
              </div>
            </div>
          )}
        </section>
        <aside className="transcript-panel">
          <div>
            <button className="active">Transcript</button>
            <button>Notes</button>
            <button>Questions</button>
          </div>
          <small>DEMO TRANSCRIPT</small>
          <p><b>Interviewer</b>{questions[question - 1]}</p>
          {question > 1 && (
            <p><b>You</b>In my final-year project, I chose to simplify the data model so the team could deliver a reliable first version…</p>
          )}
          {typedText && (
            <p><b>Drafting:</b> {typedText}</p>
          )}
          <textarea placeholder="Add a private note…"/>
          <div className="permission">
            <i/>
            <span><b>Microphone status</b><small>High fidelity audio stream ready.</small></span>
          </div>
        </aside>
      </main>
    </div>
  )
}

function Report({ go }: { go: (p: Page)=>void }) {
  const [exported, setExported] = useState(false)
  return (
    <>
      <div className="app-page-title report-title">
        <div>
          <p>REPORT / SOFTWARE ENGINEERING</p>
          <h1>Project explanation mock</h1>
          <span>16 June 2025 · 18 minutes · Realistic mock</span>
        </div>
        <AppButton quiet onClick={() => setExported(true)}>
          {exported ? '✓ Report exported' : 'Export demo report'}
        </AppButton>
      </div>
      <div className="report-summary">
        <div>
          <small>PRACTICE PERFORMANCE</small>
          <strong>74<span>/100</span></strong>
          <p>Illustrative practice score against calibrated rubric dimensions.</p>
        </div>
        {[['8/8','Questions completed'],['18m','Practice time'],['Ready','Report status']].map(x => (
          <div key={x[1]}>
            <strong>{x[0]}</strong>
            <span>{x[1]}</span>
          </div>
        ))}
      </div>
      <section className="executive">
        <span className="label">EXECUTIVE SUMMARY</span>
        <h2>Your answers were clear and relevant. The biggest opportunity is making your personal contribution more specific.</h2>
        <p>You explained the project context and outcome well. In follow-up questions, name the decision you owned and why you chose it.</p>
        <div>
          <AppButton onClick={() => go('setup')}>Practise weak areas</AppButton>
          <AppButton quiet onClick={() => go('setup')}>Retry similar mock</AppButton>
        </div>
      </section>
      <div className="report-columns">
        <section>
          <span className="label good">WHAT WORKED</span>
          {['Clear project context and goal','Calm, concise communication','Relevant answer to follow-ups'].map(x => (
            <p key={x}><CIcon name="check"/>{x}</p>
          ))}
        </section>
        <section>
          <span className="label warm">OPPORTUNITIES</span>
          {['Name your individual decisions','Explain one technical trade-off','Use a measurable outcome'].map((x, i) => (
            <p key={x}><b>0{i+1}</b>{x}</p>
          ))}
        </section>
      </div>
      <section className="dimension-card">
        <div>
          <span className="label">ILLUSTRATIVE PRACTICE RUBRIC</span>
          <h2>Skill dimensions</h2>
        </div>
        {[['Relevance',82],['Structure',74],['Specificity',61],['Technical accuracy',76],['Communication',81]].map(x => (
          <div key={x[0]}>
            <span>{x[0]}</span>
            <i><em style={{width:`${x[1]}%`}}/></i>
            <b>{x[1]}</b>
          </div>
        ))}
      </section>
      <section className="question-review">
        <span className="label">QUESTION-BY-QUESTION</span>
        <h2>Review your answers</h2>
        {['Tell me about a project where you made an important technical decision.','What trade-off led you to choose that approach?','How did you measure whether your solution worked?'].map((x, i) => (
          <details key={x} open={i===0}>
            <summary>
              <span>0{i+1}</span>
              <b>{x}</b>
              <em>{[76,69,78][i]} / 100</em>
            </summary>
            <div>
              <h4>Your answer</h4>
              <p>In my final-year project, I worked with the team to simplify our data model and deliver a more reliable first version.</p>
              <h4>Suggested improvement</h4>
              <p>Add the exact decision you owned, the alternative you considered, and one measurable outcome.</p>
              <button onClick={() => go('setup')}>Retry this question <CIcon name="arrow"/></button>
            </div>
          </details>
        ))}
      </section>
    </>
  )
}

function History({ go }: {go:(p:Page)=>void}) {
  const rows = [
    ['16 Jun','Project explanation','Realistic mock','18 min','74'],
    ['07 Jun','Technical fundamentals','Guided practice','22 min','68'],
    ['28 May','Behavioural & HR','Realistic mock','17 min','63'],
    ['19 May','Project defence','Quick practice','8 min','52']
  ]
  return (
    <>
      <div className="app-page-title">
        <div>
          <p>YOUR PRACTICE</p>
          <h1>Interview history</h1>
          <span>Review past sessions and retry with what you’ve learned.</span>
        </div>
        <AppButton onClick={() => go('setup')}>Start new mock</AppButton>
      </div>
      <div className="history-filters">
        <label>
          <CIcon name="search"/>
          <input placeholder="Search interviews"/>
        </label>
        {['All tracks','All modes','Last 3 months'].map(x => (
          <button key={x}>{x} ⌄</button>
        ))}
      </div>
      <section className="history-table">
        <header>
          <span>Date</span>
          <span>Focus area</span>
          <span>Mode</span>
          <span>Duration</span>
          <span>Practice score</span>
          <span/>
        </header>
        {rows.map(r => (
          <button onClick={() => go('report')} key={r[0]}>
            {r.map((x, i) => (
              <span key={x}>{i === 4 ? <b>{x}<small>/100</small></b> : x}</span>
            ))}
            <CIcon name="arrow"/>
          </button>
        ))}
      </section>
    </>
  )
}

function Progress({ go }: { go: (p: Page) => void }) {
  return (
    <>
      <div className="app-page-title">
        <div>
          <p>PROGRESS & ANALYTICS</p>
          <h1>See what’s changing</h1>
          <span>Practice metrics are guidance, not a prediction of selection outcomes.</span>
        </div>
        <div>
          <AppButton quiet>Last 90 days ⌄</AppButton>
        </div>
      </div>
      <div className="kpi-row">
        {[['8','Completed mocks','+3 recently'],['165m','Practice time','35m this week'],['12','Lessons completed','4 this month'],['5','Repeat practices','Strong habit']].map((x,i) => (
          <button key={x[1]} onClick={() => go(i === 2 ? 'academy' : i === 0 ? 'history' : 'setup')}>
            <span className={`kpi-icon k${i}`}><CIcon name={['mic','clock','check','target'][i]}/></span>
            <div><strong>{x[0]}</strong><b>{x[1]}</b><small>{x[2]}</small></div>
          </button>
        ))}
      </div>
      <section className="analytics-chart">
        <div className="block-title">
          <div>
            <span className="label">PRACTICE SCORE BY SESSION</span>
            <h2>Steady improvement across six sessions</h2>
          </div>
          <button>Overall score ⌄</button>
        </div>
        <div className="line-visual">
          <svg viewBox="0 0 700 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#665dff" stopOpacity=".22"/>
                <stop offset="1" stopColor="#665dff" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path className="area" d="M10 180 L145 150 L280 158 L415 110 L550 82 L690 45 L690 220 L10 220Z"/>
            <path className="line" d="M10 180 L145 150 L280 158 L415 110 L550 82 L690 45"/>
            {[[10,180],[145,150],[280,158],[415,110],[550,82],[690,45]].map((p,i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r="6"/>
            ))}
          </svg>
        </div>
      </section>
      <div className="skill-observations">
        {[
          ['Answer structure','Improving','Your answers now follow a clearer sequence.'],
          ['Role knowledge','Stable','Keep revisiting technical fundamentals.'],
          ['Specific examples','Needs practice','Add your action and measurable result.'],
          ['Communication clarity','Improving','Pacing and relevance are consistent.']
        ].map(x => (
          <section key={x[0]}>
            <span>{x[1]}</span>
            <h3>{x[0]}</h3>
            <p>{x[2]}</p>
            <button onClick={() => go('setup')}>Practise this skill <CIcon name="arrow"/></button>
          </section>
        ))}
      </div>
    </>
  )
}

function Preparation({ go }: { go: (p: Page) => void }) {
  const [tab, setTab] = useState('Plan')
  const [adjusted, setAdjusted] = useState(false)
  return (
    <>
      <div className="app-page-title">
        <div>
          <p>MY PREPARATION</p>
          <h1>Software Engineering plan</h1>
          <span>Flexible plan · 3 practice days per week</span>
        </div>
        <AppButton onClick={() => go('setup')}>Start next task</AppButton>
      </div>
      <div className="app-tabs">
        {['Plan','Weekly calendar','Milestones'].map(x => (
          <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>{x}</button>
        ))}
      </div>
      <div className="plan-layout">
        <section className="next-task">
          <span className="label">NEXT RECOMMENDED TASK</span>
          <div className="task-icon"><CIcon name="mic"/></div>
          <h2>Project explanation: guided mock</h2>
          <p>Practise giving context, naming your contribution and explaining the outcome.</p>
          <div><span>12 minutes</span><span>AI practice</span><span>Today</span></div>
          <AppButton onClick={() => go('setup')}>Start task <CIcon name="arrow"/></AppButton>
        </section>
        <section className="weekly-plan">
          <div className="block-title">
            <div>
              <span className="label">{tab.toUpperCase()}</span>
              <h2>{tab === 'Milestones' ? 'Your preparation milestones' : 'This week'}</h2>
            </div>
            <button onClick={() => setAdjusted(!adjusted)}>
              {adjusted ? 'Plan updated ✓' : 'Adjust plan'}
            </button>
          </div>
          {(tab === 'Milestones' ? ['Learn foundations','Complete initial mock','Review feedback','Meet a mentor','Retry weak areas'] : ['STAR method foundations','Project explanation practice','Review mock feedback','Technical fundamentals quiz','Retry weak-area question']).map((x, i) => (
            <div className={`plan-task ${i < 2 ? 'done' : ''}`} key={x}>
              <button><CIcon name={i < 2 ? 'check' : 'clock'}/></button>
              <span>
                <b>{x}</b>
                <small>{i < 2 ? 'Completed' : i === 2 ? 'Today · 15 min' : 'Later this week · 20 min'}</small>
              </span>
              <em>{i < 2 ? 'DONE' : i === 2 ? 'NEXT' : 'UPCOMING'}</em>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}

function Tracks({ go }: { go: (p: Page) => void }) {
  const [active, setActive] = useState('Software Engineering')
  const [showAdd, setShowAdd] = useState(false)
  const [list, setList] = useState([
    ['Software Engineering','62%','Last practised today'],
    ['Campus Placements','35%','Last practised 12 days ago'],
    ['Communication & Structure','20%','Last practised 3 weeks ago']
  ])

  const addGoal = (title: string) => {
    if (!list.find(item => item[0] === title)) {
      setList([...list, [title, '0%', 'Just added']])
    }
    setActive(title)
    setShowAdd(false)
  }

  return (
    <>
      <div className="app-page-title">
        <div>
          <p>MY TRACKS</p>
          <h1>Your preparation goals</h1>
          <span>Switch context without losing your interview history.</span>
        </div>
        <AppButton onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add preparation goal'}
        </AppButton>
      </div>
      {showAdd && (
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e6ed', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Choose goal to add:</span>
          {['UPSC Civil Services', 'Banking PO', 'Data Analytics', 'MBA Case Interviews'].map(g => (
            <button
              key={g}
              onClick={() => addGoal(g)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #dcd8ff', background: '#f5f3ff', color: '#5046e5', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >
              + {g}
            </button>
          ))}
        </div>
      )}
      <div className="my-tracks">
        {list.map((x, i) => (
          <section className={active === x[0] ? 'active' : ''} key={x[0]}>
            <div className={`track-letter t${i % 3}`}>{x[0][0]}</div>
            <span className="label">{active === x[0] ? 'ACTIVE TRACK' : 'SAVED TRACK'}</span>
            <h2>{x[0]}</h2>
            <p>{x[2]}</p>
            <div><i><em style={{width: x[1]}}/></i><b>{x[1]}</b></div>
            <button onClick={() => active === x[0] ? go('preparation') : setActive(x[0])}>
              {active === x[0] ? 'View preparation plan' : 'Set as active'} <CIcon name="arrow"/>
            </button>
          </section>
        ))}
      </div>
      <section className="archived">
        <h2>Archived tracks</h2>
        <p>No archived tracks. Archived goals remain accessible and never erase your history.</p>
      </section>
    </>
  )
}

export default function CandidateApp({ exit, startFresh = false }: { exit: () => void; startFresh?: boolean }) {
  const { data, update } = usePrototypeState()
  const [onboarded, setOnboarded] = useState(startFresh ? false : data.onboardingComplete)
  const [page, setPage] = useState<Page>('dashboard')

  if (!onboarded) {
    return <Onboarding done={() => { setOnboarded(true); update({ onboardingComplete: true }, 'Candidate completed onboarding') }} exit={exit}/>
  }
  if (page === 'session') {
    return <InterviewRoom complete={() => { update({ completedMocks: data.completedMocks + 1 }, 'Candidate completed AI mock'); setPage('report') }} exit={() => setPage('dashboard')}/>
  }

  const view = page === 'dashboard' ? <Dashboard go={setPage}/>
    : page === 'setup' ? <AISetup start={() => setPage('session')}/>
    : page === 'report' ? <Report go={setPage}/>
    : page === 'history' ? <History go={setPage}/>
    : page === 'progress' ? <Progress go={setPage}/>
    : page === 'preparation' ? <Preparation go={setPage}/>
    : page === 'tracks' ? <Tracks go={setPage}/>
    : <Phase3Page page={page} go={p => setPage(p as Page)}/>

  return <Shell page={page} setPage={setPage} exit={exit}>{view}</Shell>
}
