import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, X, Plus, Trash2, LogOut, Eye, EyeOff, Link2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ChampionCard from '@/components/ChampionCard'
import type { Champion, Workload } from '@/types'
import type { Session } from '@supabase/supabase-js'

type Tab = 'pending' | 'approved' | 'workloads'

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)

  const [tab, setTab] = useState<Tab>('pending')
  const [champions, setChampions] = useState<Champion[]>([])
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [newWorkload, setNewWorkload] = useState('')
  const [dataLoading, setDataLoading] = useState(false)

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // Load data once authenticated
  useEffect(() => {
    if (!session) return
    loadData()
  }, [session])

  async function loadData() {
    setDataLoading(true)
    const [{ data: wData }, { data: cData }] = await Promise.all([
      supabase.from('workloads').select('*').order('name'),
      supabase
        .from('champions')
        .select('*, edit_token, workloads(id, name, created_at)')
        .order('submitted_at', { ascending: false }),
    ])
    setWorkloads(wData ?? [])
    setChampions((cData as Champion[]) ?? [])
    setDataLoading(false)
  }

  async function signIn() {
    setAuthError(null)
    setSigningIn(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setSigningIn(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await supabase.from('champions').update({ status }).eq('id', id)
    setChampions((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  async function addWorkload() {
    const name = newWorkload.trim()
    if (!name) return
    const { data, error } = await supabase.from('workloads').insert({ name }).select().single()
    if (!error && data) {
      setWorkloads((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewWorkload('')
    }
  }

  async function deleteWorkload(id: string) {
    if (!confirm('Delete this workload? Champions assigned to it will lose their workload.')) return
    await supabase.from('workloads').delete().eq('id', id)
    setWorkloads((prev) => prev.filter((w) => w.id !== id))
  }

  // ── Auth gate ────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dynamics-light flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-dynamics-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-dynamics-light flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-sm w-full">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-dynamics-blue rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="font-bold text-gray-900">Admin</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-5">Sign in</h2>

          <div className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && signIn()}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && signIn()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {authError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{authError}</p>
            )}
            <button className="btn-primary w-full justify-center" onClick={signIn} disabled={signingIn}>
              {signingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Dashboard ────────────────────────────────────────────────────────────
  const pending  = champions.filter((c) => c.status === 'pending')
  const approved = champions.filter((c) => c.status === 'approved')

  return (
    <div className="min-h-screen bg-dynamics-light">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={18} />
            </Link>
            <span className="font-bold text-gray-900">Admin Dashboard</span>
          </div>
          <button onClick={signOut} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
          {([
            ['pending',   `Pending (${pending.length})`],
            ['approved',  `Approved (${approved.length})`],
            ['workloads', 'Workloads'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-dynamics-blue text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-dynamics-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Pending */}
            {tab === 'pending' && (
              <div className="space-y-4">
                {pending.length === 0 ? (
                  <p className="text-gray-400 text-sm py-10 text-center">No pending submissions.</p>
                ) : (
                  pending.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-start">
                      <ChampionCard champion={c} workloads={workloads} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.title} · {c.organization}</p>
                        {c.linkedin_url && (
                          <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-dynamics-blue hover:underline mt-1 block truncate">
                            {c.linkedin_url}
                          </a>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Submitted {new Date(c.submitted_at).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button onClick={() => updateStatus(c.id, 'approved')} className="btn-success text-xs px-3 py-1.5">
                            <Check size={13} /> Approve
                          </button>
                          <button onClick={() => updateStatus(c.id, 'rejected')} className="btn-danger text-xs px-3 py-1.5">
                            <X size={13} /> Reject
                          </button>
                          {c.edit_token && (
                            <button
                              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/edit/${c.edit_token}`)}
                              className="btn-secondary text-xs px-3 py-1.5"
                              title="Copy edit link"
                            >
                              <Link2 size={13} /> Copy edit link
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Approved */}
            {tab === 'approved' && (
              <div>
                {approved.length === 0 ? (
                  <p className="text-gray-400 text-sm py-10 text-center">No approved champions yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-5">
                    {approved.map((c) => (
                      <div key={c.id} className="relative group flex flex-col items-center gap-1">
                        <ChampionCard champion={c} workloads={workloads} />
                        <button
                          onClick={() => updateStatus(c.id, 'rejected')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Revoke"
                        >
                          <X size={12} />
                        </button>
                        {c.edit_token && (
                          <button
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/edit/${c.edit_token}`)}
                            className="text-xs text-gray-400 hover:text-dynamics-blue flex items-center gap-1 transition-colors"
                            title="Copy edit link"
                          >
                            <Link2 size={11} /> Copy edit link
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Workloads */}
            {tab === 'workloads' && (
              <div className="max-w-md">
                <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                  {workloads.map((w) => (
                    <div key={w.id} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm font-medium text-gray-800">{w.name}</span>
                      <button
                        onClick={() => deleteWorkload(w.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete workload"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="New workload name…"
                    value={newWorkload}
                    onChange={(e) => setNewWorkload(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addWorkload()}
                  />
                  <button onClick={addWorkload} className="btn-primary px-4">
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
