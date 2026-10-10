import { Fragment, useMemo, type ReactNode } from 'react'
import { splitTerms } from '../content/matcher'
import { termMatcher } from '../content/terms'
import { Term } from './Term'

/**
 * Renders short text with `code`, **bold** and *italic*, and optionally links
 * the first mention of each glossary term.
 */
export function RichText({ text, link = false, exclude }: { text: string; link?: boolean; exclude?: string }) {
  const nodes = useMemo(() => render(text, link, exclude), [text, link, exclude])
  return <>{nodes}</>
}

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g

function render(text: string, link: boolean, exclude?: string): ReactNode[] {
  const seen = new Set<string>()
  const parts = text.split(INLINE).filter(Boolean)
  return parts.map((part, i) => {
    if (part.startsWith('`')) {
      return (
        <code key={i} className="rounded bg-surface-2 px-1 py-px font-mono text-[0.88em]">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**')) return <strong key={i} className="font-semibold">{linked(part.slice(2, -2), i)}</strong>
    if (part.startsWith('*')) return <em key={i}>{linked(part.slice(1, -1), i)}</em>
    return <Fragment key={i}>{linked(part, i)}</Fragment>
  })

  function linked(s: string, key: number): ReactNode {
    if (!link) return s
    return splitTerms(s, termMatcher, seen, exclude).map((seg, j) =>
      typeof seg === 'string' ? (
        <Fragment key={`${key}-${j}`}>{seg}</Fragment>
      ) : (
        <Term key={`${key}-${j}`} id={seg.id}>
          {seg.text}
        </Term>
      ),
    )
  }
}
