import { useState } from 'react'
import { useNavigate } from 'react-router'
import { concepts, conceptById, phases, plannedStops } from '../../content/roadmap'
import type { Concept, Phase } from '../../content/types'
import { useProgressMap, useReviewCards } from '../../engine/hooks'
import { conceptState, nextConcept } from '../../engine/progress'
import { Station, type StationState } from '../../components/Station'
import { lineColor } from '../../components/phase'
import { useUi } from '../../state/ui'

export function RoadmapPage() {
  const rows = useProgressMap()
  const cards = useReviewCards()
  const [hover, setHover] = useState<string | null>(null)
  if (!rows || !cards) return <div className="h-40" aria-busy="true" />

  const next = nextConcept(concepts, rows)
  const needed = new Set(hover ? conceptById.get(hover)?.prerequisites : [])
  const stationOf = (c: Concept): StationState => {
    const s = conceptState(c, rows.get(c.id), cards.filter((k) => k.conceptId === c.id))
    if (c.id === next?.id) return 'here'
    if (s === 'mastered') return 'mastered'
    if (s === 'practiced') return 'done'
    if (s === 'unavailable') return 'planned'
    return 'todo'
  }

  return (
    <div className="mx-auto max-w-7xl">
      <p className="font-mono text-xs tracking-wider text-ink-3 uppercase">Zero to Uber/Amazon-level system design</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Roadmap</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        Each phase is a line; each stop is a concept, in the order to learn it. Hover a stop to light up what it builds on. Stops
        without a full lesson yet still open a 2-minute primer.
      </p>
      <Legend />

      <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
        {phases.slice(0, 4).map((p) => (
          <Line key={p.id} phase={p} stationOf={stationOf} hover={hover} needed={needed} onHover={setHover} />
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-extrabold">Coming later</h2>
      <p className="mt-1 text-ink-2">These lines open with milestones M5 to M7, after the concepts they rely on.</p>
      <div className="mt-6 grid gap-x-8 gap-y-10 lg:grid-cols-3">
        {phases.slice(4).map((p) => (
          <PlannedLine key={p.id} phase={p} />
        ))}
      </div>
    </div>
  )
}

function Legend() {
  const items: [StationState, string][] = [
    ['todo', 'Not started'],
    ['here', 'Next stop'],
    ['done', 'Practiced'],
    ['mastered', 'Mastered'],
    ['planned', 'Primer only for now'],
  ]
  return (
    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legend">
      {items.map(([s, label]) => (
        <li key={s} className="flex items-center gap-1.5 text-sm text-ink-2">
          <Station state={s} color="var(--ink-2)" size={18} />
          {label}
        </li>
      ))}
    </ul>
  )
}

function Line({
  phase,
  stationOf,
  hover,
  needed,
  onHover,
}: {
  phase: Phase
  stationOf: (c: Concept) => StationState
  hover: string | null
  needed: Set<string>
  onHover: (id: string | null) => void
}) {
  const navigate = useNavigate()
  const openTerm = useUi((s) => s.openTerm)
  const color = lineColor(phase.id)
  const list = concepts.filter((c) => c.phase === phase.id)

  return (
    <section aria-labelledby={`line-${phase.id}`}>
      <div className="h-2 w-16 rounded-full" style={{ background: color }} />
      <h2 id={`line-${phase.id}`} className="mt-3 text-lg leading-tight font-extrabold">
        <span className="block font-mono text-[11px] font-normal tracking-wider text-ink-3 uppercase">Phase {phase.id}</span>
        {phase.name}
      </h2>
      <ol className="mt-4">
        {list.map((c, i) => {
          const isNeeded = needed.has(c.id)
          const dim = hover !== null && hover !== c.id && !isNeeded
          const station = stationOf(c)
          return (
            <li key={c.id} className="relative flex gap-3">
              <span aria-hidden="true" className="relative flex w-[22px] shrink-0 flex-col items-center">
                <span className="w-1 flex-1" style={{ background: i === 0 ? 'transparent' : color }} />
                <Station state={station} color={color} />
                <span className="w-1 flex-1" style={{ background: i === list.length - 1 ? 'transparent' : color }} />
              </span>
              <button
                type="button"
                onMouseEnter={() => onHover(c.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(c.id)}
                onBlur={() => onHover(null)}
                onClick={() => (c.ready ? navigate(`/c/${c.id}`) : openTerm(c.id))}
                className={`my-1 flex-1 rounded-lg px-2 py-1.5 text-left transition-opacity ${dim ? 'opacity-35' : ''} ${
                  isNeeded ? 'bg-surface ring-2' : 'hover:bg-surface'
                }`}
                style={isNeeded ? { ['--tw-ring-color' as string]: color } : undefined}
              >
                <span className={`block text-[15px] leading-snug ${c.ready ? 'font-bold text-ink' : 'font-medium text-ink-2'}`}>
                  {c.title}
                </span>
                <span className="block font-mono text-[11px] text-ink-3">
                  {isNeeded ? 'Needed for the hovered stop' : c.ready ? `Full lesson · ${c.estMinutes} min` : `Primer · lesson in ${phase.milestone}`}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function PlannedLine({ phase }: { phase: Phase }) {
  const color = lineColor(phase.id)
  const stops = plannedStops.filter((s) => s.phase === phase.id)
  const tiers = [...new Set(stops.map((s) => s.tier))]
  return (
    <section aria-labelledby={`line-${phase.id}`}>
      <div className="h-2 w-16 rounded-full opacity-60" style={{ background: `repeating-linear-gradient(90deg, ${color} 0 8px, transparent 8px 12px)` }} />
      <h3 id={`line-${phase.id}`} className="mt-3 text-lg leading-tight font-extrabold">
        <span className="block font-mono text-[11px] font-normal tracking-wider text-ink-3 uppercase">
          Phase {phase.id} · {phase.milestone}
        </span>
        {phase.name}
      </h3>
      {tiers.map((t) => (
        <div key={t} className="mt-4">
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">{t}</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {stops
              .filter((s) => s.tier === t)
              .map((s) => (
                <li key={s.title} className="rounded-full border border-dashed px-2.5 py-0.5 text-[13px] text-ink-2" style={{ borderColor: color }}>
                  {s.title}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
