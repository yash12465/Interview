'use client'

import { CircleX, FileText, Hourglass, Lock, ShieldCheck, TriangleAlert } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/error-message'
import { createClient } from '@/lib/supabase/client'
import { deleteStorageFile, getSignedUrl, uploadVerificationDocument } from '@/lib/supabase/storage'
import { useAuth } from '@/lib/supabase/use-auth'
import type { InterviewerProfileData, VerificationDocumentMeta } from '@/types/profile'

type VerificationStatus = NonNullable<InterviewerProfileData['verificationStatus']>

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

  const tabs = [
    'Profile & Bio',
    'Expertise & Categories',
    'Verification Documents',
    'Rates & Services',
  ]
  const [tab, setTab] = useState('Profile & Bio')

  // Form states
  const [name, setName] = useState(profile?.name || user?.user_metadata?.name || 'Riya Mehta')
  const [title, setTitle] = useState('Senior Software Engineer | Ex-Fintech')
  const [headline, setHeadline] = useState(
    'Technical mock interviews, architecture deep dives & project defence',
  )
  const [category, setCategory] = useState<'professional' | 'exam_cleared' | 'faculty' | 'coach'>(
    'professional',
  )
  const [experienceYears, setExperienceYears] = useState('6+ years')
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi'])
  const [bio, setBio] = useState(
    '6+ years in backend systems and distributed platforms. I help early-career engineers articulate technical decisions, reason through trade-offs, and handle rigorous follow-ups with poise.',
  )
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
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('under_review')
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
          getSignedUrl('verification_documents', ip.evidenceDocument.path).then((url) => {
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
    setDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain],
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
      const result = await uploadVerificationDocument(
        file,
        user.id,
        isCert ? 'certificate' : 'evidence',
      )
      const docMeta: VerificationDocumentMeta = {
        path: result.path,
        fileName: result.name,
        uploadedAt: new Date().toISOString(),
        fileSize: result.size,
        type: isCert ? 'certificate' : 'evidence',
        signedUrl: result.signedUrl,
      }

      if (isCert) {
        setCertificates((prev) => [...prev, docMeta])
        showToast(`Certificate "${file.name}" uploaded. Please save changes.`)
      } else {
        setEvidenceDoc(docMeta)
        if (result.signedUrl) setEvidenceSignedUrl(result.signedUrl)
        showToast(`Employment verification document "${file.name}" uploaded. Please save changes.`)
      }
    } catch (err) {
      console.error('Document upload error:', err)
      setErrorMessage(getErrorMessage(err, 'Failed to upload verification document to storage.'))
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
      setCertificates((prev) => prev.filter((c) => c.fileName !== cert.fileName))
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
      verificationStatus: nextStatus,
      verificationBadge: nextStatus === 'approved' ? true : verificationBadge,
      evidenceDocument: evidenceDoc,
      evidenceDocumentName:
        evidenceDoc?.fileName || profile?.interviewer_profile?.evidenceDocumentName,
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
    } catch (err) {
      console.error('Error saving interviewer profile:', err)
      setErrorMessage(
        getErrorMessage(err, 'Failed to save profile. Please verify your connection.'),
      )
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
          <span>
            Manage your mock interview specializations, credentials, evidence documents, and public
            directory listing.
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-success-soft border border-success-border text-success text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">✓ {toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-danger-soft border border-danger-border text-danger text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TriangleAlert size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            {errorMessage}
          </span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-danger hover:underline font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Verification Status Banner */}
      {verificationStatus === 'approved' ? (
        <div className="mb-6 p-4 rounded-2xl bg-success-soft border border-success-border text-success flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-success">
                Verified Platform Mentor (Approved)
              </h4>
              <p className="text-xs text-success mt-0.5">
                Your credentials are fully verified. Candidates can discover your profile and book
                mock sessions on the public mentor directory.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-success-soft text-success">
            ✓ Publicly Active
          </span>
        </div>
      ) : verificationStatus === 'needs_information' ? (
        <div className="mb-6 p-4 rounded-2xl bg-warning-soft border border-warning-border text-warning flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <TriangleAlert size={24} className="shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-warning">
                Reviewer Requested Additional Information
              </h4>
              <p className="text-xs text-warning mt-0.5 leading-relaxed">
                {adminNotes ||
                  'Please upload a clearer proof of your employment letter or official notification confirming your technical domain.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSaveProfile(true)}
            className="px-3.5 py-1.5 rounded-xl bg-warning-solid hover:bg-warning-solid/90 text-inverse text-xs font-bold shrink-0"
          >
            Re-submit for Review →
          </button>
        </div>
      ) : verificationStatus === 'rejected' ? (
        <div className="mb-6 p-4 rounded-2xl bg-danger-soft border border-danger-border text-danger flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CircleX size={24} className="shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-danger">
                Application Needs Revision
              </h4>
              <p className="text-xs text-danger mt-0.5 leading-relaxed">
                Reason:{' '}
                {rejectionReason ||
                  'Uploaded documentation did not meet domain verification requirements. You may upload revised documents and re-apply.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSaveProfile(true)}
            className="px-3.5 py-1.5 rounded-xl bg-danger-solid hover:bg-danger-solid/90 text-inverse text-xs font-bold shrink-0"
          >
            Re-apply for Review →
          </button>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-warning-soft/90 border border-warning-border text-warning flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Hourglass size={24} className="shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-warning">
                Application Under Review by Trust & Safety
              </h4>
              <p className="text-xs text-warning mt-0.5">
                Our verification team is reviewing your background and evidence documents. You can
                configure availability and preview your profile now.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning-soft/80 text-warning shrink-0">
            Pending Staff Review
          </span>
        </div>
      )}

      {/* Main Tabs Layout */}
      <div className="profile-layout">
        <aside>
          {tabs.map((x) => (
            <button
              type="button"
              className={tab === x ? 'active' : ''}
              onClick={() => setTab(x)}
              key={x}
            >
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
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label>
                Professional Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                >
                  <option value="professional">Professional / Industry Practitioner</option>
                  <option value="exam_cleared">Exam-cleared / Former Ranker</option>
                  <option value="faculty">Faculty / Academic Interview Chair</option>
                  <option value="coach">Executive Coach / Communication Expert</option>
                </select>
              </label>
              <label className="full">
                Headline (Appears in Mentor Directory)
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Software Engineer | Technical Mock Interviews & System Design"
                />
              </label>
              <label>
                Years of Experience
                <input
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g. 6+ years"
                />
              </label>
              <label>
                Spoken Languages (Comma separated)
                <input
                  value={languages.join(', ')}
                  onChange={(e) =>
                    setLanguages(
                      e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                  placeholder="English, Hindi"
                />
              </label>
              <label className="full">
                Comprehensive Bio & Mentoring Philosophy
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Explain your technical background, what kinds of questions you ask, and how you help candidates gain interview poise..."
                />
              </label>
            </div>
          )}

          {/* 2. EXPERTISE & CATEGORIES TAB */}
          {tab === 'Expertise & Categories' && (
            <div className="space-y-4">
              <p className="text-xs text-muted">
                Select the interview tracks and domains in which you have firsthand hiring or
                assessment experience.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_DOMAINS.map((dom) => {
                  const selected = domains.includes(dom)
                  return (
                    <button
                      type="button"
                      key={dom}
                      onClick={() => toggleDomain(dom)}
                      aria-pressed={selected}
                      className={`text-left p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                        selected
                          ? 'bg-brand-soft/80 border-brand text-ink shadow-xs'
                          : 'bg-surface border-border hover:border-border-strong text-body'
                      }`}
                    >
                      <span>{dom}</span>
                      <span
                        className={`text-xs font-bold ${selected ? 'text-brand-strong' : 'text-inverse-muted'}`}
                      >
                        {selected ? '✓ Selected' : '+ Add'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3. VERIFICATION DOCUMENTS TAB */}
          {tab === 'Verification Documents' && (
            <div className="space-y-6">
              {/* Primary Evidence */}
              <div className="p-6 rounded-3xl bg-surface-soft border border-border text-center">
                <Lock size={36} className="block mb-2" />
                <h3 className="text-sm font-bold text-ink">
                  Upload Official Verification Evidence
                </h3>
                <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                  Provide an official employment letter, staff/faculty ID, corporate email
                  verification, or government appointment order (PDF/PNG/JPG up to 15 MB). Stored
                  securely in private Supabase Storage and accessible only by compliance staff.
                </p>

                <div className="mt-4 flex justify-center">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-inverse text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2">
                    <span>
                      {uploadingDoc ? 'Uploading document...' : 'Upload Primary Evidence'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleEvidenceUpload(e, false)}
                      disabled={uploadingDoc}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {evidenceDoc && (
                <div className="p-4 rounded-2xl bg-surface border border-success-border shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success-soft text-success font-bold flex items-center justify-center text-lg">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-ink">
                        {evidenceDoc.fileName}
                      </h4>
                      <p className="text-xs text-subtle mt-0.5">
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
                        className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-soft text-xs font-semibold text-body inline-block"
                      >
                        Secure Preview ↗
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveEvidence}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-danger hover:bg-danger-soft"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Professional Certificates */}
              <div className="pt-4 border-t border-border-soft">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-ink">
                      Additional Certifications & Credentials
                    </h4>
                    <p className="text-xs text-subtle">
                      AWS Certified Solutions Architect, PMP, Bar Council, UGC NET, etc.
                    </p>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-surface-sunken hover:bg-border text-ink text-xs font-bold transition-all inline-flex items-center gap-1">
                    <span>+ Add Certificate</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleEvidenceUpload(e, true)}
                      disabled={uploadingDoc}
                      className="hidden"
                    />
                  </label>
                </div>

                {certificates.length === 0 ? (
                  <p className="text-xs text-subtle italic">No additional certificates attached.</p>
                ) : (
                  <div className="space-y-2">
                    {certificates.map((cert) => (
                      <div
                        key={cert.fileName}
                        className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-ink flex items-center gap-2">
                          <FileText size={16} />
                          <span>{cert.fileName}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          {cert.signedUrl && (
                            <a
                              href={cert.signedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-brand-strong hover:underline font-semibold"
                            >
                              View ↗
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveCert(cert)}
                            className="text-xs text-danger hover:underline font-semibold"
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
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                />
              </label>
              <div className="full p-4 rounded-2xl bg-brand-soft/60 border border-brand-tint/60 text-xs text-ink leading-relaxed">
                <span className="font-bold block mb-1">Transparent Payout Calculation</span>
                <p>
                  • Standard 45-min Mock Session: <b>₹{Math.round(hourlyRate * 0.75)}</b> gross
                </p>
                <p>
                  • Platform Fee (20% covers recording, transcription, rubrics & AI parsing):{' '}
                  <b>₹{Math.round(hourlyRate * 0.75 * 0.2)}</b>
                </p>
                <p>
                  • Your Estimated Net Payout per session:{' '}
                  <b>₹{Math.round(hourlyRate * 0.75 * 0.8)}</b>
                </p>
              </div>
            </div>
          )}

          {/* SAVE BUTTONS ROW */}
          <div className="save-row mt-6 pt-4 border-t border-border-soft flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSaveProfile(false)}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-border-strong hover:bg-surface-soft text-body text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft Changes'}
            </button>

            <button
              type="button"
              onClick={() => handleSaveProfile(true)}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-inverse text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Save & Submit for Verification Review →'}
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
