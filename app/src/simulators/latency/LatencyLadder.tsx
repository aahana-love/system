import { useState } from 'react'
import { LADDER, formatCount, formatHuman, formatReal, howMany, rungById } from './latencyModel'
import { Segmented } from '../../components/Segmented'

type Scale = 'real' | 'human'
const MAX = Math.log10(LADDER[LADDER.length - 1].ns) + 1

/** Latency numbers on a log scale, then rescaled to human time (1 ns becomes 1 second). */
export function LatencyLadder() {
  const [scale, setScale] = useState<Scale>('real')
  const [smallId, setSmallId] = useState('ram')
  const [bigId, setBigId] = useState('wan')
  const small = rungById.get(smallId)!
  const big = rungById.get(bigId)!
  const n = howMany(small, big)

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="Latency ladder">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-lg font-extrabold">The latency ladder</p>
        <div className="w-full max-w-xs">
          <Segmented
            label="Show times as"
            value={scale}
            options={['real', 'human'] as Scale[]}
            display={(v) => (v === 'real' ? 'Real time' : '1 ns = 1 second')}
            onChange={setScale}
          />
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {LADDER.map((r) => {
          const width = ((Math.log10(r.ns) + 1) / MAX) * 100
          return (
            <li key={r.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold">{r.label}</span>
                <span className="font-mono font-bold tabular-nums">{scale === 'real' ? formatReal(r.ns) : formatHuman(r.ns)}</span>
              </div>
              <div className="mt-1 h-2.5 rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-ink-2" style={{ width: `${Math.max(width, 2)}%` }} />
              </div>
              <p className="mt-0.5 text-xs text-ink-3">{r.note}</p>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-xs text-ink-3">Bar length is logarithmic: each step to the right is 10× longer. On a straight scale, RAM would be invisible.</p>

      <div className="mt-6 rounded-xl border border-rule p-4">
        <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">How many fit?</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span>In one</span>
          <select aria-label="Bigger operation" value={bigId} onChange={(e) => setBigId(e.target.value)} className="rounded-lg border border-rule bg-surface px-2 py-1.5 font-semibold">
            {LADDER.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <span>you could do</span>
          <select aria-label="Smaller operation" value={smallId} onChange={(e) => setSmallId(e.target.value)} className="rounded-lg border border-rule bg-surface px-2 py-1.5 font-semibold">
            {LADDER.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-2xl font-extrabold tabular-nums" role="status">
          {n < 1 ? `Less than one: it's ${formatCount(1 / n)}× the other way round` : `${formatCount(n)} times`}
        </p>
      </div>
    </figure>
  )
}
