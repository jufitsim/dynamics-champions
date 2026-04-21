import { Linkedin, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Champion, Workload } from '@/types'

const WORKLOAD_COLORS: Record<string, string> = {
  Finance:          '#0078D4',
  'Supply Chain':   '#107C10',
  'Contact Center': '#D05F0A',
  'Field Service':  '#8764B8',
}

const DEFAULT_COLOR = '#616161'

function getColor(name?: string) {
  return name ? (WORKLOAD_COLORS[name] ?? DEFAULT_COLOR) : DEFAULT_COLOR
}

interface Props {
  champion: Champion
  workloads: Workload[]
  editToken?: string
}

export default function ChampionCard({ champion, workloads, editToken }: Props) {
  const navigate = useNavigate()
  const ids = champion.workload_ids?.length
    ? champion.workload_ids
    : champion.workload_id ? [champion.workload_id] : []

  const championWorkloads = workloads.filter(w => ids.includes(w.id))
  const primaryColor = getColor(championWorkloads[0]?.name)

  const initials = champion.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={`champion-card ${editToken ? 'cursor-pointer' : ''}`}
      style={{ borderTop: `4px solid ${primaryColor}` }}
      onClick={() => editToken && navigate(`/edit/${editToken}`)}
    >
      {/* Header strip */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ backgroundColor: primaryColor }}
      >
        <span className="text-white text-[10px] font-bold tracking-widest uppercase">
          Dynamics 365
        </span>
        <span className="text-white text-[10px] font-semibold opacity-80">Champion</span>
      </div>

      {/* Photo */}
      <div className="card-header" style={{ backgroundColor: `${primaryColor}15` }}>
        {champion.image_url ? (
          <img
            src={champion.image_url}
            alt={champion.name}
            className="card-photo"
            style={{ borderColor: primaryColor }}
          />
        ) : (
          <div
            className="card-photo-placeholder"
            style={{ backgroundColor: primaryColor }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="card-body">
        <h3 className="font-bold text-gray-900 text-base leading-tight">{champion.name}</h3>
        <p className="text-gray-500 text-xs leading-snug">{champion.title}</p>
        <p className="text-gray-600 text-xs font-medium">{champion.organization}</p>
        {champion.industry && (
          <p className="text-gray-400 text-xs italic">{champion.industry}</p>
        )}

        {/* Workload badges - horizontal */}
        {championWorkloads.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mt-2">
            {championWorkloads.map(w => (
              <span
                key={w.id}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                style={{ backgroundColor: getColor(w.name) }}
              >
                {w.name}
              </span>
            ))}
          </div>
        )}

        {champion.linkedin_url && (
          <a
            href={champion.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0A66C2] hover:underline mt-1"
          >
            <Linkedin size={13} />
            LinkedIn
          </a>
        )}
      </div>

      {/* Edit indicator */}
      {editToken && (
        <div className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium text-gray-400 hover:text-dynamics-blue transition-colors">
          <Pencil size={10} />
          Edit your card
        </div>
      )}

      {/* Bottom accent */}
      <div className="h-1 w-full" style={{ backgroundColor: primaryColor }} />
    </div>
  )
}
