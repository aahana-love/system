import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { concepts, phases } from '../../content/roadmap'
import type { Concept } from '../../content/types'
import { db, type ProgressRow } from '../../engine/db'
import { useAttempts, useMeta, useNow, useProgressMap, useReviewCards } from '../../engine/hooks'
import { STEPS, conceptState, nextConcept, openMistakes, resumeStep, type ConceptState } from '../../engine/progress'
import { formatInterval } from '../../engine/review'
import { computeStreak } from '../../engine/stats'
import { Station, type StationState } from '../../components/Station'
import { lineColor } from '../../components/phase'
import { Icon } from '../../components/Icon'

export function HomePage() {
  const rows = useProgressMap()
  const cards = useReviewCards()
  const attempts = useAttempts()
  const logTimes = useLiveQuery(async () => (await db.reviewLogs.toArray()).map((l) => l.at), [])
  const lastBackupAt = useMeta<number>('lastBackupAt')
  const now = useNow()

  if (!rows || !cards || !attempts || !logTimes) return <div className="h-40" aria-busy="true" />

  const next = nextConcept(concepts, rows)
  const due = cards.filter((c) => c.due <= now).length
  const upcoming = cards.filter((c) => c.due > now).sort((a, b) => a.due - b.due)[0]
  const mistakes = openMistakes(attempts).length
  const streak = computeStreak([...attempts.map((a) => a.at), ...logTimes], now)
  const hasProgress = rows.size > 0
  const backupStale = hasProgress && (!lastBackupAt || now - lastBackupAt > 7 * 86_400_000)
  const stateOf = (c: Concept) => conceptState(c, rows.get(c.id), cards.filter((k) => k.conceptId === c.id))

  return (
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-xs tracking-wider text-ink-3 uppercase">
        {new Date(now).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      {next ? (
        <NextStop concept={next} rows={rows} stateOf={stateOf} />
      ) : (
        <section className="mt-3">
          <h1 className="text-4xl font-extrabold tracking-tight">Every written lesson is practiced</h1>
          <p className="mt-2 max-w-xl text-ink-2">
            Keep your daily review going. New lessons arrive with each milestone; the roadmap shows what's coming.
          </p>
        </section>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Tile label="Review">
          {due > 0 ? (
            <>
              <p className="text-3xl font-extrabold tabular-nums">{due}</p>
              <p className="text-sm text-ink-2">card{due === 1 ? '' : 's'} due now</p>
              <Link to="/review" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-focus">
                Start review <Icon name="arrow" size={14} />
              </Link>
            </>
          ) : (
            <>
              <p className="text-3xl font-extrabold">0</p>
              <p className="text-sm text-ink-2">
                {upcoming ? `Next card in ${formatInterval(upcoming.due - now)}` : 'Cards arrive when you pass a practice'}
              </p>
            </>
          )}
        </Tile>
        <Tile label="Mistakes to redo">
          <p className="text-3xl font-extrabold tabular-nums">{mistakes}</p>
          {mistakes > 0 ? (
            <Link to="/mistakes" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-focus">
              Drill them <Icon name="arrow" size={14} />
            </Link>
          ) : (
            <p className="text-sm text-ink-2">Wrong answers wait here until you get them right</p>
          )}
        </Tile>
        <Tile label="Streak">
          <p className="text-3xl font-extrabold tabular-nums">
            {streak.days}
            <span className="ml-1 text-base font-semibold text-ink-2">day{streak.days === 1 ? '' : 's'}</span>
          </p>
          <p className="text-sm text-ink-2">
            {streak.activeToday ? 'You studied today' : streak.days > 0 ? 'Study today to keep it going' : 'Answer one question to start'}
          </p>
        </Tile>
      </div>

      {backupStale && (
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-rule bg-surface px-5 py-3 text-sm">
          <span className="font-semibold">
            {lastBackupAt ? 'Your last backup is over a week old.' : "You haven't backed up your progress yet."}
          </span>
          <span className="text-ink-2">It lives only in this browser.</span>
          <Link to="/settings" className="font-bold text-focus">
            Export a backup
          </Link>
        </p>
      )}

      <section className="mt-12" aria-labelledby="lines-title">
        <div className="flex items-baseline justify-between">
          <h2 id="lines-title" className="text-xl font-bold">
            Your lines
          </h2>
          <Link to="/roadmap" className="text-sm font-bold text-focus">
            Full roadmap
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {phases.slice(0, 4).map((p) => {
            const list = concepts.filter((c) => c.phase === p.id)
            const states = list.map(stateOf)
            const practiced = states.filter((s) => s === 'practiced' || s === 'mastered').length
            const ready = list.filter((c) => c.ready).length
            return (
              <li key={p.id} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-4 sm:grid-cols-[12rem_1fr_auto]">
                <span className="truncate text-sm font-semibold">{p.short}</span>
                <span className="flex h-2.5 gap-[3px]" aria-hidden="true">
                  {states.map((s, i) => (
                    <span key={list[i].id} className="h-full flex-1 rounded-full" style={segmentStyle(s, lineColor(p.id))} />
                  ))}
                </span>
                <span className="font-mono text-xs text-ink-2 tabular-nums">
                  {practiced}/{list.length}
                  {ready < list.length && <span className="text-ink-3"> · {ready} written</span>}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function segmentStyle(s: ConceptState, color: string): CSSProperties {
  switch (s) {
    case 'mastered':
      return { background: color }
    case 'practiced':
      return { background: `color-mix(in oklab, ${color} 70%, transparent)` }
    case 'learning':
      return { background: `color-mix(in oklab, ${color} 30%, transparent)` }
    case 'not-started':
      return { background: 'var(--rule)' }
    default:
      return { background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--rule)' }
  }
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-rule bg-surface px-5 py-4">
      <h2 className="mb-1 font-mono text-[11px] tracking-wider text-ink-3 uppercase">{label}</h2>
      {children}
    </section>
  )
}

function stationFor(s: ConceptState, isNext: boolean): StationState {
  if (isNext) return 'here'
  if (s === 'mastered') return 'mastered'
  if (s === 'practiced') return 'done'
  if (s === 'unavailable') return 'planned'
  return 'todo'
}

/** The hero: where you are on your current line, and the button to continue. */
function NextStop({
  concept,
  rows,
  stateOf,
}: {
  concept: Concept
  rows: Map<string, ProgressRow>
  stateOf: (c: Concept) => ConceptState
}) {
  const line = concepts.filter((c) => c.phase === concept.phase)
  const at = line.findIndex((c) => c.id === concept.id)
  const start = Math.max(0, Math.min(at - 2, line.length - 5))
  const windowed = line.slice(start, start + 5)
  const color = lineColor(concept.phase)
  const step = resumeStep(concept, rows.get(concept.id), rows)
  const stepLabel = STEPS.find((s) => s.id === step)!.label

  return (
    <section className="mt-3" aria-labelledby="next-title">
      <div className="overflow-hidden rounded-2xl border border-rule bg-surface">
        <div className="border-b border-rule px-5 pt-5 pb-4 sm:px-8">
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">
            Next stop · Phase {concept.phase} · {phases[concept.phase].short}
          </p>
          <ol className="relative mt-5 grid" style={{ gridTemplateColumns: `repeat(${windowed.length}, minmax(0, 1fr))` }}>
            {windowed.map((c, i) => (
              <li key={c.id} className="relative flex flex-col items-center text-center">
                {i < windowed.length - 1 && (
                  <span aria-hidden="true" className="absolute top-[9px] left-1/2 h-1 w-full" style={{ background: color }} />
                )}
                <span className="relative z-10">
                  <Station state={stationFor(stateOf(c), c.id === concept.id)} color={color} />
                </span>
                <span
                  className={`mt-2 line-clamp-2 px-1 text-[11px] leading-tight sm:text-xs ${
                    c.id === concept.id ? 'font-bold text-ink' : 'text-ink-3'
                  }`}
                >
                  {c.title}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid gap-6 px-5 py-6 sm:grid-cols-[1fr_auto] sm:items-end sm:px-8">
          <div>
            <h1 id="next-title" className="text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl">
              {concept.title}
            </h1>
            <p className="mt-2 max-w-xl text-lg leading-snug text-ink-2">{concept.oneLiner}</p>
          </div>
          <Link
            to={`/c/${concept.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-lg font-bold text-white"
            style={{ background: color }}
          >
            Continue: {stepLabel} <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </section>
  )
}

