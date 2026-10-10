// Finds glossary terms inside plain text. Shared by the build-time MDX plugin
// (lessons) and the runtime linkifier (primers, explanations), so both link
// exactly the same words.
//
// Rules:
// - Longest alias wins ("cache-aside" before "cache").
// - Aliases with any capital letter match case-sensitively ("A record" must
//   not match "a record"); all-lowercase aliases ignore case.
// - A trailing "s"/"es" plural is allowed.
// - Words inside hyphenated compounds don't match ("cache" in "cache-aside").

export interface TermEntry {
  id: string
  aliases: string[]
}

interface AliasInfo {
  id: string
  alias: string
  caseSensitive: boolean
}

export interface Matcher {
  regex: RegExp
  resolve(base: string): string | null
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function buildMatcher(entries: TermEntry[]): Matcher {
  const byLower = new Map<string, AliasInfo>()
  for (const e of entries) {
    for (const alias of e.aliases) {
      byLower.set(alias.toLowerCase(), { id: e.id, alias, caseSensitive: /[A-Z]/.test(alias) })
    }
  }
  const aliases = [...byLower.values()].map((a) => a.alias).sort((a, b) => b.length - a.length)
  const body = aliases.length ? aliases.map(escape).join('|') : '(?!)'
  const regex = new RegExp(`(?<![\\w-])(${body})(e?s)?(?![\\w-])`, 'gi')
  return {
    regex,
    resolve(base) {
      const info = byLower.get(base.toLowerCase())
      if (!info) return null
      if (info.caseSensitive && info.alias !== base) return null
      return info.id
    },
  }
}

export type Segment = string | { id: string; text: string }

/**
 * Splits text into plain strings and term links. Each term is linked once:
 * ids already in `seen` are skipped, and newly linked ids are added to it.
 */
export function splitTerms(text: string, matcher: Matcher, seen: Set<string>, exclude?: string): Segment[] {
  const out: Segment[] = []
  const re = new RegExp(matcher.regex.source, matcher.regex.flags)
  let last = 0
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const id = matcher.resolve(m[1])
    if (!id || id === exclude || seen.has(id)) continue
    seen.add(id)
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push({ id, text: m[0] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
