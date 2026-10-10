import { useMemo, useState } from 'react'
import { DNS_UNCACHED_MS, SETUPS, journey, type Setup, type StepId } from './journeyModel'
import { Segmented } from '../../components/Segmented'
import { RangeField } from '../../components/RangeField'

const COLOR: Record<StepId, string> = {
  dns: 'var(--line-3)',
  tcp: 'var(--line-1)',
  tls: 'var(--line-2)',
  quic: 'var(--line-2)',
  http: 'var(--line-0)',
}
const RTT = [5, 10, 20, 40, 80, 120, 150, 200, 250, 300]
const SERVER = [0, 10, 20, 50, 100, 200, 500]

const place = (rtt: number) => (rtt <= 10 ? 'same city' : rtt <= 40 ? 'same country' : rtt <= 120 ? 'another region' : 'across the world')

/** The first request on a new connection pays for DNS, TCP and TLS before any data moves. */
export function RequestJourney() {
  const [rtt, setRtt] = useState(100)
  const [setup, setSetup] = useState<Setup>('tls13')
  const [dnsCached, setDnsCached] = useState(false)
  const [reuse, setReuse] = useState(false)
  const [serverMs, setServerMs] = useState(20)

  const j = useMemo(() => journey({ rttMs: rtt, setup, dnsCached, reuse, serverMs }), [rtt, setup, dnsCached, reuse, serverMs])
  const repeat = useMemo(() => journey({ rttMs: rtt, setup, dnsCached: true, reuse: true, serverMs }), [rtt, setup, serverMs])
  const shownSteps = j.steps.filter((s) => s.ms > 0)
  const setupPct = Math.round((j.setupMs / j.totalMs) * 100)

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="Request journey simulator">
      <p className="text-lg font-extrabold">One request, step by step</p>
      <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <RangeField
          label="Round trip to the server"
          values={RTT}
          value={rtt}
          onChange={setRtt}
          format={(v) => `${v} ms`}
          hint={`About ${place(rtt)}. Every handshake below costs whole round trips.`}
        />
        <RangeField label="Server work" values={SERVER} value={serverMs} onChange={setServerMs} format={(v) => `${v} ms`} />
        <Segmented label="Connection type" value={setup} options={SETUPS.map((s) => s.id)} display={(v) => SETUPS.find((s) => s.id === v)!.label} onChange={setSetup} />
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={dnsCached} onChange={(e) => setDnsCached(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
            DNS answer cached
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={reuse} onChange={(e) => setReuse(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
            Connection already open
          </label>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">Time until the response arrives</p>
          <p className="text-3xl font-extrabold tabular-nums">
            {Math.round(j.totalMs)}
            <span className="ml-1 text-base font-semibold text-ink-2">ms</span>
          </p>
        </div>
        <div className="mt-2 flex h-10 gap-[2px]" role="img" aria-label={`Total ${Math.round(j.totalMs)} milliseconds`}>
          {shownSteps.map((s) => (
            <div
              key={s.id}
              className="flex min-w-1 items-center justify-center overflow-hidden rounded-md text-[11px] font-bold text-white"
              style={{ width: `${(s.ms / j.totalMs) * 100}%`, background: COLOR[s.id] }}
              title={`${s.label}: ${Math.round(s.ms)} ms`}
            >
              <span className="truncate px-1">{s.ms / j.totalMs > 0.12 ? s.label : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <table className="mt-4 w-full text-sm">
        <caption className="sr-only">Cost of each step</caption>
        <tbody>
          {j.steps.map((s) => (
            <tr key={s.id} className={`border-t border-rule ${s.skipped ? 'text-ink-3' : ''}`}>
              <td className="py-2 pr-3 align-top">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: s.skipped ? 'var(--rule)' : COLOR[s.id] }} />
                <span className="font-semibold">{s.label}</span>
              </td>
              <td className="py-2 pr-3 align-top font-mono tabular-nums">{s.skipped ? 'skipped' : `${Math.round(s.ms)} ms`}</td>
              <td className="py-2 align-top">{s.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 rounded-lg bg-surface-2 px-4 py-3 text-sm" role="status">
        {j.setupMs > 0 ? (
          <>
            <strong>{Math.round(j.setupMs)} ms ({setupPct}%)</strong> pass before the request is even sent. The next request on this open connection takes{' '}
            <strong>{Math.round(repeat.totalMs)} ms</strong>.
          </>
        ) : (
          <>
            Nothing to set up: only the request itself is left, <strong>{Math.round(j.totalMs)} ms</strong>. This is why connections are kept open and reused.
          </>
        )}
      </p>
      <figcaption className="mt-3 text-xs text-ink-3">
        Illustrative: an uncached DNS lookup is counted as {DNS_UNCACHED_MS} ms, and TLS and QUIC resumption tricks (0-RTT) are left out.
      </figcaption>
    </figure>
  )
}
