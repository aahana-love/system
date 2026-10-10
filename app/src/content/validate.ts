import { concepts } from './roadmap'
import { glossary } from './glossary'
import { termEntries } from './terms'
import { cards, lessonFiles, questions } from './index'
import type { Question } from './types'

export const MIN_CHECKS = 3
export const MIN_PRACTICE = 10
export const MIN_CARDS = 6

/** Returns a list of problems. An empty list means the content is consistent. */
export function validateContent(): string[] {
  const errors: string[] = []
  const err = (msg: string) => errors.push(msg)

  // Concepts
  const ids = new Set<string>()
  const order = new Map<string, number>()
  concepts.forEach((c, i) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id)) err(`Concept id "${c.id}" must be kebab-case.`)
    if (ids.has(c.id)) err(`Duplicate concept id "${c.id}".`)
    ids.add(c.id)
    order.set(c.id, i)
    if (!c.oneLiner.trim() || !c.primer.trim()) err(`Concept "${c.id}" needs a one-liner and a primer.`)
  })
  for (const c of concepts) {
    for (const p of c.prerequisites) {
      if (p === c.id) err(`Concept "${c.id}" lists itself as a prerequisite.`)
      else if (!ids.has(p)) err(`Concept "${c.id}" has unknown prerequisite "${p}".`)
      else if (order.get(p)! > order.get(c.id)!) err(`Prerequisite "${p}" comes after "${c.id}" in the roadmap.`)
    }
  }

  // Terms
  const termIds = new Set<string>()
  for (const e of termEntries) {
    if (termIds.has(e.id)) err(`Term id "${e.id}" is used twice (concept and glossary ids must differ).`)
    termIds.add(e.id)
  }
  for (const g of glossary) {
    if (g.conceptId && !ids.has(g.conceptId)) err(`Glossary term "${g.id}" points to unknown concept "${g.conceptId}".`)
    if (g.aliases.length === 0) err(`Glossary term "${g.id}" has no aliases.`)
  }
  const aliasOwner = new Map<string, string>()
  for (const e of termEntries) {
    for (const a of e.aliases) {
      const key = a.toLowerCase()
      const owner = aliasOwner.get(key)
      if (owner && owner !== e.id) err(`Alias "${a}" is claimed by both "${owner}" and "${e.id}".`)
      aliasOwner.set(key, e.id)
    }
  }

  // Questions
  const qIds = new Set<string>()
  for (const q of questions) {
    if (qIds.has(q.id)) err(`Duplicate question id "${q.id}".`)
    qIds.add(q.id)
    if (!ids.has(q.concept)) err(`Question "${q.id}" points to unknown concept "${q.concept}".`)
    if (!q.id.startsWith(`${q.concept}-`)) err(`Question "${q.id}" should start with "${q.concept}-".`)
    if (!q.prompt.trim() || !q.explanation.trim()) err(`Question "${q.id}" needs a prompt and an explanation.`)
    for (const m of checkQuestionShape(q)) err(`Question "${q.id}": ${m}`)
  }

  // Cards
  const cIds = new Set<string>()
  for (const c of cards) {
    if (cIds.has(c.id)) err(`Duplicate card id "${c.id}".`)
    cIds.add(c.id)
    if (!ids.has(c.concept)) err(`Card "${c.id}" points to unknown concept "${c.concept}".`)
    if (!c.front.trim() || !c.back.trim()) err(`Card "${c.id}" needs a front and a back.`)
  }

  // Ready concepts need everything the 5-step loop uses.
  for (const c of concepts.filter((c) => c.ready)) {
    for (const part of ['learn', 'theory']) {
      if (!lessonFiles.has(`./concepts/${c.id}/${part}.mdx`)) err(`Ready concept "${c.id}" is missing ${part}.mdx.`)
    }
    const qs = questions.filter((q) => q.concept === c.id)
    const checks = qs.filter((q) => q.check).length
    if (checks !== MIN_CHECKS) err(`Ready concept "${c.id}" has ${checks} check questions; it needs exactly ${MIN_CHECKS}.`)
    const practice = qs.length - checks
    if (practice < MIN_PRACTICE) err(`Ready concept "${c.id}" has ${practice} practice questions; it needs ${MIN_PRACTICE}+.`)
    const n = cards.filter((k) => k.concept === c.id).length
    if (n < MIN_CARDS) err(`Ready concept "${c.id}" has ${n} cards; it needs ${MIN_CARDS}+.`)
  }

  return errors
}

function checkQuestionShape(q: Question): string[] {
  const out: string[] = []
  const unique = (xs: string[]) => new Set(xs.map((x) => x.trim().toLowerCase())).size === xs.length
  switch (q.type) {
    case 'single':
      if (q.options.length < 2) out.push('needs at least 2 options')
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) out.push('answer index out of range')
      if (!unique(q.options.map((o) => o.text))) out.push('options must be distinct')
      break
    case 'multi':
      if (q.options.length < 3) out.push('needs at least 3 options')
      if (q.answers.length === 0) out.push('needs at least one correct option')
      if (new Set(q.answers).size !== q.answers.length) out.push('answers repeat')
      if (q.answers.some((i) => i < 0 || i >= q.options.length)) out.push('answer index out of range')
      if (!unique(q.options.map((o) => o.text))) out.push('options must be distinct')
      break
    case 'order':
      if (q.items.length < 3) out.push('needs at least 3 items')
      if (!unique(q.items)) out.push('items must be distinct')
      break
    case 'numeric':
      if (!(q.min < q.max)) out.push('min must be below max')
      if (q.answer < q.min || q.answer > q.max) out.push('answer must sit inside [min, max]')
      break
    case 'match':
      if (q.pairs.length < 3) out.push('needs at least 3 pairs')
      if (!unique(q.pairs.map((p) => p.left)) || !unique(q.pairs.map((p) => p.right))) out.push('pair sides must be distinct')
      break
    case 'spot': {
      const nodes = new Set(q.diagram.nodes.map((n) => n.id))
      if (!nodes.has(q.answer)) out.push(`answer node "${q.answer}" is not in the diagram`)
      for (const e of q.diagram.edges) if (!nodes.has(e.from) || !nodes.has(e.to)) out.push(`edge ${e.from}→${e.to} uses an unknown node`)
      for (const n of q.diagram.nodes) {
        if (n.x < 0 || n.y < 0 || n.x > q.diagram.width || n.y > q.diagram.height) out.push(`node "${n.id}" is outside the diagram`)
      }
      break
    }
  }
  return out
}
