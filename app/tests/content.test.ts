import { describe, expect, it } from 'vitest'
import { validateContent } from '../src/content/validate'
import { concepts } from '../src/content/roadmap'
import { questions, cards } from '../src/content/index'

describe('content', () => {
  it('is consistent (ids, prerequisites, aliases, question shapes, ready lessons)', () => {
    expect(validateContent()).toEqual([])
  })

  it('has the full roadmap and the M0 lessons', () => {
    expect(concepts).toHaveLength(60)
    expect(concepts.filter((c) => c.ready).map((c) => c.id)).toEqual(['dns', 'caching'])
    expect(questions.length).toBeGreaterThanOrEqual(30)
    expect(cards.length).toBeGreaterThanOrEqual(16)
  })
})
