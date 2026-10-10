import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type ProgressRow, type ReviewCardRow } from './db'

/** Current time, refreshed every `everyMs` so "due" counts stay accurate. */
export function useNow(everyMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), everyMs)
    return () => clearInterval(t)
  }, [everyMs])
  return now
}

export function useProgressMap(): Map<string, ProgressRow> | undefined {
  return useLiveQuery(async () => new Map((await db.progress.toArray()).map((r) => [r.conceptId, r])), [])
}

export function useReviewCards(): ReviewCardRow[] | undefined {
  return useLiveQuery(() => db.reviewCards.toArray(), [])
}

/**
 * Cards due right now. Reads the clock inside the query: cards added a moment
 * ago are due "now", which is later than the last `now` tick.
 */
export function useDueCount(now: number): number {
  return useLiveQuery(() => db.reviewCards.where('due').belowOrEqual(Math.max(now, Date.now())).count(), [now]) ?? 0
}

export function useAttempts() {
  return useLiveQuery(() => db.attempts.toArray(), [])
}

export function useMeta<T>(key: string): T | undefined {
  return useLiveQuery(async () => (await db.meta.get(key))?.value as T | undefined, [key])
}
