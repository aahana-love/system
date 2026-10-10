import { Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { Concept, Question } from '../../content/types'
import { checksFor } from '../../content/index'
import { lessonComponent } from '../../content/lessons'
import type { ProgressRow } from '../../engine/db'
import { canSubmit, grade, type Answer } from '../../engine/grading'
import { patchProgress, recordAttempt } from '../../engine/progress'
import { QuestionView, initialAnswer, useOptionOrder } from '../practice/QuestionView'
import { mdxComponents } from './mdxComponents'
import { Icon } from '../../components/Icon'
import { ReportButton } from '../../components/ReportButton'

export function LearnStep({ concept, row }: { concept: Concept; row?: ProgressRow }) {
  const Lesson = lessonComponent(concept.id, 'learn')
  return (
    <>
      <article className="lesson">
        <Suspense fallback={<p className="text-ink-3">Loading lesson…</p>}>{Lesson && <Lesson components={mdxComponents} />}</Suspense>
      </article>
      <div className="mt-6">
        <ReportButton target={`${concept.id}:learn`} />
      </div>
      <Checks concept={concept} row={row} />
    </>
  )
}

function Checks({ concept, row }: { concept: Concept; row?: ProgressRow }) {
  const checks = checksFor(concept.id)
  const [passed, setPassed] = useState<Set<string>>(new Set())
  const [retake, setRetake] = useState(false)
  const already = Boolean(row?.checksPassedAt)
  const allPassed = checks.every((q) => passed.has(q.id))

  useEffect(() => {
    if (allPassed && checks.length > 0 && !already) void patchProgress(concept.id, { checksPassedAt: Date.now() })
  }, [allPassed, already, checks.length, concept.id])

  return (
    <section aria-labelledby="checks-title" className="mt-16 border-t-2 border-ink pt-8">
      <h2 id="checks-title" className="text-2xl font-extrabold">
        Quick check
      </h2>
      {already && !retake ? (
        <div className="mt-4 rounded-xl border border-good bg-good-bg px-5 py-4">
          <p className="flex items-center gap-2 font-bold text-good">
            <Icon name="check" /> You passed the checks. Theory is unlocked.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link to={`/c/${concept.id}/theory`} className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 font-bold text-bg">
              Go to Theory <Icon name="arrow" size={16} />
            </Link>
            <button type="button" onClick={() => setRetake(true)} className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-2 hover:bg-surface">
              Retake the checks
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 text-ink-2">
            Answer all {checks.length} correctly to unlock Theory. A wrong answer shows why, and you can try that one again.
          </p>
          <ol className="mt-6 space-y-6">
            {checks.map((q, i) => (
              <li key={q.id}>
                <CheckCard q={q} n={i + 1} onPass={() => setPassed((s) => new Set(s).add(q.id))} />
              </li>
            ))}
          </ol>
          {allPassed && (
            <div className="mt-6 rounded-xl border border-good bg-good-bg px-5 py-4">
              <p className="flex items-center gap-2 font-bold text-good">
                <Icon name="check" /> All {checks.length} correct. Theory is unlocked.
              </p>
              <Link
                to={`/c/${concept.id}/theory`}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 font-bold text-bg"
              >
                Go to Theory <Icon name="arrow" size={16} />
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function CheckCard({ q, n, onPass }: { q: Question; n: number; onPass: () => void }) {
  const [seed, setSeed] = useState(0)
  const [answer, setAnswer] = useState<Answer>(() => initialAnswer(q))
  const [result, setResult] = useState<boolean | null>(null)
  const order = useOptionOrder(q, seed)

  const check = () => {
    if (!canSubmit(q, answer)) return
    const ok = grade(q, answer)
    setResult(ok)
    void recordAttempt(q.id, q.concept, ok, 'check')
    if (ok) onPass()
  }
  const retry = () => {
    setSeed((s) => s + 1)
    setAnswer(initialAnswer(q))
    setResult(null)
  }

  return (
    <div className="rounded-xl border border-rule bg-surface p-5" data-check={q.id}>
      <p className="mb-2 font-mono text-xs text-ink-3">Check {n}</p>
      <QuestionView question={q} answer={answer} onAnswer={setAnswer} submitted={result !== null} correct={result ?? undefined} order={order} />
      <div className="mt-4">
        {result === null && (
          <button
            type="button"
            onClick={check}
            disabled={!canSubmit(q, answer)}
            className="rounded-lg bg-ink px-4 py-2 font-bold text-bg disabled:opacity-35"
          >
            Check answer
          </button>
        )}
        {result === false && (
          <button type="button" onClick={retry} className="rounded-lg border border-ink px-4 py-2 font-bold">
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
