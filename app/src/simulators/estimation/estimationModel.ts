// The back-of-envelope chain: users → requests → QPS → storage → bandwidth → machines.

export interface EstimateInput {
  /** Daily active users. */
  dau: number
  readsPerUser: number
  writesPerUser: number
  /** Size of one stored object, in KB. */
  objectKB: number
  /** Size of one response, in KB. */
  responseKB: number
  retentionYears: number
  /** Copies kept of every object. */
  replication: number
  /** Peak traffic as a multiple of the average. */
  peakFactor: number
  /** 86,400 exactly, or 100,000 for quick mental math. */
  secondsPerDay: number
  /** Requests per second one server can handle. */
  serverQps: number
}

export interface Estimate {
  readsPerDay: number
  writesPerDay: number
  readQps: number
  writeQps: number
  peakReadQps: number
  peakWriteQps: number
  storagePerDayGB: number
  totalStorageTB: number
  egressMBps: number
  peakEgressMBps: number
  servers: number
}

export function estimate(i: EstimateInput): Estimate {
  const readsPerDay = i.dau * i.readsPerUser
  const writesPerDay = i.dau * i.writesPerUser
  const readQps = readsPerDay / i.secondsPerDay
  const writeQps = writesPerDay / i.secondsPerDay
  const peakReadQps = readQps * i.peakFactor
  const peakWriteQps = writeQps * i.peakFactor
  const storagePerDayGB = (writesPerDay * i.objectKB) / 1e6
  const totalStorageTB = (storagePerDayGB * 365 * i.retentionYears * i.replication) / 1e3
  const egressMBps = (readQps * i.responseKB) / 1e3
  const peakEgressMBps = egressMBps * i.peakFactor
  const servers = Math.max(1, Math.ceil((peakReadQps + peakWriteQps) / i.serverQps))
  return { readsPerDay, writesPerDay, readQps, writeQps, peakReadQps, peakWriteQps, storagePerDayGB, totalStorageTB, egressMBps, peakEgressMBps, servers }
}

export interface Preset {
  id: string
  label: string
  input: EstimateInput
}

const base = { retentionYears: 5, replication: 3, peakFactor: 3, secondsPerDay: 86_400, serverQps: 1_000 }

export const PRESETS: Preset[] = [
  {
    id: 'shortener',
    label: 'URL shortener',
    input: { ...base, dau: 10_000_000, readsPerUser: 10, writesPerUser: 0.1, objectKB: 0.5, responseKB: 0.5 },
  },
  {
    id: 'photos',
    label: 'Photo sharing',
    input: { ...base, dau: 20_000_000, readsPerUser: 50, writesPerUser: 0.5, objectKB: 2_000, responseKB: 300, peakFactor: 3 },
  },
  {
    id: 'chat',
    label: 'Chat app',
    input: { ...base, dau: 50_000_000, readsPerUser: 100, writesPerUser: 40, objectKB: 0.2, responseKB: 0.2, retentionYears: 3, peakFactor: 4 },
  },
]

export function formatBig(n: number): string {
  if (n >= 1e12) return `${trim(n / 1e12)} trillion`
  if (n >= 1e9) return `${trim(n / 1e9)} billion`
  if (n >= 1e6) return `${trim(n / 1e6)} million`
  if (n >= 100) return Math.round(n).toLocaleString('en-US')
  if (n >= 10) return trim(n)
  return n.toFixed(2).replace(/\.?0+$/, '')
}

export function formatGB(gb: number): string {
  if (gb >= 1e6) return `${trim(gb / 1e6)} PB`
  if (gb >= 1e3) return `${trim(gb / 1e3)} TB`
  if (gb >= 1) return `${trim(gb)} GB`
  return `${trim(gb * 1e3)} MB`
}

export function formatTB(tb: number): string {
  return formatGB(tb * 1e3)
}

function trim(n: number): string {
  return n >= 100 ? String(Math.round(n)) : n >= 10 ? n.toFixed(0) : n.toFixed(1).replace(/\.0$/, '')
}
