import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, X, Plus, Trash2, LogOut, Link2 } from 'lucide-react'
import {
  adminGetChampions,
  adminGetWorkloads,
  adminUpdateChampion,
  adminCreateWorkload,
  adminDeleteWorkload,
} from '@/lib/api'
import ChampionCard from '@/components/ChampionCard'
import type { Champion, Workload } from '@/types'

type Tab = 'pending' | 'approved' | 'workloads'

interface SWAPrincipal {
  userId: string
  userDetails: string
  identityProvider: string
}

export default function Admin() {
  const [principal, setPrincipal] = useState<SWAPrincipal | null | undefined>(undefined)
  const [tab, setTab] = useState<Tab>('pending')
  const [champions, setChampions] = useState<Champion[]>([])
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [newWorkload, setNewWorkload] = useState('')
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/.auth/me')
      .then((r) => r.json())
      .then(({ clientPrincipal }) => setPrincipal(clientPrincipal ?? null))
      .catch(() => setPrincipal(null))
  }, [])

  useEffect(() => {
    if (!principal) return
    setDataLoading(true)
    Promise.all([adminGetChampions(), adminGetWorkloads()])
      .then(([cData, wData]) => {
        setChampions(cData)
        setWorkloads(wData)
      })
      .catch((err) => setDataError(err.message ?? String(err)))
      .finally(() => setDataLoading(false))
  }, [principal])

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await adminUpdateChampion(id, { status })
    setChampions((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  async function addWorkload() {
    const name = newWorkload.trim()
    if (!name) return
    const created = await adminCreateWorkload(name)
    setWorkloads((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    setNewWorkload('')
  }

  async function deleteWorkload(id: string) {
    if (!confirm('Delete this workload? Champions assigned to it will lose their workload.')) return
    await adminDeleteWorkload(id)
    setWorkloads((prev) => prev.filter((w) => w.id !== id))
  }

  // ── Loading principal ────────────────────────────────────────────────────
  if (principal === undefined) {
    return (
      <div className="min-h-screen bg-dynamics-light flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-dynamics-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Not signed in ────────────────────────────────────────────────────────
  if (!principal) {
    return (
      <div className="min-h-screen bg-dynamics-light flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-sm w-full text-center">
          <div className="w-10 h-10 bg-dynamics-blue rounded-lg flex items-center justify-center mx-auto mb-5">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Admin access required</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in with your GitHub account to continue.</p>
          <a
            href="/.auth/login/github?post_login_redirect_uri=/admin"
            className="btn-primary w-full justify-center"
          >
            Sign in with GitHub
          </a>
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
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{principal.userDetails}</span>
            <a
              href="/.auth/logout?post_logout_redirect_uri=/"
              className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
            >
              <LogOut size={13} /> Sign out
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {dataError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            Failed to load data: {dataError}
          </div>
        )}

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
                tab === key ? 'bg-dynamics-blue text-white' : 'text-gray-600 hover:text-gray-900'
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
                    <Plus size={16} /> Add
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
