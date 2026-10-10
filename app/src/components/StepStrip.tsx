import { Link } from 'react-router'
import { Station, type StationState } from './Station'
import { STEPS, lockReason, stepUnlocked, type StepId } from '../engine/progress'
import type { ProgressRow } from '../engine/db'

/** The five steps of a concept, drawn as stops on its line. */
export function StepStrip({
  conceptId,
  current,
  row,
  gateDone,
  mastered,
  color,
}: {
  conceptId: string
  current: StepId
  row?: ProgressRow
  gateDone: boolean
  mastered: boolean
  color: string
}) {
  const done: Record<StepId, boolean> = {
    gate: gateDone,
    learn: Boolean(row?.checksPassedAt),
    theory: Boolean(row?.theoryReadAt),
    practice: Boolean(row?.practicedAt),
    review: mastered,
  }
  return (
    <nav aria-label="Lesson steps" className="mt-8">
      <ol className="flex">
        {STEPS.map((s, i) => {
          const unlocked = stepUnlocked(s.id, row)
          let state: StationState = unlocked ? 'todo' : 'locked'
          if (done[s.id]) state = s.id === 'review' ? 'mastered' : 'done'
          if (s.id === current) state = 'here'
          const next = STEPS[i + 1]
          const label = (
            <>
              <Station state={state} color={color} />
              <span
                className={`mt-2 text-[12px] font-bold tracking-wide uppercase sm:text-[13px] ${
                  s.id === current ? 'text-ink' : unlocked ? 'text-ink-2' : 'text-ink-3'
                }`}
              >
                {s.label}
              </span>
            </>
          )
          return (
            <li key={s.id} className="relative flex flex-1 flex-col items-center text-center">
              {next && (
                <span
                  aria-hidden="true"
                  className="absolute top-[9px] left-1/2 h-1 w-full rounded-full"
                  style={{ background: done[s.id] ? color : 'var(--rule)' }}
                />
              )}
              {unlocked ? (
                <Link
                  to={`/c/${conceptId}/${s.id}`}
                  aria-current={s.id === current ? 'step' : undefined}
                  className="relative z-10 flex flex-col items-center rounded-md px-1"
                >
                  {label}
                </Link>
              ) : (
                <span className="relative z-10 flex flex-col items-center px-1" title={lockReason(s.id)}>
                  {label}
                  <span className="sr-only">Locked. {lockReason(s.id)}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
