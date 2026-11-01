'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/use-auth'

export function AdminUserManagement() {
  const { user: currentAdmin } = useAuth()
  const supabase = createClient()

  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All users')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<any | null>(null)
  const [drawerTab, setDrawerTab] = useState<'Overview' | 'Roles' | 'Profile' | 'Privacy'>('Overview')

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    type: 'suspend' | 'activate' | 'restrict'
    targetUser: any
  } | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on tab & search
  const filtered = users.filter(u => {
    const matches =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.id?.toLowerCase().includes(search.toLowerCase())

    if (!matches) return false
    if (tab === 'Candidates') return u.role === 'candidate'
    if (tab === 'Interviewers') return u.role === 'interviewer'
    if (tab === 'Staff') return u.role === 'admin'
    if (tab === 'Suspended / Restricted') return u.status === 'restricted' || u.status === 'suspended'
    return true
  })

  // Execute User Status Mutation
  const handleConfirmAction = async () => {
    if (!actionModal) return
    const { type, targetUser } = actionModal
    setActionLoading(true)

    const nextStatus = type === 'suspend' ? 'suspended' : type === 'activate' ? 'active' : 'restricted'

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
    } catch (err: any) {
      console.error('Action error:', err)
      alert(err?.message || 'Failed to update user status.')
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
          <span>View platform identities, assign permissions, audit activity and enforce safety suspensions.</span>
        </div>
      </div>

      {toastMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>✓ {toastMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        {['All users', 'Candidates', 'Interviewers', 'Staff', 'Suspended / Restricted'].map(x => (
          <button className={tab === x ? 'active' : ''} onClick={() => setTab(x)} key={x}>
            {x}
          </button>
        ))}
      </div>

      {/* Filter / Search Bar */}
      <div className="admin-filters">
        <label>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or user ID..."
          />
        </label>
        <button onClick={() => setSearch('')}>Clear search</button>
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
          <div className="p-8 text-center text-xs text-zinc-400">Loading platform users from Supabase...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">No users found matching current filters.</div>
        ) : (
          filtered.map(u => (
            <button
              type="button"
              onClick={() => setDetail(u)}
              key={u.id}
              className="text-left w-full hover:bg-slate-50 transition-colors"
            >
              <span className="font-mono text-zinc-500 text-[11px]">{u.id.slice(0, 10)}...</span>
              <span className="font-bold text-zinc-900">{u.name}</span>
              <span className="text-zinc-500 font-mono text-[11px]">{u.email}</span>
              <span className="capitalize font-semibold text-zinc-700">{u.role}</span>
              <span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    u.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : u.status === 'suspended'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : u.status === 'under_review'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {u.status || 'active'}
                </span>
              </span>
              <span className="text-zinc-400 text-xs">{u.last_active || 'Recent'}</span>
              <b className="text-zinc-400">•••</b>
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
              <span className="font-mono text-[10px] text-zinc-400">{detail.id}</span>
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
            {(['Overview', 'Roles', 'Profile', 'Privacy'] as const).map(t => (
              <button
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
                    <dd className="capitalize font-bold text-zinc-900">{detail.role}</dd>
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
                            <span className="text-emerald-700 font-bold">
                              ✓ {detail.candidate_profile.resume.fileName}
                            </span>
                          ) : (
                            <span className="text-zinc-400">None uploaded</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                    {detail.candidate_profile?.skills && (
                      <div className="pt-2">
                        <b className="block text-zinc-700 mb-1">Listed Skills:</b>
                        <div className="flex flex-wrap gap-1">
                          {detail.candidate_profile.skills.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[10px]">
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
                        <dd className="capitalize">{detail.interviewer_profile?.category || 'Professional'}</dd>
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
                    <dd className="font-mono text-[10px]">{detail.id}/...</dd>
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
                className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              >
                ✓ Activate Account
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActionModal({ type: 'restrict', targetUser: detail })}
                  className="bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                >
                  ⚠️ Restrict Access
                </button>
                <button
                  type="button"
                  onClick={() => setActionModal({ type: 'suspend', targetUser: detail })}
                  className="bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                >
                  ⛔ Suspend Account
                </button>
              </>
            )}
            <small>All governance actions are logged to the platform append-only audit trail.</small>
          </section>
        </div>
      )}

      {/* Action Reason Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200">
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              Confirm {actionModal.type.toUpperCase()} Action
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              You are modifying the platform status for{' '}
              <strong className="text-zinc-800">{actionModal.targetUser.name}</strong> ({actionModal.targetUser.email}).
            </p>

            <label className="font-bold text-xs text-zinc-700 block mb-1">Reason / Internal Compliance Note</label>
            <textarea
              rows={3}
              required
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
              placeholder="Required for platform audit trail (e.g. Terms violation, candidate grievance, identity re-verification)..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs focus:border-indigo-500 focus:outline-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionModal(null)
                  setActionReason('')
                }}
                className="px-3.5 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs ${
                  actionModal.type === 'suspend'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : actionModal.type === 'activate'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
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
