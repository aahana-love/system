import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useAttempts } from '../../engine/hooks'
import { openMistakes } from '../../engine/progress'
import { questionById } from '../../content/index'
import { conceptById } from '../../content/roadmap'
import type { Question } from '../../content/types'
import { shuffle } from '../../engine/grading'
import { QuestionRunner, type RunResult } from '../practice/QuestionRunner'
import { TYPE_LABEL } from '../practice/QuestionView'
import { RichText } from '../../components/RichText'
import { lineColor } from '../../components/phase'

export function MistakesPage() {
  const attempts = useAttempts()
  const [run, setRun] = useState<{ questions: Question[]; key: number } | null>(null)
  const [last, setLast] = useState<RunResult[] | null>(null)

  const groups = useMemo(() => {
    if (!attempts) return null
    const ids = openMistakes(attempts).filter((id) => questionById.has(id))
    const map = new Map<string, Question[]>()
    for (const id of ids) {
      const q = questionById.get(id)!
      map.set(q.concept, [...(map.get(q.concept) ?? []), q])
    }
    return [...map]
  }, [attempts])

  if (!groups) return <div className="h-40" aria-busy="true" />
  const total = groups.reduce((n, [, qs]) => n + qs.length, 0)

  if (run) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 font-mono text-xs tracking-wider text-ink-3 uppercase">Mistakes drill</p>
        <QuestionRunner
          key={run.key}
          questions={run.questions}
          mode="mistakes"
          onFinish={(results) => {
            setLast(results)
            setRun(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs tracking-wider text-ink-3 uppercase">Questions you got wrong last time</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Mistakes</h1>
      {last && (
        <p className="mt-4 rounded-xl border border-rule bg-surface px-5 py-3">
          Drill finished: {last.filter((r) => r.correct).length} of {last.length} right. Correct answers leave this list.
        </p>
      )}
      {total === 0 ? (
        <div className="mt-8 rounded-2xl border border-rule bg-surface px-6 py-10 text-center">
          <p className="text-xl font-bold">No open mistakes</p>
          <p className="mx-auto mt-2 max-w-md text-ink-2">
            When you miss a question it lands here, and it stays until you answer it correctly.
          </p>
          <Link to="/" className="mt-5 inline-block font-semibold text-focus underline underline-offset-4">
            Go to Today
          </Link>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setRun({ questions: shuffle(groups.flatMap(([, qs]) => qs)), key: Date.now() })}
            className="mt-6 rounded-lg bg-ink px-5 py-2.5 font-bold text-bg"
          >
            Drill all {total}
          </button>
          <div className="mt-8 space-y-8">
            {groups.map(([conceptId, qs]) => {
              const c = conceptById.get(conceptId)!
              return (
                <section key={conceptId}>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-bold">
                      <span className="inline-block h-2.5 w-6 rounded-full" style={{ background: lineColor(c.phase) }} />
                      {c.title}
                      <span className="font-mono text-sm font-normal text-ink-3">{qs.length}</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setRun({ questions: shuffle(qs), key: Date.now() })}
                      className="rounded-lg border border-rule px-3 py-1.5 text-sm font-semibold hover:bg-surface"
                    >
                      Drill these
                    </button>
                  </div>
                  <ul className="mt-3 divide-y divide-rule rounded-xl border border-rule bg-surface">
                    {qs.map((q) => (
                      <li key={q.id} className="px-5 py-3">
                        <p className="font-mono text-[11px] text-ink-3 uppercase">{TYPE_LABEL[q.type]}</p>
                        <p className="mt-0.5">
                          <RichText text={q.prompt} />
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
