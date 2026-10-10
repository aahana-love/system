// What happens before a web page's first byte arrives, and what each step costs.
// Everything is round trips: the time one message needs to go and come back.

export type Setup = 'http' | 'tls12' | 'tls13' | 'quic'
export type StepId = 'dns' | 'tcp' | 'tls' | 'quic' | 'http'

export const SETUPS: { id: Setup; label: string }[] = [
  { id: 'http', label: 'Plain HTTP' },
  { id: 'tls12', label: 'HTTPS · TLS 1.2' },
  { id: 'tls13', label: 'HTTPS · TLS 1.3' },
  { id: 'quic', label: 'HTTP/3 · QUIC' },
]

/** An uncached DNS walk, as in the DNS lesson's simulator (illustrative). */
export const DNS_UNCACHED_MS = 60

export interface JourneyOptions {
  rttMs: number
  setup: Setup
  dnsCached: boolean
  /** The connection is already open from an earlier request. */
  reuse: boolean
  /** Time the server spends producing the response. */
  serverMs: number
}

export interface JourneyStep {
  id: StepId
  label: string
  ms: number
  detail: string
  skipped: boolean
}

export interface Journey {
  steps: JourneyStep[]
  totalMs: number
  /** Time spent before the request itself is sent. */
  setupMs: number
}

export function journey(o: JourneyOptions): Journey {
  const steps: JourneyStep[] = []
  const dnsSkipped = o.reuse || o.dnsCached
  steps.push({
    id: 'dns',
    label: 'DNS lookup',
    ms: dnsSkipped ? 0 : DNS_UNCACHED_MS,
    detail: o.reuse ? 'Not needed: the connection is already open.' : o.dnsCached ? 'Answer already cached on your device.' : 'Resolver walks root, TLD and authoritative servers.',
    skipped: dnsSkipped,
  })

  if (o.setup === 'quic') {
    steps.push({
      id: 'quic',
      label: 'QUIC handshake',
      ms: o.reuse ? 0 : o.rttMs,
      detail: o.reuse ? 'Not needed: the connection is already open.' : 'Transport and encryption are set up together: 1 round trip.',
      skipped: o.reuse,
    })
  } else {
    steps.push({
      id: 'tcp',
      label: 'TCP handshake',
      ms: o.reuse ? 0 : o.rttMs,
      detail: o.reuse ? 'Not needed: the connection is already open.' : 'SYN, SYN-ACK, ACK: 1 round trip before any data.',
      skipped: o.reuse,
    })
    if (o.setup !== 'http') {
      const trips = o.setup === 'tls12' ? 2 : 1
      steps.push({
        id: 'tls',
        label: 'TLS handshake',
        ms: o.reuse ? 0 : trips * o.rttMs,
        detail: o.reuse ? 'Not needed: the session is already encrypted.' : `Agree on keys and check the certificate: ${trips} round trip${trips === 1 ? '' : 's'}.`,
        skipped: o.reuse,
      })
    }
  }

  steps.push({
    id: 'http',
    label: 'Request and response',
    ms: o.rttMs + o.serverMs,
    detail: `1 round trip, plus ${o.serverMs} ms of server work.`,
    skipped: false,
  })

  const totalMs = steps.reduce((t, s) => t + s.ms, 0)
  return { steps, totalMs, setupMs: totalMs - steps[steps.length - 1].ms }
}
