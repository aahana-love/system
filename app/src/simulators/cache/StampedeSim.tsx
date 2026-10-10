import { useMemo, useState } from 'react'
import { simulateStampede, type Strategy } from './stampedeModel'

const STRATEGIES: { id: Strategy; label: string; detail: string }[] = [
  { id: 'none', label: 'No protection', detail: 'Every request that misses queries the database itself.' },
  { id: 'coalesce', label: 'Request coalescing', detail: 'One request rebuilds the key; the others wait for its result.' },
  { id: 'swr', label: 'Stale-while-revalidate', detail: 'Everyone gets the old value right away while one request refreshes it.' },
]
const BUCKET = 50

/** A hot key expires at 0 ms. Compare what each strategy does to the database. */
export function StampedeSim() {
  const [rps, setRps] = useState(400)
  const [rebuildMs, setRebuildMs] = useState(200)
  const [strategy, setStrategy] = useState<Strategy>('none')
  const [hover, setHover] = useState<number | null>(null)

  const results = useMemo(
    () => Object.fromEntries(STRATEGIES.map((s) => [s.id, simulateStampede({ rps, rebuildMs, strategy: s.id, bucketMs: BUCKET })])) as Record<
      Strategy,
      ReturnType<typeof simulateStampede>
    >,
    [rps, rebuildMs],
  )
  const r = results[strategy]
  const scale = Math.max(1, results.none.peakInFlight)
  const W = 600
  const H = 160
  const barW = W / r.inFlight.length

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="Cache stampede simulator">
      <p className="text-lg font-extrabold">Stampede: a hot key expires at 0 ms</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">Requests per second for this key: {rps}</span>
          <input type="range" min={50} max={2000} step={50} value={rps} onChange={(e) => setRps(Number(e.target.value))} className="mt-2 block w-full accent-[var(--ink)]" />
        </label>
        <label className="block">
          <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">Time to rebuild the value: {rebuildMs} ms</span>
          <input type="range" min={50} max={500} step={25} value={rebuildMs} onChange={(e) => setRebuildMs(Number(e.target.value))} className="mt-2 block w-full accent-[var(--ink)]" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Protection">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={strategy === s.id}
            onClick={() => setStrategy(s.id)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${strategy === s.id ? 'border-ink bg-ink text-bg' : 'border-rule text-ink-2 hover:text-ink'}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-ink-2">{STRATEGIES.find((s) => s.id === strategy)!.detail}</p>

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-bold">Database queries in flight for this key</p>
          <p className="font-mono text-xs text-ink-2" aria-live="polite">
            {hover !== null
              ? `${hover * BUCKET}–${(hover + 1) * BUCKET} ms: ${r.inFlight[hover]} in flight`
              : `peak ${r.peakInFlight}`}
          </p>
        </div>
        <svg viewBox={`0 0 ${W} ${H + 22}`} className="mt-2 h-auto w-full" role="img" aria-label={`Peak of ${r.peakInFlight} database queries in flight`}>
          <line x1="0" y1={H} x2={W} y2={H} stroke="var(--rule)" />
          <line x1="0" y1="0" x2={W} y2="0" stroke="var(--rule)" strokeDasharray="3 4" />
          <text x="4" y="12" fontSize="10.5" fill="var(--ink-3)" className="font-mono">
            {scale}
          </text>
          {r.inFlight.map((v, i) => {
            const h = (v / scale) * (H - 4)
            return (
              <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect x={i * barW} y="0" width={barW} height={H} fill="transparent" />
                {v > 0 && (
                  <path
                    d={roundedTop(i * barW + 1, H - h, barW - 2, h)}
                    fill="var(--miss)"
                    opacity={hover === null || hover === i ? 1 : 0.45}
                  />
                )}
              </g>
            )
          })}
          {[0, 250, 500, 750, 1000].map((t) => (
            <text key={t} x={(t / 1000) * W} y={H + 16} fontSize="10.5" fill="var(--ink-3)" textAnchor={t === 0 ? 'start' : t === 1000 ? 'end' : 'middle'} className="font-mono">
              {t} ms
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">All three strategies compared</caption>
          <thead>
            <tr className="text-left font-mono text-[11px] tracking-wider text-ink-3 uppercase">
              <th className="py-1.5 pr-3 font-normal">Strategy</th>
              <th className="py-1.5 pr-3 font-normal">DB queries</th>
              <th className="py-1.5 pr-3 font-normal">Users who waited</th>
              <th className="py-1.5 pr-3 font-normal">Longest wait</th>
              <th className="py-1.5 font-normal">Stale answers</th>
            </tr>
          </thead>
          <tbody>
            {STRATEGIES.map((s) => {
              const x = results[s.id]
              return (
                <tr key={s.id} className={`border-t border-rule ${s.id === strategy ? 'font-bold' : ''}`}>
                  <td className="py-2 pr-3">{s.label}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums">{x.dbQueries}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums">{x.waited}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums">{x.maxWaitMs} ms</td>
                  <td className="py-2 font-mono tabular-nums">{x.staleServed}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-3 text-xs text-ink-3">
        Simplified: requests arrive evenly and the database doesn't slow down. In real systems it does, which makes the unprotected case worse.
      </figcaption>
    </figure>
  )
}

/** Bar with 4px rounded top corners, square at the baseline. */
function roundedTop(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h)
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`
}
