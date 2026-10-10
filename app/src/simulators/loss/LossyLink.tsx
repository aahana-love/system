import { useMemo, useState, type ReactNode } from 'react'
import { simulateTcp, simulateUdp } from './lossModel'
import { RangeField } from '../../components/RangeField'
import { Icon } from '../../components/Icon'

const LOSS = [0, 1, 2, 5, 10, 20, 30]
const RTT = [20, 50, 100, 200, 300]
const PACKETS = 40
const GAP = 10

/** The same 40 packets, sent over the same lossy link, by TCP and by UDP. */
export function LossyLink() {
  const [lossPct, setLossPct] = useState(5)
  const [rttMs, setRttMs] = useState(100)
  const [seed, setSeed] = useState(7)
  const o = useMemo(() => ({ packets: PACKETS, lossPct, rttMs, gapMs: GAP, seed }), [lossPct, rttMs, seed])
  const udp = useMemo(() => simulateUdp(o), [o])
  const tcp = useMemo(() => simulateTcp(o), [o])
  const lostSet = new Set(udp.lost)

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="TCP versus UDP on a lossy link">
      <p className="text-lg font-extrabold">Same link, same packets, two protocols</p>
      <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <RangeField label="Packets lost" values={LOSS} value={lossPct} onChange={setLossPct} format={(v) => `${v}%`} />
        <RangeField label="Round trip" values={RTT} value={rttMs} onChange={setRttMs} format={(v) => `${v} ms`} />
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rule px-3 py-2 text-sm font-semibold hover:bg-surface-2"
        >
          <Icon name="reset" size={15} /> Re-roll the losses
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="udp-title">
          <h3 id="udp-title" className="text-base font-extrabold">
            UDP <span className="font-mono text-xs font-normal text-ink-3">send and move on</span>
          </h3>
          <Cells>
            {Array.from({ length: PACKETS }, (_, i) => (
              <Cell key={i} n={i + 1} tone={lostSet.has(i) ? 'lost' : 'ok'} title={lostSet.has(i) ? `Packet ${i + 1}: lost, never resent` : `Packet ${i + 1}: arrived`} />
            ))}
          </Cells>
          <Stats
            rows={[
              ['Arrived', `${udp.arrived.length} of ${PACKETS}`],
              ['Missing for good', String(udp.lost.length)],
              ['Last packet arrives', `${Math.round(udp.completeAt)} ms`],
            ]}
          />
        </section>
        <section aria-labelledby="tcp-title">
          <h3 id="tcp-title" className="text-base font-extrabold">
            TCP <span className="font-mono text-xs font-normal text-ink-3">handshake, then resend until it's all there</span>
          </h3>
          <Cells>
            {tcp.packets.map((p) => (
              <Cell
                key={p.seq}
                n={p.seq + 1}
                tone={p.attempts > 1 ? 'resent' : p.waited > 0 ? 'waited' : 'ok'}
                title={
                  p.attempts > 1
                    ? `Packet ${p.seq + 1}: sent ${p.attempts} times`
                    : p.waited > 0
                      ? `Packet ${p.seq + 1}: arrived, then waited ${Math.round(p.waited)} ms for an earlier packet`
                      : `Packet ${p.seq + 1}: arrived and delivered`
                }
              />
            ))}
          </Cells>
          <Stats
            rows={[
              ['Delivered, in order', `${PACKETS} of ${PACKETS}`],
              ['Resends', String(tcp.retransmits)],
              ['Longest stall', `${Math.round(tcp.maxStallMs)} ms`],
              ['Last packet delivered', `${Math.round(tcp.completeAt)} ms (includes ${tcp.handshakeMs} ms handshake)`],
            ]}
          />
        </section>
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-2" aria-label="Legend">
        <Key tone="ok" label="Arrived" />
        <Key tone="lost" label="Lost for good" />
        <Key tone="resent" label="Lost, then resent" />
        <Key tone="waited" label="Held back behind a resent packet" />
      </ul>
      <p className="mt-3 rounded-lg bg-surface-2 px-4 py-3 text-sm" role="status">
        {udp.lost.length === 0 && tcp.retransmits === 0 ? (
          <>No loss this time: both deliver everything. TCP still finishes {rttMs} ms later, because of its handshake.</>
        ) : (
          <>
            UDP lost {udp.lost.length} packet{udp.lost.length === 1 ? '' : 's'} but finished in <strong>{Math.round(udp.completeAt)} ms</strong>. TCP delivered
            all {PACKETS} but needed <strong>{Math.round(tcp.completeAt)} ms</strong>, and the app saw nothing after each loss until the resend landed.
          </>
        )}
      </p>
      <figcaption className="mt-3 text-xs text-ink-3">
        Simplified: a lost TCP packet is noticed and resent about one round trip later. Real TCP also uses timeouts, windows and congestion control.
      </figcaption>
    </figure>
  )
}

type Tone = 'ok' | 'lost' | 'resent' | 'waited'
const TONE: Record<Tone, string> = {
  ok: 'border-hit bg-hit/15 text-ink',
  lost: 'border-bad border-dashed bg-bad-bg text-bad',
  resent: 'border-miss bg-miss/20 text-ink',
  waited: 'border-ink-3 bg-surface-2 text-ink-2',
}

function Cells({ children }: { children: ReactNode }) {
  return <ol className="mt-3 grid grid-cols-10 gap-1">{children}</ol>
}
function Cell({ n, tone, title }: { n: number; tone: Tone; title: string }) {
  return (
    <li title={title} className={`flex h-8 items-center justify-center rounded-md border font-mono text-[11px] font-semibold ${TONE[tone]}`}>
      <span className="sr-only">{title}</span>
      <span aria-hidden="true">{tone === 'lost' ? '✕' : n}</span>
    </li>
  )
}
function Key({ tone, label }: { tone: Tone; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`inline-block h-4 w-4 rounded border ${TONE[tone]}`} />
      {label}
    </li>
  )
}
function Stats({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-4 space-y-1 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 border-t border-rule pt-1">
          <dt className="text-ink-2">{k}</dt>
          <dd className="text-right font-mono font-semibold tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
