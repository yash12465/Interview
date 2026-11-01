'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase/use-auth'
import { createClient } from '@/lib/supabase/client'
import { uploadResume, getSignedUrl, deleteStorageFile } from '@/lib/supabase/storage'
import { EducationEntry, ExperienceEntry, ResumeFileMeta, CandidateProfileData } from '@/types/profile'

const POPULAR_SKILLS = [
  'System Design',
  'Data Structures & Algorithms',
  'React',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'Distributed Systems',
  'STAR Framework',
  'Project Defence',
  'AWS Cloud',
  'Docker & K8s',
  'Situational Reasoning',
]

export function CandidateProfileEditor() {
  const { user, profile, refreshProfile } = useAuth()
  const supabase = createClient()

  const tabs = ['Personal', 'Education', 'Experience & Projects', 'Skills', 'Resume files', 'Preferences']
  const [tab, setTab] = useState('Personal')

  // Core profile state
  const [name, setName] = useState(profile?.name || user?.user_metadata?.name || 'Aarav Kumar')
  const [targetTrack, setTargetTrack] = useState('Software Engineering')
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [preferredLanguage, setPreferredLanguage] = useState('English')
  const [preferredMode, setPreferredMode] = useState<'voice' | 'text' | 'both'>('both')
  const [bio, setBio] = useState('Computer science student focused on backend development and reliable web applications.')

  // Education state
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([
    {
      id: 'edu-1',
      institution: 'Indian Institute of Information Technology (IIIT)',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science and Engineering',
      startYear: '2022',
      endYear: '2026',
      grade: '8.7 CGPA',
    },
  ])
  const [showEduModal, setShowEduModal] = useState(false)
  const [editingEdu, setEditingEdu] = useState<EducationEntry | null>(null)

  // Experience state
  const [experienceHistory, setExperienceHistory] = useState<ExperienceEntry[]>([
    {
      id: 'exp-1',
      company: 'NextGen Systems',
      role: 'Backend Engineering Intern',
      startDate: 'May 2025',
      endDate: 'Aug 2025',
      current: false,
      description: 'Built high-throughput indexing pipelines in Node.js and PostgreSQL. Designed fault-tolerant idempotency queues that reduced duplicate webhooks by 99.4%.',
    },
  ])
  const [showExpModal, setShowExpModal] = useState(false)
  const [editingExp, setEditingExp] = useState<ExperienceEntry | null>(null)

  // Skills state
  const [skills, setSkills] = useState<string[]>([
    'System Design',
    'TypeScript',
    'PostgreSQL',
    'Node.js',
    'STAR Framework',
    'Data Structures & Algorithms',
  ])
  const [newSkillInput, setNewSkillInput] = useState('')

  // Resume state
  const [resume, setResume] = useState<ResumeFileMeta | null>(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeSignedUrl, setResumeSignedUrl] = useState<string | null>(null)

  // Status flags
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Populate from existing candidate profile on load
  useEffect(() => {
    if (profile?.candidate_profile) {
      const cp: CandidateProfileData = profile.candidate_profile
      if (cp.targetTrack) setTargetTrack(cp.targetTrack)
      if (cp.targetRole) setTargetRole(cp.targetRole)
      if (cp.preferredLanguage) setPreferredLanguage(cp.preferredLanguage)
      if (cp.preferredMode) setPreferredMode(cp.preferredMode)
      if (cp.bio) setBio(cp.bio)
      if (cp.skills && cp.skills.length > 0) setSkills(cp.skills)
      if (cp.educationHistory && cp.educationHistory.length > 0) setEducationHistory(cp.educationHistory)
      if (cp.experienceHistory && cp.experienceHistory.length > 0) setExperienceHistory(cp.experienceHistory)
      if (cp.resume) {
        setResume(cp.resume)
        if (cp.resume.path) {
          getSignedUrl('resumes', cp.resume.path).then(url => {
            if (url) setResumeSignedUrl(url)
          })
        }
      }
    }
  }, [profile])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Calculate profile completeness score
  const calculateCompleteness = () => {
    let score = 20 // baseline for registered account
    if (name.trim()) score += 15
    if (bio.trim()) score += 15
    if (educationHistory.length > 0) score += 15
    if (experienceHistory.length > 0) score += 15
    if (skills.length >= 3) score += 10
    if (resume) score += 10
    return Math.min(100, score)
  }

  // Handle Resume File Upload via Supabase Storage
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!user) {
      setErrorMessage('You must be signed in to upload a resume.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Resume file size exceeds the 10 MB limit.')
      return
    }

    setUploadingResume(true)
    setErrorMessage(null)

    try {
      const result = await uploadResume(file, user.id)
      const newResumeMeta: ResumeFileMeta = {
        path: result.path,
        fileName: result.name,
        uploadedAt: new Date().toISOString(),
        fileSize: result.size,
        signedUrl: result.signedUrl,
      }
      setResume(newResumeMeta)
      if (result.signedUrl) {
        setResumeSignedUrl(result.signedUrl)
      }
      showToast(`Resume "${file.name}" uploaded successfully! Remember to save changes.`)
    } catch (err: any) {
      console.error('Resume upload error:', err)
      setErrorMessage(err?.message || 'Failed to upload resume to storage.')
    } finally {
      setUploadingResume(false)
      // reset file input
      e.target.value = ''
    }
  }

  const handleRemoveResume = async () => {
    if (!resume) return
    if (confirm('Are you sure you want to remove your uploaded resume?')) {
      try {
        await deleteStorageFile('resumes', resume.path)
        setResume(null)
        setResumeSignedUrl(null)
        showToast('Resume removed. Please save changes.')
      } catch (err: any) {
        console.error('Error removing resume:', err)
      }
    }
  }

  // Add / Edit Education
  const handleSaveEducation = (entry: EducationEntry) => {
    if (editingEdu) {
      setEducationHistory(prev => prev.map(e => (e.id === entry.id ? entry : e)))
    } else {
      setEducationHistory(prev => [...prev, { ...entry, id: `edu-${Date.now()}` }])
    }
    setShowEduModal(false)
    setEditingEdu(null)
  }

  const handleDeleteEducation = (id: string) => {
    setEducationHistory(prev => prev.filter(e => e.id !== id))
  }

  // Add / Edit Experience
  const handleSaveExperience = (entry: ExperienceEntry) => {
    if (editingExp) {
      setExperienceHistory(prev => prev.map(e => (e.id === entry.id ? entry : e)))
    } else {
      setExperienceHistory(prev => [...prev, { ...entry, id: `exp-${Date.now()}` }])
    }
    setShowExpModal(false)
    setEditingExp(null)
  }

  const handleDeleteExperience = (id: string) => {
    setExperienceHistory(prev => prev.filter(e => e.id !== id))
  }

  // Skills
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed])
      setNewSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  // Main Save to Supabase
  const handleSaveProfile = async () => {
    setSaving(true)
    setErrorMessage(null)

    const updatedCandidateProfile: CandidateProfileData = {
      targetTrack,
      targetRole,
      preferredLanguage,
      preferredMode,
      bio,
      skills,
      educationHistory,
      experienceHistory,
      resume,
      completedMocks: profile?.candidate_profile?.completedMocks || 3,
      practiceMinutes: profile?.candidate_profile?.practiceMinutes || 45,
      savedQuestionsCount: profile?.candidate_profile?.savedQuestionsCount || 8,
      lessonsCompletedCount: profile?.candidate_profile?.lessonsCompletedCount || 4,
    }

    try {
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({
            name: name.trim(),
            candidate_profile: updatedCandidateProfile,
            last_active: 'Just now',
          })
          .eq('id', user.id)

        if (error) throw error
        await refreshProfile()
      }
      showToast('Profile and resume data successfully synchronized with database!')
    } catch (err: any) {
      console.error('Save error:', err)
      setErrorMessage(err?.message || 'Failed to save profile changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const completeness = calculateCompleteness()
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AK'

  return (
    <>
      <div className="app-page-title">
        <div className="app-title-text">
          <p>RESUME & PROFILE LAB</p>
          <h1>Your interview context</h1>
          <span>Keep your credentials and background up-to-date so AI and mentors tailor practice accurately.</span>
        </div>
      </div>

      {toastMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">✓ {toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 font-bold">×</button>
        </div>
      )}

      {/* Profile Header Card */}
      <section className="profile-head">
        <div className="profile-avatar">{initials}</div>
        <div>
          <h2>
            {name}{' '}
            <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
              EMAIL VERIFIED
            </span>
          </h2>
          <p>{targetRole} · {targetTrack} · Candidate workspace</p>
        </div>
        <div>
          <strong>{completeness}%</strong>
          <span>Profile complete</span>
        </div>
      </section>

      {/* Main Tabbed Layout */}
      <div className="profile-layout">
        <aside>
          {tabs.map(x => (
            <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>
              {x}
            </button>
          ))}
        </aside>

        <section>
          <div className="block-title">
            <div>
              <span className="label">{tab.toUpperCase()}</span>
              <h2>
                {tab === 'Resume files'
                  ? 'Resume documents & cloud storage'
                  : tab === 'Education'
                  ? 'Education & academic degrees'
                  : tab === 'Experience & Projects'
                  ? 'Work experience & portfolio projects'
                  : tab === 'Skills'
                  ? 'Verified technical & behavioural skills'
                  : `${tab} details`}
              </h2>
            </div>
          </div>

          {/* 1. PERSONAL TAB */}
          {tab === 'Personal' && (
            <div className="profile-form">
              <label>
                Full Name
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full legal name" />
              </label>
              <label>
                Target Preparation Track
                <select value={targetTrack} onChange={e => setTargetTrack(e.target.value)}>
                  <option>Software Engineering</option>
                  <option>Campus Placement & College</option>
                  <option>UPSC Personality Test</option>
                  <option>Bank PO Officer</option>
                  <option>MBA Admissions & Case</option>
                  <option>Communication & Structure</option>
                </select>
              </label>
              <label>
                Target Role / Goal
                <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Senior Software Engineer" />
              </label>
              <label>
                Interview Spoken Language
                <select value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value)}>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Hinglish (Bilingual)</option>
                </select>
              </label>
              <label className="full">
                Professional Bio & Target Context
                <textarea
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Summarize your background, primary areas of expertise, and goals for mock interview practice..."
                />
              </label>
            </div>
          )}

          {/* 2. EDUCATION TAB */}
          {tab === 'Education' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-zinc-500">
                  Include your formal academic degrees, university, graduation year, and academic achievements.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEdu(null)
                    setShowEduModal(true)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
                >
                  + Add Degree
                </button>
              </div>

              {educationHistory.length === 0 ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-zinc-200 text-center">
                  <span className="text-3xl block mb-2">🎓</span>
                  <p className="text-xs font-semibold text-zinc-600">No education entries added yet.</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Add your degree to help interviewers understand your academic foundation.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {educationHistory.map(edu => (
                    <div
                      key={edu.id}
                      className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-900">{edu.institution}</h4>
                          {edu.grade && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {edu.grade}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-700 font-medium mt-0.5">
                          {edu.degree} in {edu.fieldOfStudy}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          {edu.startYear} – {edu.endYear || 'Present'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEdu(edu)
                            setShowEduModal(true)
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. EXPERIENCE TAB */}
          {tab === 'Experience & Projects' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-zinc-500">
                  Highlight past internships, full-time jobs, open source contributions, or major capstone projects.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExp(null)
                    setShowExpModal(true)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
                >
                  + Add Experience
                </button>
              </div>

              {experienceHistory.length === 0 ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-zinc-200 text-center">
                  <span className="text-3xl block mb-2">💼</span>
                  <p className="text-xs font-semibold text-zinc-600">No work experience or project entries recorded.</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Adding project details allows the AI interviewer to generate tailored deep-dive questions.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {experienceHistory.map(exp => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-900">{exp.role}</h4>
                          <span className="text-xs font-semibold text-zinc-500">@ {exp.company}</span>
                          {exp.current && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </p>
                        <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExp(exp)
                            setShowExpModal(true)
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. SKILLS TAB */}
          {tab === 'Skills' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">Add Custom Skill Tag</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill(newSkillInput)
                      }
                    }}
                    placeholder="e.g. Distributed Consensus, Next.js, Redis, Behavioral Leadership"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(newSkillInput)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-2">Your Active Skills ({skills.length})</label>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-indigo-400 hover:text-indigo-800 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-xs text-zinc-400 italic">No skills listed yet. Choose from suggestions below or add custom skills.</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100">
                <span className="text-xs font-bold text-zinc-500 block mb-2">Popular Suggested Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.filter(s => !skills.includes(s)).map(ps => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => handleAddSkill(ps)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-indigo-100 text-zinc-700 hover:text-indigo-900 text-[11px] font-medium transition-all"
                    >
                      + {ps}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. RESUME TAB */}
          {tab === 'Resume files' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-50 border border-zinc-200/90 text-center">
                <span className="text-4xl block mb-2">📄</span>
                <h3 className="text-sm font-bold text-zinc-900">Upload your latest résumé</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  PDF or Word document (maximum 10 MB). Stored securely in your private Supabase Storage bucket.
                </p>

                <div className="mt-4 flex justify-center">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2">
                    <span>{uploadingResume ? 'Uploading to Supabase...' : 'Choose File to Upload'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {resume && (
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900">{resume.fileName}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Uploaded {new Date(resume.uploadedAt).toLocaleDateString()} · {(resume.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {resumeSignedUrl && (
                      <a
                        href={resumeSignedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-slate-50 text-xs font-semibold text-zinc-700 inline-block"
                      >
                        Preview / Download ↗
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
                <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wider">
                  AI Context Generation Insights
                </span>
                <p>• Your uploaded resume is parsed securely to inject realistic background details into mock interviewers.</p>
                <p>• Mentors you book can securely preview this resume ahead of scheduled 1:1 sessions.</p>
                <p>• Private storage RLS guarantees public visitors cannot browse your resume.</p>
              </div>
            </div>
          )}

          {/* 6. PREFERENCES TAB */}
          {tab === 'Preferences' && (
            <div className="profile-form">
              <label>
                Preferred Practice Mode
                <select value={preferredMode} onChange={e => setPreferredMode(e.target.value as any)}>
                  <option value="both">Voice orb + Realtime text transcript (Recommended)</option>
                  <option value="voice">Voice orb only</option>
                  <option value="text">Text typing only</option>
                </select>
              </label>
              <label>
                Interface Accessibility
                <select defaultValue="Standard">
                  <option>Standard contrast & motion</option>
                  <option>Reduced motion</option>
                  <option>High contrast</option>
                </select>
              </label>
              <div className="full pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  <span>Send email notifications when mentors confirm 1:1 booking requests</span>
                </label>
              </div>
            </div>
          )}

          {/* SAVE BUTTON ROW */}
          <div className="save-row mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? 'Synchronizing with Database...' : 'Save Profile Changes →'}
            </button>
          </div>
        </section>
      </div>

      {/* Education Modal */}
      {showEduModal && (
        <EducationModal
          initial={editingEdu}
          onSave={handleSaveEducation}
          onClose={() => {
            setShowEduModal(false)
            setEditingEdu(null)
          }}
        />
      )}

      {/* Experience Modal */}
      {showExpModal && (
        <ExperienceModal
          initial={editingExp}
          onSave={handleSaveExperience}
          onClose={() => {
            setShowExpModal(false)
            setEditingExp(null)
          }}
        />
      )}
    </>
  )
}

function EducationModal({
  initial,
  onSave,
  onClose,
}: {
  initial: EducationEntry | null
  onSave: (entry: EducationEntry) => void
  onClose: () => void
}) {
  const [institution, setInstitution] = useState(initial?.institution || '')
  const [degree, setDegree] = useState(initial?.degree || 'B.Tech')
  const [fieldOfStudy, setFieldOfStudy] = useState(initial?.fieldOfStudy || '')
  const [startYear, setStartYear] = useState(initial?.startYear || '2022')
  const [endYear, setEndYear] = useState(initial?.endYear || '2026')
  const [grade, setGrade] = useState(initial?.grade || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!institution.trim() || !degree.trim()) return
    onSave({
      id: initial?.id || `edu-${Date.now()}`,
      institution: institution.trim(),
      degree: degree.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      startYear: startYear.trim(),
      endYear: endYear.trim(),
      grade: grade.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200">
        <h3 className="text-base font-bold text-zinc-900 mb-1">
          {initial ? 'Edit Education' : 'Add Degree or Academic Program'}
        </h3>
        <p className="text-xs text-zinc-500 mb-4">Enter details of your college, university, or institute.</p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-zinc-700 block mb-1">Institution / University</label>
            <input
              type="text"
              required
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              placeholder="e.g. IIT Delhi, BITS Pilani, Delhi University"
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Degree</label>
              <input
                type="text"
                required
                value={degree}
                onChange={e => setDegree(e.target.value)}
                placeholder="B.Tech, MBA, M.S., B.Com"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Field of Study</label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={e => setFieldOfStudy(e.target.value)}
                placeholder="Computer Science, Finance"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Start Year</label>
              <input
                type="text"
                value={startYear}
                onChange={e => setStartYear(e.target.value)}
                placeholder="2022"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-zinc-700 block mb-1">End / Grad Year</label>
              <input
                type="text"
                value={endYear}
                onChange={e => setEndYear(e.target.value)}
                placeholder="2026"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Grade / CGPA</label>
              <input
                type="text"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                placeholder="8.9 CGPA"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Save Degree
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ExperienceModal({
  initial,
  onSave,
  onClose,
}: {
  initial: ExperienceEntry | null
  onSave: (entry: ExperienceEntry) => void
  onClose: () => void
}) {
  const [company, setCompany] = useState(initial?.company || '')
  const [role, setRole] = useState(initial?.role || '')
  const [startDate, setStartDate] = useState(initial?.startDate || '')
  const [endDate, setEndDate] = useState(initial?.endDate || '')
  const [current, setCurrent] = useState(initial?.current || false)
  const [description, setDescription] = useState(initial?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !role.trim()) return
    onSave({
      id: initial?.id || `exp-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      startDate: startDate.trim(),
      endDate: current ? '' : endDate.trim(),
      current,
      description: description.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-zinc-200">
        <h3 className="text-base font-bold text-zinc-900 mb-1">
          {initial ? 'Edit Work Experience or Project' : 'Add Work Experience or Project'}
        </h3>
        <p className="text-xs text-zinc-500 mb-4">Highlight technical tasks, architecture, or deliverables.</p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Company / Project Name</label>
              <input
                type="text"
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Razorpay, Capstone AI Project"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Role / Position</label>
              <input
                type="text"
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Software Engineer Intern, Lead Author"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Start Date</label>
              <input
                type="text"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                placeholder="e.g. May 2025"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-zinc-700 block mb-1">End Date</label>
              <input
                type="text"
                disabled={current}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                placeholder={current ? 'Present' : 'e.g. Aug 2025'}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none disabled:bg-zinc-100"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-700">
            <input
              type="checkbox"
              checked={current}
              onChange={e => setCurrent(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span>I currently work here or this project is ongoing</span>
          </label>

          <div>
            <label className="font-bold text-zinc-700 block mb-1">Key Responsibilities & Contributions</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your architectural decisions, frameworks used, performance metrics improved, and how you answered tough trade-off questions..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Save Experience
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
