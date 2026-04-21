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
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-dynamics-blue rounded flex items-center justify-center">
              <Users size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">D365 Champions</span>
          </div>
          <Link to="/join" className="btn-primary text-xs px-3 py-1.5">
            <UserPlus size={14} />
            Become a Champion
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-dynamics-blue to-blue-800 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Dynamics 365 Champions</h1>
          <p className="text-blue-100 text-base">
            Meet the community of Dynamics 365 leaders transforming how organizations work.
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
