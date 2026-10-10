// Sending the same stream over a lossy link with TCP and with UDP.
// Simplified on purpose: TCP notices a loss about one round trip later and
// resends. Real TCP also has timeouts, windows and congestion control.

import { mulberry32 } from '../random'

export interface LinkOptions {
  packets: number
  lossPct: number
  rttMs: number
  /** Time between packets leaving the sender. */
  gapMs: number
  seed: number
}

export interface UdpResult {
  /** Seqs that arrived, in arrival order. */
  arrived: number[]
  lost: number[]
  completeAt: number
}

export interface TcpPacket {
  seq: number
  attempts: number
  arrivedAt: number
  /** When the application got it: never before every earlier packet. */
  deliveredAt: number
  waited: number
}

export interface TcpResult {
  packets: TcpPacket[]
  handshakeMs: number
  retransmits: number
  maxStallMs: number
  completeAt: number
}

function firstAttemptLosses(o: LinkOptions): boolean[] {
  const rand = mulberry32(o.seed)
  const p = o.lossPct / 100
  return Array.from({ length: o.packets }, () => rand() < p)
}

export function simulateUdp(o: LinkOptions): UdpResult {
  const lostFirst = firstAttemptLosses(o)
  const arrived: number[] = []
  const lost: number[] = []
  let completeAt = 0
  lostFirst.forEach((isLost, i) => {
    if (isLost) lost.push(i)
    else {
      arrived.push(i)
      completeAt = Math.max(completeAt, i * o.gapMs + o.rttMs / 2)
    }
  })
  return { arrived, lost, completeAt }
}

export function simulateTcp(o: LinkOptions): TcpResult {
  const lostFirst = firstAttemptLosses(o)
  const retry = mulberry32(o.seed + 7919)
  const p = o.lossPct / 100
  const handshakeMs = o.rttMs // SYN out, SYN-ACK back; data rides with the final ACK
  const packets: TcpPacket[] = []
  let retransmits = 0
  let maxStallMs = 0

  for (let i = 0; i < o.packets; i++) {
    let attempts = 1
    let sentAt = handshakeMs + i * o.gapMs
    let lost = lostFirst[i]
    // The 12-attempt cap only guards the loop; at 30% loss it would take odds of 5 in 10 million.
    while (lost && attempts < 12) {
      attempts++
      retransmits++
      sentAt += o.rttMs
      lost = retry() < p
    }
    const arrivedAt = sentAt + o.rttMs / 2
    const previous = i === 0 ? 0 : packets[i - 1].deliveredAt
    const deliveredAt = Math.max(arrivedAt, previous)
    const waited = deliveredAt - arrivedAt
    maxStallMs = Math.max(maxStallMs, waited)
    packets.push({ seq: i, attempts, arrivedAt, deliveredAt, waited })
  }
  return { packets, handshakeMs, retransmits, maxStallMs, completeAt: packets.length ? packets[packets.length - 1].deliveredAt : 0 }
}
