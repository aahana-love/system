// What happens in the first second after a hot key expires.
// Requests arrive evenly; the database takes `rebuildMs` to recompute the value.
// (Real databases also slow down under the extra load, which makes "none" worse.)

export type Strategy = 'none' | 'coalesce' | 'swr'

export interface StampedeResult {
  /** In-flight database queries for this key, sampled at the start of each bucket. */
  inFlight: number[]
  dbQueries: number
  peakInFlight: number
  waited: number
  maxWaitMs: number
  staleServed: number
}

export function simulateStampede(opts: {
  rps: number
  rebuildMs: number
  strategy: Strategy
  windowMs?: number
  bucketMs?: number
}): StampedeResult {
  const { rps, rebuildMs, strategy, windowMs = 1000, bucketMs = 50 } = opts
  const gap = 1000 / rps
  const arrivals: number[] = []
  for (let t = 0; t < windowMs; t += gap) arrivals.push(t)
  // Until the first rebuild finishes, the key is missing (or stale).
  const missing = arrivals.filter((t) => t < rebuildMs)

  let queries: [number, number][] = []
  let waited = 0
  let maxWaitMs = 0
  let staleServed = 0
  if (strategy === 'none') {
    queries = missing.map((t) => [t, t + rebuildMs])
    waited = missing.length
    maxWaitMs = missing.length ? rebuildMs : 0
  } else if (strategy === 'coalesce') {
    queries = missing.length ? [[0, rebuildMs]] : []
    waited = missing.length
    maxWaitMs = missing.length ? rebuildMs : 0
  } else {
    queries = missing.length ? [[0, rebuildMs]] : []
    staleServed = missing.length
  }

  const inFlight: number[] = []
  for (let b = 0; b < windowMs; b += bucketMs) {
    inFlight.push(queries.filter(([s, e]) => s <= b + bucketMs - 1 && e > b).length)
  }
  return { inFlight, dbQueries: queries.length, peakInFlight: Math.max(0, ...inFlight), waited, maxWaitMs, staleServed }
}
