'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase/use-auth'
import { createClient } from '@/lib/supabase/client'
import { uploadVerificationDocument, getSignedUrl, deleteStorageFile } from '@/lib/supabase/storage'
import { VerificationDocumentMeta, InterviewerProfileData } from '@/types/profile'

const AVAILABLE_DOMAINS = [
  'Software Engineering',
  'Project Defence',
  'System Design',
  'Data Analytics',
  'MBA Admissions',
  'Campus Placement',
  'UPSC Personality Test',
  'State PSC Interviews',
  'Administrative Ethics',
  'Communication & Structure',
  'Banking PO Interviews',
]

export function InterviewerProfileEditor() {
  const { user, profile, refreshProfile } = useAuth()
  const supabase = createClient()

  const tabs = ['Profile & Bio', 'Expertise & Categories', 'Verification Documents', 'Rates & Services']
  const [tab, setTab] = useState('Profile & Bio')

  // Form states
  const [name, setName] = useState(profile?.name || user?.user_metadata?.name || 'Riya Mehta')
  const [title, setTitle] = useState('Senior Software Engineer | Ex-Fintech')
  const [headline, setHeadline] = useState('Technical mock interviews, architecture deep dives & project defence')
  const [category, setCategory] = useState<'professional' | 'exam_cleared' | 'faculty' | 'coach'>('professional')
  const [experienceYears, setExperienceYears] = useState('6+ years')
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi'])
  const [bio, setBio] = useState('6+ years in backend systems and distributed platforms. I help early-career engineers articulate technical decisions, reason through trade-offs, and handle rigorous follow-ups with poise.')
  const [hourlyRate, setHourlyRate] = useState(1199)

  // Expertise domains
  const [domains, setDomains] = useState<string[]>([
    'Software Engineering',
    'Project Defence',
    'System Design',
  ])

  // Document states
  const [evidenceDoc, setEvidenceDoc] = useState<VerificationDocumentMeta | null>(null)
  const [evidenceSignedUrl, setEvidenceSignedUrl] = useState<string | null>(null)
  const [certificates, setCertificates] = useState<VerificationDocumentMeta[]>([])
  const [uploadingDoc, setUploadingDoc] = useState(false)

  // Status
  const [verificationStatus, setVerificationStatus] = useState<string>('under_review')
  const [verificationBadge, setVerificationBadge] = useState<boolean>(false)
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [adminNotes, setAdminNotes] = useState<string>('')

  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load profile data on mount / refresh
  useEffect(() => {
    if (profile?.interviewer_profile) {
      const ip: InterviewerProfileData = profile.interviewer_profile
      if (ip.title) setTitle(ip.title)
      if (ip.headline) setHeadline(ip.headline)
      if (ip.category) setCategory(ip.category)
      if (ip.experienceYears) setExperienceYears(ip.experienceYears)
      if (ip.languages && ip.languages.length > 0) setLanguages(ip.languages)
      if (ip.bio) setBio(ip.bio)
      if (ip.hourlyRate) setHourlyRate(ip.hourlyRate)
      if (ip.domains && ip.domains.length > 0) setDomains(ip.domains)
      if (ip.verificationStatus) setVerificationStatus(ip.verificationStatus)
      if (typeof ip.verificationBadge === 'boolean') setVerificationBadge(ip.verificationBadge)
      if (ip.rejectionReason) setRejectionReason(ip.rejectionReason)
      if (ip.adminNotes) setAdminNotes(ip.adminNotes)

      if (ip.evidenceDocument) {
        setEvidenceDoc(ip.evidenceDocument)
        if (ip.evidenceDocument.path) {
          getSignedUrl('verification_documents', ip.evidenceDocument.path).then(url => {
            if (url) setEvidenceSignedUrl(url)
          })
        }
      } else if (ip.evidenceDocumentName) {
        setEvidenceDoc({
          path: '',
          fileName: ip.evidenceDocumentName,
          uploadedAt: new Date().toISOString(),
          fileSize: 1240000,
          type: 'evidence',
        })
      }

      if (ip.certificates && ip.certificates.length > 0) {
        setCertificates(ip.certificates)
      }
    }
  }, [profile])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const toggleDomain = (domain: string) => {
    setDomains(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    )
  }

  // Upload verification evidence document
  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCert = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!user) {
      setErrorMessage('You must be signed in to upload verification evidence.')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15 MB limit.')
      return
    }

    setUploadingDoc(true)
    setErrorMessage(null)

    try {
      const result = await uploadVerificationDocument(file, user.id, isCert ? 'certificate' : 'evidence')
      const docMeta: VerificationDocumentMeta = {
        path: result.path,
        fileName: result.name,
        uploadedAt: new Date().toISOString(),
        fileSize: result.size,
        type: isCert ? 'certificate' : 'evidence',
        signedUrl: result.signedUrl,
      }

      if (isCert) {
        setCertificates(prev => [...prev, docMeta])
        showToast(`Certificate "${file.name}" uploaded. Please save changes.`)
      } else {
        setEvidenceDoc(docMeta)
        if (result.signedUrl) setEvidenceSignedUrl(result.signedUrl)
        showToast(`Employment verification document "${file.name}" uploaded. Please save changes.`)
      }
    } catch (err: any) {
      console.error('Document upload error:', err)
      setErrorMessage(err?.message || 'Failed to upload verification document to storage.')
    } finally {
      setUploadingDoc(false)
      e.target.value = ''
    }
  }

  const handleRemoveEvidence = async () => {
    if (!evidenceDoc) return
    if (confirm('Are you sure you want to remove this verification document?')) {
      if (evidenceDoc.path) {
        await deleteStorageFile('verification_documents', evidenceDoc.path)
      }
      setEvidenceDoc(null)
      setEvidenceSignedUrl(null)
      showToast('Document removed. Remember to save changes.')
    }
  }

  const handleRemoveCert = async (cert: VerificationDocumentMeta) => {
    if (confirm(`Remove certificate "${cert.fileName}"?`)) {
      if (cert.path) {
        await deleteStorageFile('verification_documents', cert.path)
      }
      setCertificates(prev => prev.filter(c => c.fileName !== cert.fileName))
      showToast('Certificate removed.')
    }
  }

  // Save profile & optionally submit for review
  const handleSaveProfile = async (submitForReview = false) => {
    setSaving(true)
    setErrorMessage(null)

    const nextStatus = submitForReview ? 'under_review' : verificationStatus

    const updatedInterviewerProfile: InterviewerProfileData = {
      title,
      headline,
      category,
      domains,
      experienceYears,
      languages,
      bio,
      hourlyRate,
      verificationStatus: nextStatus as any,
      verificationBadge: nextStatus === 'approved' ? true : verificationBadge,
      evidenceDocument: evidenceDoc,
      evidenceDocumentName: evidenceDoc?.fileName || profile?.interviewer_profile?.evidenceDocumentName,
      certificates,
      rating: profile?.interviewer_profile?.rating || 4.9,
      reviewCount: profile?.interviewer_profile?.reviewCount || 0,
      completedSessions: profile?.interviewer_profile?.completedSessions || 0,
      netEarnings: profile?.interviewer_profile?.netEarnings || 0,
      pendingPayout: profile?.interviewer_profile?.pendingPayout || 0,
      rejectionReason,
      adminNotes,
    }

    try {
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({
            name: name.trim(),
            status: nextStatus === 'approved' ? 'active' : 'under_review',
            interviewer_profile: updatedInterviewerProfile,
            last_active: 'Just now',
          })
          .eq('id', user.id)

        if (error) throw error
        await refreshProfile()
      }

      if (submitForReview) {
        setVerificationStatus('under_review')
        showToast('Your application and credentials have been submitted for Platform Review!')
      } else {
        showToast('Interviewer profile details successfully saved!')
      }
    } catch (err: any) {
      console.error('Error saving interviewer profile:', err)
      setErrorMessage(err?.message || 'Failed to save profile. Please verify your connection.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="app-page-title">
        <div className="app-title-text">
          <p>INTERVIEWER CREDENTIALS & COCKPIT</p>
          <h1>Professional Profile & Verification</h1>
          <span>Manage your mock interview specializations, credentials, evidence documents, and public directory listing.</span>
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

      {/* Verification Status Banner */}
      {verificationStatus === 'approved' ? (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Verified Platform Mentor (Approved)
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your credentials are fully verified. Candidates can discover your profile and book mock sessions on the public mentor directory.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-800">
            ✓ Publicly Active
          </span>
        </div>
      ) : verificationStatus === 'needs_information' ? (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Reviewer Requested Additional Information
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {adminNotes || 'Please upload a clearer proof of your employment letter or official notification confirming your technical domain.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSaveProfile(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex-shrink-0"
          >
            Re-submit for Review →
          </button>
        </div>
      ) : verificationStatus === 'rejected' ? (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">❌</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Application Needs Revision
              </h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Reason: {rejectionReason || 'Uploaded documentation did not meet domain verification requirements. You may upload revised documents and re-apply.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSaveProfile(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex-shrink-0"
          >
            Re-apply for Review →
          </button>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⏳</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Application Under Review by Trust & Safety
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Our verification team is reviewing your background and evidence documents. You can configure availability and preview your profile now.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200/80 text-amber-800 flex-shrink-0">
            Pending Staff Review
          </span>
        </div>
      )}

      {/* Main Tabs Layout */}
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
                {tab === 'Verification Documents'
                  ? 'Private Verification Evidence & Certificates'
                  : tab === 'Expertise & Categories'
                  ? 'Interview Tracks & Mock Domains'
                  : tab === 'Rates & Services'
                  ? 'Mentorship Pricing & Packages'
                  : 'Professional Identity & Bio'}
              </h2>
            </div>
          </div>

          {/* 1. PROFILE & BIO TAB */}
          {tab === 'Profile & Bio' && (
            <div className="profile-form">
              <label>
                Display / Legal Name
                <input value={name} onChange={e => setName(e.target.value)} />
              </label>
              <label>
                Professional Category
                <select value={category} onChange={e => setCategory(e.target.value as any)}>
                  <option value="professional">Professional / Industry Practitioner</option>
                  <option value="exam_cleared">Exam-cleared / Former Ranker</option>
                  <option value="faculty">Faculty / Academic Interview Chair</option>
                  <option value="coach">Executive Coach / Communication Expert</option>
                </select>
              </label>
              <label className="full">
                Headline (Appears in Mentor Directory)
                <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Senior Software Engineer | Technical Mock Interviews & System Design" />
              </label>
              <label>
                Years of Experience
                <input value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="e.g. 6+ years" />
              </label>
              <label>
                Spoken Languages (Comma separated)
                <input
                  value={languages.join(', ')}
                  onChange={e => setLanguages(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="English, Hindi"
                />
              </label>
              <label className="full">
                Comprehensive Bio & Mentoring Philosophy
                <textarea
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Explain your technical background, what kinds of questions you ask, and how you help candidates gain interview poise..."
                />
              </label>
            </div>
          )}

          {/* 2. EXPERTISE & CATEGORIES TAB */}
          {tab === 'Expertise & Categories' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                Select the interview tracks and domains in which you have firsthand hiring or assessment experience.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_DOMAINS.map(dom => {
                  const selected = domains.includes(dom)
                  return (
                    <div
                      key={dom}
                      onClick={() => toggleDomain(dom)}
                      className={`p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                        selected
                          ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 shadow-xs'
                          : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700'
                      }`}
                    >
                      <span>{dom}</span>
                      <span className={`text-xs font-bold ${selected ? 'text-indigo-600' : 'text-zinc-300'}`}>
                        {selected ? '✓ Selected' : '+ Add'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3. VERIFICATION DOCUMENTS TAB */}
          {tab === 'Verification Documents' && (
            <div className="space-y-6">
              {/* Primary Evidence */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-zinc-200 text-center">
                <span className="text-4xl block mb-2">🔒</span>
                <h3 className="text-sm font-bold text-zinc-900">Upload Official Verification Evidence</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                  Provide an official employment letter, staff/faculty ID, corporate email verification, or government appointment order (PDF/PNG/JPG up to 15 MB).
                  Stored securely in private Supabase Storage and accessible only by compliance staff.
                </p>

                <div className="mt-4 flex justify-center">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2">
                    <span>{uploadingDoc ? 'Uploading document...' : 'Upload Primary Evidence'}</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={e => handleEvidenceUpload(e, false)}
                      disabled={uploadingDoc}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {evidenceDoc && (
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900">{evidenceDoc.fileName}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Primary Evidence · {(evidenceDoc.fileSize / 1024).toFixed(1)} KB · Encrypted
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {evidenceSignedUrl && (
                      <a
                        href={evidenceSignedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-slate-50 text-xs font-semibold text-zinc-700 inline-block"
                      >
                        Secure Preview ↗
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveEvidence}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Professional Certificates */}
              <div className="pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800">Additional Certifications & Credentials</h4>
                    <p className="text-[11px] text-zinc-400">AWS Certified Solutions Architect, PMP, Bar Council, UGC NET, etc.</p>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all inline-flex items-center gap-1">
                    <span>+ Add Certificate</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={e => handleEvidenceUpload(e, true)}
                      disabled={uploadingDoc}
                      className="hidden"
                    />
                  </label>
                </div>

                {certificates.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">No additional certificates attached.</p>
                ) : (
                  <div className="space-y-2">
                    {certificates.map(cert => (
                      <div
                        key={cert.fileName}
                        className="p-3 rounded-xl bg-white border border-zinc-200 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-zinc-800 flex items-center gap-2">
                          <span>📜</span>
                          <span>{cert.fileName}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          {cert.signedUrl && (
                            <a
                              href={cert.signedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-indigo-600 hover:underline font-semibold"
                            >
                              View ↗
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveCert(cert)}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. RATES & SERVICES TAB */}
          {tab === 'Rates & Services' && (
            <div className="profile-form">
              <label>
                Hourly 1:1 Mock Interview Fee (₹)
                <input
                  type="number"
                  min={499}
                  max={9999}
                  value={hourlyRate}
                  onChange={e => setHourlyRate(Number(e.target.value))}
                />
              </label>
              <div className="full p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/60 text-xs text-indigo-900 leading-relaxed">
                <span className="font-bold block mb-1">Transparent Payout Calculation</span>
                <p>• Standard 45-min Mock Session: <b>₹{Math.round(hourlyRate * 0.75)}</b> gross</p>
                <p>• Platform Fee (20% covers recording, transcription, rubrics & AI parsing): <b>₹{Math.round(hourlyRate * 0.75 * 0.2)}</b></p>
                <p>• Your Estimated Net Payout per session: <b>₹{Math.round(hourlyRate * 0.75 * 0.8)}</b></p>
              </div>
            </div>
          )}

          {/* SAVE BUTTONS ROW */}
          <div className="save-row mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSaveProfile(false)}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-slate-50 text-zinc-700 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft Changes'}
            </button>

            <button
              type="button"
              onClick={() => handleSaveProfile(true)}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Save & Submit for Verification Review →'}
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
