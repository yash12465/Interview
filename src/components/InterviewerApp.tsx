'use client'

import { InterviewerScheduleManager } from './booking/InterviewerScheduleManager'
import { NotificationBell } from './ui/NotificationBell'

import { InterviewerProfileEditor } from './profile/InterviewerProfileEditor'

import React, { useState } from 'react'
import { usePrototypeState } from './PrototypeState'
import { RoleSwitcher } from './ui/RoleSwitcher'
import { useAuth } from '@/lib/supabase/use-auth'
import { InterviewerApprovalBanner } from './auth/InterviewerApprovalBanner'

type Page='dashboard'|'bookings'|'booking'|'calendar'|'session'|'feedback'|'candidates'|'profile'|'expertise'|'services'|'earnings'|'reviews'|'notifications'|'settings'

function IIcon({name}:{name:string}){
  const p:Record<string,React.ReactNode>={
    grid:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
    users:<><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/></>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    card:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></>,
    chart:<><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
    star:<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.7l6.2-.9Z"/>,
    bell:<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l2-1-2-3-2 1a8 8 0 0 0-3-1.7L14 3h-4L9.6 5A8 8 0 0 0 7 6.5L5 5.5l-2 3 2 2v3l-2 2 2 3 2-1a8 8 0 0 0 3 1.7l.4 2h4l.4-2a8 8 0 0 0 3-1.7l2 1 2-3-2-2Z"/></>,
    arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,check:<path d="m5 12 4 4L19 7"/>,mic:<><rect x="8" y="3" width="8" height="13" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
    camera:<><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>,search:<><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{p[name]||p.grid}</svg>
}
const Btn=({children,onClick,quiet=false,disabled=false}:{children:React.ReactNode;onClick?:()=>void;quiet?:boolean;disabled?:boolean})=><button className={`app-button ${quiet?'quiet':''}`} onClick={onClick} disabled={disabled}>{children}</button>

function Application({finish,exit}:{finish:()=>void;exit:()=>void}){
  const { data, update } = usePrototypeState()
  const [step,setStep]=useState(1),[selected,setSelected]=useState<string[]>([]),[submitted,setSubmitted]=useState(false)
  const titles=['Account & identity','Expertise & categories','Qualifications & evidence','Public profile','Availability & services','Review & submit']
  const toggle=(x:string)=>setSelected(s=>s.includes(x)?s.filter(v=>v!==x):[...s,x])
  if(data.interviewerStatus!=='draft'||submitted)return <div className="interviewer-status"><button className="app-logo dark" onClick={exit}><span>IS</span><b>InterviewSetu</b></button><div className="status-hero"><span><IIcon name="check"/></span><p>APPLICATION SUBMITTED</p><h1>{data.interviewerStatus==='approved'?'Your application is approved.':data.interviewerStatus==='needs-information'?'More information is needed.':data.interviewerStatus==='not-approved'?'Application decision available.':'Your application is under review.'}</h1><p>Reference: <b>DEMO-INT-2048</b> · Submitted just now</p></div><section><div className="status-timeline">{['Submitted','Under review','Decision'].map((x,i)=><div className={i===0?'active':''} key={x}><i>{i===0?'✓':i+1}</i><b>{x}</b><small>{i===0?'Complete':'No timing promised'}</small></div>)}</div><h2>What happens next</h2><p>Your profile and evidence are read-only while under review. If more information is needed, it will appear in this status centre.</p><div style={{display:'flex',gap:'10px'}}><Btn quiet onClick={()=>setSubmitted(false)}>View application</Btn><Btn onClick={finish}>Open approved workspace <IIcon name="arrow"/></Btn></div><small>Prototype control: workspace preview allows testing verified interviewer tools.</small></section></div>
  return <div className="application-shell"><header><button className="app-logo dark" onClick={exit}><span>IS</span><b>InterviewSetu</b></button><div><small>INTERVIEWER APPLICATION</small><b>{titles[step-1]}</b></div><span>Saved just now · Prototype</span><div style={{display:'flex',gap:'8px'}}><button onClick={finish} style={{fontWeight:600,color:'#818cf8'}}>Skip to workspace →</button><button onClick={exit}>Save & exit</button></div></header><div className="application-progress">{titles.map((x,i)=><button className={step===i+1?'active':step>i+1?'done':''} onClick={()=>setStep(i+1)} key={x}><i>{step>i+1?'✓':i+1}</i><span>{x}</span></button>)}</div><main><section className="application-form"><div className="application-title"><span>STEP {step} OF 6</span><h1>{titles[step-1]}</h1><p>{['Tell us who you are. Private verification fields are never shown publicly.','What interviews can you confidently conduct?','Help candidates understand your relevant background.','Shape what candidates see before they book.','Define when and how you would conduct sessions.','Check every section before submitting.'][step-1]}</p></div>
    {step===1&&<div className="form-grid"><label>Legal / full name <small>Private verification field</small><input defaultValue="Riya Mehta"/></label><label>Display name <small>Shown publicly</small><input defaultValue="Riya Mehta"/></label><label>Email <small>Verified</small><input defaultValue="riya@example.com"/></label><label>Professional title<input defaultValue="Senior Software Engineer"/></label><label>Country / timezone<select><option>India · Asia/Kolkata</option></select></label><label>Short headline<input defaultValue="Technical mock interviews & project defence"/></label><div className="upload-field full"><span>RM</span><div><b>Profile photo</b><small>JPG or PNG · Public after approval</small></div><button onClick={()=>alert('Demo: Profile photo attached.')}>Choose image</button></div></div>}
    {step===2&&<><h3 className="form-section-title">Interviewer identity</h3><div className="select-cards">{['Professional / Hiring practitioner','Examination-cleared candidate','Subject-matter expert / Faculty','Communication or career coach'].map(x=><button className={selected.includes(x)?'active':''} onClick={()=>toggle(x)} key={x}><i>{selected.includes(x)?'✓':'+'}</i><b>{x}</b></button>)}</div><h3 className="form-section-title">Categories</h3><label className="category-search"><IIcon name="search"/><input placeholder="Search admin-configured categories"/></label><div className="category-tree">{['Software & IT','Data & Analytics','College Placements','Business & Management','Communication & Group Discussions'].map((x,i)=><button className={i<2?'active':''} onClick={()=>toggle(x)} key={x}><span>{x}</span><small>{i===0?'Frontend · Backend · System Design':'View subcategories'}</small><i>{i<2?'✓':'+'}</i></button>)}</div><h3 className="form-section-title">Formats, level and language</h3><div className="application-chips">{['Technical round','Behavioural','Resume review','Single interviewer','Intermediate','Advanced','English','Hindi'].map(x=><button className={selected.includes(x)?'active':''} onClick={()=>toggle(x)} key={x}>{x}</button>)}</div></>}
    {step===3&&<><div className="verify-note"><b>Verification is private and reviewed by authorised staff.</b><p>Sensitive documents are never displayed on your public profile.</p></div><div className="form-grid"><label>Organisation <small>Private</small><input defaultValue="Sample Technology Company"/></label><label>Current role<input defaultValue="Senior Software Engineer"/></label><label>Years in role<select><option>5–7 years</option></select></label><label>Primary domain<input defaultValue="Backend systems"/></label></div><div className="evidence-upload"><IIcon name="card"/><div><b>Employment evidence</b><p>PDF · Maximum 5 MB · Prototype upload</p></div><button onClick={()=>alert('Demo: Document uploaded successfully.')}>Upload file</button></div><div className="uploaded-file"><span>PDF</span><div><b>employment-letter-sample.pdf</b><small>1.2 MB · Ready for private review</small></div><em>Uploaded</em><button onClick={()=>alert('Document removed.')}>Remove</button></div><label className="consent-check"><input type="checkbox" defaultChecked/> I confirm I have permission to share this document for verification.</label></>}
    {step===4&&<div className="profile-edit"><div className="form-grid"><label>Professional headline<input defaultValue="Senior Software Engineer | Technical Mock Interviews"/></label><label>Languages<input defaultValue="English, Hindi"/></label><label className="full">About / bio<textarea defaultValue="I help early-career engineers explain projects, reason through trade-offs and respond confidently to technical follow-up questions."/></label><label className="full">What candidates should prepare<textarea defaultValue="Bring one project you can discuss in detail and the target role description."/></label><label className="full">Session includes<textarea defaultValue="Realistic questions, spoken feedback and clear next practice steps."/></label><label className="full">Limits / disclaimer<textarea defaultValue="Independent practice guidance. I do not represent an official hiring or examination board and cannot guarantee outcomes."/></label></div><ProfilePreview/></div>}
    {step===5&&<><div className="availability-builder"><div className="block-title"><div><span>TIMEZONE</span><h2>Asia/Kolkata · IST</h2></div><button onClick={()=>alert('Typical weekday evening hours applied.')}>Use typical hours</button></div>{['Monday','Tuesday','Wednesday','Thursday','Friday'].map((x,i)=><div key={x}><b>{x}</b>{i<4?<><span>5:30 PM</span><em>to</em><span>8:30 PM</span><button>×</button></>:<button onClick={()=>alert('New slot added for Friday.')}>+ Add hours</button>}</div>)}<footer><label>Buffer<select><option>15 minutes</option></select></label><label>Advance notice<select><option>24 hours</option></select></label><label>Booking window<select><option>30 days</option></select></label></footer></div><div className="service-builder"><div><span>DEMO SERVICE · ACTIVE</span><button onClick={()=>alert('Service duplicated for editing.')}>Duplicate</button></div><h2>Technical Mock Interview</h2><div><b>45 minutes</b><b>1:1 video</b><b>English / Hindi</b></div><p>Realistic technical and project questions with spoken feedback and a written scorecard.</p><dl><dt>Candidate price</dt><dd>₹1,199</dd><dt>Illustrative net after demo fee</dt><dd>₹959</dd></dl><small>Cancellation terms follow platform policy; hidden terms cannot be added.</small></div></>}
    {step===6&&<><div className="review-completeness"><div><strong>100%</strong><span><b>Application complete</b><small>All required prototype sections are ready.</small></span></div>{titles.slice(0,5).map((x,i)=><button onClick={()=>setStep(i+1)} key={x}><IIcon name="check"/><span><b>{x}</b><small>{i===2?'1 private evidence file':i===4?'4 weekly availability ranges · 1 service':'Complete'}</small></span>Edit</button>)}</div><label className="consent-check"><input type="checkbox" defaultChecked/> I confirm this information is accurate and understand the platform guidelines.</label><label className="consent-check"><input type="checkbox"/> Send optional product and marketing updates.</label></>}
    <footer className="application-actions"><Btn quiet onClick={()=>step>1&&setStep(step-1)} disabled={step===1}>Back</Btn><Btn onClick={()=>step===6?(setSubmitted(true),update({interviewerStatus:'pending'},'Interviewer submitted application')):setStep(step+1)}>{step===6?'Submit application':'Continue'} <IIcon name="arrow"/></Btn></footer></section><aside className="application-summary">{step===4?<ProfilePreview/>:<><span>APPLICATION SUMMARY</span><div className="summary-avatar">RM</div><h3>Riya Mehta</h3><p>Senior Software Engineer</p><dl><div><dt>Identity</dt><dd>{step>1?'Professional':'In progress'}</dd></div><div><dt>Categories</dt><dd>{step>2?'2 selected':'Not added'}</dd></div><div><dt>Evidence</dt><dd>{step>3?'Uploaded':'Not added'}</dd></div><div><dt>Availability</dt><dd>{step>5?'Configured':'Not added'}</dd></div></dl><small>This summary is stored only in the current prototype session.</small></>}</aside></main></div>
}

function ProfilePreview(){return <div className="interviewer-preview"><span>PUBLIC PROFILE PREVIEW</span><div className="preview-avatar">RM<i/></div><h3>Riya Mehta</h3><p>Senior Software Engineer | Technical Mock Interviews</p><div><b>Software Engineering</b><b>Project Defence</b></div><small>English · Hindi</small><hr/><p>I help early-career engineers explain projects and reason through technical trade-offs.</p><em>Verification controlled by platform review</em></div>}

const nav:[Page,string,string][]=[['dashboard','Overview','grid'],['bookings','Bookings','card'],['calendar','Calendar & Availability','calendar'],['candidates','Candidate History','users'],['profile','My Profile','user'],['expertise','Expertise & Categories','star'],['services','Pricing & Packages','card'],['earnings','Earnings & Payouts','chart'],['reviews','Reviews','star'],['notifications','Notifications','bell'],['settings','Settings','settings']]

function Shell({page,setPage,exit,children}:{page:Page;setPage:(p:Page)=>void;exit:()=>void;children:React.ReactNode}){
  const { signOut, user, profile } = useAuth()
  const displayName = profile?.name || user?.user_metadata?.name || 'Riya Mehta'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'RM'
  const isReview = profile?.status === 'under_review' || profile?.interviewer_profile?.verificationStatus === 'under_review'

  return <div className="candidate-shell interviewer-shell"><aside className="app-sidebar"><button className="app-logo" onClick={exit}><span>IS</span><b>InterviewSetu</b></button><div className="workspace-label">INTERVIEWER SPACE</div><nav>{nav.map(([p,l,i])=><button className={page===p||(p==='bookings'&&page==='booking')?'active':''} onClick={()=>setPage(p)} key={p}><IIcon name={i}/><span>{l}</span></button>)}</nav><div className="sidebar-bottom"><button onClick={()=>setPage('profile')}><span className="avatar">{initials}</span><span><b>{displayName}</b><small>{isReview ? 'Under review' : 'Verified interviewer'}</small></span></button><button onClick={() => signOut()}>Sign out</button></div></aside><section className="app-workspace"><header className="app-topbar"><div><small>INTERVIEWER / {nav.find(n=>n[0]===page)?.[1].toUpperCase()||'SESSION'}</small></div><RoleSwitcher currentRole="interviewer" userName={displayName} /><label><IIcon name="search"/><input placeholder="Search bookings"/></label><NotificationBell customUserId={user?.id || 'usr-mentor-1'} /><span className="avatar" onClick={()=>setPage('profile')} style={{cursor:'pointer'}}>{initials}</span></header><main className="app-main page-enter" key={page}><InterviewerApprovalBanner />{children}</main></section></div>
}
const Title=({eye,title,copy,action}:{eye:string;title:string;copy:string;action?:React.ReactNode})=><div className="app-page-title"><div className="app-title-text"><p>{eye}</p><h1>{title}</h1><span>{copy}</span></div>{action&&<div className="app-title-actions">{action}</div>}</div>

function Dashboard({go}:{go:(p:Page)=>void}){
  const { update } = usePrototypeState()
  const [requests, setRequests] = useState([
    { id: 'IS-2051', initials: 'NK', name: 'Neha K.', track: 'Project Defence', time: '19 Jun · 5:30 PM', status: 'pending' },
    { id: 'IS-2056', initials: 'VR', name: 'Vikram R.', track: 'Technical Deep Dive', time: '21 Jun · 11:00 AM', status: 'pending' },
  ])
  const [feedbackToast, setFeedbackToast] = useState('')

  const handleAccept = (req: typeof requests[0]) => {
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'accepted' } : r))
    update({ bookingStatus: 'confirmed' }, `Accepted booking request from ${req.name}`)
    setFeedbackToast(`Booking ${req.id} confirmed! Added to your schedule.`)
    setTimeout(() => setFeedbackToast(''), 3000)
  }

  const handleDecline = (req: typeof requests[0]) => {
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'declined' } : r))
    update({}, `Declined booking request ${req.id}`)
    setFeedbackToast(`Booking request ${req.id} declined.`)
    setTimeout(() => setFeedbackToast(''), 3000)
  }

  return (
    <>
      <Title eye="MONDAY, 16 JUNE" title="Welcome back, Riya." copy="Your next session is ready for preparation." action={<Btn onClick={()=>go('calendar')}>Manage availability</Btn>}/>
      {feedbackToast && (
        <div style={{ background: '#059669', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
          ✓ {feedbackToast}
        </div>
      )}
      <div className="verified-chip"><IIcon name="check"/> Verified interviewer <span>Profile live</span></div>
      <div className="kpi-row interviewer-kpis">
        {[['4','Upcoming sessions','Next 7 days'],['18','Completed sessions','Last 30 days'],['4.8','Candidate rating','12 reviews'],['₹12,840','Net earnings','Demo · 30 days']].map((x,i)=><button onClick={()=>go(i===0?'bookings':i===3?'earnings':'reviews')} key={x[1]}><span className={`kpi-icon k${i}`}><IIcon name={['calendar','check','star','chart'][i]}/></span><div><strong>{x[0]}</strong><b>{x[1]}</b><small>{x[2]}</small></div></button>)}
      </div>
      <div className="mentor-dashboard-grid">
        <section className="activity-chart">
          <div className="block-title"><div><span className="label">SESSION ACTIVITY</span><h2>12 completed this month</h2></div><select><option>Last 30 days</option></select></div>
          <div>{[28,45,38,65,52,78,61,85].map((h,i)=><span style={{height:`${h}%`}} key={i}><i>{i+1}</i></span>)}</div>
        </section>
        <section className="earning-donut">
          <span className="label">COMPLETION RATE · DEMO</span>
          <div><i/><strong>92%<small>completed</small></strong></div>
          <p>23 completed · 2 rescheduled</p>
          <button onClick={()=>go('earnings')}>View earnings <IIcon name="arrow"/></button>
        </section>
      </div>
      <section className="next-session-mentor">
        <div className="candidate-initial">AS</div>
        <div>
          <span>NEXT SESSION · TOMORROW, 6:00 PM IST</span>
          <h2>Technical Mock Interview</h2>
          <p>Candidate: Aarav S. · Software Engineering · 45 minutes</p>
        </div>
        <div>
          <small>PREPARATION BRIEF SHARED</small>
          <button onClick={()=>go('booking')}>Review booking</button>
          <button onClick={()=>go('session')}>Open session room</button>
        </div>
      </section>
      <section className="booking-requests">
        <div className="block-title">
          <h2>Booking requests</h2>
          <button onClick={()=>go('bookings')}>View all</button>
        </div>
        {requests.map(r => (
          <div key={r.id}>
            <span>{r.initials}</span>
            <b>{r.name}</b>
            <small>{r.track}</small>
            <small>{r.time}</small>
            {r.status === 'pending' ? (
              <>
                <button onClick={() => handleDecline(r)}>Decline</button>
                <button onClick={() => handleAccept(r)}>Accept</button>
              </>
            ) : (
              <span style={{ fontSize: '12px', fontWeight: 700, color: r.status === 'accepted' ? '#10b981' : '#94a3b8' }}>
                {r.status === 'accepted' ? 'Accepted ✓' : 'Declined'}
              </span>
            )}
          </div>
        ))}
      </section>
    </>
  )
}

function Bookings({go}:{go:(p:Page)=>void}){
 return <InterviewerScheduleManager viewMode="bookings" />;
 const _unusedBookings = () => {
 const { update } = usePrototypeState()
 const [tab,setTab]=useState('Requests')
 const [accepted,setAccepted]=useState<string[]>([])
 const [declined,setDeclined]=useState<string[]>([])
 const [search,setSearch]=useState('')

 const rows=[
   { id: 'IS-2048', name: 'Aarav S.', format: 'Technical Mock', time: '18 Jun · 6:00 PM', status: 'Confirmed' },
   { id: 'IS-2051', name: 'Neha K.', format: 'Project Defence', time: '19 Jun · 5:30 PM', status: 'Requested' },
   { id: 'IS-2056', name: 'Vikram R.', format: 'Technical Deep Dive', time: '21 Jun · 11:00 AM', status: 'Requested' },
   { id: 'IS-2039', name: 'Vikram R.', format: 'System Design Mock', time: '12 Jun · 4:00 PM', status: 'Completed' },
 ]

 const filtered = rows.filter(r => {
   const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())
   if (!matchesSearch) return false
   if (tab === 'Requests') return r.status === 'Requested'
   if (tab === 'Upcoming') return r.status === 'Confirmed'
   if (tab === 'Completed') return r.status === 'Completed'
   return true
 })

 return (
   <>
     <Title eye="SESSION MANAGEMENT" title="Bookings" copy="Review requests and manage confirmed sessions."/>
     <div className="app-tabs">
       {['Requests','Upcoming','In Progress','Completed','Cancelled','Disputed'].map(x=>(
         <button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>
       ))}
     </div>
     <div className="history-filters">
       <label><IIcon name="search"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search booking reference or candidate"/></label>
       <button onClick={()=>setSearch('')}>Clear filters</button>
     </div>
     <section className="mentor-booking-table">
       <header>
         <span>Booking</span><span>Candidate</span><span>Format</span><span>Date / time</span><span>Status</span><span>Actions</span>
       </header>
       {filtered.length === 0 ? (
         <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
           No bookings found under "{tab}".
         </div>
       ) : (
         filtered.map(x=>(
           <div onClick={()=>go('booking')} key={x.id}>
             <b>{x.id}</b>
             <span>{x.name}</span>
             <span>{x.format}</span>
             <span>{x.time}</span>
             <em>{accepted.includes(x.id)?'Accepted':declined.includes(x.id)?'Declined':x.status}</em>
             <span>
               {x.status==='Requested' && !accepted.includes(x.id) && !declined.includes(x.id) ? (
                 <>
                   <button onClick={e=>{e.stopPropagation();setAccepted([...accepted,x.id]);update({bookingStatus:'confirmed'},`Interviewer accepted booking ${x.id}`)}}>Accept</button>
                   <button onClick={e=>{e.stopPropagation();setDeclined([...declined,x.id]);update({},`Interviewer declined booking ${x.id}`)}}>Decline</button>
                 </>
               ) : (
                 <button onClick={e=>{e.stopPropagation();go('booking')}}>View</button>
               )}
             </span>
           </div>
         ))
       )}
     </section>
   </>
 );
 };
}

function BookingDetail({go}:{go:(p:Page)=>void}){
 const [tab,setTab]=useState('Overview')
 const [rescheduled,setRescheduled]=useState(false)
 const [notes,setNotes]=useState('')
 const [toast,setToast]=useState('')

 const handleReschedule = () => {
   setRescheduled(true)
   setToast('Reschedule proposal sent to candidate for 20 June, 6:30 PM IST.')
   setTimeout(() => setToast(''), 4000)
 }

 return (
   <>
     <button className="back-link" onClick={()=>go('bookings')}>← Back to bookings</button>
     <Title eye={`BOOKING IS-2048 · ${rescheduled ? 'RESCHEDULE PROPOSED' : 'CONFIRMED'}`} title="Technical Mock Interview" copy={`Aarav S. · ${rescheduled ? '20 June 2025 · 6:30 PM IST' : '18 June 2025 · 6:00 PM IST'}`} action={<Btn onClick={()=>go('session')}>Open session room</Btn>}/>
     {toast && (
       <div style={{ background: '#059669', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
         ✓ {toast}
       </div>
     )}
     <div className="booking-detail mentor-detail">
       <section>
         <div className="app-tabs">
           {['Overview','Candidate Brief','Session Notes','Feedback'].map(x=>(
             <button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>
           ))}
         </div>
         <span className="private-label">VISIBLE ONLY FOR THIS BOOKED SESSION</span>
         <h2>{tab==='Overview'?'Preparation goal':tab}</h2>
         <p className="detail-copy">
           {tab==='Overview'?'Practise explaining a final-year project, including architecture choices, personal contribution and one technical trade-off.':tab==='Candidate Brief'?'Target role: Software Engineer · Focus: Project Defence · Experience: Final-year student. Candidate shared résumé and project notes.':tab==='Session Notes'?'Add private notes before or during the session. These are not visible to the candidate.':'Feedback becomes available after the session ends.'}
         </p>
         <div className="shared-topics">
           {['Project architecture','Personal contribution','Database choice','Follow-up handling'].map(x=><span key={x}>{x}</span>)}
         </div>
         <textarea className="private-notes" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add private preparation notes…"/>
       </section>
       <aside>
         <span>APPOINTMENT</span>
         <div className="detail-time">
           <span><small>DATE</small><b>{rescheduled ? '20 June' : '18 June'}</b></span>
           <span><small>TIME</small><b>{rescheduled ? '6:30 PM' : '6:00 PM'}</b></span>
           <span><small>TIMEZONE</small><b>IST</b></span>
         </div>
         <div className="status-line">
           {['Booked','Confirmed','Session','Feedback'].map((x,i)=><span className={i<2?'done':''} key={x}><i>{i<2?'✓':i+1}</i>{x}</span>)}
         </div>
         <Btn onClick={()=>go('session')}>Test and enter room</Btn>
         <Btn quiet onClick={handleReschedule}>Reschedule</Btn>
         <small>Payment and payout amounts shown in this prototype are sample data.</small>
       </aside>
     </div>
   </>
 )
}

function SessionRoom({go}:{go:(p:Page)=>void}){
 const [mic,setMic]=useState(true)
 const [camera,setCamera]=useState(true)
 const [sharing,setSharing]=useState(false)
 const [captions,setCaptions]=useState(false)
 const [ended,setEnded]=useState(false)
 const [tab,setTab]=useState('Brief')

 return (
   <div className="mentor-room">
     <header>
       <button className="app-logo" onClick={()=>go('booking')}><span>IS</span><b>InterviewSetu</b></button>
       <div><b>Technical Mock Interview</b><span>Aarav S. · Demo video room</span></div>
       <strong>32:18</strong>
       <span className="connection"><i/> Stable connection</span>
     </header>
     <main>
       <section>
         <div className={`candidate-video ${camera?'':'off'}`}>
           <span>AS</span>
           <small>Candidate · Aarav S.</small>
           <div className="self-video">
             <span>RM</span>
             <small>You {camera ? '' : '(Video off)'}</small>
           </div>
           {sharing && (
             <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(99,102,241,0.9)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
               📺 Screen Sharing Active
             </div>
           )}
           {captions && (
             <div style={{ position: 'absolute', bottom: '30px', left: '20px', right: '20px', background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', lineHeight: 1.4, backdropFilter: 'blur(4px)' }}>
               <b style={{ color: '#818cf8' }}>Aarav S.:</b> "In our architecture, we used PostgreSQL with read replicas to guarantee ACID compliance for transactions..."
             </div>
           )}
           <em>Recording off · Consent not provided</em>
         </div>
         <div className="call-controls">
           <button onClick={()=>setMic(!mic)} className={!mic?'off':''}><IIcon name="mic"/><span>{mic?'Mute':'Unmute'}</span></button>
           <button onClick={()=>setCamera(!camera)} className={!camera?'off':''}><IIcon name="camera"/><span>{camera?'Stop video':'Start video'}</span></button>
           <button onClick={()=>setSharing(!sharing)} className={sharing?'active':''}><IIcon name="grid"/><span>{sharing?'Stop sharing':'Share screen'}</span></button>
           <button onClick={()=>setCaptions(!captions)} className={captions?'active':''}><IIcon name="card"/><span>{captions?'Captions ON':'Captions'}</span></button>
           <button className="end" onClick={()=>setEnded(true)}>End session</button>
         </div>
       </section>
       <aside>
         <div className="app-tabs">
           {['Brief','Rubric','Notes'].map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>)}
         </div>
         <span className="private-label">VISIBLE ONLY IN THIS SESSION</span>
         <h3>{tab==='Brief'?'Candidate goal':tab==='Rubric'?'Question guide':'Private notes'}</h3>
         {tab==='Brief'?(
           <>
             <p>Explain project architecture and personal contribution clearly.</p>
             {['Project context','Technical decision','Trade-off','Outcome'].map(x=><div className="room-topic" key={x}><i/>{x}</div>)}
           </>
         ):tab==='Rubric'?(
           ['Relevance','Structure','Accuracy','Specificity','Communication'].map(x=>(
             <label className="rubric-mini" key={x}>
               {x}
               <select defaultValue="Strong">
                 <option>Needs practice</option>
                 <option>Developing</option>
                 <option>Strong</option>
               </select>
             </label>
           ))
         ):(
           <textarea placeholder="Notes are private until explicitly included in feedback."/>
         )}
       </aside>
     </main>
     {ended&&<div className="room-modal"><div><h2>End this session?</h2><p>The call will close and you’ll move to the feedback scorecard. Recording is off.</p><Btn quiet onClick={()=>setEnded(false)}>Continue session</Btn><Btn onClick={()=>go('feedback')}>End and write feedback</Btn></div></div>}
   </div>
 )
}

function Feedback({go}:{go:(p:Page)=>void}){
 const { update } = usePrototypeState()
 const [draft,setDraft]=useState(false)
 const [submitted,setSubmitted]=useState(false)
 const [toast,setToast]=useState('')
 const [scores,setScores]=useState<Record<string,string>>({
   'Relevance': 'Strong',
   'Answer structure': 'Developing',
   'Technical accuracy': 'Strong',
   'Specificity': 'Developing',
   'Communication clarity': 'Strong',
   'Reasoning': 'Developing'
 })

 const handleSaveDraft = () => {
   setToast('Feedback draft saved securely.')
   setTimeout(() => setToast(''), 3000)
 }

 if(submitted)return <section className="feedback-success"><span><IIcon name="check"/></span><h1>Feedback submitted</h1><p>The candidate-facing report is ready. Private notes remain private.</p><Btn onClick={()=>go('dashboard')}>Return to dashboard</Btn></section>

 return (
   <>
     <Title eye="POST-SESSION FEEDBACK" title="Aarav S. · Technical Mock" copy="Human review required · Candidate-facing unless marked private" action={<Btn quiet onClick={handleSaveDraft}>Save draft</Btn>}/>
     {toast && (
       <div style={{ background: '#059669', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
         ✓ {toast}
       </div>
     )}
     <div className="feedback-layout">
       <section>
         <div className="feedback-note">Use specific evidence from the session. Scores follow the configured practice rubric and do not predict hiring outcomes.</div>
         {['Relevance','Answer structure','Technical accuracy','Specificity','Communication clarity','Reasoning'].map(x=>(
           <div className="score-dimension" key={x}>
             <div>
               <h3>{x}</h3>
               <div>
                 {['Needs practice','Developing','Strong'].map(v=>(
                   <button
                     className={scores[x]===v?'active':''}
                     onClick={()=>setScores(s=>({...s,[x]:v}))}
                     key={v}
                   >
                     {v}
                   </button>
                 ))}
               </div>
             </div>
             <textarea placeholder={`Evidence for ${x.toLowerCase()}…`}/>
           </div>
         ))}
         {['Strengths','Improvement areas','Suggested next practice'].map((x,i)=>(
           <label className="feedback-text" key={x}>
             <span>{x} · Required</span>
             <textarea defaultValue={draft?['You explained the project context clearly and responded calmly to follow-ups.','Name your individual decisions and quantify one outcome.','Retry the project explanation with a focus on one technical trade-off.'][i]:''}/>
           </label>
         ))}
         <button className="ai-draft" onClick={()=>setDraft(true)}>Draft summary with AI · Simulated — human review required</button>
         <label className="feedback-text private">
           <span>Private internal notes · Never sent to candidate</span>
           <textarea placeholder="Observations for platform records or personal memory..."/>
         </label>
         <Btn onClick={()=>{setSubmitted(true);update({feedbackSubmitted:true,bookingStatus:'completed'},'Interviewer submitted session feedback')}}>
           Review and submit feedback <IIcon name="arrow"/>
         </Btn>
       </section>
       <aside>
         <span>CANDIDATE REPORT PREVIEW</span>
         <h2>Session feedback</h2>
         <p>Technical Mock Interview · 18 June</p>
         <hr/>
         <h3>Observed strengths</h3>
         <p>{draft?'You explained the project context clearly and responded calmly to follow-ups.':'Your comments will appear here.'}</p>
         <h3>Next improvement</h3>
         <p>{draft?'Name your individual decisions and quantify one outcome.':'Complete the required fields to preview.'}</p>
         <em>Private internal notes are excluded.</em>
       </aside>
     </div>
   </>
 )
}

function Calendar(){
 return <InterviewerScheduleManager viewMode="calendar" />;
 const _unusedCal = () => {
 const [view,setView]=useState('Week')
 const [toast,setToast]=useState('')
 const [rules,setRules]=useState([
   'Monday · 5:30–8:30 PM',
   'Tuesday · 5:30–8:30 PM',
   'Wednesday · 5:30–8:30 PM',
   'Thursday · 5:30–8:30 PM'
 ])

 const handleBlock = () => {
   setToast('Time blocked for Thursday 4:00 PM - 5:30 PM.')
   setTimeout(() => setToast(''), 3000)
 }

 const handleAddAvailability = () => {
   setToast('Friday 5:30 PM - 8:30 PM added to open calendar.')
   setTimeout(() => setToast(''), 3000)
 }

 const handleAddRecurring = () => {
   if (!rules.includes('Friday · 5:30–8:30 PM')) {
     setRules([...rules, 'Friday · 5:30–8:30 PM'])
     setToast('Added recurring Friday evening hours.')
     setTimeout(() => setToast(''), 3000)
   } else {
     setToast('Recurring schedule updated.')
     setTimeout(() => setToast(''), 3000)
   }
 }

 return (
   <>
     <Title eye="CALENDAR & AVAILABILITY" title="Your schedule" copy="Asia/Kolkata · IST · 15-minute buffer" action={<div><Btn quiet onClick={handleBlock}>Block time</Btn><Btn onClick={handleAddAvailability}>Add availability</Btn></div>}/>
     {toast && (
       <div style={{ background: '#059669', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
         ✓ {toast}
       </div>
     )}
     <div className="app-tabs">
       {['Month','Week','List'].map(x=><button className={view===x?'active':''} onClick={()=>setView(x)} key={x}>{x}</button>)}
     </div>
     <section className="mentor-calendar">
       <header>
         <button onClick={()=>setToast('Previous week')}>←</button>
         <h2>16–22 June 2025</h2>
         <button onClick={()=>setToast('Showing current week')}>Today</button>
         <button onClick={()=>setToast('Next week')}>→</button>
       </header>
       <div className="calendar-legend">
         <span><i/>Available</span><span><i/>Confirmed booking</span><span><i/>Pending request</span><span><i/>Blocked</span>
       </div>
       <div className="week-grid">
         {['TIME','MON 16','TUE 17','WED 18','THU 19','FRI 20'].map(x=><b key={x}>{x}</b>)}
         {['4 PM','5 PM','6 PM','7 PM'].map((t,r)=>(
           <React.Fragment key={t}>
             <small>{t}</small>
             {[0,1,2,3,4].map(c=>(
               <div key={`${r}-${c}`} className={r===2&&c===2?'booking':r===1&&c===3?'pending':r===3&&c===4?'blocked':r>0?'available':''}>
                 {r===2&&c===2?'Aarav · Mock':r===1&&c===3?'Request':r===3&&c===4?'Blocked':r>0?'Available':''}
               </div>
             ))}
           </React.Fragment>
         ))}
       </div>
     </section>
     <section className="availability-rules">
       <div><span className="label">RECURRING HOURS</span><h2>Typical weekly availability</h2></div>
       {rules.map((x,i)=>(
         <span key={x}>
           {x}
           <button onClick={()=>{setRules(rules.filter((_,idx)=>idx!==i));setToast('Removed schedule slot.')}}>Remove</button>
         </span>
       ))}
       <button onClick={handleAddRecurring}>+ Add recurring hours</button>
     </section>
   </>
 );
 };
}

function SimplePage({page,go}:{page:Page;go:(p:Page)=>void}){
 const [toast,setToast]=useState('')
 const [selectedCandidate,setSelectedCandidate]=useState<string|null>(null)
 const [replyModal,setReplyModal]=useState<string|null>(null)
 const [replyText,setReplyText]=useState('')

 const showToast=(msg:string)=>{
   setToast(msg)
   setTimeout(()=>setToast(''),3500)
 }

 const data:Record<string,[string,string,string]>={
  candidates:['CANDIDATE HISTORY','Candidates you have interviewed','Only authorised, session-shared data appears here.'],
  profile:['PROFILE MANAGER','Your public profile','Edit candidate-facing information and preview changes.'],
  expertise:['EXPERTISE & CATEGORIES','Approved expertise','Category changes may require new evidence and admin review.'],
  services:['PRICING & PACKAGES','Your services','Manage candidate-facing packages and illustrative pricing.'],
  earnings:['EARNINGS & PAYOUTS','Earnings overview','All amounts and transactions below are demo data.'],
  reviews:['REVIEWS & QUALITY','Candidate feedback','Respond professionally or report concerns for admin review.'],
  notifications:['NOTIFICATIONS','Updates that need attention','Booking requests, session reminders and payout updates.'],
  settings:['SETTINGS','Interviewer preferences','Account, timezone, privacy, recording, payouts and security.'],
 }
 const [eye,title,copy]=data[page]||data.settings

 return (
   <>
     <Title
       eye={eye}
       title={title}
       copy={copy}
       action={
         page==='services' ? (
           <Btn onClick={()=>showToast('New service package modal opened.')}>+ Add service</Btn>
         ) : page==='profile' ? (
           <Btn onClick={()=>showToast('Profile changes published to directory.')}>Publish changes</Btn>
         ) : undefined
       }
     />
     {toast && (
       <div style={{ background: '#059669', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
         ✓ {toast}
       </div>
     )}
     {page==='candidates'?(
       <>
         <div className="privacy-banner">Candidate data is limited to booked interactions and information explicitly shared for those sessions.</div>
         <section className="mentor-booking-table">
           <header><span>Candidate</span><span>Last session</span><span>Track</span><span>Completed</span><span>Status</span><span/></header>
           {[['Aarav S.','18 Jun 2025','Software Engineering','2','Feedback due'],['Neha K.','04 Jun 2025','Campus Placement','1','Completed'],['Vikram R.','28 May 2025','Data Analytics','3','Completed']].map(x=>(
             <div key={x[0]}>
               {x.map(v=><span key={v}>{v}</span>)}
               <button onClick={()=>setSelectedCandidate(x[0])}>View permitted history</button>
             </div>
           ))}
         </section>
         {selectedCandidate && (
           <div className="room-modal" onClick={()=>setSelectedCandidate(null)}>
             <div onClick={e=>e.stopPropagation()} style={{ maxWidth: '500px' }}>
               <h2>{selectedCandidate} — Session History</h2>
               <p style={{ marginTop: '8px' }}>Candidate shared preparation focus: Final-year project architecture, personal contribution justification, and system trade-offs.</p>
               <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', margin: '14px 0', fontSize: '12px' }}>
                 <b>Previous Session:</b> Technical Mock (18 Jun 2025)<br/>
                 <b>Feedback Status:</b> Pending submission<br/>
                 <b>Shared Artifacts:</b> Resume (1.2 MB), GitHub Repository link
               </div>
               <Btn onClick={()=>setSelectedCandidate(null)}>Close history</Btn>
             </div>
           </div>
         )}
       </>
     ):page==='profile'?(
       <InterviewerProfileEditor/>
     ):page==='expertise'?(
       <div className="expertise-grid">
         {[['Software Engineering','APPROVED','Frontend, backend, system design'],['Project Defence','APPROVED','College placements and professional roles'],['Data Analytics','PENDING','Evidence review required']].map(x=>(
           <section key={x[0]}>
             <span>{x[1]}</span>
             <h2>{x[0]}</h2>
             <p>{x[2]}</p>
             <button onClick={()=>showToast(`${x[0]} category details opened.`)}>{x[1]==='PENDING'?'View evidence request':'Manage category'}</button>
           </section>
         ))}
         <button className="add-category" onClick={()=>showToast('Category request application submitted.')}>+ Request another category</button>
       </div>
     ):page==='services'?(
       <div className="services-grid">
         {[['Technical Mock Interview','45 min','₹1,199','₹959','Active'],['Project Defence Focus','30 min','₹799','₹639','Active'],['Resume & Answer Review','30 min','₹699','₹559','Draft']].map(x=>(
           <section key={x[0]}>
             <span>{x[4]}</span>
             <h2>{x[0]}</h2>
             <p>{x[1]} · 1:1 session</p>
             <dl><dt>Candidate price</dt><dd>{x[2]}</dd><dt>Illustrative net</dt><dd>{x[3]}</dd></dl>
             <footer>
               <button onClick={()=>showToast(`Previewing ${x[0]} service.`)}>Preview</button>
               <button onClick={()=>showToast(`Editing ${x[0]} package.`)}>Edit</button>
               <button onClick={()=>showToast(`${x[0]} package archived.`)}>Archive</button>
             </footer>
           </section>
         ))}
       </div>
     ):page==='earnings'?(
       <Earnings/>
     ):page==='reviews'?(
       <>
         <Reviews onReply={(name)=>setReplyModal(name)} onReport={(name)=>showToast(`Report filed for review by ${name}. Sent to moderation.`)}/>
         {replyModal && (
           <div className="room-modal" onClick={()=>setReplyModal(null)}>
             <div onClick={e=>e.stopPropagation()} style={{ maxWidth: '520px' }}>
               <h2>Reply to {replyModal}</h2>
               <p style={{ marginTop: '6px' }}>Your reply will appear publicly under this candidate's review.</p>
               <textarea
                 style={{ width: '100%', minHeight: '100px', marginTop: '12px', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                 placeholder="Write a professional, encouraging response..."
                 value={replyText}
                 onChange={e=>setReplyText(e.target.value)}
               />
               <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                 <Btn quiet onClick={()=>setReplyModal(null)}>Cancel</Btn>
                 <Btn onClick={()=>{showToast(`Reply published to ${replyModal}.`);setReplyModal(null);setReplyText('')}}>Post public reply</Btn>
               </div>
             </div>
           </div>
         )}
       </>
     ):page==='notifications'?(
       <MentorNotifications/>
     ):(
       <MentorSettings onSave={()=>showToast('Interviewer preferences saved successfully.')}/>
     )}
   </>
 )
}

function Earnings(){
  return (
    <>
      <div className="kpi-row">
        {[['₹16,050','Gross earnings'],['₹3,210','Demo platform fee'],['₹12,840','Net earnings'],['₹3,596','Pending payout']].map((x,i)=>(
          <button key={x[1]} onClick={()=>alert(`Filter applied for ${x[1]}`)}>
            <span className={`kpi-icon k${i}`}><IIcon name="chart"/></span>
            <div><strong>{x[0]}</strong><b>{x[1]}</b><small>June · Demo</small></div>
          </button>
        ))}
      </div>
      <section className="payout-chart">
        <div className="block-title"><h2>Net earnings by week</h2><button onClick={()=>alert('Filter: Last 3 months')}>Last 3 months ⌄</button></div>
        <div>{[35,58,44,72,65,83].map((x,i)=><span style={{height:`${x}%`}} key={i}><i>W{i+1}</i></span>)}</div>
      </section>
      <section className="invoice-table">
        <div><h2>Demo transactions</h2><span>DEMO DATA</span></div>
        <header><span>Date</span><span>Booking</span><span>Gross</span><span>Net</span><span>Status</span></header>
        {[['18 Jun','IS-2048','₹1,199','₹959','Pending'],['12 Jun','IS-2022','₹799','₹639','Demo paid'],['08 Jun','IS-2014','₹1,199','₹959','Demo paid']].map(x=>(
          <div key={x[1]}>{x.map(v=><span key={v}>{v}</span>)}</div>
        ))}
      </section>
    </>
  )
}

function Reviews({onReply,onReport}:{onReply:(name:string)=>void;onReport:(name:string)=>void}){
  return (
    <>
      <section className="review-summary">
        <div><strong>4.8</strong><span>Average from 12 sample reviews</span></div>
        {[['Clarity','4.9'],['Usefulness','4.8'],['Professionalism','4.9']].map(x=><div key={x[0]}><b>{x[1]}</b><span>{x[0]}</span></div>)}
      </section>
      {[['Aarav S.','Technical Mock','“The follow-up questions helped me explain my choices much more clearly.”'],['Neha K.','Project Defence','“Specific feedback and practical next steps.”']].map(x=>(
        <section className="review-card" key={x[0]}>
          <div className="candidate-initial">{x[0].split(' ').map(v=>v[0]).join('')}</div>
          <div>
            <span>VISIBLE SAMPLE REVIEW · {x[1]}</span>
            <h3>{x[0]}</h3>
            <p>{x[2]}</p>
            <button onClick={()=>onReply(x[0])}>Write public response</button>
            <button onClick={()=>onReport(x[0])}>Report for moderation</button>
          </div>
        </section>
      ))}
    </>
  )
}

function MentorNotifications(){
  const [items,setItems]=useState([
    { title: 'New booking request', desc: 'Neha K. requested Project Defence · 19 June', time: 'Today', read: false },
    { title: 'Session reminder', desc: 'Aarav S. · Tomorrow at 6:00 PM IST', time: 'Today', read: false },
    { title: 'Feedback due', desc: 'Complete feedback for booking IS-2039', time: 'Earlier', read: false },
    { title: 'Demo payout update', desc: 'Sample payout marked processed', time: 'Earlier', read: true }
  ])

  return (
    <section className="mentor-notifications">
      {items.map((x,i)=>(
        <button
          className={x.read?'read':''}
          key={x.title}
          onClick={()=>setItems(prev=>prev.map((it,idx)=>idx===i?{...it,read:true}:it))}
        >
          <span><IIcon name={i===0?'card':i===3?'chart':'bell'}/></span>
          <div><b>{x.title}</b><p>{x.desc}</p><small>{x.time}</small></div>
          <IIcon name="arrow"/>
        </button>
      ))}
      <Btn quiet onClick={()=>setItems(prev=>prev.map(it=>({...it,read:true})))}>Mark all as read</Btn>
    </section>
  )
}

function MentorSettings({onSave}:{onSave:()=>void}){
  const [tab,setTab]=useState('Account')
  return (
    <div className="settings-layout">
      <aside>
        {['Account','Notifications','Timezone','Availability defaults','Privacy','Profile visibility','Recording preferences','Payout settings','Security'].map(x=>(
          <button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>
        ))}
      </aside>
      <section>
        <span className="label">{tab.toUpperCase()}</span>
        <h2>{tab}</h2>
        <div className="setting-toggles">
          {['Booking and session reminders','Candidate preparation brief access','Save private session notes',tab==='Recording preferences'?'Allow recording request (consent still required)':'Email security alerts'].map((x,i)=>(
            <label key={x}>
              <span><b>{x}</b><small>{x.includes('recording')?'Recording remains off until every participant consents.':'Changes apply to your interviewer workspace.'}</small></span>
              <input type="checkbox" defaultChecked={i<3}/>
            </label>
          ))}
        </div>
        <div className="save-row">
          <Btn onClick={onSave}>Save preferences</Btn>
        </div>
      </section>
    </div>
  )
}

export default function InterviewerApp({exit}:{exit:()=>void}){
 const { data, update } = usePrototypeState()
 const [approved,setApproved]=useState(data.interviewerStatus==='approved')
 const [page,setPage]=useState<Page>('dashboard')

 if(!approved)return <Application finish={()=>{setApproved(true);update({interviewerStatus:'approved'},'Prototype interviewer workspace approved')}} exit={exit}/>
 if(page==='session')return <SessionRoom go={setPage}/>
 const view=page==='dashboard'?<Dashboard go={setPage}/>:page==='bookings'?<Bookings go={setPage}/>:page==='booking'?<BookingDetail go={setPage}/>:page==='feedback'?<Feedback go={setPage}/>:page==='calendar'?<Calendar/>:<SimplePage page={page} go={setPage}/>
 return <Shell page={page} setPage={setPage} exit={exit}>{view}</Shell>
}
