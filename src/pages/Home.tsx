import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Users } from 'lucide-react'
import { getChampions, getWorkloads } from '@/lib/api'
import ChampionCard from '@/components/ChampionCard'
import FilterBar from '@/components/FilterBar'
import type { Champion, Workload } from '@/types'

export default function Home() {
  const [champions, setChampions] = useState<Champion[]>([])
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [query, setQuery] = useState('')
  const [selectedWorkload, setSelectedWorkload] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [myTokens, setMyTokens] = useState<Record<string, string>>({})

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('champion_tokens') || '{}')
    setMyTokens(stored)
  }, [])

  useEffect(() => {
    async function load() {
      const [wData, cData] = await Promise.all([getWorkloads(), getChampions()])
      setWorkloads(wData)
      setChampions(cData)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = champions.filter((c) => {
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.organization.toLowerCase().includes(query.toLowerCase())
    const ids = c.workload_ids?.length ? c.workload_ids : c.workload_id ? [c.workload_id] : []
    const matchesWorkload = !selectedWorkload || ids.includes(selectedWorkload)
    return matchesQuery && matchesWorkload
  })

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Banner ─────────────────────────────────────────────────── */}
      <header className="relative w-full shrink-0">
        <img
          src="/banner-long.png"
          alt="Dynamics Champions"
          className="w-full block"
        />
        <div className="absolute inset-0 flex items-center justify-end px-6">
          <Link to="/join" className="btn-primary shadow-lg">
            <UserPlus size={14} />
            Add Your Card
          </Link>
        </div>
      </header>

      {/* ── Welcome ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 shadow-sm">
        <p
          className="max-w-3xl mx-auto text-center text-base leading-relaxed"
          style={{ color: '#374151' }}
        >
          Welcome to the Dynamics Champions Connection page—a dynamic directory of our community.
          Think of it like a collection of "baseball cards," where you can explore fellow Champions,
          discover their industry and product focus, and connect with others who share your interests
          across the Dynamics ecosystem.
        </p>
      </div>

      {/* ── Cards area ─────────────────────────────────────────────── */}
      <main
        className="flex-1 bg-cover bg-no-repeat"
        style={{ backgroundImage: 'url(/background.png)', backgroundPosition: 'center -72px' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Filter bar on a frosted card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm px-4 py-3 mb-6">
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              selectedWorkload={selectedWorkload}
              onWorkloadChange={setSelectedWorkload}
              workloads={workloads}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-dynamics-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-10 inline-block">
                <Users size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">
                  {champions.length === 0
                    ? 'No champions yet — be the first!'
                    : 'No champions match your filters.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium mb-4" style={{ color: '#374151' }}>
                {filtered.length} champion{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-5">
                {filtered.map((c) => (
                  <ChampionCard key={c.id} champion={c} workloads={workloads} editToken={myTokens[c.id]} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
