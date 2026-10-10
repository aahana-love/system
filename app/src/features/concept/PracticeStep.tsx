import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import type { Concept, Question } from '../../content/types'
import { practiceFor, questionById } from '../../content/index'
import type { ProgressRow } from '../../engine/db'
import { shuffle } from '../../engine/grading'
import { PASS_MARK, finishPractice } from '../../engine/progress'
import { QuestionRunner, type RunResult } from '../practice/QuestionRunner'
import { TYPE_LABEL } from '../practice/QuestionView'
import { lineColor } from '../../components/phase'
import { Icon } from '../../components/Icon'

type Phase =
  | { kind: 'intro' }
  | { kind: 'run'; questions: Question[]; full: boolean; key: number }
  | { kind: 'done'; results: RunResult[]; full: boolean; newlyPassed: boolean }

export function PracticeStep({ concept, row, cardIds }: { concept: Concept; row?: ProgressRow; cardIds: string[] }) {
  const all = practiceFor(concept.id)
  const [phase, setPhase] = useState<Phase>({ kind: 'intro' })
  const [runKey, setRunKey] = useState(0)
  const types = [...new Set(all.map((q) => TYPE_LABEL[q.type].toLowerCase()))]

  const startFull = () => {
    setRunKey((k) => k + 1)
    setPhase({ kind: 'run', questions: shuffle(all), full: true, key: runKey + 1 })
  }
  const startMissed = (ids: string[]) => {
    setRunKey((k) => k + 1)
    setPhase({ kind: 'run', questions: shuffle(ids.map((id) => questionById.get(id)!)), full: false, key: runKey + 1 })
  }

  if (phase.kind === 'run') {
    return (
      <QuestionRunner
        key={phase.key}
        questions={phase.questions}
        mode="practice"
        onFinish={async (results) => {
          let newlyPassed = false
          if (phase.full) {
            const score = results.filter((r) => r.correct).length / results.length
            newlyPassed = await finishPractice(concept.id, score, cardIds)
          }
          setPhase({ kind: 'done', results, full: phase.full, newlyPassed })
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (phase.kind === 'done') {
    const right = phase.results.filter((r) => r.correct).length
    const score = right / phase.results.length
    const missed = phase.results.filter((r) => !r.correct).map((r) => r.questionId)
    const passed = phase.full && score >= PASS_MARK
    return (
      <section aria-live="polite">
        <p className="font-mono text-xs tracking-wider text-ink-3 uppercase">{phase.full ? 'Practice result' : 'Missed-questions drill'}</p>
        <p className="mt-2 text-6xl font-extrabold tracking-tight tabular-nums">
          {Math.round(score * 100)}
          <span className="text-3xl text-ink-3">%</span>
        </p>
        <p className="mt-1 text-ink-2">
          {right} of {phase.results.length} correct
          {phase.full ? ` · pass mark ${PASS_MARK * 100}%` : ''}
        </p>

        {phase.newlyPassed && <Unlocked color={lineColor(concept.phase)} count={cardIds.length} />}
        {phase.full && !passed && (
          <p className="mt-6 max-w-xl rounded-xl border border-rule bg-surface px-5 py-4">
            Not there yet. Drill the {missed.length} you missed, re-read the explanations, then run the full set again to pass.
          </p>
        )}
        {!phase.full && (
          <p className="mt-6 max-w-xl text-ink-2">Drills don't count toward the pass mark. Run the full set when you're ready.</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {missed.length > 0 && (
            <button type="button" onClick={() => startMissed(missed)} className="rounded-lg bg-ink px-5 py-2.5 font-bold text-bg">
              Drill the {missed.length} you missed
            </button>
          )}
          <button type="button" onClick={startFull} className="rounded-lg border border-ink px-5 py-2.5 font-bold">
            Run the full set again
          </button>
          {(row?.practicedAt || phase.newlyPassed) && (
            <Link to={`/c/${concept.id}/review`} className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-bold text-ink hover:bg-surface">
              Go to Review <Icon name="arrow" size={16} />
            </Link>
          )}
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-extrabold">Practice</h2>
      <p className="mt-2 max-w-2xl text-ink-2">
        {all.length} questions in random order: {types.join(', ')}. Every answer comes with an explanation. Score{' '}
        {PASS_MARK * 100}% or more to pass and send this concept's flashcards to your daily review.
      </p>
      {row?.practiceBest !== undefined && (
        <p className="mt-3 font-mono text-sm text-ink-2">Your best so far: {Math.round(row.practiceBest * 100)}%</p>
      )}
      <button type="button" onClick={startFull} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 font-bold text-bg">
        Start practice <Icon name="arrow" size={16} />
      </button>
      <p className="mt-3 font-mono text-xs text-ink-3">Keys: 1–9 choose · Enter checks and continues</p>
    </section>
  )
}

/** The line extends from Practice to Review: the one celebratory moment. */
function Unlocked({ color, count }: { color: string; count: number }) {
  return (
    <div className="mt-8 max-w-xl rounded-xl border border-rule bg-surface px-5 py-5">
      <svg viewBox="0 0 320 40" className="h-10 w-full max-w-xs" aria-hidden="true">
        <line x1="20" y1="20" x2="300" y2="20" stroke="var(--rule)" strokeWidth="5" strokeLinecap="round" />
        <motion.line
          x1="20"
          y1="20"
          x2="300"
          y2="20"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        />
        <circle cx="20" cy="20" r="9" fill={color} />
        <motion.circle cx="300" cy="20" r="9" fill={color} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.85 }} />
      </svg>
      <p className="mt-3 text-lg font-bold">Passed. Review is unlocked.</p>
      <p className="mt-1 text-ink-2">
        {count} flashcards joined your daily review. They come back on a schedule timed to just before you'd forget them.
      </p>
    </div>
  )
}
