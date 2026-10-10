// Build-time MDX plugin: wraps the first mention of every glossary term in a
// lesson with <Term id="…">, so hovering shows a definition and clicking opens
// the term drawer. Authors write plain prose; linking is automatic.
import type { Root, PhrasingContent } from 'mdast'
import { findAndReplace } from 'mdast-util-find-and-replace'
import { termMatcher } from '../content/terms.ts'

const SKIP = new Set(['heading', 'link', 'linkReference', 'inlineCode', 'code'])

export function remarkTermLinks() {
  return (tree: Root, file: { path?: string; history?: string[] }) => {
    const path = file.path ?? file.history?.[0] ?? ''
    const current = /concepts[\\/]([^\\/]+)[\\/]/.exec(path)?.[1]
    const seen = new Set<string>()
    findAndReplace(
      tree,
      [
        [
          new RegExp(termMatcher.regex.source, termMatcher.regex.flags),
          (value: string, base: string) => {
            const id = termMatcher.resolve(base)
            if (!id || id === current || seen.has(id)) return false
            seen.add(id)
            return {
              type: 'mdxJsxTextElement',
              name: 'Term',
              attributes: [{ type: 'mdxJsxAttribute', name: 'id', value: id }],
              children: [{ type: 'text', value }],
            } as unknown as PhrasingContent
          },
        ],
      ],
      {
        ignore: (node) =>
          SKIP.has(node.type) ||
          ((node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') &&
            ['Term', 'Quiz', 'Kbd'].includes((node as unknown as { name: string }).name)),
      },
    )
  }
}
