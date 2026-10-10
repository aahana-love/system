import { fsrs, createEmptyCard, Rating, State, type Card as FsrsCard, type Grade } from 'ts-fsrs'
import { db, type ReviewCardRow } from './db'

// FSRS decides when each flashcard comes back: just before you'd forget it.
const scheduler = fsrs({ enable_fuzz: true, request_retention: 0.9 })

export const GRADES: { grade: Grade; label: string; key: string }[] = [
  { grade: Rating.Again, label: 'Again', key: '1' },
  { grade: Rating.Hard, label: 'Hard', key: '2' },
  { grade: Rating.Good, label: 'Good', key: '3' },
  { grade: Rating.Easy, label: 'Easy', key: '4' },
]

/** A card counts toward mastery once it's expected to hold for this long. */
export const MASTERY_STABILITY_DAYS = 21

export function toFsrs(row: ReviewCardRow): FsrsCard {
  return {
    due: new Date(row.due),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    learning_steps: row.learning_steps,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state as State,
    last_review: row.last_review === null ? undefined : new Date(row.last_review),
  }
}

function fromFsrs(card: FsrsCard, base: Pick<ReviewCardRow, 'cardId' | 'conceptId' | 'addedAt'>): ReviewCardRow {
  return {
    ...base,
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.getTime() : null,
  }
}

export function newCardRow(cardId: string, conceptId: string, now: number): ReviewCardRow {
  return fromFsrs(createEmptyCard(new Date(now)), { cardId, conceptId, addedAt: now })
}

export function rateRow(row: ReviewCardRow, grade: Grade, now: number): ReviewCardRow {
  const { card } = scheduler.next(toFsrs(row), new Date(now), grade)
  return fromFsrs(card, row)
}

/** When the card would come back for each rating. */
export function previewRow(row: ReviewCardRow, now: number): Record<Grade, number> {
  const preview = scheduler.repeat(toFsrs(row), new Date(now))
  return {
    [Rating.Again]: preview[Rating.Again].card.due.getTime(),
    [Rating.Hard]: preview[Rating.Hard].card.due.getTime(),
    [Rating.Good]: preview[Rating.Good].card.due.getTime(),
    [Rating.Easy]: preview[Rating.Easy].card.due.getTime(),
  } as Record<Grade, number>
}

export function isCardMastered(row: ReviewCardRow): boolean {
  return row.state === State.Review && row.stability >= MASTERY_STABILITY_DAYS
}

/** "<1m", "10m", "3h", "4d", "2.5mo", "1.2y" */
export function formatInterval(ms: number): string {
  const min = ms / 60000
  if (min < 1) return '<1m'
  if (min < 60) return `${Math.round(min)}m`
  const h = min / 60
  if (h < 24) return `${Math.round(h)}h`
  const d = h / 24
  if (d < 30) return `${Math.round(d)}d`
  const mo = d / 30
  if (mo < 12) return `${Math.round(mo * 10) / 10}mo`
  return `${Math.round((d / 365) * 10) / 10}y`
}

export async function addCards(conceptId: string, cardIds: string[], now: number) {
  await db.transaction('rw', db.reviewCards, async () => {
    for (const id of cardIds) {
      if (!(await db.reviewCards.get(id))) await db.reviewCards.add(newCardRow(id, conceptId, now))
    }
  })
}

export async function rateCard(cardId: string, grade: Grade, now: number) {
  await db.transaction('rw', db.reviewCards, db.reviewLogs, async () => {
    const row = await db.reviewCards.get(cardId)
    if (!row) return
    await db.reviewCards.put(rateRow(row, grade, now))
    await db.reviewLogs.add({ cardId, rating: grade, at: now })
  })
}
