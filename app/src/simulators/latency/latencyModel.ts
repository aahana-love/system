// The latency ladder: round, defensible figures for common operations.
// Real numbers move with hardware and era; the ratios between rungs are the lesson.

export interface Rung {
  id: string
  label: string
  /** Nanoseconds. */
  ns: number
  note: string
}

export const LADDER: Rung[] = [
  { id: 'l1', label: 'CPU cache (L1)', ns: 1, note: 'On the processor itself.' },
  { id: 'l2', label: 'CPU cache (L2)', ns: 4, note: 'Slightly further, still on the chip.' },
  { id: 'ram', label: 'Main memory (RAM)', ns: 100, note: 'Where running programs keep their data.' },
  { id: 'ssd', label: 'SSD random read', ns: 100_000, note: 'About 100 µs; ranges from 16 µs to 1 ms by drive and era.' },
  { id: 'dc', label: 'Round trip inside a data center', ns: 500_000, note: 'One server asking another a question.' },
  { id: 'hdd', label: 'Hard disk seek', ns: 10_000_000, note: 'A spinning disk moving its read head.' },
  { id: 'wan', label: 'Round trip across continents', ns: 150_000_000, note: 'Limited by the speed of light in fiber.' },
]

export const rungById = new Map(LADDER.map((r) => [r.id, r]))

const trim = (n: number) => (n >= 10 || Number.isInteger(n) ? String(Math.round(n)) : n.toFixed(1))

/** "1 ns", "100 µs", "10 ms", "150 ms" */
export function formatReal(ns: number): string {
  if (ns < 1_000) return `${trim(ns)} ns`
  if (ns < 1_000_000) return `${trim(ns / 1_000)} µs`
  if (ns < 1_000_000_000) return `${trim(ns / 1_000_000)} ms`
  return `${trim(ns / 1_000_000_000)} s`
}

const plural = (text: string, n: number) => (n === 1 ? text : `${text}s`)

/** Rescales 1 ns to 1 second and says it the way a person would. */
export function formatHuman(ns: number): string {
  const s = ns
  if (s < 60) return `${trim(s)} ${plural('second', Math.round(s))}`
  if (s < 3_600) return `${trim(s / 60)} minutes`
  if (s < 86_400) return `${trim(s / 3_600)} hours`
  const days = s / 86_400
  if (days < 30) return `${trim(days)} days`
  if (days < 365) return `${trim(days / 30.4)} months`
  return `${trim(days / 365)} years`
}

/** How many `small` operations fit in one `big` operation. */
export function howMany(small: Rung, big: Rung): number {
  return big.ns / small.ns
}

export function formatCount(n: number): string {
  if (n >= 1e9) return `${trim(n / 1e9)} billion`
  if (n >= 1e6) return `${trim(n / 1e6)} million`
  if (n >= 10) return Math.round(n).toLocaleString('en-US')
  return n.toFixed(n < 1 ? 3 : 1).replace(/\.?0+$/, '')
}
