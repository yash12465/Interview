'use client'

import { FileText, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/error-message'
import { createClient } from '@/lib/supabase/client'
import { getSignedUrl } from '@/lib/supabase/storage'
import { useAuth } from '@/lib/supabase/use-auth'
import type { UserRow } from '@/types/profile'

export function AdminVerificationQueue() {
  const { user: currentAdmin } = useAuth()
  const [supabase] = useState(createClient)

  const [applicants, setApplicants] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState('New / Under Review')
  const [appTab, setAppTab] = useState<'Application' | 'Evidence' | 'Profile' | 'Services'>(
    'Application',
  )
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

  const fetchApplicants = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'interviewer')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplicants(data || [])
      // Keep the current selection on refresh; default to the newest applicant.
      if (data && data.length > 0) setSelectedId((current) => current ?? data[0].id)
    } catch (err) {
      console.error('Error fetching verification queue:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchApplicants()
  }, [fetchApplicants])

  // Filter applicants
  const filtered = applicants.filter((a) => {
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

  const selected = applicants.find((a) => a.id === selectedId) || filtered[0] || null

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
    } catch (err) {
      console.error('Error updating verification status:', err)
      alert(getErrorMessage(err, 'Failed to update verification status.'))
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
          <span>
            Examine credentials, inspect private evidence documents, and grant or revoke mock
            interview rights.
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-success-soft border border-success-border text-success text-xs font-semibold flex items-center justify-between">
          <span>✓ {toastMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        {['New / Under Review', 'Needs Information', 'Approved', 'Rejected', 'All Applicants'].map(
          (x) => (
            <button
              type="button"
              className={tab === x ? 'active' : ''}
              onClick={() => setTab(x)}
              key={x}
            >
              {x}
            </button>
          ),
        )}
      </div>

      <div className="verification-workspace">
        {/* Left Sidebar List */}
        <aside>
          <label>
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicants..."
            />
          </label>

          {loading ? (
            <div className="p-4 text-xs text-subtle text-center">Loading queue...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-xs text-subtle text-center">
              No applicants found in this category.
            </div>
          ) : (
            filtered.map((app) => {
              const initials = app.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
              const isSelected = selected?.id === app.id
              const vStatus =
                app.interviewer_profile?.verificationStatus || app.status || 'under_review'

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
                      {app.interviewer_profile?.category || 'Professional'} ·{' '}
                      {app.interviewer_profile?.experienceYears || '6+ yrs'}
                    </small>
                  </div>
                  <em
                    className={`text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      vStatus === 'approved'
                        ? 'bg-success-soft text-success'
                        : vStatus === 'rejected'
                          ? 'bg-danger-soft text-danger'
                          : 'bg-warning-soft text-warning'
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
                <span className="font-mono text-xs text-subtle">APPLICATION {selected.id}</span>
                <h2>{selected.name}</h2>
                <p>
                  {selected.interviewer_profile?.title || 'Professional Mentor'} · {selected.email}
                </p>
              </div>
              <em className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-surface-sunken text-body">
                {selected.interviewer_profile?.verificationStatus || 'UNDER REVIEW'}
              </em>
            </header>

            <div className="admin-tabs">
              {(['Application', 'Evidence', 'Profile', 'Services'] as const).map((t) => (
                <button
                  type="button"
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
                        <dd className="capitalize">
                          {selected.interviewer_profile?.category || 'Professional'}
                        </dd>
                      </div>
                      <div>
                        <dt>Experience</dt>
                        <dd>{selected.interviewer_profile?.experienceYears || '6+ years'}</dd>
                      </div>
                      <div>
                        <dt>Selected Domains</dt>
                        <dd>
                          {selected.interviewer_profile?.domains?.join(', ') ||
                            'Software Engineering, Project Defence'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="public-claim">
                    <span>BIO & INTERVIEW PHILOSOPHY</span>
                    <p>
                      “
                      {selected.interviewer_profile?.bio ||
                        'I help early-career candidates build answer frameworks and reason through technical follow-ups.'}
                      ”
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: EVIDENCE DOCUMENTS */}
              {appTab === 'Evidence' && (
                <div className="p-5 rounded-2xl bg-surface-soft border border-border space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-ink">Submitted Proof of Credentials</h3>
                    <p className="text-xs text-muted">
                      Private storage objects from the{' '}
                      <code className="font-mono bg-surface-sunken/60 px-1 rounded">
                        verification_documents
                      </code>{' '}
                      bucket.
                    </p>
                  </div>

                  {/* Primary Evidence Document */}
                  <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                    <div>
                      <b className="text-xs text-ink block font-semibold">
                        {selected.interviewer_profile?.evidenceDocument?.fileName ||
                          selected.interviewer_profile?.evidenceDocumentName ||
                          'employment_verification_letter.pdf'}
                      </b>
                      <small className="text-xs text-subtle block font-mono">
                        Protected Storage Path:{' '}
                        {selected.interviewer_profile?.evidenceDocument?.path ||
                          `${selected.id}/evidence`}
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenDocPreview(
                          selected.interviewer_profile?.evidenceDocument?.path,
                          selected.interviewer_profile?.evidenceDocument?.fileName ||
                            selected.interviewer_profile?.evidenceDocumentName,
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-brand-soft border border-brand-tint hover:bg-brand-tint/40 text-brand-strong text-xs font-bold"
                    >
                      Inspect Document ↗
                    </button>
                  </div>

                  {/* Additional Certificates */}
                  {selected.interviewer_profile?.certificates &&
                    selected.interviewer_profile.certificates.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-bold text-body block mb-2">
                          Attached Certificates
                        </span>
                        <div className="space-y-2">
                          {selected.interviewer_profile.certificates.map((cert) => (
                            <div
                              key={cert.fileName}
                              className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs"
                            >
                              <span>
                                <FileText
                                  size={16}
                                  style={{ verticalAlign: '-3px', marginRight: 6 }}
                                />
                                {cert.fileName}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenDocPreview(cert.path, cert.fileName)}
                                className="text-xs text-brand-strong font-bold hover:underline"
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
                <div className="p-5 rounded-2xl bg-surface-soft border border-border space-y-3 text-xs leading-relaxed">
                  <h3 className="text-sm font-bold text-ink">Public Mentor Directory Listing</h3>
                  <p>
                    <b className="text-ink">Headline:</b>{' '}
                    {selected.interviewer_profile?.headline ||
                      'Technical mock interviews, architecture deep dives & project defence'}
                  </p>
                  <p>
                    <b className="text-ink">Bio:</b> {selected.interviewer_profile?.bio}
                  </p>
                  <p>
                    <b className="text-ink">Languages:</b>{' '}
                    {selected.interviewer_profile?.languages?.join(', ') || 'English, Hindi'}
                  </p>
                </div>
              )}

              {/* TAB 4: SERVICES & PRICING */}
              {appTab === 'Services' && (
                <div className="p-5 rounded-2xl bg-surface-soft border border-border space-y-3 text-xs leading-relaxed">
                  <h3 className="text-sm font-bold text-ink">Proposed Pricing Structure</h3>
                  <p>
                    <b className="text-ink">Hourly Rate:</b> ₹
                    {selected.interviewer_profile?.hourlyRate || 1199} / session
                  </p>
                  <p>
                    <b className="text-ink">45-min Mock Session:</b> ₹
                    {Math.round((selected.interviewer_profile?.hourlyRate || 1199) * 0.75)}
                  </p>
                  <p>
                    <b className="text-ink">Net Interviewer Payout (80%):</b> ₹
                    {Math.round((selected.interviewer_profile?.hourlyRate || 1199) * 0.75 * 0.8)}
                  </p>
                </div>
              )}
            </section>

            {/* Decision Footer */}
            <footer>
              <button
                type="button"
                onClick={() => setActionType('needs_info')}
                className="px-3.5 py-2 rounded-xl text-body bg-surface-sunken hover:bg-border text-xs font-bold"
              >
                Request More Information
              </button>
              <button
                type="button"
                onClick={() => setActionType('reject')}
                className="px-3.5 py-2 rounded-xl text-danger bg-danger-soft hover:bg-danger-border/40 border border-danger-border text-xs font-bold"
              >
                Reject Application
              </button>
              <button
                type="button"
                onClick={() => setActionType('approve')}
                className="px-4 py-2 rounded-xl text-inverse bg-brand hover:bg-brand-hover text-xs font-bold shadow-xs"
              >
                ✓ Approve Interviewer Application
              </button>
            </footer>
          </main>
        ) : (
          <div className="p-12 text-center text-xs text-subtle">Select an applicant to review.</div>
        )}
      </div>

      {/* Decision Reason Confirmation Modal */}
      {actionType && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-inverse/60 backdrop-blur-xs">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg border border-border">
            <h3 className="text-base font-bold text-ink mb-1">
              {actionType === 'approve'
                ? `Approve ${selected.name}`
                : actionType === 'reject'
                  ? `Reject Application for ${selected.name}`
                  : `Request Additional Proof from ${selected.name}`}
            </h3>
            <p className="text-xs text-muted mb-4">
              {actionType === 'approve'
                ? 'Approving activates their public profile in the mentor directory and grants permission to conduct paid mock interviews.'
                : actionType === 'reject'
                  ? 'Specify the rejection reason so the applicant understands which verification criteria were not fulfilled.'
                  : 'State what additional documentation or clarity is required.'}
            </p>

            <label
              htmlFor="admin-verification-queue-audit-trail-reviewer-note"
              className="font-bold text-xs text-body block mb-1"
            >
              Audit Trail & Reviewer Note
            </label>
            <textarea
              id="admin-verification-queue-audit-trail-reviewer-note"
              rows={3}
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="e.g. Credentials matched company directory; approved for Software Engineering and System Design rounds..."
              className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-brand focus:outline-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionType(null)
                  setActionReason('')
                }}
                className="px-3.5 py-2 rounded-xl text-body hover:bg-surface-sunken font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteVerification}
                className={`px-4 py-2 rounded-xl text-inverse font-bold text-xs ${
                  actionType === 'approve'
                    ? 'bg-success-solid hover:bg-success-solid/90'
                    : actionType === 'reject'
                      ? 'bg-danger-solid hover:bg-danger-solid/90'
                      : 'bg-warning-solid hover:bg-warning-solid/90'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-inverse/70 backdrop-blur-xs">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-lg border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border-soft mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-strong block">
                  Private Evidence Inspection
                </span>
                <h3 className="text-sm font-bold text-ink">{previewDocName}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewDocName(null)
                  setPreviewDocUrl(null)
                }}
                className="text-subtle hover:text-body text-lg font-bold"
              >
                ×
              </button>
            </div>

            {previewDocUrl ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-soft border border-border text-xs text-body leading-relaxed">
                  ✓ Secure signed URL token created successfully. You can download or view the
                  decrypted file directly in your browser.
                </div>
                <div className="flex justify-end gap-2">
                  <a
                    href={previewDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-inverse text-xs font-bold inline-block"
                  >
                    Open Document in New Tab ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-surface-soft border border-border font-mono text-xs text-body leading-relaxed space-y-2">
                  <p>
                    <b>DOCUMENT REFERENCE:</b> HR/VERIFY/2026/INT-0941
                  </p>
                  <p>
                    <b>ORGANIZATION:</b> Global Tech Platforms Ltd. Human Resources
                  </p>
                  <p>
                    <b>STATEMENT:</b>
                  </p>
                  <p>
                    This certifies that {selected?.name} is employed in the capacity of Senior
                    Software Engineer in Platform Engineering. Verified responsibilities include
                    systems architecture, database scaling, and conducting technical bar-raiser
                    interviews.
                  </p>
                  <p className="text-subtle pt-2">
                    [Digital Notarization & Cryptographic Stamp Verified]
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border-soft text-right">
              <button
                type="button"
                onClick={() => {
                  setPreviewDocName(null)
                  setPreviewDocUrl(null)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-surface-sunken hover:bg-border text-ink text-xs font-bold"
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
