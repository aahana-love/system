import { Link, useNavigate } from 'react-router'
import type { Concept } from '../../content/types'
import { conceptById, phases } from '../../content/roadmap'
import type { ProgressRow } from '../../engine/db'
import { acknowledgePrereqs, prereqCovered } from '../../engine/progress'
import { useUi } from '../../state/ui'
import { Station } from '../../components/Station'
import { lineColor } from '../../components/phase'
import { Icon } from '../../components/Icon'

export function GateStep({ concept, rows }: { concept: Concept; rows: Map<string, ProgressRow> }) {
  const navigate = useNavigate()
  const openTerm = useUi((s) => s.openTerm)
  const prereqs = concept.prerequisites.map((id) => conceptById.get(id)!)
  const missing = prereqs.filter((p) => !prereqCovered(rows.get(p.id)))

  const start = async () => {
    await acknowledgePrereqs(
      concept.id,
      missing.map((m) => m.id),
    )
    navigate(`/c/${concept.id}/learn`)
  }

  return (
    <section aria-labelledby="gate-title">
      <h2 id="gate-title" className="text-2xl font-extrabold">
        Before you start
      </h2>
      {prereqs.length === 0 ? (
        <p className="mt-2 text-ink-2">This concept has no prerequisites. You can start right away.</p>
      ) : (
        <p className="mt-2 max-w-2xl text-ink-2">
          {concept.title} builds on {prereqs.length === 1 ? 'one idea' : `${prereqs.length} ideas`}. Practice a lesson or read
          its 2-minute primer to cover it.
        </p>
      )}

      {prereqs.length > 0 && (
        <ul className="mt-6 divide-y divide-rule rounded-xl border border-rule bg-surface">
          {prereqs.map((p) => {
            const row = rows.get(p.id)
            const covered = prereqCovered(row)
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
                <Station state={covered ? 'done' : 'todo'} color={lineColor(p.phase)} />
                <span className="min-w-[12rem] flex-1">
                  <span className="block font-bold">{p.title}</span>
                  <span className="block text-sm text-ink-2">{p.oneLiner}</span>
                </span>
                <span className="flex items-center gap-2 max-sm:w-full max-sm:pl-10">
                  {covered ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-good">
                      <Icon name="check" size={15} />
                      {row?.practicedAt ? 'Practiced' : 'Primer read'}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-ink-3">Not covered</span>
                  )}
                  <button
                    type="button"
                    onClick={() => openTerm(p.id)}
                    className="rounded-lg border border-rule px-3 py-1.5 text-sm font-semibold hover:bg-surface-2"
                  >
                    Read primer
                  </button>
                  {p.ready && (
                    <Link to={`/c/${p.id}`} className="rounded-lg border border-rule px-3 py-1.5 text-sm font-semibold hover:bg-surface-2">
                      Open lesson
                    </Link>
                  )}
                </span>
                {!p.ready && !covered && (
                  <span className="basis-full pl-10 font-mono text-[11px] text-ink-3">
                    Full lesson arrives with {phases[p.phase].milestone}. The primer covers what you need here.
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={start}
          className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-bold ${
            missing.length === 0 ? 'bg-ink text-bg' : 'border border-ink text-ink hover:bg-surface-2'
          }`}
        >
          {missing.length === 0 ? 'Start Learn' : `Start anyway (skip ${missing.length})`}
          <Icon name="arrow" size={16} />
        </button>
        {missing.length > 0 && (
          <p className="max-w-md text-sm text-ink-3">
            Skipping is allowed. It's noted, so the app can point you back to these later.
          </p>
        )}
      </div>
    </section>
  )
}
