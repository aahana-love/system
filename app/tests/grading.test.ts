import { describe, expect, it } from 'vitest'
import { canSubmit, emptyAnswer, grade, parseNumber, scrambledOrder, shuffle } from '../src/engine/grading'
import { mulberry32 } from '../src/simulators/cache/cacheModel'
import type { Question } from '../src/content/types'

const base = { concept: 'x', prompt: 'p', explanation: 'e', difficulty: 1 as const }

describe('parseNumber', () => {
  it.each([
    ['12000', 12000],
    ['12,000', 12000],
    ['1.2k', 1200],
    ['3e6', 3e6],
    ['2 million', 2e6],
    ['5 lakh', 5e5],
    ['2 crore', 2e7],
    ['1.5bn', 1.5e9],
    ['3 x 10^6', 3e6],
    ['40%', 40],
    ['0.5', 0.5],
  ])('reads %s', (raw, n) => expect(parseNumber(raw)).toBeCloseTo(n))

  it.each(['', 'abc', '12 apples', '1..2'])('rejects %s', (raw) => expect(parseNumber(raw)).toBeNull())
})

describe('grade', () => {
  it('single', () => {
    const q: Question = { ...base, id: 'x-1', type: 'single', options: [{ text: 'a' }, { text: 'b' }], answer: 1 }
    expect(grade(q, { type: 'single', choice: 1 })).toBe(true)
    expect(grade(q, { type: 'single', choice: 0 })).toBe(false)
    expect(canSubmit(q, emptyAnswer(q))).toBe(false)
  })

  it('multi needs the exact set', () => {
    const q: Question = { ...base, id: 'x-2', type: 'multi', options: [{ text: 'a' }, { text: 'b' }, { text: 'c' }], answers: [0, 2] }
    expect(grade(q, { type: 'multi', choices: [2, 0] })).toBe(true)
    expect(grade(q, { type: 'multi', choices: [0] })).toBe(false)
    expect(grade(q, { type: 'multi', choices: [0, 1, 2] })).toBe(false)
  })

  it('order', () => {
    const q: Question = { ...base, id: 'x-3', type: 'order', items: ['a', 'b', 'c'] }
    expect(grade(q, { type: 'order', order: [0, 1, 2] })).toBe(true)
    expect(grade(q, { type: 'order', order: [1, 0, 2] })).toBe(false)
  })

  it('numeric uses the accepted range', () => {
    const q: Question = { ...base, id: 'x-4', type: 'numeric', answer: 20, min: 18, max: 22 }
    expect(grade(q, { type: 'numeric', raw: '21' })).toBe(true)
    expect(grade(q, { type: 'numeric', raw: '22' })).toBe(true)
    expect(grade(q, { type: 'numeric', raw: '23' })).toBe(false)
    expect(canSubmit(q, { type: 'numeric', raw: 'twenty' })).toBe(false)
  })

  it('match', () => {
    const q: Question = { ...base, id: 'x-5', type: 'match', pairs: [{ left: 'a', right: '1' }, { left: 'b', right: '2' }, { left: 'c', right: '3' }] }
    expect(grade(q, { type: 'match', mapping: [0, 1, 2] })).toBe(true)
    expect(grade(q, { type: 'match', mapping: [1, 0, 2] })).toBe(false)
    expect(canSubmit(q, { type: 'match', mapping: [0, null, 2] })).toBe(false)
  })

  it('spot', () => {
    const q: Question = {
      ...base,
      id: 'x-6',
      type: 'spot',
      diagram: { width: 100, height: 100, nodes: [{ id: 'a', label: 'A', x: 10, y: 10 }], edges: [] },
      answer: 'a',
    }
    expect(grade(q, { type: 'spot', node: 'a' })).toBe(true)
    expect(grade(q, { type: 'spot', node: 'b' })).toBe(false)
  })

  it('rejects an answer of the wrong type', () => {
    const q: Question = { ...base, id: 'x-7', type: 'single', options: [{ text: 'a' }, { text: 'b' }], answer: 0 }
    expect(grade(q, { type: 'spot', node: 'a' })).toBe(false)
  })
})

describe('shuffling', () => {
  it('shuffle keeps every item', () => {
    const out = shuffle([1, 2, 3, 4, 5], mulberry32(3))
    expect(out.slice().sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('scrambledOrder is never already sorted', () => {
    for (let seed = 0; seed < 200; seed++) {
      const o = scrambledOrder(3, mulberry32(seed))
      expect(o).not.toEqual([0, 1, 2])
      expect(o.slice().sort()).toEqual([0, 1, 2])
    }
  })
})
