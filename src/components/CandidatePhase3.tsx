'use client'

import { CandidateSessionsManager } from './booking/CandidateSessionsManager'

import { useState } from 'react'
import { usePrototypeState } from './PrototypeState'

type Go = (page: string) => void

function PIcon({ name = 'arrow' }: { name?: string }) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>, check: <path d="m5 12 4 4L19 7"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
    bookmark: <path d="M6 4h12v17l-6-4-6 4Z"/>, play: <path d="m9 7 8 5-8 5Z"/>,
    book: <><path d="M4 5a3 3 0 0 1 3-3h5v18H7a3 3 0 0 0-3 2ZM20 5a3 3 0 0 0-3-3h-5v18h5a3 3 0 0 1 3 2Z"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l2-1-2-3-2 1.2a8 8 0 0 0-2.6-1.5L14 4h-4l-.4 2.2A8 8 0 0 0 7 7.7L5 6.5l-2 3 2 1v3l-2 1 2 3 2-1.2a8 8 0 0 0 2.6 1.5L10 20h4l.4-2.2a8 8 0 0 0 2.6-1.5l2 1.2 2-3Z"/></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name] || paths.arrow}</svg>
}

const Button = ({ children, onClick, quiet=false }: { children: React.ReactNode; onClick?:()=>void; quiet?:boolean }) =>
  <button className={`app-button ${quiet?'quiet':''}`} onClick={onClick}>{children}</button>

function Title({ eyebrow, title, copy, action }: { eyebrow:string; title:string; copy:string; action?:React.ReactNode }) {
  return <div className="app-page-title"><div className="app-title-text"><p>{eyebrow}</p><h1>{title}</h1><span>{copy}</span></div>{action&&<div className="app-title-actions">{action}</div>}</div>
}

const lessons: [string, string, string, number][] = [
  ['Build a confident self-introduction','Foundations','12 min',72],
  ['Explain your project with clarity','Communication','15 min',35],
  ['Use STAR without sounding scripted','Behavioural','10 min',100],
  ['Think aloud in technical interviews','Technical','18 min',0],
  ['Handle follow-up questions','Advanced','14 min',0],
  ['Structure balanced opinions','Government Interview','16 min',0],
]

export function Academy({ go }:{ go:Go }) {
  const [category,setCategory]=useState('All'), [search,setSearch]=useState('')
  const shown=lessons.filter(x=>(category==='All'||x[1]===category)&&x[0].toLowerCase().includes(search.toLowerCase()))
  return <><Title eyebrow="LEARNING ACADEMY" title="Build skills that transfer" copy="Short, practical lessons connected to your preparation plan." action={<Button onClick={()=>go('lesson')}>Continue learning <PIcon/></Button>}/>
    <section className="continue-learning"><div><span>CONTINUE LEARNING</span><h2>Build a confident self-introduction</h2><p>Next: connect your experience to the role without memorising a script.</p><i><em style={{width:'72%'}}/></i></div><strong>72%</strong><button onClick={()=>go('lesson')}><PIcon name="play"/></button></section>
    <div className="library-tools"><label><PIcon name="search"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search lessons"/></label><div>{['All','Foundations','Communication','Behavioural','Technical','Advanced'].map(x=><button className={category===x?'active':''} onClick={()=>setCategory(x)} key={x}>{x}</button>)}</div></div>
    <div className="lesson-grid">{shown.map((x,i)=><article key={x[0]}><div className={`lesson-art la${i%4}`}><span>{String(i+1).padStart(2,'0')}</span><PIcon name="book"/></div><div className="lesson-body"><span>{x[1]}</span><h3>{x[0]}</h3><p>{['Create a concise opening that sounds like you.','Turn project details into a clear, relevant story.','Use evidence and reflection in behavioural answers.'][i%3]}</p><div><small>{x[2]}</small><small>{x[3]===100?'Completed':x[3]?'In progress':'Not started'}</small></div>{x[3]>0&&<i><em style={{width:`${x[3]}%`}}/></i>}<button onClick={()=>go('lesson')}>{x[3]?'Resume lesson':'Start lesson'} <PIcon/></button></div></article>)}</div>
  </>
}

export function Lesson({ go }:{go:Go}) {
  const { update } = usePrototypeState()
  const [section,setSection]=useState(0), [answer,setAnswer]=useState(''), [result,setResult]=useState(''), [complete,setComplete]=useState(false)
  const sections=['Why introductions matter','A simple three-part structure','Make it relevant','Common mistakes','Practise and check']
  return <div className="lesson-layout"><aside><button onClick={()=>go('academy')}>← Back to academy</button><span>LESSON CONTENT</span>{sections.map((x,i)=><button className={section===i?'active':''} onClick={()=>setSection(i)} key={x}><i>{complete||i<section?<PIcon name="check"/>:i+1}</i>{x}</button>)}</aside><article>
    <div className="lesson-breadcrumb">FOUNDATIONS / COMMUNICATION</div><h1>Build a confident self-introduction</h1><div className="lesson-meta"><span>12 min</span><span>Beginner friendly</span><span>Updated lesson</span></div>
    <div className="lesson-hero"><span>THE GOAL</span><h2>Help the interviewer understand where you’re coming from—and where you want to go.</h2></div>
    <h2>What a strong introduction does</h2><p>A useful introduction is selective, relevant and conversational. It gives the interviewer a map for the discussion without listing your entire résumé.</p><div className="objective-box"><b>By the end, you will be able to:</b><p><PIcon name="check"/>Choose details that support your target role.</p><p><PIcon name="check"/>Connect your experience, strengths and direction.</p><p><PIcon name="check"/>Deliver the answer in 60–90 seconds.</p></div>
    <h2>A simple three-part structure</h2><div className="concept-steps">{[['01','Present','Who you are now and your current focus.'],['02','Proof','One or two experiences that shaped relevant skills.'],['03','Direction','Why this opportunity is a logical next step.']].map(x=><div key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div>
    <div className="example-panel"><span>ILLUSTRATIVE EXAMPLE</span><p>“I’m a final-year computer science student focused on building reliable web applications. During my capstone project, I led the API design and learned how much I enjoy turning unclear requirements into simple systems…”</p></div>
    <h2>Knowledge check</h2><p>Which opening is most useful for an interview introduction?</p><div className="quiz-options">{['My name is Aarav and I was born in…','I’m a final-year CS student focused on backend systems…','Everything is already written on my résumé…'].map((x,i)=><button className={result&&(i===1?'correct':answer===x?'wrong':'')} onClick={()=>setAnswer(x)} key={x}>{x}</button>)}</div>{result&&<div className="quiz-result"><b>{result}</b><p>A relevant present-day starting point gives the interviewer useful context.</p></div>}
    <div className="lesson-footer"><Button quiet onClick={()=>setResult(answer.includes('final-year')?'Correct — good choice.':'Not quite — try the role-relevant option.')}>Check answer</Button><Button onClick={()=>{setComplete(true);update({lessonComplete:true},'Candidate completed learning lesson');go('academy')}}>{complete?'Completed':'Mark lesson complete'} <PIcon name="check"/></Button></div>
  </article><aside className="learning-rail"><span>LEARNING ASSISTANT · DEMO</span><h3>Ask for another explanation</h3><textarea placeholder="What would you like explained differently?"/><button>Explain this concept</button><div><b>Your notes</b><textarea placeholder="Add a private note…"/></div></aside></div>
}

export function AnswerLab() {
  const [question, setQuestion] = useState('Tell me about a challenge you handled.')
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState(false)
  const [tab, setTab] = useState('Intent')
  const [savedDraft, setSavedDraft] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('Next edit: name the decision you made and include one concrete result.')
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Title eyebrow="ANSWER LEARNING LAB" title="Build an answer that sounds like you" copy="Understand the question, draft in steps, then improve with specific feedback."/>
      <div className="question-picker">
        <span>QUESTION</span>
        <select value={question} onChange={e => setQuestion(e.target.value)}>
          <option>Tell me about a challenge you handled.</option>
          <option>Why are you interested in this role?</option>
          <option>Explain a project you’re proud of.</option>
          <option>Tell me about yourself.</option>
        </select>
      </div>
      <div className="answer-lab">
        <section className="understand-panel">
          <div className="lab-tabs">
            {['Intent','Framework','Pitfalls','Examples'].map(x => (
              <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>{x}</button>
            ))}
          </div>
          <span className="label">WHAT THE INTERVIEWER IS LEARNING</span>
          <h2>
            {tab === 'Intent' ? 'How you respond when plans change.' : tab === 'Framework' ? 'Context → Action → Reason → Result' : tab === 'Pitfalls' ? 'Avoid vague team-level descriptions.' : 'Compare structure, not exact wording.'}
          </h2>
          <p>
            {tab === 'Intent' ? 'They want evidence of judgement, ownership and reflection—not a story where everything went perfectly.' : 'Use this as a flexible guide. Your answer should remain authentic and specific.'}
          </p>
          <div className="intent-points">
            {['A situation with meaningful difficulty','The action you personally took','Why you chose that response','The outcome and what you learned'].map((x, i) => (
              <div key={x}><span>{i + 1}</span>{x}</div>
            ))}
          </div>
          <div className="weak-example">
            <span>COMMON PITFALL</span>
            <p>“We had a problem, but we all worked hard and solved it.”</p>
            <small>Actions and evidence are unclear.</small>
          </div>
        </section>
        <section className="builder-panel">
          <div className="block-title">
            <div><span className="label">YOUR DRAFT</span><h2>Shape your response</h2></div>
            <small>{draft.trim() ? draft.trim().split(/\s+/).length : 0} words</small>
          </div>
          {[
            ['Context','What was happening and why did it matter?'],
            ['Your action','What did you personally decide or do?'],
            ['Evidence / result','What changed, and how do you know?'],
            ['Reflection','What did you learn or change afterward?']
          ].map((x, i) => (
            <label key={x[0]}>
              <span><b>{i + 1}</b>{x[0]}</span>
              <textarea onChange={e => { if (i === 0) setDraft(e.target.value) }} placeholder={x[1]}/>
            </label>
          ))}
          <div className="builder-actions">
            <button onClick={() => setSavedDraft(true)}>
              {savedDraft ? '✓ Draft saved' : 'Save draft'}
            </button>
            <button onClick={() => setFeedback(true)}>
              Get feedback <PIcon/>
            </button>
          </div>
          {feedback && (
            <div className="draft-feedback">
              <span><PIcon name="check"/></span>
              <div>
                <b>Strong start: the context is easy to follow.</b>
                <p>Next edit: name the decision you made and include one concrete result.</p>
                <button onClick={handleCopy}>
                  {copied ? '✓ Copied to clipboard' : 'Copy suggestion to clipboard'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

const questions = [
  ['Tell me about yourself.','Communication','Beginner'],
  ['Explain a difficult technical decision.','Software Engineering','Intermediate'],
  ['Describe a conflict within your team.','Behavioural','Intermediate'],
  ['Why are you interested in this role?','Motivation','Beginner'],
  ['How would you improve this product?','Product thinking','Advanced'],
  ['Explain your final-year project.','Project defence','Intermediate']
]

export function QuestionBank({ go }:{go:Go}) {
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState<number[]>([1])
  const [level, setLevel] = useState('All')
  const shown = questions.filter(x => x[0].toLowerCase().includes(search.toLowerCase()) && (level === 'All' || x[2] === level))
  return (
    <>
      <Title eyebrow="QUESTION BANK" title="Practise with purpose" copy="Explore reviewed sample prompts by track, topic and difficulty." action={<Button onClick={() => go('setup')}>Start quick practice</Button>}/>
      <div className="bank-layout">
        <aside>
          <span>FILTER QUESTIONS</span>
          <label>
            Difficulty
            <select value={level} onChange={e => setLevel(e.target.value)}>
              <option>All</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <label>
            Track
            <select>
              <option>All tracks</option>
              <option>Software Engineering</option>
              <option>Communication</option>
            </select>
          </label>
          <label className="check-row"><input type="checkbox"/> Saved only</label>
          <button onClick={() => setLevel('All')}>Clear filters</button>
        </aside>
        <section>
          <div className="bank-tools">
            <label>
              <PIcon name="search"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions"/>
            </label>
            <span>{shown.length} questions</span>
            <button>Most relevant ⌄</button>
          </div>
          <div className="question-list">
            {shown.map((x, i) => (
              <article key={x[0]} onClick={() => go('question')}>
                <div><span>{x[1]}</span><span>{x[2]}</span></div>
                <h3>{x[0]}</h3>
                <p>Use this prompt to practise a clear, evidence-based response.</p>
                <footer>
                  <button onClick={e => { e.stopPropagation(); setSaved(s => s.includes(i) ? s.filter(n => n !== i) : [...s, i]) }} className={saved.includes(i) ? 'saved' : ''}>
                    <PIcon name="bookmark"/>{saved.includes(i) ? 'Saved' : 'Save'}
                  </button>
                  <button onClick={e => { e.stopPropagation(); go('setup') }}>Practise <PIcon/></button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

export function QuestionDetail({ go }:{go:Go}) {
  const [example, setExample] = useState(false)
  const [reported, setReported] = useState(false)
  const [saved, setSaved] = useState(false)
  const [added, setAdded] = useState(false)

  return (
    <>
      <button className="back-link" onClick={() => go('questions')}>← Back to question bank</button>
      <section className="question-detail-hero">
        <div>
          <span>SOFTWARE ENGINEERING · INTERMEDIATE</span>
          <h1>Explain a difficult technical decision you made.</h1>
          <p>Estimated response: 2–3 minutes · Sample practice question</p>
        </div>
        <div>
          <Button quiet onClick={() => setSaved(!saved)}>
            <PIcon name="bookmark"/> {saved ? 'Saved ✓' : 'Save'}
          </Button>
          <Button onClick={() => go('setup')}>Start AI practice <PIcon/></Button>
        </div>
      </section>
      <div className="question-detail-layout">
        <article>
          <h2>Why this question is asked</h2>
          <p>Interviewers use this prompt to understand how you evaluate alternatives, handle constraints and take ownership of technical choices.</p>
          <h2>What to include</h2>
          <div className="include-grid">
            {['The decision and why it mattered','Alternatives you considered','Constraints and trade-offs','Your reasoning and evidence','The outcome','What you would change now'].map((x, i) => (
              <div key={x}><span>{i + 1}</span>{x}</div>
            ))}
          </div>
          <h2>A useful answer structure</h2>
          {[
            ['Context','Briefly explain the project and decision.'],
            ['Options','Name the realistic alternatives.'],
            ['Reasoning','Show how constraints shaped your choice.'],
            ['Outcome','Share evidence and reflection.']
          ].map(x => (
            <div className="structure-row" key={x[0]}><b>{x[0]}</b><p>{x[1]}</p></div>
          ))}
          <button className="example-toggle" onClick={() => setExample(!example)}>
            See illustrative example <span>{example ? '−' : '+'}</span>
          </button>
          {example && (
            <div className="example-panel">
              <span>ILLUSTRATIVE — NOT A SCRIPT</span>
              <p>“While designing our project API, I had to choose between a flexible document model and a relational schema. Because reporting accuracy mattered more than rapid schema changes…”</p>
            </div>
          )}
        </article>
        <aside>
          <span>ADD TO YOUR PLAN</span>
          <h3>Practise this question later</h3>
          <p>Save it to this week’s preparation tasks.</p>
          <button onClick={() => setAdded(true)}>
            {added ? '✓ Added to preparation plan' : '+ Add to preparation plan'}
          </button>
          <hr/>
          <button onClick={() => setReported(true)}>Report an issue</button>
          {reported && <small>Thanks. Your demo report was recorded.</small>}
        </aside>
      </div>
    </>
  )
}

export function Profile() {
  const tabs = ['Personal','Education','Experience & Projects','Skills','Resume files','Preferences','Privacy']
  const [tab, setTab] = useState('Personal')
  const [saved, setSaved] = useState(false)
  const [cvUploaded, setCvUploaded] = useState(false)
  const [exported, setExported] = useState(false)
  const [deleteWarning, setDeleteWarning] = useState(false)

  return (
    <>
      <Title eyebrow="RESUME & PROFILE LAB" title="Your interview context" copy="Keep details accurate so practice can stay relevant."/>
      <section className="profile-head">
        <div className="profile-avatar">AK</div>
        <div>
          <h2>Aarav Kumar <span>EMAIL VERIFIED</span></h2>
          <p>Software Engineering · Candidate profile</p>
        </div>
        <div><strong>68%</strong><span>Profile complete</span></div>
      </section>
      <div className="profile-layout">
        <aside>
          {tabs.map(x => (
            <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>{x}</button>
          ))}
        </aside>
        <section>
          <div className="block-title">
            <div>
              <span className="label">{tab.toUpperCase()}</span>
              <h2>{tab === 'Resume files' ? 'Resume files and insights' : tab === 'Privacy' ? 'Privacy and account data' : `${tab} information`}</h2>
            </div>
          </div>
          {tab === 'Resume files' ? (
            <>
              <div className="resume-upload">
                <PIcon name="book"/>
                <h3>Upload a résumé</h3>
                <p>PDF or DOCX · Maximum 5 MB · Prototype upload only</p>
                <button onClick={() => setCvUploaded(true)}>
                  {cvUploaded ? '✓ Aarav_Kumar_CV.pdf attached' : 'Choose file'}
                </button>
              </div>
              <div className="resume-insights">
                <span>ILLUSTRATIVE SUGGESTIONS</span>
                <p><PIcon name="check"/>Highlight outcomes where you have reliable measures.</p>
                <p><PIcon name="check"/>Prepare to explain your personal contribution to listed projects.</p>
                <p><PIcon name="check"/>Review follow-up questions for every skill you mention.</p>
              </div>
            </>
          ) : tab === 'Privacy' ? (
            <>
              <div className="privacy-row">
                <span><b>Practice data</b><small>Use saved answers to personalise recommendations.</small></span>
                <input type="checkbox" defaultChecked/>
              </div>
              <div className="privacy-row">
                <span><b>Recording consent</b><small>Off by default. Required separately for applicable mentor sessions.</small></span>
                <input type="checkbox"/>
              </div>
              <div className="danger-zone">
                <b>Export or delete account data</b>
                <p>Export requests and account deletion require identity confirmation.</p>
                <button onClick={() => setExported(true)}>
                  {exported ? '✓ Export queued to your email' : 'Request data export'}
                </button>
                <button onClick={() => setDeleteWarning(true)}>Delete account</button>
                {deleteWarning && (
                  <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '6px' }}>
                    Demo protection: account deletion is disabled in this preview environment.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="profile-form">
              <label>Full name<input defaultValue="Aarav Kumar"/></label>
              <label>Email address<input defaultValue="aarav@example.com"/></label>
              <label>Current status<select><option>Final-year student</option><option>Working professional</option></select></label>
              <label>Target role<input defaultValue="Software Engineer"/></label>
              <label className="full">Short background<textarea defaultValue="Computer science student focused on backend development and reliable web applications."/></label>
            </div>
          )}
          <div className="save-row">
            <Button onClick={() => setSaved(true)}>Save changes</Button>
            {saved && <span><PIcon name="check"/> Changes saved</span>}
          </div>
        </section>
      </div>
    </>
  )
}

export function Saved({ go }:{go:Go}) {
  const [tab, setTab] = useState('Questions')
  const [removed, setRemoved] = useState<string[]>([])
  const data: Record<string,string[]> = {
    Questions: ['Explain a difficult technical decision.','Tell me about a challenge you handled.','Why are you interested in this role?'],
    Lessons: ['Build a confident self-introduction','Use STAR without sounding scripted'],
    Answers: ['Project challenge — draft 2'],
    Tracks: ['Software Engineering','Communication & Structure']
  }
  return (
    <>
      <Title eyebrow="SAVED ITEMS" title="Your preparation library" copy="Questions, lessons and drafts you chose to keep."/>
      <div className="app-tabs">
        {Object.keys(data).map(x => (
          <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>{x}</button>
        ))}
      </div>
      <section className="saved-list">
        {data[tab].filter(x => !removed.includes(x)).map((x, i) => (
          <div key={x}>
            <span className="saved-icon">{String(i + 1).padStart(2, '0')}</span>
            <span><b>{x}</b><small>{tab.slice(0, -1)} · Saved recently</small></span>
            <button onClick={() => go(tab === 'Lessons' ? 'lesson' : tab === 'Questions' ? 'question' : 'academy')}>Open</button>
            <button onClick={() => setRemoved([...removed, x])}>Remove</button>
          </div>
        ))}
        {data[tab].every(x => removed.includes(x)) && (
          <div className="empty-state">
            <PIcon name="bookmark"/>
            <h3>No saved {tab.toLowerCase()}</h3>
            <p>Items you save will appear here.</p>
          </div>
        )}
      </section>
      {removed.length > 0 && (
        <div className="undo-toast">
          Item removed <button onClick={() => setRemoved([])}>Undo</button>
        </div>
      )}
    </>
  )
}

export function Sessions({ go }:{go:Go}) {
  return <CandidateSessionsManager />;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unused = () => {
  const [tab, setTab] = useState('Upcoming')
  const [booking, setBooking] = useState(false)
  const [step, setStep] = useState(1)
  if (booking) return <Booking step={step} setStep={setStep} close={() => setBooking(false)}/>
  return (
    <>
      <Title eyebrow="HUMAN MOCK INTERVIEWS" title="My mentor sessions" copy="Prepare for upcoming sessions and revisit completed feedback." action={<Button onClick={() => setBooking(true)}>Book a mentor</Button>}/>
      <div className="app-tabs">
        {['Upcoming','Completed','Cancelled'].map(x => (
          <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>{x}</button>
        ))}
      </div>
      {tab === 'Upcoming' ? (
        <section className="session-card-app">
          <div className="mentor-avatar">RM</div>
          <div>
            <span>CONFIRMED · SAMPLE BOOKING</span>
            <h2>Project Defence Mock Interview</h2>
            <p>Riya Mehta · Software Engineering mentor example</p>
            <div><b>18 June 2025</b><b>6:00 PM IST</b><b>45 minutes</b></div>
          </div>
          <aside>
            <button onClick={() => go('sessionDetail')}>View details</button>
            <button onClick={() => setBooking(true)}>Reschedule</button>
            <small>Join becomes available near the session time.</small>
          </aside>
        </section>
      ) : (
        <section className="empty-state">
          <PIcon name={tab === 'Completed' ? 'check' : 'clock'}/>
          <h3>No {tab.toLowerCase()} sessions</h3>
          <p>{tab === 'Completed' ? 'Completed sessions and feedback will appear here.' : 'Cancelled sessions remain visible for your records.'}</p>
        </section>
      )}
      <section className="prep-checklist">
        <span className="label">PREPARATION CHECKLIST</span>
        <h2>Get ready for your next human mock</h2>
        {['Confirm your focus areas','Share relevant project context','Review cancellation and recording preferences'].map((x, i) => (
          <label key={x}>
            <input type="checkbox" defaultChecked={i === 0}/>
            <span><b>{x}</b><small>{i === 0 ? 'Complete' : 'Recommended before 18 June'}</small></span>
          </label>
        ))}
      </section>
    </>
  );
  };
}

function Booking({ step, setStep, close }:{step:number;setStep:(n:number)=>void;close:()=>void}) {
  const { update } = usePrototypeState()
  const labels = ['Format','Time','Preparation','Review','Payment','Confirmed']
  return (
    <>
      <button className="back-link" onClick={close}>← Back to sessions</button>
      <Title eyebrow="DEMO BOOKING" title={step === 6 ? 'Your sample booking is confirmed' : 'Book a mentor session'} copy="No real availability or payment is connected in this prototype."/>
      <div className="booking-steps">
        {labels.map((x, i) => (
          <span className={step >= i + 1 ? 'active' : ''} key={x}><i>{step > i + 1 ? '✓' : i + 1}</i>{x}</span>
        ))}
      </div>
      <section className="booking-panel">
        {step === 1 && (
          <>
            <h2>Choose a session format</h2>
            <div className="package-grid">
              {[['Focused feedback','30 min','₹799'],['Full mock interview','45 min','₹1,199'],['Mock + written report','60 min','₹1,699']].map((x, i) => (
                <button className={i === 1 ? 'active' : ''} key={x[0]}>
                  <span>DEMO PACKAGE</span>
                  <h3>{x[0]}</h3>
                  <p>{x[1]} · Video session</p>
                  <strong>{x[2]}</strong>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Select sample date and time</h2>
            <div className="slot-grid">
              {['Tue 18 · 4:30 PM','Tue 18 · 6:00 PM','Wed 19 · 5:00 PM','Thu 20 · 7:30 PM'].map((x, i) => (
                <button className={i === 1 ? 'active' : ''} key={x}>{x}</button>
              ))}
            </div>
            <p className="form-note">Timezone: India Standard Time (IST). Availability is illustrative.</p>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Share your preparation goal</h2>
            <div className="profile-form">
              <label>Target role<input defaultValue="Software Engineer"/></label>
              <label>Focus area<input defaultValue="Project explanation"/></label>
              <label className="full">Notes for mentor<textarea placeholder="What would make this session useful?"/></label>
              <label className="full check-row"><input type="checkbox"/> I consent to sharing this preparation brief with the mentor.</label>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <h2>Review sample booking</h2>
            <dl className="booking-review">
              <div><dt>Session</dt><dd>Full mock interview</dd></div>
              <div><dt>Mentor</dt><dd>Riya Mehta · Profile example</dd></div>
              <div><dt>When</dt><dd>18 June · 6:00 PM IST</dd></div>
              <div><dt>Total</dt><dd>₹1,199 demo amount</dd></div>
            </dl>
          </>
        )}
        {step === 5 && (
          <>
            <h2>Demo checkout</h2>
            <div className="demo-checkout">
              <PIcon name="card"/>
              <div>
                <b>No payment will be processed</b>
                <p>This step demonstrates loading, success and retry placement only.</p>
              </div>
            </div>
            <label className="check-row"><input type="checkbox"/> I understand this is a simulated booking.</label>
          </>
        )}
        {step === 6 && (
          <div className="booking-success">
            <span><PIcon name="check"/></span>
            <h2>Booking reference: DEMO-IS-1842</h2>
            <p>18 June 2025 · 6:00 PM IST · Full mock interview</p>
          </div>
        )}
        <footer>
          {step > 1 && step < 6 && <Button quiet onClick={() => setStep(step - 1)}>Back</Button>}
          <Button onClick={() => step === 6 ? close() : (step === 5 ? (update({ bookingStatus: 'confirmed' }, 'Candidate completed demo mentor booking'), setStep(6)) : setStep(step + 1))}>
            {step === 5 ? 'Confirm demo booking' : step === 6 ? 'View my sessions' : 'Continue'} <PIcon/>
          </Button>
        </footer>
      </section>
    </>
  )
}

export function SessionDetail() {
  const [cancel, setCancel] = useState(false)
  const [review, setReview] = useState(false)
  const [rescheduled, setRescheduled] = useState(false)

  return (
    <>
      <Title eyebrow="BOOKING / DEMO-IS-1842" title="Project Defence Mock Interview" copy="Confirmed · Sample booking"/>
      <div className="booking-detail">
        <section>
          <div className="detail-mentor">
            <div className="mentor-avatar">RM</div>
            <div>
              <span>MENTOR PROFILE EXAMPLE</span>
              <h2>Riya Mehta</h2>
              <p>Software Engineering · Project Defence</p>
            </div>
          </div>
          <div className="detail-time">
            <span><small>DATE</small><b>Wednesday, 18 June</b></span>
            <span><small>TIME</small><b>6:00 PM IST</b></span>
            <span><small>DURATION</small><b>45 minutes</b></span>
          </div>
          <h3>Status timeline</h3>
          <div className="status-line">
            {['Booked','Confirmed','Session','Feedback'].map((x, i) => (
              <span className={i < 2 ? 'done' : ''} key={x}><i>{i < 2 ? '✓' : i + 1}</i>{x}</span>
            ))}
          </div>
          <h3>Your preparation brief</h3>
          <p className="detail-copy">Focus on explaining project architecture, personal contribution and technical trade-offs.</p>
        </section>
        <aside>
          <span>SESSION ACTIONS</span>
          <Button quiet onClick={() => setRescheduled(true)}>
            {rescheduled ? 'Reschedule requested ✓' : 'Reschedule'}
          </Button>
          <Button quiet onClick={() => setCancel(true)}>Cancel session</Button>
          <hr/>
          <button onClick={() => setReview(!review)}>Recording & privacy preferences</button>
          {review && <p>Recording is off. Any change requires separate informed consent.</p>}
          <small>Join session becomes available near the configured start time.</small>
        </aside>
      </div>
      {cancel && (
        <div className="inline-warning">
          <b>Cancel this sample booking?</b>
          <p>Cancellation consequences depend on the configured platform policy. No payment or refund will occur in this demo.</p>
          <button onClick={() => setCancel(false)}>Keep session</button>
          <button onClick={() => setCancel(false)}>Confirm cancellation</button>
        </div>
      )}
    </>
  )
}

export function Notifications({ go }:{go?:Go}) {
  const [read, setRead] = useState<number[]>([2])
  const items = [
    ['Your mock report is ready','Project explanation mock · 74/100 illustrative score','Today, 10:42 AM'],
    ['Mentor session confirmed','Project Defence Mock · 18 June at 6:00 PM IST','Today, 9:15 AM'],
    ['Continue your preparation plan','Your next activity is a 12-minute guided practice.','Yesterday'],
    ['Lesson completed','Use STAR without sounding scripted','14 June']
  ]
  return (
    <>
      <Title eyebrow="NOTIFICATIONS" title="Stay on track" copy="Only useful preparation and session updates." action={<Button quiet onClick={() => setRead(items.map((_, i) => i))}>Mark all as read</Button>}/>
      <div className="notification-layout">
        <section>
          {items.map((x, i) => (
            <button className={read.includes(i) ? 'read' : ''} onClick={() => setRead([...read, i])} key={x[0]}>
              <span><PIcon name={i === 1 ? 'user' : i === 3 ? 'book' : 'bell'}/>{!read.includes(i) && <i/>}</span>
              <div><b>{x[0]}</b><p>{x[1]}</p><small>{x[2]}</small></div>
              <PIcon/>
            </button>
          ))}
        </section>
        <aside>
          <span>NOTIFICATION PREFERENCES</span>
          <p>Choose which reminders you receive. Marketing remains off unless you opt in.</p>
          <button onClick={() => go?.('settings')}>Manage preferences <PIcon/></button>
        </aside>
      </div>
    </>
  )
}

export function Billing() {
  const [modal, setModal] = useState(false)
  const [downloaded, setDownloaded] = useState<string | null>(null)
  return (
    <>
      <Title eyebrow="BILLING & PLAN" title="Your plan" copy="Prototype plan and usage data — no real transactions."/>
      <section className="plan-card">
        <div>
          <span>CURRENT DEMO PLAN</span>
          <h2>Practice Plus</h2>
          <p>AI practice, full reports and learning academy access.</p>
        </div>
        <div>
          <b>₹499</b>
          <span>/ month · demo</span>
          <Button onClick={() => setModal(true)}>Manage plan</Button>
        </div>
      </section>
      <div className="usage-grid">
        {[['AI mock minutes','165 of 300 min',55],['Detailed reports','8 of 15 reports',53],['Saved answers','6 of 25 drafts',24]].map(x => (
          <section key={x[0]}>
            <span>{x[0]}</span>
            <b>{x[1]}</b>
            <i><em style={{width:`${x[2]}%`}}/></i>
          </section>
        ))}
      </div>
      <section className="invoice-table">
        <div>
          <h2>Payment history</h2>
          <span>DEMO DATA</span>
        </div>
        <header>
          <span>Date</span>
          <span>Description</span>
          <span>Amount</span>
          <span>Status</span>
          <span/>
        </header>
        {[['01 Jun 2025','Practice Plus — sample','₹499','Demo paid'],['01 May 2025','Practice Plus — sample','₹499','Demo paid']].map(x => (
          <div key={x[0]}>
            {x.map(v => <span key={v}>{v}</span>)}
            <button onClick={() => setDownloaded(x[0])}>
              {downloaded === x[0] ? '✓ Downloaded' : 'Invoice'}
            </button>
          </div>
        ))}
      </section>
      {modal && (
        <div className="inline-warning">
          <b>Manage demo subscription</b>
          <p>Plan changes are simulated and will not create a charge.</p>
          <button onClick={() => setModal(false)}>Keep current plan</button>
          <button onClick={() => setModal(false)}>Switch demo plan</button>
        </div>
      )}
    </>
  )
}

export function Settings() {
  const { data, update } = usePrototypeState()
  const tabs=['Account','Notifications','Language & Accessibility','Privacy','Recording & Transcript','Security','Data & Account'],[tab,setTab]=useState('Account'),[saved,setSaved]=useState(false)
  return <><Title eyebrow="SETTINGS" title="Account and privacy" copy="Control notifications, accessibility, consent and your data."/><div className="settings-layout"><aside>{tabs.map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>)}</aside><section><span className="label">{tab.toUpperCase()}</span><h2>{tab}</h2>{tab==='Account'?<div className="profile-form"><label>Full name<input defaultValue="Aarav Kumar"/></label><label>Email<input defaultValue="aarav@example.com"/></label><label className="full">Interface language<select><option>English</option><option>Hindi</option></select></label></div>:tab==='Data & Account'?<div className="danger-zone"><b>Export your data</b><p>Request a copy of profile, practice and saved content data.</p><button onClick={()=>setSaved(true)}>Request export</button><hr/><b>Delete account</b><p>This is irreversible after identity confirmation and the configured waiting period.</p><input placeholder='Type "DELETE" to continue'/><button>Delete account</button></div>:<div className="setting-toggles">{(tab==='Notifications'?['Booking reminders','Learning plan reminders','Product updates','Marketing messages']:tab==='Privacy'?['Personalised recommendations','Share anonymous product analytics','Mentor preparation brief sharing']:tab==='Recording & Transcript'?['Save AI text transcripts','Allow mentor session recording','Auto-delete transcripts after 90 days']:tab==='Security'?['Email alerts for new sign-ins','Sign out other demo sessions']:['Reduced motion','Captions and transcripts','Higher contrast','Larger interface text']).map((x,i)=><label key={x}><span><b>{x}</b><small>{x.includes('Marketing')?'Off by default':x.includes('recording')?'Requires separate consent for every session':'You can change this any time.'}</small></span><input type="checkbox" checked={x==='Reduced motion'?data.reducedMotion:x==='Captions and transcripts'?data.captions:undefined} defaultChecked={x!=='Reduced motion'&&x!=='Captions and transcripts'&&!x.includes('Marketing')&&!x.includes('recording')?true:undefined} onChange={e=>x==='Reduced motion'?update({reducedMotion:e.target.checked},'Candidate updated reduced-motion preference'):x==='Captions and transcripts'?update({captions:e.target.checked},'Candidate updated transcript preference'):undefined}/></label>)}</div>}<div className="save-row"><Button onClick={()=>{setSaved(true);update({},'Candidate saved settings')}}>Save preferences</Button>{saved&&<span><PIcon name="check"/> Settings saved and applied</span>}</div></section></div></>
}

export function Phase3Page({page,go}:{page:string;go:Go}) {
  if(page==='academy')return <Academy go={go}/>
  if(page==='lesson')return <Lesson go={go}/>
  if(page==='answerLab')return <AnswerLab/>
  if(page==='questions')return <QuestionBank go={go}/>
  if(page==='question')return <QuestionDetail go={go}/>
  if(page==='profile')return <Profile/>
  if(page==='saved')return <Saved go={go}/>
  if(page==='sessions')return <Sessions go={go}/>
  if(page==='sessionDetail')return <SessionDetail/>
  if(page==='notifications')return <Notifications go={go}/>
  if(page==='billing')return <Billing/>
  return <Settings/>
}
