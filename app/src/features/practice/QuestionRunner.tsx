import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Question } from '../../content/types'
import { canSubmit, grade, type Answer } from '../../engine/grading'
import { recordAttempt } from '../../engine/progress'
import type { AttemptMode } from '../../engine/db'
import { QuestionView, initialAnswer, useOptionOrder } from './QuestionView'
import { Icon } from '../../components/Icon'

export interface RunResult {
  questionId: string
  correct: boolean
}

/** Runs a list of questions one at a time, with keyboard support. */
export function QuestionRunner({
  questions,
  mode,
  onFinish,
}: {
  questions: Question[]
  mode: AttemptMode
  onFinish: (results: RunResult[]) => void
}) {
  const [idx, setIdx] = useState(0)
  const q = questions[idx]
  const [answer, setAnswer] = useState<Answer>(() => initialAnswer(q))
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<RunResult[]>([])
  const order = useOptionOrder(q, idx)
  const isLast = idx === questions.length - 1
  const correct = results[idx]?.correct

  const submit = useCallback(() => {
    if (submitted || !canSubmit(q, answer)) return
    const ok = grade(q, answer)
    setSubmitted(true)
    setResults((r) => [...r, { questionId: q.id, correct: ok }])
    void recordAttempt(q.id, q.concept, ok, mode)
  }, [submitted, q, answer, mode])

  const next = useCallback(() => {
    if (!submitted) return
    if (isLast) {
      onFinish(results)
      return
    }
    const nq = questions[idx + 1]
    setIdx(idx + 1)
    setAnswer(initialAnswer(nq))
    setSubmitted(false)
    window.scrollTo({ top: 0 })
  }, [submitted, isLast, onFinish, results, questions, idx])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement
      const tag = target.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      if (e.key === 'Enter') {
        if (tag === 'TEXTAREA') return
        const role = target.getAttribute('role')
        // A focused ordinary button (Next, move up/down) activates itself.
        if (tag === 'BUTTON' && role !== 'radio' && role !== 'checkbox') return
        e.preventDefault()
        if (submitted) next()
        else submit()
        return
      }
      if (typing || submitted) return
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1 || n > order.length) return
      const i = order[n - 1]
      if (q.type === 'single') setAnswer({ type: 'single', choice: i })
      if (q.type === 'multi' && answer.type === 'multi') {
        setAnswer({ type: 'multi', choices: answer.choices.includes(i) ? answer.choices.filter((c) => c !== i) : [...answer.choices, i] })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [submitted, submit, next, order, q, answer])

  return (
    <div>
      <ol className="mb-6 flex gap-1" aria-label={`Question ${idx + 1} of ${questions.length}`}>
        {questions.map((qq, i) => (
          <li
            key={qq.id}
            className="h-1.5 flex-1 rounded-full"
            style={{
              background:
                i < results.length ? (results[i].correct ? 'var(--good)' : 'var(--bad)') : i === idx ? 'var(--ink)' : 'var(--rule)',
            }}
          />
        ))}
      </ol>
      <p className="mb-3 font-mono text-xs text-ink-3">
        Question {idx + 1} of {questions.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id + idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.16 }}
        >
          <QuestionView
            question={q}
            answer={answer}
            onAnswer={setAnswer}
            submitted={submitted}
            correct={correct}
            order={order}
            showKeys={q.type === 'single' || q.type === 'multi'}
          />
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex items-center gap-4">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit(q, answer)}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 font-bold text-bg disabled:opacity-35"
          >
            Check answer
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 font-bold text-bg"
            autoFocus
          >
            {isLast ? 'See results' : 'Next question'} <Icon name="arrow" size={16} />
          </button>
        )}
        <span className="hidden font-mono text-xs text-ink-3 sm:inline">
          {q.type === 'single' || q.type === 'multi' ? '1–9 to choose · ' : ''}Enter to {submitted ? 'continue' : 'check'}
        </span>
      </div>
    </div>
  )
}
