import { useState } from 'react'
import type { Diagram } from '../content/types'
import { ArchDiagram } from './ArchDiagram'
import { RichText } from './RichText'
import { Icon } from './Icon'

export interface StepperStep {
  title: string
  /** Small label above the title, such as "Minutes 0–5". */
  tag?: string
  text: string
  /** Diagram nodes to light up on this step. */
  focus?: string[]
  /** A second line of context: what to watch for, or why it matters. */
  note?: string
}

/** A short guided walk-through: one step at a time, with an optional diagram that follows along. */
export function Stepper({ steps, diagram, label }: { steps: StepperStep[]; diagram?: Diagram; label: string }) {
  const [i, setI] = useState(0)
  const s = steps[i]
  return (
    <figure
      className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
        if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, steps.length - 1))
        if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0))
      }}
    >
      <ol className="flex flex-wrap gap-1.5" aria-label="Steps">
        {steps.map((st, n) => (
          <li key={n}>
            <button
              type="button"
              onClick={() => setI(n)}
              aria-current={n === i ? 'step' : undefined}
              aria-label={`Step ${n + 1}: ${st.title}`}
              className={`h-8 min-w-8 rounded-full border px-2 font-mono text-xs font-bold ${
                n === i ? 'border-ink bg-ink text-bg' : n < i ? 'border-ink-3 text-ink-2' : 'border-rule text-ink-3 hover:text-ink'
              }`}
            >
              {n + 1}
            </button>
          </li>
        ))}
      </ol>

      {diagram && (
        <div className="mt-4 rounded-xl border border-rule p-2">
          <ArchDiagram diagram={diagram} highlight={s.focus} label={`${label}: ${s.title}`} />
        </div>
      )}

      <div className="mt-4 min-h-28" aria-live="polite">
        {s.tag && <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">{s.tag}</p>}
        <p className="mt-1 font-display text-xl font-extrabold">{s.title}</p>
        <p className="mt-2 font-serif text-[1.05rem] leading-relaxed">
          <RichText text={s.text} link />
        </p>
        {s.note && (
          <p className="mt-3 border-l-4 border-rule pl-3 font-display text-sm text-ink-2">
            <RichText text={s.note} />
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setI((n) => Math.max(n - 1, 0))}
          disabled={i === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rule px-3 py-1.5 text-sm font-semibold hover:bg-surface-2 disabled:opacity-35"
        >
          <Icon name="back" size={15} /> Back
        </button>
        <button
          type="button"
          onClick={() => setI((n) => Math.min(n + 1, steps.length - 1))}
          disabled={i === steps.length - 1}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 text-sm font-bold text-bg disabled:opacity-35"
        >
          Next <Icon name="arrow" size={15} />
        </button>
        <span className="ml-auto font-mono text-xs text-ink-3">
          {i + 1} of {steps.length}
        </span>
      </div>
    </figure>
  )
}
