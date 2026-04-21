import { Linkedin } from 'lucide-react'
import type { Champion } from '@/types'

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
}

export default function ChampionCard({ champion }: Props) {
  const workloadName = champion.workloads?.name
  const color = getColor(workloadName)
  const initials = champion.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="champion-card" style={{ borderTop: `4px solid ${color}` }}>
      {/* Header strip */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ backgroundColor: color }}
      >
        <span className="text-white text-[10px] font-bold tracking-widest uppercase">
          Dynamics 365
        </span>
        <span className="text-white text-[10px] font-semibold opacity-80">Champion</span>
      </div>

      {/* Photo */}
      <div className="card-header" style={{ backgroundColor: `${color}15` }}>
        {champion.image_url ? (
          <img
            src={champion.image_url}
            alt={champion.name}
            className="card-photo"
            style={{ borderColor: color }}
          />
        ) : (
          <div
            className="card-photo-placeholder"
            style={{ backgroundColor: color }}
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

        <div className="mt-2 flex flex-col items-center gap-2 w-full">
          {workloadName && (
            <span
              className="workload-badge"
              style={{ backgroundColor: color }}
            >
              {workloadName}
            </span>
          )}

          {champion.linkedin_url && (
            <a
              href={champion.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0A66C2] hover:underline"
            >
              <Linkedin size={13} />
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />
    </div>
  )
}
