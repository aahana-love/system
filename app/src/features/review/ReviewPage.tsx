import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import type { Grade } from 'ts-fsrs'
import { db, type ReviewCardRow } from '../../engine/db'
import { GRADES, formatInterval, previewRow, rateCard } from '../../engine/review'
import { useReviewCards } from '../../engine/hooks'
import { cardById } from '../../content/index'
import { conceptById } from '../../content/roadmap'
import { lineColor } from '../../components/phase'
import { RichText } from '../../components/RichText'

/** Cards rated "Again" come back within the same session if due this soon. */
const RELEARN_WINDOW = 15 * 60_000

export function ReviewPage() {
  const [params] = useSearchParams()
  const conceptFilter = params.get('concept')
  const all = useReviewCards()
  const [queue, setQueue] = useState<string[] | null>(null)
  const [done, setDone] = useState(0)

  // Snapshot the due queue once, when the cards first load.
  useEffect(() => {
    if (!all || queue) return
    const now = Date.now()
    setQueue(
      all
        .filter((c) => c.due <= now && (!conceptFilter || c.conceptId === conceptFilter))
        .sort((a, b) => a.due - b.due)
        .map((c) => c.cardId),
    )
  }, [all, queue, conceptFilter])

  const onRated = useCallback(async (cardId: string, grade: Grade) => {
    const now = Date.now()
    await rateCard(cardId, grade, now)
    const updated = await db.reviewCards.get(cardId)
    setDone((d) => d + 1)
    setQueue((q) => {
      const rest = (q ?? []).slice(1)
      return updated && updated.due - now < RELEARN_WINDOW ? [...rest, cardId] : rest
    })
  }, [])

  if (!all || !queue) return <div className="h-40" aria-busy="true" />

  const current = queue[0] ? all.find((c) => c.cardId === queue[0]) : undefined

  return (
    <div className="mx-auto max-w-2xl">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-wider text-ink-3 uppercase">
            Daily review{conceptFilter ? ` · ${conceptById.get(conceptFilter)?.title ?? ''}` : ''}
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Review</h1>
        </div>
        {current && (
          <p className="font-mono text-sm text-ink-2 tabular-nums">
            {done} done · {queue.length} left
          </p>
        )}
      </header>
      <div className="mt-8">
        {current ? (
          <ReviewCard key={`${current.cardId}-${done}`} row={current} onRated={onRated} />
        ) : (
          <Empty all={all} reviewed={done} />
        )}
      </div>
    </div>
  )
}

function ReviewCard({ row, onRated }: { row: ReviewCardRow; onRated: (id: string, g: Grade) => void }) {
  const [flipped, setFlipped] = useState(false)
  const [busy, setBusy] = useState(false)
  const card = cardById.get(row.cardId)
  const concept = conceptById.get(row.conceptId)
  const preview = useMemo(() => previewRow(row, Date.now()), [row])

  const rate = useCallback(
    (g: Grade) => {
      if (busy) return
      setBusy(true)
      onRated(row.cardId, g)
    },
    [busy, onRated, row.cardId],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey) return
      if (e.key === ' ' || (e.key === 'Enter' && !flipped)) {
        e.preventDefault()
        setFlipped(true)
        return
      }
      if (!flipped) return
      const g = GRADES.find((x) => x.key === e.key)
      if (g) rate(g.grade)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipped, rate])

  if (!card) {
    return <p className="text-ink-2">This card no longer exists in the content. Rate it Easy to move on, or reset your progress.</p>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
      <div className="min-h-64 rounded-2xl border border-rule bg-surface px-6 py-7 sm:px-8">
        {concept && (
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-ink-3 uppercase">
            <span className="inline-block h-2 w-5 rounded-full" style={{ background: lineColor(concept.phase) }} />
            {concept.title}
          </p>
        )}
        <p className="mt-4 text-2xl leading-snug font-bold text-balance">
          <RichText text={card.front} />
        </p>
        <AnimatePresence>
          {flipped && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 border-t border-rule pt-5">
              <p className="font-serif text-lg leading-relaxed">
                <RichText text={card.back} link />
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-5">
        {!flipped ? (
          <button type="button" onClick={() => setFlipped(true)} className="w-full rounded-xl bg-ink py-3.5 font-bold text-bg" autoFocus>
            Show answer <kbd className="ml-2 font-mono text-xs opacity-70">Space</kbd>
          </button>
        ) : (
          <>
            <p className="mb-2 text-center text-sm text-ink-2">How well did you remember it?</p>
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map((g) => (
                <button
                  key={g.grade}
                  type="button"
                  disabled={busy}
                  onClick={() => rate(g.grade)}
                  className="rounded-xl border border-rule bg-surface px-2 py-3 text-center hover:border-ink disabled:opacity-50"
                >
                  <span className="block font-bold">{g.label}</span>
                  <span className="block font-mono text-xs text-ink-3">
                    {formatInterval(preview[g.grade] - Date.now())} · {g.key}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

function Empty({ all, reviewed }: { all: ReviewCardRow[]; reviewed: number }) {
  const now = Date.now()
  const next = all.filter((c) => c.due > now).sort((a, b) => a.due - b.due)[0]
  return (
    <div className="rounded-2xl border border-rule bg-surface px-6 py-10 text-center">
      {all.length === 0 ? (
        <>
          <p className="text-xl font-bold">No cards yet</p>
          <p className="mx-auto mt-2 max-w-md text-ink-2">
            A concept's flashcards join your review when you pass its practice. Start with the next stop on your route.
          </p>
          <Link to="/" className="mt-5 inline-block rounded-lg bg-ink px-5 py-2.5 font-bold text-bg">
            Go to Today
          </Link>
        </>
      ) : (
        <>
          <p className="text-xl font-bold">{reviewed > 0 ? `Done. You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}.` : 'Nothing due right now'}</p>
          {next && <p className="mt-2 text-ink-2">Next card comes back in {formatInterval(next.due - now)}.</p>}
        </>
      )}
    </div>
  )
}
