import type { Concept } from '../content/types'
import { db, type AttemptMode, type ProgressRow, type ReviewCardRow } from './db'
import { addCards, isCardMastered } from './review'

export const PASS_MARK = 0.8

export type StepId = 'gate' | 'learn' | 'theory' | 'practice' | 'review'
export const STEPS: { id: StepId; label: string }[] = [
  { id: 'gate', label: 'Prerequisites' },
  { id: 'learn', label: 'Learn' },
  { id: 'theory', label: 'Theory' },
  { id: 'practice', label: 'Practice' },
  { id: 'review', label: 'Review' },
]

export type ConceptState = 'unavailable' | 'not-started' | 'learning' | 'practiced' | 'mastered'

export function conceptState(concept: Concept, row?: ProgressRow, cards: ReviewCardRow[] = []): ConceptState {
  if (!concept.ready) return 'unavailable'
  if (row?.practicedAt) {
    return cards.length > 0 && cards.every(isCardMastered) ? 'mastered' : 'practiced'
  }
  if (row && (row.prereqsAcknowledgedAt || row.checksPassedAt || row.theoryReadAt || row.practiceBest !== undefined)) {
    return 'learning'
  }
  return 'not-started'
}

/** A prerequisite counts as covered if you practiced it or read its primer. */
export function prereqCovered(row?: ProgressRow): boolean {
  return Boolean(row?.practicedAt || row?.primerSeenAt)
}

export function stepUnlocked(step: StepId, row?: ProgressRow): boolean {
  switch (step) {
    case 'gate':
    case 'learn':
      return true
    case 'theory':
      return Boolean(row?.checksPassedAt)
    case 'practice':
      return Boolean(row?.theoryReadAt)
    case 'review':
      return Boolean(row?.practicedAt)
  }
}

export function lockReason(step: StepId): string {
  switch (step) {
    case 'theory':
      return 'Pass the 3 checks at the end of Learn to unlock Theory.'
    case 'practice':
      return 'Finish reading Theory to unlock Practice.'
    case 'review':
      return `Score ${PASS_MARK * 100}% in Practice to unlock Review.`
    default:
      return ''
  }
}

/** The step to open when you arrive at a concept. */
export function resumeStep(concept: Concept, row: ProgressRow | undefined, rows: Map<string, ProgressRow>): StepId {
  const missing = concept.prerequisites.some((p) => !prereqCovered(rows.get(p)))
  if (!row?.prereqsAcknowledgedAt && missing) return 'gate'
  if (!row?.checksPassedAt) return 'learn'
  if (!row.theoryReadAt) return 'theory'
  if (!row.practicedAt) return 'practice'
  return 'review'
}

/** First lesson in roadmap order that's written and not yet practiced. */
export function nextConcept(all: Concept[], rows: Map<string, ProgressRow>): Concept | undefined {
  return all.find((c) => c.ready && !rows.get(c.id)?.practicedAt)
}

// ── Writes ─────────────────────────────────────────────

export async function patchProgress(conceptId: string, patch: Partial<ProgressRow>, now = Date.now()) {
  await db.transaction('rw', db.progress, async () => {
    const row = (await db.progress.get(conceptId)) ?? { conceptId, updatedAt: now }
    await db.progress.put({ ...row, ...patch, conceptId, updatedAt: now })
  })
}

export async function markPrimerSeen(conceptId: string, now = Date.now()) {
  const row = await db.progress.get(conceptId)
  if (!row?.primerSeenAt) await patchProgress(conceptId, { primerSeenAt: now }, now)
}

export async function acknowledgePrereqs(conceptId: string, skipped: string[], now = Date.now()) {
  await patchProgress(conceptId, { prereqsAcknowledgedAt: now, skippedPrereqs: skipped }, now)
}

export async function recordAttempt(
  questionId: string,
  conceptId: string,
  correct: boolean,
  mode: AttemptMode,
  now = Date.now(),
) {
  await db.attempts.add({ questionId, conceptId, correct, mode, at: now })
}

/**
 * Saves a practice result. The first time the score reaches the pass mark,
 * the concept is marked practiced and its flashcards join the review queue.
 * Returns true if this run newly passed.
 */
export async function finishPractice(conceptId: string, score: number, cardIds: string[], now = Date.now()) {
  const row = await db.progress.get(conceptId)
  const best = Math.max(row?.practiceBest ?? 0, score)
  const newlyPassed = score >= PASS_MARK && !row?.practicedAt
  await patchProgress(conceptId, { practiceBest: best, ...(newlyPassed ? { practicedAt: now } : {}) }, now)
  if (newlyPassed) await addCards(conceptId, cardIds, now)
  return newlyPassed
}

/** Question ids whose most recent attempt was wrong. */
export function openMistakes(attempts: { questionId: string; correct: boolean; at: number }[]): string[] {
  const latest = new Map<string, { correct: boolean; at: number }>()
  for (const a of attempts) {
    const prev = latest.get(a.questionId)
    if (!prev || a.at >= prev.at) latest.set(a.questionId, a)
  }
  return [...latest].filter(([, v]) => !v.correct).map(([id]) => id)
}
