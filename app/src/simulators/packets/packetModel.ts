// A message is cut into numbered packets, which take different routes and
// arrive in any order. The receiver puts them back using the numbers.

import { mulberry32 } from '../random'

export type Route = 'A' | 'B' | 'C'

export interface Packet {
  seq: number
  total: number
  data: string
}

export interface Delivery {
  packet: Packet
  route: Route
  /** Simulated travel time in ms. */
  delayMs: number
}

export const ROUTE_BASE_MS: Record<Route, number> = { A: 20, B: 35, C: 55 }
export const ROUTES: Route[] = ['A', 'B', 'C']

export function split(message: string, size: number): Packet[] {
  const chars = [...message]
  const total = Math.max(1, Math.ceil(chars.length / size))
  return Array.from({ length: total }, (_, seq) => ({ seq, total, data: chars.slice(seq * size, (seq + 1) * size).join('') }))
}

/** Sends every packet down a random route and returns them in arrival order. */
export function send(packets: Packet[], seed: number, dropSeqs: number[] = []): { arrived: Delivery[]; dropped: Packet[] } {
  const rand = mulberry32(seed)
  const all: Delivery[] = packets.map((packet) => {
    const route = ROUTES[Math.floor(rand() * ROUTES.length)]
    return { packet, route, delayMs: Math.round(ROUTE_BASE_MS[route] + rand() * 40) }
  })
  const dropped = all.filter((d) => dropSeqs.includes(d.packet.seq)).map((d) => d.packet)
  const arrived = all.filter((d) => !dropSeqs.includes(d.packet.seq)).sort((a, b) => a.delayMs - b.delayMs || a.packet.seq - b.packet.seq)
  return { arrived, dropped }
}

export interface Received {
  text: string
  missing: number[]
  complete: boolean
  /** Packets happened to arrive in sequence order. */
  inOrder: boolean
}

export function receive(arrived: Packet[], total: number): Received {
  const bySeq = new Map(arrived.map((p) => [p.seq, p]))
  const missing: number[] = []
  const parts: string[] = []
  for (let i = 0; i < total; i++) {
    const p = bySeq.get(i)
    if (p) parts.push(p.data)
    else {
      missing.push(i)
      parts.push('▯')
    }
  }
  const inOrder = arrived.every((p, i) => i === 0 || arrived[i - 1].seq < p.seq)
  return { text: parts.join(''), missing, complete: missing.length === 0, inOrder }
}
