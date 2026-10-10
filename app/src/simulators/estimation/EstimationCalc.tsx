import { useMemo, useState } from 'react'
import { PRESETS, estimate, formatBig, formatGB, formatTB, type EstimateInput } from './estimationModel'
import { RangeField } from '../../components/RangeField'

const DAU = [10_000, 100_000, 1_000_000, 10_000_000, 20_000_000, 50_000_000, 100_000_000, 500_000_000, 1_000_000_000]
const PER_USER = [0.1, 0.5, 1, 5, 10, 20, 40, 50, 100, 200]
const OBJECT_KB = [0.2, 0.5, 1, 10, 100, 300, 1_000, 2_000, 5_000]
const YEARS = [1, 2, 3, 5, 10]
const PEAK = [1, 2, 3, 4, 5, 10]
const SERVER_QPS = [100, 500, 1_000, 5_000, 10_000]

const kb = (v: number) => (v >= 1000 ? `${v / 1000} MB` : `${v} KB`)

/** The estimation chain with every line of the math visible. */
export function EstimationCalc() {
  const [presetId, setPresetId] = useState(PRESETS[0].id)
  const [input, setInput] = useState<EstimateInput>(PRESETS[0].input)
  const e = useMemo(() => estimate(input), [input])
  const set = <K extends keyof EstimateInput>(k: K, v: EstimateInput[K]) => setInput((i) => ({ ...i, [k]: v }))
  const s = input.secondsPerDay === 100_000 ? '100,000' : '86,400'

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="Estimation calculator">
      <p className="text-lg font-extrabold">Estimation calculator</p>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Start from an example">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={presetId === p.id}
            onClick={() => {
              setPresetId(p.id)
              setInput(p.input)
            }}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${presetId === p.id ? 'border-ink bg-ink text-bg' : 'border-rule text-ink-2 hover:text-ink'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <RangeField label="Daily active users" values={DAU} value={input.dau} onChange={(v) => set('dau', v)} format={formatBig} />
        <RangeField label="Reads per user per day" values={PER_USER} value={input.readsPerUser} onChange={(v) => set('readsPerUser', v)} />
        <RangeField label="Writes per user per day" values={PER_USER} value={input.writesPerUser} onChange={(v) => set('writesPerUser', v)} />
        <RangeField label="Size of one stored object" values={OBJECT_KB} value={input.objectKB} onChange={(v) => set('objectKB', v)} format={kb} />
        <RangeField label="Size of one response" values={OBJECT_KB} value={input.responseKB} onChange={(v) => set('responseKB', v)} format={kb} />
        <RangeField label="Keep data for" values={YEARS} value={input.retentionYears} onChange={(v) => set('retentionYears', v)} format={(v) => `${v} year${v === 1 ? '' : 's'}`} />
        <RangeField label="Peak vs average" values={PEAK} value={input.peakFactor} onChange={(v) => set('peakFactor', v)} format={(v) => `${v}×`} />
        <RangeField label="One server handles" values={SERVER_QPS} value={input.serverQps} onChange={(v) => set('serverQps', v)} format={(v) => `${v.toLocaleString('en-US')} req/s`} />
        <label className="flex items-end gap-2 pb-1 text-sm font-semibold">
          <input
            type="checkbox"
            checked={input.secondsPerDay === 100_000}
            onChange={(ev) => set('secondsPerDay', ev.target.checked ? 100_000 : 86_400)}
            className="h-4 w-4 accent-[var(--ink)]"
          />
          Round a day to 100,000 seconds
        </label>
      </div>

      <ol className="mt-6 divide-y divide-rule rounded-xl border border-rule">
        <Line n={1} label="Requests per day" math={`${formatBig(input.dau)} users × (${input.readsPerUser} reads + ${input.writesPerUser} writes)`} result={`${formatBig(e.readsPerDay)} reads, ${formatBig(e.writesPerDay)} writes`} />
        <Line n={2} label="Average requests per second" math={`÷ ${s} seconds in a day`} result={`${formatBig(e.readQps)} reads/s, ${formatBig(e.writeQps)} writes/s`} />
        <Line n={3} label="Peak requests per second" math={`× ${input.peakFactor} peak factor`} result={`${formatBig(e.peakReadQps + e.peakWriteQps)} requests/s`} strong />
        <Line n={4} label="New data per day" math={`${formatBig(e.writesPerDay)} writes × ${kb(input.objectKB)}`} result={formatGB(e.storagePerDayGB)} />
        <Line n={5} label="Total storage" math={`× 365 days × ${input.retentionYears} years × ${input.replication} copies`} result={formatTB(e.totalStorageTB)} strong />
        <Line n={6} label="Outgoing bandwidth, average" math={`${formatBig(e.readQps)} reads/s × ${kb(input.responseKB)}`} result={`${formatBig(e.egressMBps)} MB/s (${formatBig(e.egressMBps * 8)} Mbps)`} />
        <Line n={7} label="Servers for peak traffic" math={`${formatBig(e.peakReadQps + e.peakWriteQps)} ÷ ${input.serverQps.toLocaleString('en-US')} per server, rounded up`} result={`${e.servers.toLocaleString('en-US')} server${e.servers === 1 ? '' : 's'} (before redundancy)`} strong />
      </ol>
      <figcaption className="mt-3 text-xs text-ink-3">
        Rough by design: the point is the order of magnitude. Add headroom and redundancy to real server counts. Metadata and indexes typically add 10–30% to storage.
      </figcaption>
    </figure>
  )
}

function Line({ n, label, math, result, strong = false }: { n: number; label: string; math: string; result: string; strong?: boolean }) {
  return (
    <li className={`grid gap-x-4 gap-y-0.5 px-4 py-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.2fr)] ${strong ? 'bg-surface-2' : ''}`}>
      <span className="font-semibold">
        <span className="mr-2 font-mono text-xs text-ink-3">{n}</span>
        {label}
      </span>
      <span className="font-mono text-xs leading-relaxed text-ink-2 sm:text-sm">{math}</span>
      <span className="font-bold tabular-nums">{result}</span>
    </li>
  )
}
