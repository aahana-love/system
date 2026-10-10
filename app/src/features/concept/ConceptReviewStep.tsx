import { useState } from 'react'
import { Link } from 'react-router'
import type { Concept } from '../../content/types'
import { cardById } from '../../content/index'
import type { ReviewCardRow } from '../../engine/db'
import { useNow } from '../../engine/hooks'
import { MASTERY_STABILITY_DAYS, formatInterval, isCardMastered } from '../../engine/review'
import { RichText } from '../../components/RichText'
import { Icon } from '../../components/Icon'

export function ConceptReviewStep({ concept, cards }: { concept: Concept; cards: ReviewCardRow[] }) {
  const now = useNow()
  const [browse, setBrowse] = useState(false)
  const due = cards.filter((c) => c.due <= now).length
  const mastered = cards.filter(isCardMastered).length

  return (
    <section>
      <h2 className="text-2xl font-extrabold">Review</h2>
      <p className="mt-2 max-w-2xl text-ink-2">
        These cards come back in your daily review. The concept counts as mastered once every card is expected to hold for{' '}
        {MASTERY_STABILITY_DAYS}+ days, which takes a few weeks of spaced reviews.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        <p>
          <span className="text-3xl font-extrabold tabular-nums">
            {mastered}/{cards.length}
          </span>{' '}
          <span className="text-ink-2">cards mastered</span>
        </p>
        {due > 0 ? (
          <Link to={`/review?concept=${concept.id}`} className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 font-bold text-bg">
            Review {due} due card{due === 1 ? '' : 's'} <Icon name="arrow" size={16} />
          </Link>
        ) : (
          <p className="text-ink-2">Nothing due for this concept right now.</p>
        )}
        <button type="button" onClick={() => setBrowse((b) => !b)} className="rounded-lg border border-rule px-4 py-2 text-sm font-semibold hover:bg-surface">
          {browse ? 'Hide answers' : 'Show all answers'}
        </button>
      </div>

      <ul className="mt-6 divide-y divide-rule rounded-xl border border-rule bg-surface">
        {cards.map((row) => {
          const card = cardById.get(row.cardId)
          if (!card) return null
          return (
            <li key={row.cardId} className="px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                  <RichText text={card.front} />
                </p>
                <p className="font-mono text-xs text-ink-3">
                  {isCardMastered(row)
                    ? `Mastered · holds ~${Math.round(row.stability)}d`
                    : row.due <= now
                      ? 'Due now'
                      : `Due in ${formatInterval(row.due - now)}`}
                </p>
              </div>
              {browse && (
                <p className="mt-2 font-serif text-ink-2">
                  <RichText text={card.back} />
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
