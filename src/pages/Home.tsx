import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ChampionCard from '@/components/ChampionCard'
import FilterBar from '@/components/FilterBar'
import type { Champion, Workload } from '@/types'

export default function Home() {
  const [champions, setChampions] = useState<Champion[]>([])
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [query, setQuery] = useState('')
  const [selectedWorkload, setSelectedWorkload] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: wData }, { data: cData }] = await Promise.all([
        supabase.from('workloads').select('*').order('name'),
        supabase
          .from('champions')
          .select('*, workloads(id, name, created_at)')
          .eq('status', 'approved')
          .order('name'),
      ])
      setWorkloads(wData ?? [])
      setChampions((cData as Champion[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = champions.filter((c) => {
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.organization.toLowerCase().includes(query.toLowerCase())
    const matchesWorkload = !selectedWorkload || c.workload_id === selectedWorkload
    return matchesQuery && matchesWorkload
  })

  return (
    <div className="min-h-screen bg-dynamics-light">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <img src="/square.png" alt="Dynamics Champions" className="h-9 w-auto" />
          <Link to="/join" className="btn-primary text-xs px-3 py-1.5">
            <UserPlus size={14} />
            Connections
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div
        className="relative text-white py-16 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background.png)' }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-3xl mx-auto text-center">
          <img src="/square.png" alt="Dynamics Champions" className="h-24 w-auto mx-auto mb-4 drop-shadow-lg" />
          <p className="text-white/90 text-base drop-shadow max-w-xl mx-auto leading-relaxed">
            Welcome to the Dynamics Champions Connection page. As members of the Dynamics Champions
            community, this is your space to connect and collaborate with peers across industries,
            products, and roles.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
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
          <div className="text-center py-20 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {champions.length === 0
                ? 'No champions yet — be the first!'
                : 'No champions match your filters.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">
              {filtered.length} champion{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-5">
              {filtered.map((c) => (
                <ChampionCard key={c.id} champion={c} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
