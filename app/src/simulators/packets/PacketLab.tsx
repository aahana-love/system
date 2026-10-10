import { useMemo, useState } from 'react'
import { receive, send, split, type Route } from './packetModel'
import { RangeField } from '../../components/RangeField'
import { Icon } from '../../components/Icon'

const ROUTE_COLOR: Record<Route, string> = { A: 'var(--line-1)', B: 'var(--line-2)', C: 'var(--line-0)' }

/** Cut a message into packets, send them by different routes, and put them back together. */
export function PacketLab() {
  const [message, setMessage] = useState('Meet me at the station at six pm')
  const [size, setSize] = useState(6)
  const [seed, setSeed] = useState(3)
  const [drop, setDrop] = useState(false)

  const packets = useMemo(() => split(message, size), [message, size])
  const dropSeqs = useMemo(() => (drop && packets.length > 2 ? [Math.floor(packets.length / 2)] : []), [drop, packets.length])
  const { arrived, dropped } = useMemo(() => send(packets, seed, dropSeqs), [packets, seed, dropSeqs])
  const got = useMemo(() => receive(arrived.map((d) => d.packet), packets.length), [arrived, packets.length])

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="Packet lab">
      <p className="text-lg font-extrabold">Packet lab</p>
      <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">Message</span>
          <input
            value={message}
            maxLength={80}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-sm"
          />
        </label>
        <RangeField label="Characters per packet" values={[3, 4, 6, 8, 12]} value={size} onChange={setSize} hint="Real packets carry up to about 1,400 bytes." />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => setSeed((s) => s + 1)} className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-1.5 text-sm font-bold text-bg">
          <Icon name="play" size={14} /> Send again, new routes
        </button>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={drop} onChange={(e) => setDrop(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
          A router drops one packet
        </label>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">Sent, in order</p>
          <ol className="mt-2 flex flex-wrap gap-1.5">
            {packets.map((p) => (
              <li key={p.seq} className={`rounded-md border px-2 py-1 text-sm ${dropped.some((d) => d.seq === p.seq) ? 'border-dashed border-bad' : 'border-rule'}`}>
                <span className="mr-1.5 font-mono text-[10px] text-ink-3">
                  {p.seq + 1}/{p.total}
                </span>
                <span className="font-mono">{p.data.replace(/ /g, '·')}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">Arrived, first to last</p>
          <ol className="mt-2 flex flex-wrap gap-1.5">
            {arrived.map((d) => (
              <li key={d.packet.seq} className="rounded-md border border-rule px-2 py-1 text-sm" title={`Route ${d.route}, ${d.delayMs} ms`}>
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: ROUTE_COLOR[d.route] }} />
                <span className="mr-1.5 font-mono text-[10px] text-ink-3">
                  {d.packet.seq + 1}/{d.packet.total} · {d.delayMs} ms
                </span>
                <span className="font-mono">{d.packet.data.replace(/ /g, '·')}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-ink-3">Dot colour is the route taken (A, B or C). Spaces are shown as ·</p>
        </div>
      </div>

      <div className={`mt-5 rounded-xl border px-4 py-3 ${got.complete ? 'border-good bg-good-bg' : 'border-bad bg-bad-bg'}`} role="status">
        <p className="font-mono text-[11px] tracking-wider text-ink-2 uppercase">The receiver reassembles by sequence number</p>
        <p className="mt-1 font-mono text-lg font-bold break-words">{got.text}</p>
        <p className="mt-1 text-sm">
          {got.complete
            ? got.inOrder
              ? 'Every packet arrived in order this time. That is luck, not a guarantee.'
              : 'The packets arrived out of order, and the numbers put the message back together.'
            : `Packet ${got.missing.map((m) => m + 1).join(', ')} never arrived. The receiver can see the gap, because the numbers skip, and ask for it again. That is what TCP does.`}
        </p>
      </div>
    </figure>
  )
}
