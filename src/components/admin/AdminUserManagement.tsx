'use client'

import { Ban, Search, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/error-message'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/use-auth'
import type { UserRow } from '@/types/profile'

export function AdminUserManagement() {
  const { user: currentAdmin } = useAuth()
  const [supabase] = useState(createClient)

  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All users')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<UserRow | null>(null)
  const [drawerTab, setDrawerTab] = useState<'Overview' | 'Roles' | 'Profile' | 'Privacy'>(
    'Overview',
  )

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    type: 'suspend' | 'activate' | 'restrict'
    targetUser: UserRow
  } | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users based on tab & search
  const filtered = users.filter((u) => {
    const matches =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.id?.toLowerCase().includes(search.toLowerCase())

    if (!matches) return false
    if (tab === 'Candidates') return u.role === 'candidate'
    if (tab === 'Interviewers') return u.role === 'interviewer'
    if (tab === 'Staff') return u.role === 'admin'
    if (tab === 'Suspended / Restricted')
      return u.status === 'restricted' || u.status === 'suspended'
    return true
  })

  // Execute User Status Mutation
  const handleConfirmAction = async () => {
    if (!actionModal) return
    const { type, targetUser } = actionModal
    setActionLoading(true)

    const nextStatus =
      type === 'suspend' ? 'suspended' : type === 'activate' ? 'active' : 'restricted'

    try {
      // 1. Update user status in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          status: nextStatus,
          last_active: 'Just now',
        })
        .eq('id', targetUser.id)

      if (updateError) throw updateError

      // 2. Insert audit event
      await supabase.from('audit_log_events').insert({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_name: currentAdmin?.user_metadata?.name || 'Super Admin',
        actor_role: 'admin',
        action: `${type.toUpperCase()} Account for ${targetUser.name}`,
        target_resource: `User ${targetUser.id} (${targetUser.email})`,
        category: 'User Moderation',
        reason: actionReason.trim() || `Admin initiated ${type} action.`,
      })

      showToast(`User ${targetUser.name} has been set to ${nextStatus.toUpperCase()}.`)
      setActionModal(null)
      setActionReason('')
      if (detail && detail.id === targetUser.id) {
        setDetail({ ...detail, status: nextStatus })
      }
      await fetchUsers()
    } catch (err) {
      console.error('Action error:', err)
      alert(getErrorMessage(err, 'Failed to update user status.'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <div className="app-page-title">
        <div className="app-title-text">
          <p>PEOPLE & ACCESS</p>
          <h1>User management</h1>
          <span>
            View platform identities, assign permissions, audit activity and enforce safety
            suspensions.
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
        {['All users', 'Candidates', 'Interviewers', 'Staff', 'Suspended / Restricted'].map((x) => (
          <button
            type="button"
            className={tab === x ? 'active' : ''}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>

      {/* Filter / Search Bar */}
      <div className="admin-filters">
        <label>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or user ID..."
          />
        </label>
        <button type="button" onClick={() => setSearch('')}>
          Clear search
        </button>
      </div>

      {/* Table */}
      <section className="admin-table users-table">
        <header>
          <span>User ID</span>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last active</span>
          <span />
        </header>

        {loading ? (
          <div className="p-8 text-center text-xs text-subtle">
            Loading platform users from Supabase...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-subtle">
            No users found matching current filters.
          </div>
        ) : (
          filtered.map((u) => (
            <button
              type="button"
              onClick={() => setDetail(u)}
              key={u.id}
              className="text-left w-full hover:bg-surface-soft transition-colors"
            >
              <span className="font-mono text-muted text-xs">{u.id.slice(0, 10)}...</span>
              <span className="font-bold text-ink">{u.name}</span>
              <span className="text-muted font-mono text-xs">{u.email}</span>
              <span className="capitalize font-semibold text-body">{u.role}</span>
              <span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    u.status === 'active'
                      ? 'bg-success-soft text-success border border-success-border'
                      : u.status === 'suspended'
                        ? 'bg-danger-soft text-danger border border-danger-border'
                        : u.status === 'under_review'
                          ? 'bg-warning-soft text-warning border border-warning-border'
                          : 'bg-surface-sunken text-body'
                  }`}
                >
                  {u.status || 'active'}
                </span>
              </span>
              <span className="text-subtle text-xs">{u.last_active || 'Recent'}</span>
              <b className="text-subtle">•••</b>
            </button>
          ))
        )}
      </section>

      {/* User Detail Drawer */}
      {detail && (
        <div className="admin-drawer">
          <header>
            <div className="drawer-avatar">
              {detail.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <span className="font-mono text-xs text-subtle">{detail.id}</span>
              <h2>{detail.name}</h2>
              <p>
                {detail.role.toUpperCase()} · <b className="capitalize">{detail.status}</b>
              </p>
            </div>
            <button type="button" onClick={() => setDetail(null)}>
              ×
            </button>
          </header>

          <div className="admin-tabs">
            {(['Overview', 'Roles', 'Profile', 'Privacy'] as const).map((t) => (
              <button
                type="button"
                key={t}
                className={drawerTab === t ? 'active' : ''}
                onClick={() => setDrawerTab(t)}
              >
                {t === 'Profile' ? 'Profile & Resume' : t}
              </button>
            ))}
          </div>

          <section>
            {drawerTab === 'Overview' && (
              <>
                <span>ACCOUNT DETAILS</span>
                <dl>
                  <div>
                    <dt>Email</dt>
                    <dd>{detail.email}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{detail.created_at || 'Recent'}</dd>
                  </div>
                  <div>
                    <dt>Email Verified</dt>
                    <dd>{detail.email_verified ? 'Yes (Verified)' : 'Pending'}</dd>
                  </div>
                  <div>
                    <dt>Last active</dt>
                    <dd>{detail.last_active || 'Just now'}</dd>
                  </div>
                </dl>
              </>
            )}

            {drawerTab === 'Roles' && (
              <>
                <span>ASSIGNED ROLE & PERMISSIONS</span>
                <dl>
                  <div>
                    <dt>Primary Role</dt>
                    <dd className="capitalize font-bold text-ink">{detail.role}</dd>
                  </div>
                  <div>
                    <dt>Account Status</dt>
                    <dd className="capitalize">{detail.status}</dd>
                  </div>
                  <div>
                    <dt>Verification Status</dt>
                    <dd>
                      {detail.interviewer_profile?.verificationStatus
                        ? detail.interviewer_profile.verificationStatus.toUpperCase()
                        : 'N/A (Standard Candidate)'}
                    </dd>
                  </div>
                </dl>
              </>
            )}

            {drawerTab === 'Profile' && (
              <div className="space-y-4 text-xs">
                {detail.role === 'candidate' ? (
                  <>
                    <span>CANDIDATE PROFILE DATA</span>
                    <dl>
                      <div>
                        <dt>Target Track</dt>
                        <dd>{detail.candidate_profile?.targetTrack || 'Software Engineering'}</dd>
                      </div>
                      <div>
                        <dt>Target Role</dt>
                        <dd>{detail.candidate_profile?.targetRole || 'Not specified'}</dd>
                      </div>
                      <div>
                        <dt>Education Count</dt>
                        <dd>{detail.candidate_profile?.educationHistory?.length || 0} degrees</dd>
                      </div>
                      <div>
                        <dt>Experience Count</dt>
                        <dd>{detail.candidate_profile?.experienceHistory?.length || 0} roles</dd>
                      </div>
                      <div>
                        <dt>Resume File</dt>
                        <dd>
                          {detail.candidate_profile?.resume ? (
                            <span className="text-success font-bold">
                              ✓ {detail.candidate_profile.resume.fileName}
                            </span>
                          ) : (
                            <span className="text-subtle">None uploaded</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                    {detail.candidate_profile?.skills && (
                      <div className="pt-2">
                        <b className="block text-body mb-1">Listed Skills:</b>
                        <div className="flex flex-wrap gap-1">
                          {detail.candidate_profile.skills.map((s: string) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-surface-sunken text-ink text-xs"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <span>INTERVIEWER PROFILE DATA</span>
                    <dl>
                      <div>
                        <dt>Title</dt>
                        <dd>{detail.interviewer_profile?.title || 'Professional Mentor'}</dd>
                      </div>
                      <div>
                        <dt>Category</dt>
                        <dd className="capitalize">
                          {detail.interviewer_profile?.category || 'Professional'}
                        </dd>
                      </div>
                      <div>
                        <dt>Experience</dt>
                        <dd>{detail.interviewer_profile?.experienceYears || '6+ years'}</dd>
                      </div>
                      <div>
                        <dt>Hourly Rate</dt>
                        <dd>₹{detail.interviewer_profile?.hourlyRate || 1199} / session</dd>
                      </div>
                      <div>
                        <dt>Verification Document</dt>
                        <dd>
                          {detail.interviewer_profile?.evidenceDocument?.fileName ||
                            detail.interviewer_profile?.evidenceDocumentName ||
                            'employment-letter.pdf'}
                        </dd>
                      </div>
                    </dl>
                  </>
                )}
              </div>
            )}

            {drawerTab === 'Privacy' && (
              <>
                <span>PRIVACY & SECURITY RECORD</span>
                <dl>
                  <div>
                    <dt>RLS Isolation</dt>
                    <dd>Row Level Security Active</dd>
                  </div>
                  <div>
                    <dt>Private Storage Path</dt>
                    <dd className="font-mono text-xs">{detail.id}/...</dd>
                  </div>
                  <div>
                    <dt>Session Audit</dt>
                    <dd>Protected</dd>
                  </div>
                </dl>
              </>
            )}

            <h3>Governance & Moderation Actions</h3>
            {detail.status !== 'active' ? (
              <button
                type="button"
                onClick={() => setActionModal({ type: 'activate', targetUser: detail })}
                className="bg-success-soft text-success hover:bg-success-border/40 border border-success-border"
              >
                ✓ Activate Account
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActionModal({ type: 'restrict', targetUser: detail })}
                  className="bg-warning-soft text-warning hover:bg-warning-border/40 border border-warning-border"
                >
                  <TriangleAlert size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                  Restrict Access
                </button>
                <button
                  type="button"
                  onClick={() => setActionModal({ type: 'suspend', targetUser: detail })}
                  className="bg-danger-soft text-danger hover:bg-danger-border/40 border border-danger-border"
                >
                  <Ban size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                  Suspend Account
                </button>
              </>
            )}
            <small>
              All governance actions are logged to the platform append-only audit trail.
            </small>
          </section>
        </div>
      )}

      {/* Action Reason Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-inverse/60 backdrop-blur-xs">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg border border-border">
            <h3 className="text-base font-bold text-ink mb-1">
              Confirm {actionModal.type.toUpperCase()} Action
            </h3>
            <p className="text-xs text-muted mb-4">
              You are modifying the platform status for{' '}
              <strong className="text-ink">{actionModal.targetUser.name}</strong> (
              {actionModal.targetUser.email}).
            </p>

            <label
              htmlFor="admin-user-management-reason-internal-compliance-note"
              className="font-bold text-xs text-body block mb-1"
            >
              Reason / Internal Compliance Note
            </label>
            <textarea
              id="admin-user-management-reason-internal-compliance-note"
              rows={3}
              required
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Required for platform audit trail (e.g. Terms violation, candidate grievance, identity re-verification)..."
              className="w-full px-3 py-2 rounded-xl border border-border text-xs focus:border-brand focus:outline-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionModal(null)
                  setActionReason('')
                }}
                className="px-3.5 py-2 rounded-xl text-body hover:bg-surface-sunken font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-inverse font-bold text-xs ${
                  actionModal.type === 'suspend'
                    ? 'bg-danger-solid hover:bg-danger-solid/90'
                    : actionModal.type === 'activate'
                      ? 'bg-success-solid hover:bg-success-solid/90'
                      : 'bg-warning-solid hover:bg-warning-solid/90'
                }`}
              >
                {actionLoading ? 'Applying...' : `Confirm ${actionModal.type.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
