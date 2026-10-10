import type { Question } from '../content/types'

export type Answer =
  | { type: 'single'; choice: number | null }
  | { type: 'multi'; choices: number[] }
  /** Indices into `items`, in the order you arranged them. */
  | { type: 'order'; order: number[] }
  | { type: 'numeric'; raw: string }
  /** For each left item, the index of the pair whose right side you chose. */
  | { type: 'match'; mapping: (number | null)[] }
  | { type: 'spot'; node: string | null }

const WORDS: Record<string, number> = {
  thousand: 1e3,
  k: 1e3,
  lakh: 1e5,
  lakhs: 1e5,
  l: 1e5,
  million: 1e6,
  mn: 1e6,
  m: 1e6,
  crore: 1e7,
  crores: 1e7,
  cr: 1e7,
  billion: 1e9,
  bn: 1e9,
  b: 1e9,
  trillion: 1e12,
  t: 1e12,
}

/**
 * Reads numbers the way people type them: "12,000", "1.2k", "3e6",
 * "2 million", "5 lakh", "3 x 10^6", "40%".
 */
export function parseNumber(raw: string): number | null {
  let s = raw.trim().toLowerCase().replace(/,/g, '').replace(/_/g, '')
  if (!s) return null
  s = s.replace(/%$/, '').trim()
  const pow = /^(-?\d*\.?\d+)\s*(?:x|\*|×)\s*10\s*\^\s*(-?\d+)$/.exec(s)
  if (pow) return Number(pow[1]) * 10 ** Number(pow[2])
  const m = /^(-?\d*\.?\d+(?:e[+-]?\d+)?)\s*([a-z]+)?$/.exec(s)
  if (!m) return null
  const n = Number(m[1])
  if (!Number.isFinite(n)) return null
  if (!m[2]) return n
  const mult = WORDS[m[2]]
  return mult ? n * mult : null
}

export function emptyAnswer(q: Question): Answer {
  switch (q.type) {
    case 'single':
      return { type: 'single', choice: null }
    case 'multi':
      return { type: 'multi', choices: [] }
    case 'order':
      return { type: 'order', order: q.items.map((_, i) => i) }
    case 'numeric':
      return { type: 'numeric', raw: '' }
    case 'match':
      return { type: 'match', mapping: q.pairs.map(() => null) }
    case 'spot':
      return { type: 'spot', node: null }
  }
}

/** Whether the answer is complete enough to submit. */
export function canSubmit(q: Question, a: Answer): boolean {
  switch (a.type) {
    case 'single':
      return a.choice !== null
    case 'multi':
      return a.choices.length > 0
    case 'order':
      return a.order.length === (q.type === 'order' ? q.items.length : 0)
    case 'numeric':
      return parseNumber(a.raw) !== null
    case 'match':
      return a.mapping.every((v) => v !== null)
    case 'spot':
      return a.node !== null
  }
}

export function grade(q: Question, a: Answer): boolean {
  if (q.type !== a.type) return false
  switch (q.type) {
    case 'single':
      return (a as Extract<Answer, { type: 'single' }>).choice === q.answer
    case 'multi': {
      const chosen = new Set((a as Extract<Answer, { type: 'multi' }>).choices)
      return chosen.size === q.answers.length && q.answers.every((i) => chosen.has(i))
    }
    case 'order': {
      const order = (a as Extract<Answer, { type: 'order' }>).order
      return order.length === q.items.length && order.every((v, i) => v === i)
    }
    case 'numeric': {
      const n = parseNumber((a as Extract<Answer, { type: 'numeric' }>).raw)
      return n !== null && n >= q.min && n <= q.max
    }
    case 'match': {
      const mapping = (a as Extract<Answer, { type: 'match' }>).mapping
      return mapping.length === q.pairs.length && mapping.every((v, i) => v === i)
    }
    case 'spot':
      return (a as Extract<Answer, { type: 'spot' }>).node === q.answer
  }
}

/** Fisher–Yates shuffle that returns a new array. */
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** A shuffled order of 0..n-1 that is never already sorted (for n > 1). */
export function scrambledOrder(n: number, rand: () => number = Math.random): number[] {
  const base = Array.from({ length: n }, (_, i) => i)
  if (n < 2) return base
  for (let tries = 0; tries < 20; tries++) {
    const s = shuffle(base, rand)
    if (s.some((v, i) => v !== i)) return s
  }
  return [...base.slice(1), base[0]]
}
