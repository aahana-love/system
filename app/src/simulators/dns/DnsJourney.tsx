import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useReducedMotion } from 'motion/react'
import { DOMAINS, clearDevice, emptyCaches, resolve, type DnsCaches, type DnsNode, type Lookup } from './dnsModel'
import { Icon } from '../../components/Icon'

const POS: Record<DnsNode, { x: number; y: number }> = {
  browser: { x: 80, y: 150 },
  os: { x: 230, y: 150 },
  resolver: { x: 430, y: 150 },
  root: { x: 660, y: 52 },
  tld: { x: 660, y: 150 },
  auth: { x: 660, y: 248 },
}
const EDGES: [DnsNode, DnsNode][] = [
  ['browser', 'os'],
  ['os', 'resolver'],
  ['resolver', 'root'],
  ['resolver', 'tld'],
  ['resolver', 'auth'],
]
const STEP_MS = 650

function fmtClock(ms: number) {
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const hms = [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':')
  return d > 0 ? `${d}d ${hms}` : hms
}

function fmtLeft(ms: number) {
  const s = Math.ceil(ms / 1000)
  if (s >= 86400) return `${Math.round(s / 3600)}h`
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
  if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${s}s`
}

export function DnsJourney() {
  const reduce = useReducedMotion()
  const [domainIdx, setDomainIdx] = useState(0)
  const [caches, setCaches] = useState<DnsCaches>(emptyCaches)
  const [clock, setClock] = useState(0)
  const [lookup, setLookup] = useState<Lookup | null>(null)
  const [shown, setShown] = useState(0)
  const [history, setHistory] = useState<{ name: string; ms: number; by: DnsNode }[]>([])
  const domain = DOMAINS[domainIdx]
  const playing = lookup !== null && shown < lookup.steps.length

  useEffect(() => {
    if (!lookup || shown >= lookup.steps.length) return
    const t = setTimeout(() => setShown((s) => s + 1), reduce ? 0 : STEP_MS)
    return () => clearTimeout(t)
  }, [lookup, shown, reduce])

  const lookUp = () => {
    const result = resolve(caches, domain, clock)
    setCaches(result.caches)
    setLookup(result)
    setShown(reduce ? result.steps.length : 1)
    setHistory((h) => [...h.slice(-4), { name: domain.name, ms: result.totalMs, by: result.answeredBy }])
  }

  const advance = (ms: number) => setClock((c) => c + ms)
  const reset = () => {
    setCaches(emptyCaches())
    setClock(0)
    setLookup(null)
    setShown(0)
    setHistory([])
  }

  const step = lookup && shown > 0 ? lookup.steps[shown - 1] : null
  const active = new Set<DnsNode>(lookup ? lookup.steps.slice(0, shown).flatMap((s) => [s.from, s.to]) : [])
  const labels: Record<DnsNode, [string, string]> = {
    browser: ['Browser', 'own cache'],
    os: ['Operating system', 'OS cache'],
    resolver: ['Recursive resolver', 'ISP or 1.1.1.1'],
    root: ['Root server', '.'],
    tld: [`.${domain.tld} TLD server`, 'top-level domain'],
    auth: ['Authoritative', `${domain.zone} nameserver`],
  }

  const cacheRows = useMemo(() => {
    const rows = (rec: Record<string, number>) =>
      Object.entries(rec)
        .filter(([, exp]) => exp > clock)
        .map(([k, exp]) => ({ k, left: exp - clock }))
    return { browser: rows(caches.browser), os: rows(caches.os), resolver: rows(caches.resolver) }
  }, [caches, clock])

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="DNS lookup simulator">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold">
          Name
          <select
            value={domainIdx}
            onChange={(e) => setDomainIdx(Number(e.target.value))}
            disabled={playing}
            className="rounded-lg border border-rule bg-surface px-2 py-1.5 font-mono text-sm"
          >
            {DOMAINS.map((d, i) => (
              <option key={d.name} value={i}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={lookUp}
          disabled={playing}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 text-sm font-bold text-bg disabled:opacity-40"
        >
          <Icon name="play" size={14} /> Look up
        </button>
        <span className="mx-1 hidden h-5 w-px bg-rule sm:inline-block" />
        <span className="font-mono text-xs text-ink-2">Clock {fmtClock(clock)}</span>
        {[
          ['+1 min', 60_000],
          ['+10 min', 600_000],
          ['+1 day', 86_400_000],
        ].map(([label, ms]) => (
          <button
            key={label}
            type="button"
            disabled={playing}
            onClick={() => advance(ms as number)}
            className="rounded-md border border-rule px-2 py-1 font-mono text-xs hover:bg-surface-2 disabled:opacity-40"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          disabled={playing}
          onClick={() => setCaches(clearDevice(caches))}
          className="rounded-md border border-rule px-2 py-1 text-xs font-semibold hover:bg-surface-2 disabled:opacity-40"
        >
          Clear my device's cache
        </button>
        <button type="button" onClick={reset} className="ml-auto inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink" aria-label="Reset simulator">
          <Icon name="reset" size={14} /> Reset
        </button>
      </div>

      <div className="-mx-1 mt-4 overflow-x-auto px-1">
      <svg viewBox="0 0 760 300" className="h-auto w-full min-w-[600px]" role="img" aria-label="Diagram of the servers involved in a DNS lookup">
        <rect x="14" y="98" width="292" height="104" rx="14" fill="none" stroke="var(--rule)" strokeDasharray="5 4" />
        <text x="24" y="92" fontSize="11" fill="var(--ink-3)" className="font-mono">
          YOUR LAPTOP
        </text>
        {EDGES.map(([a, b]) => (
          <line
            key={a + b}
            x1={POS[a].x}
            y1={POS[a].y}
            x2={POS[b].x}
            y2={POS[b].y}
            stroke={active.has(a) && active.has(b) ? 'var(--ink-2)' : 'var(--rule)'}
            strokeWidth={2}
          />
        ))}
        {(Object.keys(POS) as DnsNode[]).map((n) => {
          const isCurrent = step && (step.from === n || step.to === n)
          const hit = step && step.kind === 'cache-hit' && step.from === n
          return (
            <g key={n}>
              <rect
                x={POS[n].x - 66}
                y={POS[n].y - 24}
                width={132}
                height={48}
                rx={10}
                fill={hit ? 'color-mix(in oklab, var(--hit) 18%, var(--surface))' : 'var(--surface)'}
                stroke={hit ? 'var(--hit)' : isCurrent ? 'var(--ink)' : active.has(n) ? 'var(--ink-2)' : 'var(--rule)'}
                strokeWidth={isCurrent ? 2.4 : 1.4}
              />
              <text x={POS[n].x} y={POS[n].y - 3} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--ink)">
                {labels[n][0]}
              </text>
              <text x={POS[n].x} y={POS[n].y + 13} textAnchor="middle" fontSize="10.5" fill="var(--ink-2)" className="font-mono">
                {labels[n][1]}
              </text>
            </g>
          )
        })}
        {step && step.from !== step.to && !reduce && (
          <circle
            key={shown}
            r="7"
            fill={step.kind === 'answer' ? 'var(--hit)' : step.kind === 'referral' ? 'var(--miss)' : 'var(--ink)'}
            className="packet"
            style={
              {
                offsetPath: `path('M ${POS[step.from].x} ${POS[step.from].y} L ${POS[step.to].x} ${POS[step.to].y}')`,
                '--dur': `${STEP_MS - 120}ms`,
              } as CSSProperties
            }
          />
        )}
      </svg>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">What was said</p>
          {!lookup ? (
            <p className="mt-2 text-sm text-ink-2">Press Look up to start. Each hop appears here with the time it adds.</p>
          ) : (
            <ol className="mt-2 space-y-1">
              {lookup.steps.slice(0, shown).map((s, i) => (
                <li key={i} className="grid grid-cols-[1.5rem_1fr_auto] gap-2 text-sm">
                  <span className="font-mono text-ink-3">{i + 1}</span>
                  <span>
                    <span className="font-semibold">{labels[s.from][0]}</span>
                    {s.from !== s.to && <span className="text-ink-3"> → {labels[s.to][0]}</span>}
                    <span className="block text-ink-2">{s.text}</span>
                  </span>
                  <span className="font-mono text-xs text-ink-3">{s.ms ? `+${s.ms} ms` : ''}</span>
                </li>
              ))}
            </ol>
          )}
          {lookup && !playing && (
            <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold" role="status">
              {lookup.totalMs === 0
                ? `Answered instantly from the ${lookup.answeredBy === 'browser' ? 'browser' : 'OS'} cache: 0 ms.`
                : `Answered by the ${lookup.answeredBy === 'auth' ? 'authoritative nameserver' : "resolver's cache"} in ${lookup.totalMs} ms.`}
            </p>
          )}
          {history.length > 1 && !playing && (
            <p className="mt-2 font-mono text-xs text-ink-2">
              Last lookups: {history.map((h) => `${h.ms} ms`).join(' · ')}
            </p>
          )}
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">What each layer remembers</p>
          <dl className="mt-2 space-y-2 text-sm">
            {(
              [
                ['Browser', cacheRows.browser],
                ['OS', cacheRows.os],
                ['Resolver', cacheRows.resolver],
              ] as const
            ).map(([name, rows]) => (
              <div key={name}>
                <dt className="font-semibold">{name}</dt>
                <dd className="font-mono text-xs text-ink-2">
                  {rows.length === 0
                    ? 'empty'
                    : rows.map((r) => (
                        <span key={r.k} className="mr-3 inline-block">
                          {r.k.replace(/^A:/, '')} <span className="text-ink-3">({fmtLeft(r.left)} left)</span>
                        </span>
                      ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <figcaption className="mt-4 border-t border-rule pt-3 text-xs text-ink-3">
        Times are round trips, counted on each question. Illustrative addresses, TTLs and timings. Real lookups vary with your network and provider.
      </figcaption>
    </figure>
  )
}
