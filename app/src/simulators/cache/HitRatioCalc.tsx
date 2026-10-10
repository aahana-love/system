import { useState } from 'react'
import { averageLatency, LATENCY_MS } from './cacheModel'

/** Sliders for the hit-ratio formula, with the result as two labeled bars. */
export function HitRatioCalc() {
  const [hit, setHit] = useState(90)
  const [db, setDb] = useState<number>(LATENCY_MS.db)
  const avg = averageLatency(hit / 100, LATENCY_MS.cache, db)
  const max = db + LATENCY_MS.cache
  const perThousand = Math.round((1 - hit / 100) * 1000)

  return (
    <figure className="wide my-8 rounded-2xl border border-rule bg-surface p-4 sm:p-6" aria-label="Hit ratio calculator">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">Hit ratio: {hit}%</span>
          <input type="range" min={0} max={100} value={hit} onChange={(e) => setHit(Number(e.target.value))} className="mt-2 block w-full accent-[var(--ink)]" />
        </label>
        <label className="block">
          <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">Database query: {db} ms</span>
          <input type="range" min={5} max={100} step={5} value={db} onChange={(e) => setDb(Number(e.target.value))} className="mt-2 block w-full accent-[var(--ink)]" />
        </label>
      </div>
      <p className="mt-4 font-mono text-sm text-ink-2">
        {(hit / 100).toFixed(2)} × {LATENCY_MS.cache} ms + {(1 - hit / 100).toFixed(2)} × ({LATENCY_MS.cache} + {db}) ms ={' '}
        <strong className="text-ink">{avg.toFixed(1)} ms</strong>
      </p>
      <div className="mt-4 space-y-2.5">
        {[
          ['Every read goes to the database', db],
          [`With the cache at ${hit}% hits`, avg],
        ].map(([label, ms]) => (
          <div key={label as string}>
            <div className="flex justify-between text-sm">
              <span>{label}</span>
              <span className="font-mono font-semibold tabular-nums">{(ms as number).toFixed(1)} ms</span>
            </div>
            <div className="mt-1 h-2.5 rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-ink-2" style={{ width: `${((ms as number) / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-2">
        Out of every 1,000 reads, <strong className="text-ink tabular-nums">{perThousand}</strong> reach the database.
      </p>
    </figure>
  )
}
