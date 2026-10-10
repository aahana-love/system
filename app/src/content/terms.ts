import { concepts, conceptById } from './roadmap.ts'
import { glossary } from './glossary.ts'
import { buildMatcher, type TermEntry } from './matcher.ts'

export interface TermInfo {
  id: string
  kind: 'concept' | 'glossary'
  label: string
  oneLiner: string
  body?: string
  /** Concept that teaches it (itself, for concepts). */
  conceptId?: string
}

export const termEntries: TermEntry[] = [
  ...concepts.map((c) => ({ id: c.id, aliases: c.aliases })),
  ...glossary.map((g) => ({ id: g.id, aliases: g.aliases })),
]

const glossaryById = new Map(glossary.map((g) => [g.id, g]))

export function getTerm(id: string): TermInfo | undefined {
  const c = conceptById.get(id)
  if (c) return { id, kind: 'concept', label: c.title, oneLiner: c.oneLiner, body: c.primer, conceptId: c.id }
  const g = glossaryById.get(id)
  if (g) return { id, kind: 'glossary', label: g.label, oneLiner: g.oneLiner, body: g.body, conceptId: g.conceptId }
  return undefined
}

export const allTerms: TermInfo[] = termEntries.map((e) => getTerm(e.id)!)

export const termMatcher = buildMatcher(termEntries)
