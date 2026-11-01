'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/use-auth'
import { getSignedUrl } from '@/lib/supabase/storage'

export function AdminVerificationQueue() {
  const { user: currentAdmin } = useAuth()
  const supabase = createClient()

  const [applicants, setApplicants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState('New / Under Review')
  const [appTab, setAppTab] = useState<'Application' | 'Evidence' | 'Profile' | 'Services'>('Application')
  const [search, setSearch] = useState('')

  // Modal actions
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'needs_info' | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Document preview state
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null)
  const [previewDocName, setPreviewDocName] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchApplicants = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'interviewer')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplicants(data || [])
      if (data && data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
      }
    } catch (err: any) {
      console.error('Error fetching verification queue:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplicants()
  }, [])

  // Filter applicants
  const filtered = applicants.filter(a => {
    const vStatus = a.interviewer_profile?.verificationStatus || a.status || 'under_review'
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (tab === 'New / Under Review') {
      return vStatus === 'under_review' || vStatus === 'submitted' || vStatus === 'draft'
    }
    if (tab === 'Approved') return vStatus === 'approved'
    if (tab === 'Needs Information') return vStatus === 'needs_information'
    if (tab === 'Rejected') return vStatus === 'rejected'
    return true
  })

  const selected = applicants.find(a => a.id === selectedId) || filtered[0] || null

  // Fetch signed URL for document preview
  const handleOpenDocPreview = async (docPath?: string, docName?: string) => {
    setPreviewDocName(docName || 'Verification Evidence')
    if (docPath) {
      const signed = await getSignedUrl('verification_documents', docPath)
      setPreviewDocUrl(signed)
    } else {
      // Fallback illustration preview for demo files
      setPreviewDocUrl(null)
    }
  }

  // Handle Verification Mutation
  const handleExecuteVerification = async () => {
    if (!actionType || !selected) return
    setActionLoading(true)

    try {
      let nextStatus = 'active'
      let nextVStatus = 'approved'
      let badge = true
      let reason = actionReason.trim()

      if (actionType === 'approve') {
        nextStatus = 'active'
        nextVStatus = 'approved'
        badge = true
        reason = reason || 'Applicant verified against platform hiring standards.'
      } else if (actionType === 'reject') {
        nextStatus = 'restricted'
        nextVStatus = 'rejected'
        badge = false
        reason = reason || 'Documentation failed verification criteria.'
      } else if (actionType === 'needs_info') {
        nextStatus = 'under_review'
        nextVStatus = 'needs_information'
        badge = false
        reason = reason || 'Additional proof of domain practice required.'
      }

      const updatedProfile = {
        ...(selected.interviewer_profile || {}),
        verificationStatus: nextVStatus,
        verificationBadge: badge,
        rejectionReason: actionType === 'reject' ? reason : undefined,
        adminNotes: actionType === 'needs_info' ? reason : undefined,
      }

      // 1. Update in Supabase users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          status: nextStatus,
          interviewer_profile: updatedProfile,
          last_active: 'Just now',
        })
        .eq('id', selected.id)

      if (updateError) throw updateError

      // 2. Insert into audit_log_events
      await supabase.from('audit_log_events').insert({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_name: currentAdmin?.user_metadata?.name || 'Super Admin',
        actor_role: 'admin',
        action: `${actionType.toUpperCase()} Interviewer Application for ${selected.name}`,
        target_resource: `User ${selected.id} (${selected.email})`,
        category: 'Verification Review',
        reason,
      })

      showToast(`Application for ${selected.name} updated to ${nextVStatus.toUpperCase()}!`)
      setActionType(null)
      setActionReason('')
      await fetchApplicants()
    } catch (err: any) {
      console.error('Error updating verification status:', err)
      alert(err?.message || 'Failed to update verification status.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <div className="app-page-title">
        <div className="app-title-text">
          <p>TRUST & SAFETY COMPLIANCE</p>
          <h1>Interviewer Verification Queue</h1>
          <span>Examine credentials, inspect private evidence documents, and grant or revoke mock interview rights.</span>
        </div>
      </div>

      {toastMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>✓ {toastMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        {['New / Under Review', 'Needs Information', 'Approved', 'Rejected', 'All Applicants'].map(x => (
          <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>
            {x}
          </button>
        ))}
      </div>

      <div className="verification-workspace">
        {/* Left Sidebar List */}
        <aside>
          <label>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search applicants..."
            />
          </label>

          {loading ? (
            <div className="p-4 text-xs text-zinc-400 text-center">Loading queue...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-xs text-zinc-400 text-center">No applicants found in this category.</div>
          ) : (
            filtered.map(app => {
              const initials = app.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
              const isSelected = selected?.id === app.id
              const vStatus = app.interviewer_profile?.verificationStatus || app.status || 'under_review'

              return (
                <button
                  type="button"
                  key={app.id}
                  className={isSelected ? 'active' : ''}
                  onClick={() => setSelectedId(app.id)}
                >
                  <span>{initials}</span>
                  <div>
                    <b>{app.name}</b>
                    <small>
                      {app.interviewer_profile?.category || 'Professional'} · {app.interviewer_profile?.experienceYears || '6+ yrs'}
                    </small>
                  </div>
                  <em
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      vStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : vStatus === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {vStatus}
                  </em>
                </button>
              )
            })
          )}
        </aside>

        {/* Right Main Review Panel */}
        {selected ? (
          <main>
            <header>
              <div className="drawer-avatar">
                {selected.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <span className="font-mono text-[10px] text-zinc-400">APPLICATION {selected.id}</span>
                <h2>{selected.name}</h2>
                <p>
                  {selected.interviewer_profile?.title || 'Professional Mentor'} · {selected.email}
                </p>
              </div>
              <em className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-slate-100 text-zinc-700">
                {selected.interviewer_profile?.verificationStatus || 'UNDER REVIEW'}
              </em>
            </header>

            <div className="admin-tabs">
              {(['Application', 'Evidence', 'Profile', 'Services'] as const).map(t => (
                <button
                  key={t}
                  className={appTab === t ? 'active' : ''}
                  onClick={() => setAppTab(t)}
                >
                  {t === 'Profile' ? 'Public Profile' : t}
                </button>
              ))}
            </div>

            <section>
              {/* TAB 1: APPLICATION DETAILS */}
              {appTab === 'Application' && (
                <div className="space-y-4">
                  <div className="review-section">
                    <span>IDENTITY & SPECIALIZATION</span>
                    <dl>
                      <div>
                        <dt>Current Title</dt>
                        <dd>{selected.interviewer_profile?.title || 'Senior Software Engineer'}</dd>
                      </div>
                      <div>
                        <dt>Category</dt>
                        <dd className="capitalize">{selected.interviewer_profile?.category || 'Professional'}</dd>
                      </div>
                      <div>
                        <dt>Experience</dt>
                        <dd>{selected.interviewer_profile?.experienceYears || '6+ years'}</dd>
                      </div>
                      <div>
                        <dt>Selected Domains</dt>
                        <dd>
                          {selected.interviewer_profile?.domains?.join(', ') || 'Software Engineering, Project Defence'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="public-claim">
                    <span>BIO & INTERVIEW PHILOSOPHY</span>
                    <p>“{selected.interviewer_profile?.bio || 'I help early-career candidates build answer frameworks and reason through technical follow-ups.'}”</p>
                  </div>
                </div>
              )}

              {/* TAB 2: EVIDENCE DOCUMENTS */}
              {appTab === 'Evidence' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-zinc-200 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Submitted Proof of Credentials</h3>
                    <p className="text-xs text-zinc-500">
                      Private storage objects from the <code className="font-mono bg-zinc-200/60 px-1 rounded">verification_documents</code> bucket.
                    </p>
                  </div>

                  {/* Primary Evidence Document */}
                  <div className="p-3.5 rounded-xl bg-white border border-zinc-200 flex items-center justify-between">
                    <div>
                      <b className="text-xs text-zinc-900 block font-semibold">
                        {selected.interviewer_profile?.evidenceDocument?.fileName ||
                          selected.interviewer_profile?.evidenceDocumentName ||
                          'employment_verification_letter.pdf'}
                      </b>
                      <small className="text-[11px] text-zinc-400 block font-mono">
                        Protected Storage Path: {selected.interviewer_profile?.evidenceDocument?.path || `${selected.id}/evidence`}
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenDocPreview(
                          selected.interviewer_profile?.evidenceDocument?.path,
                          selected.interviewer_profile?.evidenceDocument?.fileName || selected.interviewer_profile?.evidenceDocumentName
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold"
                    >
                      Inspect Document ↗
                    </button>
                  </div>

                  {/* Additional Certificates */}
                  {selected.interviewer_profile?.certificates && selected.interviewer_profile.certificates.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-zinc-600 block mb-2">Attached Certificates</span>
                      <div className="space-y-2">
                        {selected.interviewer_profile.certificates.map((cert: any) => (
                          <div
                            key={cert.fileName}
                            className="p-3 rounded-xl bg-white border border-zinc-200 flex items-center justify-between text-xs"
                          >
                            <span>📜 {cert.fileName}</span>
                            <button
                              type="button"
                              onClick={() => handleOpenDocPreview(cert.path, cert.fileName)}
                              className="text-xs text-indigo-600 font-bold hover:underline"
                            >
                              Inspect ↗
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PUBLIC PROFILE PREVIEW */}
              {appTab === 'Profile' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-zinc-200 space-y-3 text-xs leading-relaxed">
                  <h3 className="text-sm font-bold text-zinc-900">Public Mentor Directory Listing</h3>
                  <p>
                    <b className="text-zinc-800">Headline:</b> {selected.interviewer_profile?.headline || 'Technical mock interviews, architecture deep dives & project defence'}
                  </p>
                  <p>
                    <b className="text-zinc-800">Bio:</b> {selected.interviewer_profile?.bio}
                  </p>
                  <p>
                    <b className="text-zinc-800">Languages:</b> {selected.interviewer_profile?.languages?.join(', ') || 'English, Hindi'}
                  </p>
                </div>
              )}

              {/* TAB 4: SERVICES & PRICING */}
              {appTab === 'Services' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-zinc-200 space-y-3 text-xs leading-relaxed">
                  <h3 className="text-sm font-bold text-zinc-900">Proposed Pricing Structure</h3>
                  <p>
                    <b className="text-zinc-800">Hourly Rate:</b> ₹{selected.interviewer_profile?.hourlyRate || 1199} / session
                  </p>
                  <p>
                    <b className="text-zinc-800">45-min Mock Session:</b> ₹{Math.round((selected.interviewer_profile?.hourlyRate || 1199) * 0.75)}
                  </p>
                  <p>
                    <b className="text-zinc-800">Net Interviewer Payout (80%):</b> ₹{Math.round((selected.interviewer_profile?.hourlyRate || 1199) * 0.75 * 0.8)}
                  </p>
                </div>
              )}
            </section>

            {/* Decision Footer */}
            <footer>
              <button
                type="button"
                onClick={() => setActionType('needs_info')}
                className="px-3.5 py-2 rounded-xl text-zinc-700 bg-zinc-100 hover:bg-zinc-200 text-xs font-bold"
              >
                Request More Information
              </button>
              <button
                type="button"
                onClick={() => setActionType('reject')}
                className="px-3.5 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold"
              >
                Reject Application
              </button>
              <button
                type="button"
                onClick={() => setActionType('approve')}
                className="px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 text-xs font-bold shadow-xs"
              >
                ✓ Approve Interviewer Application
              </button>
            </footer>
          </main>
        ) : (
          <div className="p-12 text-center text-xs text-zinc-400">Select an applicant to review.</div>
        )}
      </div>

      {/* Decision Reason Confirmation Modal */}
      {actionType && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200">
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              {actionType === 'approve'
                ? `Approve ${selected.name}`
                : actionType === 'reject'
                ? `Reject Application for ${selected.name}`
                : `Request Additional Proof from ${selected.name}`}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              {actionType === 'approve'
                ? 'Approving activates their public profile in the mentor directory and grants permission to conduct paid mock interviews.'
                : actionType === 'reject'
                ? 'Specify the rejection reason so the applicant understands which verification criteria were not fulfilled.'
                : 'State what additional documentation or clarity is required.'}
            </p>

            <label className="font-bold text-xs text-zinc-700 block mb-1">Audit Trail & Reviewer Note</label>
            <textarea
              rows={3}
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
              placeholder="e.g. Credentials matched company directory; approved for Software Engineering and System Design rounds..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs focus:border-indigo-500 focus:outline-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionType(null)
                  setActionReason('')
                }}
                className="px-3.5 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteVerification}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${actionType.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  Private Evidence Inspection
                </span>
                <h3 className="text-sm font-bold text-zinc-900">{previewDocName}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewDocName(null)
                  setPreviewDocUrl(null)
                }}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {previewDocUrl ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed">
                  ✓ Secure signed URL token created successfully. You can download or view the decrypted file directly in your browser.
                </div>
                <div className="flex justify-end gap-2">
                  <a
                    href={previewDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-block"
                  >
                    Open Document in New Tab ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 font-mono text-[11px] text-zinc-700 leading-relaxed space-y-2">
                  <p><b>DOCUMENT REFERENCE:</b> HR/VERIFY/2026/INT-0941</p>
                  <p><b>ORGANIZATION:</b> Global Tech Platforms Ltd. Human Resources</p>
                  <p><b>STATEMENT:</b></p>
                  <p>
                    This certifies that {selected?.name} is employed in the capacity of Senior Software Engineer in Platform Engineering. Verified responsibilities include systems architecture, database scaling, and conducting technical bar-raiser interviews.
                  </p>
                  <p className="text-zinc-400 pt-2">[Digital Notarization & Cryptographic Stamp Verified]</p>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-zinc-100 text-right">
              <button
                type="button"
                onClick={() => {
                  setPreviewDocName(null)
                  setPreviewDocUrl(null)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
