import { describe, expect, it } from 'vitest'
import { buildMatcher, splitTerms } from '../src/content/matcher'

const m = buildMatcher([
  { id: 'caching', aliases: ['cache'] },
  { id: 'cache-aside', aliases: ['cache-aside'] },
  { id: 'a-record', aliases: ['A record'] },
  { id: 'ttl', aliases: ['TTL'] },
  { id: 'api', aliases: ['API'] },
])

const links = (text: string, exclude?: string) =>
  splitTerms(text, m, new Set(), exclude)
    .filter((s) => typeof s !== 'string')
    .map((s) => (s as { id: string; text: string }).text)

describe('term matcher', () => {
  it('links the first mention only', () => {
    expect(links('A cache helps. Another cache helps more.')).toEqual(['cache'])
  })

  it('prefers the longest alias', () => {
    expect(links('Use cache-aside here.')).toEqual(['cache-aside'])
  })

  it('does not match inside hyphenated words', () => {
    expect(links('The in-cache-layer thing')).toEqual([])
  })

  it('ignores case for lowercase aliases', () => {
    expect(links('Caches are fast.')).toEqual(['Caches'])
  })

  it('is case-sensitive for aliases with capitals', () => {
    expect(links('They keep a record of it.')).toEqual([])
    expect(links('An A record points to an address.')).toEqual(['A record'])
    expect(links('ttl in lowercase is not linked')).toEqual([])
  })

  it('accepts plurals of acronyms', () => {
    expect(links('Many APIs exist.')).toEqual(['APIs'])
  })

  it('skips the excluded term', () => {
    expect(links('A cache with a TTL', 'caching')).toEqual(['TTL'])
  })

  it('keeps all the text', () => {
    const text = 'Set a TTL on every cache entry.'
    const joined = splitTerms(text, m, new Set())
      .map((s) => (typeof s === 'string' ? s : s.text))
      .join('')
    expect(joined).toBe(text)
  })
})
