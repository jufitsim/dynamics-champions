import { Search, X } from 'lucide-react'
import type { Workload } from '@/types'

interface Props {
  query: string
  onQueryChange: (v: string) => void
  selectedWorkload: string | null
  onWorkloadChange: (id: string | null) => void
  workloads: Workload[]
}

const WORKLOAD_COLORS: Record<string, string> = {
  Finance:          '#0078D4',
  'Supply Chain':   '#107C10',
  'Contact Center': '#D05F0A',
  'Field Service':  '#8764B8',
}

export default function FilterBar({
  query,
  onQueryChange,
  selectedWorkload,
  onWorkloadChange,
  workloads,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or organization…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="input pl-9 pr-8"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Workload pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onWorkloadChange(null)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            selectedWorkload === null
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
          }`}
        >
          All
        </button>
        {workloads.map((w) => {
          const color = WORKLOAD_COLORS[w.name] ?? '#616161'
          const active = selectedWorkload === w.id
          return (
            <button
              key={w.id}
              onClick={() => onWorkloadChange(active ? null : w.id)}
              className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
              style={
                active
                  ? { backgroundColor: color, color: '#fff', borderColor: color }
                  : { backgroundColor: '#fff', color: '#374151', borderColor: '#D1D5DB' }
              }
            >
              {w.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
