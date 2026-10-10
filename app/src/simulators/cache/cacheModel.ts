// A real (small) cache: fixed slots, LRU/LFU/FIFO eviction and optional TTL.
// Pure functions so the Cache Lab and the tests share one implementation.

export type Policy = 'LRU' | 'LFU' | 'FIFO'
export type Workload = 'popular' | 'uniform' | 'scan'

export interface Entry {
  key: string
  insertedTick: number
  lastUsedTick: number
  uses: number
  /** Simulated time (seconds) when the entry expires, or null for no TTL. */
  expiresAt: number | null
}

export interface CacheState {
  capacity: number
  policy: Policy
  /** TTL in simulated seconds, or null. */
  ttl: number | null
  /** Slot order is stable: a new key takes the evicted key's slot. */
  slots: Entry[]
  tick: number
}

export interface AccessResult {
  state: CacheState
  hit: boolean
  evicted: string | null
  expired: boolean
}

export const LATENCY_MS = { cache: 1, db: 20 } as const

export function createCache(capacity: number, policy: Policy, ttl: number | null = null): CacheState {
  return { capacity, policy, ttl, slots: [], tick: 0 }
}

/** The entry this policy would evict next. */
export function pickVictim(slots: Entry[], policy: Policy): number {
  let best = 0
  for (let i = 1; i < slots.length; i++) {
    const a = slots[i]
    const b = slots[best]
    const better =
      policy === 'LRU'
        ? a.lastUsedTick < b.lastUsedTick
        : policy === 'FIFO'
          ? a.insertedTick < b.insertedTick
          : a.uses < b.uses || (a.uses === b.uses && a.lastUsedTick < b.lastUsedTick)
    if (better) best = i
  }
  return best
}

/** Reads `key` through the cache at simulated time `now` (cache-aside). */
export function access(state: CacheState, key: string, now: number): AccessResult {
  const tick = state.tick + 1
  const slots = state.slots.slice()
  let expired = false
  const at = slots.findIndex((e) => e.key === key)

  if (at >= 0) {
    const e = slots[at]
    if (e.expiresAt === null || e.expiresAt > now) {
      slots[at] = { ...e, lastUsedTick: tick, uses: e.uses + 1 }
      return { state: { ...state, slots, tick }, hit: true, evicted: null, expired: false }
    }
    // Expired: drop it and treat as a miss.
    slots.splice(at, 1)
    expired = true
  }

  const fresh: Entry = {
    key,
    insertedTick: tick,
    lastUsedTick: tick,
    uses: 1,
    expiresAt: state.ttl === null ? null : now + state.ttl,
  }
  let evicted: string | null = null
  if (slots.length < state.capacity) {
    if (expired && at >= 0) slots.splice(at, 0, fresh)
    else slots.push(fresh)
  } else {
    const v = pickVictim(slots, state.policy)
    evicted = slots[v].key
    slots[v] = fresh
  }
  return { state: { ...state, slots, tick }, hit: false, evicted, expired }
}

export { mulberry32 } from '../random'

export const KEY_COUNT = 20
export const SCAN_LENGTH = 8

/**
 * Key generator for a workload:
 * - popular: Zipf-like, a few keys get most requests (real traffic looks like this)
 * - uniform: every key equally likely
 * - scan: keys 1..8 in a loop, like a batch job reading every row
 */
export function keyStream(workload: Workload, rand: () => number = Math.random): () => string {
  if (workload === 'scan') {
    let i = 0
    return () => `user:${(i++ % SCAN_LENGTH) + 1}`
  }
  if (workload === 'uniform') return () => `user:${Math.floor(rand() * KEY_COUNT) + 1}`
  const weights = Array.from({ length: KEY_COUNT }, (_, k) => 1 / (k + 1) ** 1.3)
  const total = weights.reduce((a, b) => a + b, 0)
  const cumulative: number[] = []
  weights.reduce((acc, w, k) => (cumulative[k] = acc + w / total), 0)
  return () => {
    const r = rand()
    const k = cumulative.findIndex((c) => r <= c)
    return `user:${(k < 0 ? KEY_COUNT - 1 : k) + 1}`
  }
}

/** Average latency for a hit ratio, cache-aside (a miss pays both trips). */
export function averageLatency(hitRatio: number, cacheMs: number = LATENCY_MS.cache, dbMs: number = LATENCY_MS.db): number {
  return hitRatio * cacheMs + (1 - hitRatio) * (cacheMs + dbMs)
}
