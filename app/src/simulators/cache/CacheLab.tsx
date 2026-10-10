import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  KEY_COUNT,
  LATENCY_MS,
  access,
  createCache,
  keyStream,
  pickVictim,
  type CacheState,
  type Policy,
  type Workload,
} from './cacheModel'
import { Icon } from '../../components/Icon'
import { Segmented } from '../../components/Segmented'

interface Stats {
  requests: number
  hits: number
  latency: number
}
interface Recent {
  id: number
  key: string
  hit: boolean
  evicted: string | null
}

const WORKLOADS: { id: Workload; label: string; hint: string }[] = [
  { id: 'popular', label: 'Popular', hint: 'A few users get most requests' },
  { id: 'uniform', label: 'Uniform', hint: 'Every user equally likely' },
  { id: 'scan', label: 'Scan', hint: 'Users 1–8 in a loop, like a batch job' },
]
const TTLS: { label: string; value: number | null }[] = [
  { label: 'Off', value: null },
  { label: '5 s', value: 5 },
  { label: '20 s', value: 20 },
]
const SPEEDS = [2, 5, 10]

export function CacheLab() {
  const reduce = useReducedMotion()
  const [policy, setPolicy] = useState<Policy>('LRU')
  const [capacity, setCapacity] = useState(5)
  const [workload, setWorkload] = useState<Workload>('popular')
  const [ttl, setTtl] = useState<number | null>(null)
  const [rps, setRps] = useState(5)
  const [running, setRunning] = useState(false)
  const [cache, setCache] = useState<CacheState>(() => createCache(5, 'LRU'))
  const [stats, setStats] = useState<Stats>({ requests: 0, hits: 0, latency: 0 })
  const [recent, setRecent] = useState<Recent[]>([])
  const [simTime, setSimTime] = useState(0)
  const streamRef = useRef(keyStream('popular'))
  const idRef = useRef(0)
  const stateRef = useRef({ cache, simTime })
  stateRef.current = { cache, simTime }

  const restart = useCallback((p: Policy, cap: number, w: Workload, t: number | null) => {
    setCache(createCache(cap, p, t))
    setStats({ requests: 0, hits: 0, latency: 0 })
    setRecent([])
    setSimTime(0)
    streamRef.current = keyStream(w)
  }, [])

  useEffect(() => {
    restart(policy, capacity, workload, ttl)
  }, [policy, capacity, workload, ttl, restart])

  const request = useCallback(
    (key?: string) => {
      const k = key ?? streamRef.current()
      const now = stateRef.current.simTime + 1 / rps
      const r = access(stateRef.current.cache, k, now)
      stateRef.current = { cache: r.state, simTime: now }
      setCache(r.state)
      setSimTime(now)
      setStats((s) => ({
        requests: s.requests + 1,
        hits: s.hits + (r.hit ? 1 : 0),
        latency: s.latency + (r.hit ? LATENCY_MS.cache : LATENCY_MS.cache + LATENCY_MS.db),
      }))
      setRecent((list) => [...list.slice(-15), { id: ++idRef.current, key: k, hit: r.hit, evicted: r.evicted }])
    },
    [rps],
  )

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => request(), 1000 / rps)
    return () => clearInterval(t)
  }, [running, rps, request])

  const ratio = stats.requests ? stats.hits / stats.requests : 0
  const victim = cache.slots.length >= cache.capacity ? pickVictim(cache.slots, cache.policy) : -1
  const last = recent.at(-1)
  const packets = reduce ? [] : recent.slice(-6)

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="Cache Lab simulator">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-lg font-extrabold">Cache Lab</p>
        <p className="font-mono text-xs text-ink-3">hit = {LATENCY_MS.cache} ms · miss = {LATENCY_MS.cache + LATENCY_MS.db} ms</p>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <Segmented label="Eviction" value={policy} options={['LRU', 'LFU', 'FIFO'] as Policy[]} onChange={setPolicy} />
        <Segmented
          label="Workload"
          value={workload}
          options={WORKLOADS.map((w) => w.id)}
          display={(v) => WORKLOADS.find((w) => w.id === v)!.label}
          onChange={setWorkload}
        />
        <Segmented label="TTL" value={ttl} options={TTLS.map((t) => t.value)} display={(v) => TTLS.find((t) => t.value === v)!.label} onChange={setTtl} />
        <label className="block">
          <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">Capacity: {capacity} keys</span>
          <input
            type="range"
            min={2}
            max={10}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-2 block w-full accent-[var(--ink)]"
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-ink-3">
        {WORKLOADS.find((w) => w.id === workload)!.hint}. Changing a setting starts a fresh run.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 text-sm font-bold text-bg"
        >
          <Icon name={running ? 'pause' : 'play'} size={14} /> {running ? 'Pause traffic' : 'Start traffic'}
        </button>
        <button
          type="button"
          onClick={() => request()}
          disabled={running}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rule px-3 py-1.5 text-sm font-semibold hover:bg-surface-2 disabled:opacity-40"
        >
          <Icon name="step" size={14} /> One request
        </button>
        <span className="ml-1 text-xs font-bold tracking-wide text-ink-2 uppercase">Speed</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRps(s)}
            aria-pressed={rps === s}
            className={`rounded-md px-2 py-1 font-mono text-xs ${rps === s ? 'bg-surface-2 font-bold text-ink' : 'text-ink-3 hover:text-ink'}`}
          >
            {s}/s
          </button>
        ))}
        <button
          type="button"
          onClick={() => restart(policy, capacity, workload, ttl)}
          className="ml-auto inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink"
        >
          <Icon name="reset" size={14} /> Reset
        </button>
      </div>

      {/* Request path */}
      <div className="-mx-1 mt-4 overflow-x-auto px-1">
      <svg viewBox="0 0 640 96" className="h-auto w-full min-w-[520px]" aria-hidden="true">
        <line x1="80" y1="48" x2="560" y2="48" stroke="var(--rule)" strokeWidth="2" />
        {[
          [80, 'App server', ''],
          [320, 'Cache', 'in memory'],
          [560, 'Database', 'on disk'],
        ].map(([x, label, sub]) => (
          <g key={label as string}>
            <rect x={(x as number) - 62} y="24" width="124" height="48" rx="10" fill="var(--surface)" stroke="var(--ink-3)" strokeWidth="1.4" />
            <text x={x as number} y={sub ? 45 : 52} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink)">
              {label}
            </text>
            {sub && (
              <text x={x as number} y="61" textAnchor="middle" fontSize="10.5" fill="var(--ink-2)" className="font-mono">
                {sub}
              </text>
            )}
          </g>
        ))}
        {packets.map((p) => (
          <circle
            key={p.id}
            r="6"
            fill={p.hit ? 'var(--hit)' : 'var(--miss)'}
            stroke="var(--surface)"
            strokeWidth="2"
            className="packet"
            style={
              {
                offsetPath: p.hit ? "path('M 142 48 L 258 48 L 142 48')" : "path('M 142 48 L 498 48 L 142 48')",
                '--dur': p.hit ? '520ms' : '950ms',
              } as CSSProperties
            }
          />
        ))}
      </svg>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">Cache slots ({cache.slots.length}/{cache.capacity})</p>
          <ul className="mt-2 grid grid-cols-5 gap-2">
            {Array.from({ length: cache.capacity }, (_, i) => {
              const e = cache.slots[i]
              const fresh = e && last && last.key === e.key && !last.hit
              return (
                <li
                  key={i}
                  className={`min-h-16 rounded-lg border px-2 py-1.5 ${
                    !e ? 'border-dashed border-rule' : i === victim ? 'border-dashed border-bad' : fresh ? 'border-miss' : 'border-rule'
                  }`}
                >
                  {e ? (
                    <>
                      <p className="font-mono text-sm font-semibold">{e.key.replace('user:', 'u')}</p>
                      <p className="font-mono text-[10px] leading-tight text-ink-3">
                        {policy === 'LRU' && `used ${cache.tick - e.lastUsedTick} ago`}
                        {policy === 'LFU' && `used ×${e.uses}`}
                        {policy === 'FIFO' && `in at #${e.insertedTick}`}
                      </p>
                      {e.expiresAt !== null && ttl && (
                        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-2">
                          <span
                            className="block h-full bg-ink-3"
                            style={{ width: `${Math.max(0, Math.min(1, (e.expiresAt - simTime) / ttl)) * 100}%` }}
                          />
                        </span>
                      )}
                      {i === victim && <p className="font-mono text-[10px] text-bad">next to go</p>}
                    </>
                  ) : (
                    <p className="font-mono text-[11px] text-ink-3">empty</p>
                  )}
                </li>
              )
            })}
          </ul>

          <p className="mt-4 font-mono text-[11px] tracking-wider text-ink-3 uppercase">Last requests</p>
          <ol className="mt-2 flex min-h-9 flex-wrap gap-1" aria-label="Last requests, oldest first">
            {recent.map((r) => (
              <li
                key={r.id}
                className="rounded-md px-1.5 py-0.5 font-mono text-[11px] leading-tight text-white"
                style={{ background: r.hit ? 'var(--hit)' : 'var(--miss)' }}
                title={r.evicted ? `miss, evicted ${r.evicted}` : r.hit ? 'hit' : 'miss'}
              >
                {r.key.replace('user:', 'u')} {r.hit ? 'hit' : 'miss'}
              </li>
            ))}
          </ol>
          {last?.evicted && (
            <p className="mt-1 text-xs text-ink-2">
              Last miss evicted <span className="font-mono">{last.evicted.replace('user:', 'u')}</span> ({policy}).
            </p>
          )}

          <p className="mt-4 font-mono text-[11px] tracking-wider text-ink-3 uppercase">Or request a user yourself</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.from({ length: KEY_COUNT }, (_, i) => (
              <button
                key={i}
                type="button"
                disabled={running}
                onClick={() => request(`user:${i + 1}`)}
                className="w-9 rounded-md border border-rule py-1 font-mono text-xs hover:bg-surface-2 disabled:opacity-40"
                aria-label={`Request user ${i + 1}`}
              >
                u{i + 1}
              </button>
            ))}
          </div>
        </div>

        <dl className="grid grid-cols-2 content-start gap-x-4 gap-y-4">
          <div className="col-span-2">
            <dt className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">Hit ratio</dt>
            <dd className="text-5xl font-extrabold tabular-nums" aria-live="off">
              {stats.requests ? Math.round(ratio * 100) : '–'}
              {stats.requests > 0 && <span className="text-2xl text-ink-3">%</span>}
            </dd>
          </div>
          <Stat label="Requests" value={stats.requests} />
          <Stat label="Hits / misses" value={`${stats.hits} / ${stats.requests - stats.hits}`} />
          <Stat label="Avg latency" value={stats.requests ? `${(stats.latency / stats.requests).toFixed(1)} ms` : '–'} />
          <Stat label="Reached the DB" value={stats.requests ? `${Math.round((1 - ratio) * 100)}%` : '–'} />
          <div className="col-span-2 flex gap-4 text-xs text-ink-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--hit)' }} /> hit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--miss)' }} /> miss
            </span>
          </div>
        </dl>
      </div>
    </figure>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">{label}</dt>
      <dd className="text-xl font-bold tabular-nums">{value}</dd>
    </div>
  )
}
