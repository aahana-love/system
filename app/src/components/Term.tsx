import { useId, useState, type ReactNode } from 'react'
import { getTerm } from '../content/terms'
import { useUi } from '../state/ui'

/**
 * An inline link to a glossary term or concept. Hover or focus shows the
 * one-line definition; click opens the drawer without leaving the page.
 */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const openTerm = useUi((s) => s.openTerm)
  const [show, setShow] = useState(false)
  const tipId = useId()
  const term = getTerm(id)
  if (!term) return <>{children}</>
  return (
    <span className="relative inline">
      <button
        type="button"
        className="term inline cursor-help border-b-[1.5px] border-dotted border-ink-3 p-0 text-left font-[inherit] text-[inherit] leading-[inherit] hover:border-solid hover:border-focus focus-visible:border-focus"
        aria-describedby={show ? tipId : undefined}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={() => {
          setShow(false)
          openTerm(id)
        }}
      >
        {children}
      </button>
      {show && (
        <span
          id={tipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 z-40 mb-2 block w-72 max-w-[80vw] rounded-lg border border-rule bg-surface px-3 py-2 font-display text-sm leading-snug font-normal text-ink not-italic shadow-lg"
        >
          <span className="block font-bold">{term.label}</span>
          <span className="mt-0.5 block text-ink-2">{term.oneLiner}</span>
          <span className="mt-1.5 block font-mono text-[11px] text-ink-3">Click for more</span>
        </span>
      )}
    </span>
  )
}
