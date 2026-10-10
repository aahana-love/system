import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { Rating, State } from 'ts-fsrs'
import { db } from '../src/engine/db'
import { exportBackup, importBackup, parseBackup, resetAll, BackupError } from '../src/engine/backup'
import {
  conceptState,
  finishPractice,
  nextConcept,
  openMistakes,
  patchProgress,
  resumeStep,
  stepUnlocked,
  markPrimerSeen,
} from '../src/engine/progress'
import { formatInterval, isCardMastered, newCardRow, previewRow, rateCard, rateRow } from '../src/engine/review'
import { computeStreak } from '../src/engine/stats'
import { concepts, conceptById } from '../src/content/roadmap'

beforeEach(async () => {
  await resetAll()
})

describe('progress rules', () => {
  const caching = conceptById.get('caching')!

  it('unlocks steps in order', () => {
    expect(stepUnlocked('learn', undefined)).toBe(true)
    expect(stepUnlocked('theory', undefined)).toBe(false)
    expect(stepUnlocked('theory', { conceptId: 'caching', checksPassedAt: 1, updatedAt: 1 })).toBe(true)
    expect(stepUnlocked('practice', { conceptId: 'caching', checksPassedAt: 1, updatedAt: 1 })).toBe(false)
    expect(stepUnlocked('review', { conceptId: 'caching', practicedAt: 1, updatedAt: 1 })).toBe(true)
  })

  it('starts at the gate when prerequisites are not covered', () => {
    expect(resumeStep(caching, undefined, new Map())).toBe('gate')
  })

  it('skips the gate once every prerequisite primer is read', async () => {
    for (const p of caching.prerequisites) await markPrimerSeen(p)
    const rows = new Map((await db.progress.toArray()).map((r) => [r.conceptId, r]))
    expect(resumeStep(caching, undefined, rows)).toBe('learn')
  })

  it('suggests the first written, unpracticed lesson', () => {
    expect(nextConcept(concepts, new Map())?.id).toBe('dns')
    const rows = new Map([['dns', { conceptId: 'dns', practicedAt: 1, updatedAt: 1 }]])
    expect(nextConcept(concepts, rows)?.id).toBe('caching')
  })

  it('reports states', () => {
    expect(conceptState(conceptById.get('cdn')!)).toBe('unavailable')
    expect(conceptState(caching)).toBe('not-started')
    expect(conceptState(caching, { conceptId: 'caching', checksPassedAt: 1, updatedAt: 1 })).toBe('learning')
    expect(conceptState(caching, { conceptId: 'caching', practicedAt: 1, updatedAt: 1 })).toBe('practiced')
  })

  it('passing practice adds cards once, failing does not', async () => {
    expect(await finishPractice('caching', 0.5, ['c1', 'c2'])).toBe(false)
    expect(await db.reviewCards.count()).toBe(0)
    expect(await finishPractice('caching', 0.85, ['c1', 'c2'])).toBe(true)
    expect(await db.reviewCards.count()).toBe(2)
    expect(await finishPractice('caching', 0.9, ['c1', 'c2'])).toBe(false)
    expect(await db.reviewCards.count()).toBe(2)
    expect((await db.progress.get('caching'))?.practiceBest).toBe(0.9)
  })

  it('open mistakes are questions whose latest attempt was wrong', () => {
    expect(
      openMistakes([
        { questionId: 'a', correct: false, at: 1 },
        { questionId: 'a', correct: true, at: 2 },
        { questionId: 'b', correct: true, at: 1 },
        { questionId: 'b', correct: false, at: 3 },
      ]),
    ).toEqual(['b'])
  })
})

describe('spaced repetition', () => {
  const now = Date.UTC(2026, 9, 10, 9)

  it('new cards are due immediately', () => {
    expect(newCardRow('k', 'c', now).due).toBeLessThanOrEqual(now)
  })

  it('rating Good schedules the card later than Again', () => {
    const row = newCardRow('k', 'c', now)
    const p = previewRow(row, now)
    expect(p[Rating.Good]).toBeGreaterThan(p[Rating.Again])
    expect(p[Rating.Easy]).toBeGreaterThanOrEqual(p[Rating.Good])
  })

  it('repeated Good reviews eventually master a card', () => {
    let row = newCardRow('k', 'c', now)
    let t = now
    for (let i = 0; i < 8; i++) {
      row = rateRow(row, Rating.Good, t)
      t = row.due
    }
    expect(row.state).toBe(State.Review)
    expect(isCardMastered(row)).toBe(true)
  })

  it('rateCard stores the new schedule and a log', async () => {
    await db.reviewCards.add(newCardRow('k', 'c', now))
    await rateCard('k', Rating.Good, now)
    expect((await db.reviewCards.get('k'))!.due).toBeGreaterThan(now)
    expect(await db.reviewLogs.count()).toBe(1)
  })

  it('formats intervals', () => {
    expect(formatInterval(30_000)).toBe('<1m')
    expect(formatInterval(10 * 60_000)).toBe('10m')
    expect(formatInterval(3 * 3600_000)).toBe('3h')
    expect(formatInterval(4 * 86_400_000)).toBe('4d')
  })
})

describe('backup', () => {
  it('round-trips everything through JSON', async () => {
    await patchProgress('dns', { checksPassedAt: 5 })
    await db.reviewCards.add(newCardRow('k', 'dns', 10))
    await db.reports.add({ target: 'dns-p1', note: 'typo', at: 3 })
    const file = JSON.parse(JSON.stringify(await exportBackup()))
    await resetAll()
    expect(await db.progress.count()).toBe(0)
    await importBackup(file)
    expect((await db.progress.get('dns'))?.checksPassedAt).toBe(5)
    expect(await db.reviewCards.count()).toBe(1)
    expect(await db.reports.count()).toBe(1)
  })

  it('rejects files from elsewhere with a clear message', () => {
    expect(() => parseBackup({ hello: 1 })).toThrow(BackupError)
    expect(() => parseBackup({ app: 'system-design-study-plan', version: 99, tables: {} })).toThrow(/newer version/)
  })
})

describe('streak', () => {
  const day = 86_400_000
  const now = new Date(2026, 9, 10, 20).getTime()

  it('counts consecutive days ending today', () => {
    expect(computeStreak([now, now - day, now - 2 * day], now)).toEqual({ days: 3, activeToday: true })
  })

  it('keeps yesterday\'s streak alive before you study today', () => {
    expect(computeStreak([now - day, now - 2 * day], now)).toEqual({ days: 2, activeToday: false })
  })

  it('breaks on a missed day', () => {
    expect(computeStreak([now, now - 2 * day], now).days).toBe(1)
  })
})
