import { describe, expect, it } from 'vitest'
import { access, averageLatency, createCache, keyStream, mulberry32, type CacheState, type Policy } from '../src/simulators/cache/cacheModel'
import { simulateStampede } from '../src/simulators/cache/stampedeModel'
import { DOMAINS, RTT, clearDevice, emptyCaches, resolve } from '../src/simulators/dns/dnsModel'

function run(keys: string[], policy: Policy, capacity = 2, ttl: number | null = null) {
  let s: CacheState = createCache(capacity, policy, ttl)
  const out: { hit: boolean; evicted: string | null }[] = []
  keys.forEach((k, i) => {
    const r = access(s, k, i)
    s = r.state
    out.push({ hit: r.hit, evicted: r.evicted })
  })
  return { s, out }
}

describe('cache model', () => {
  it('LRU evicts the least recently used key', () => {
    const { out } = run(['a', 'b', 'a', 'c'], 'LRU')
    expect(out[3].evicted).toBe('b')
  })

  it('FIFO evicts the oldest inserted key even if it was just used', () => {
    const { out } = run(['a', 'b', 'a', 'c'], 'FIFO')
    expect(out[3].evicted).toBe('a')
  })

  it('LFU evicts the least used key', () => {
    const { out } = run(['a', 'a', 'b', 'c'], 'LFU')
    expect(out[3].evicted).toBe('b')
  })

  it('counts hits and keeps slot positions stable', () => {
    const { s, out } = run(['a', 'b', 'a', 'c'], 'LRU')
    expect(out.map((o) => o.hit)).toEqual([false, false, true, false])
    expect(s.slots.map((e) => e.key)).toEqual(['a', 'c'])
  })

  it('expires entries after the TTL', () => {
    let s = createCache(3, 'LRU', 5)
    s = access(s, 'a', 0).state
    expect(access(s, 'a', 4).hit).toBe(true)
    const late = access(s, 'a', 6)
    expect(late.hit).toBe(false)
    expect(late.expired).toBe(true)
  })

  it('a scan one key bigger than the cache never hits under LRU', () => {
    const keys = Array.from({ length: 80 }, (_, i) => `k${i % 8}`)
    expect(run(keys, 'LRU', 7).out.filter((o) => o.hit)).toHaveLength(0)
    expect(run(keys, 'LRU', 8).out.filter((o) => o.hit)).toHaveLength(72)
  })

  it('a popular workload hits far more often than a uniform one', () => {
    const ratio = (w: 'popular' | 'uniform') => {
      const next = keyStream(w, mulberry32(7))
      const keys = Array.from({ length: 4000 }, () => next())
      return run(keys, 'LRU', 5).out.filter((o) => o.hit).length / keys.length
    }
    expect(ratio('popular')).toBeGreaterThan(ratio('uniform') + 0.15)
  })

  it('average latency matches the lesson example', () => {
    expect(averageLatency(0.9, 1, 20)).toBeCloseTo(3)
  })
})

describe('stampede model', () => {
  it('without protection every early request queries the database', () => {
    const r = simulateStampede({ rps: 400, rebuildMs: 200, strategy: 'none' })
    expect(r.dbQueries).toBe(80)
    expect(r.peakInFlight).toBeGreaterThan(10)
  })

  it('coalescing and stale-while-revalidate send one query', () => {
    const c = simulateStampede({ rps: 400, rebuildMs: 200, strategy: 'coalesce' })
    const s = simulateStampede({ rps: 400, rebuildMs: 200, strategy: 'swr' })
    expect(c.dbQueries).toBe(1)
    expect(c.waited).toBe(80)
    expect(s.dbQueries).toBe(1)
    expect(s.waited).toBe(0)
    expect(s.staleServed).toBe(80)
  })
})

describe('dns model', () => {
  const d = DOMAINS[0]

  it('walks the whole tree on a cold lookup', () => {
    const r = resolve(emptyCaches(), d, 0)
    expect(r.totalMs).toBe(RTT.resolver + RTT.root + RTT.tld + RTT.auth)
    expect(r.answeredBy).toBe('auth')
  })

  it('answers from the browser cache right after', () => {
    const first = resolve(emptyCaches(), d, 0)
    const again = resolve(first.caches, d, 1000)
    expect(again.totalMs).toBe(0)
    expect(again.answeredBy).toBe('browser')
  })

  it('uses the resolver cache after the device cache is cleared', () => {
    const first = resolve(emptyCaches(), d, 0)
    const r = resolve(clearDevice(first.caches), d, 1000)
    expect(r.totalMs).toBe(RTT.resolver)
    expect(r.answeredBy).toBe('resolver')
  })

  it('skips root and TLD when only the A record expired', () => {
    const first = resolve(emptyCaches(), d, 0)
    const r = resolve(first.caches, d, (d.ttl + 1) * 1000)
    expect(r.totalMs).toBe(RTT.resolver + RTT.auth)
    expect(r.steps.some((s) => s.to === 'root')).toBe(false)
  })
})
