import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { getTerm } from '../content/terms'
import { conceptById, phases } from '../content/roadmap'
import { useUi } from '../state/ui'
import { useProgressMap } from '../engine/hooks'
import { markPrimerSeen, prereqCovered } from '../engine/progress'
import { RichText } from './RichText'
import { Icon } from './Icon'
import { lineColor } from './phase'

/** Side drawer (bottom sheet on phones) showing the term on top of the stack. */
export function TermDrawer() {
  const { drawer, backTerm, closeDrawer, openTerm } = useUi()
  const top = drawer.at(-1)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!top) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        backTerm()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [top, backTerm])

  useEffect(() => {
    if (top) panelRef.current?.focus()
  }, [top])

  return (
    <AnimatePresence>
      {top && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-40 bg-black/25 md:bg-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            key="panel"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Term details"
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[82vh] flex-col rounded-t-2xl border border-rule bg-surface shadow-2xl outline-none md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[420px] md:rounded-none md:border-y-0 md:border-r-0"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <header className="flex items-center gap-2 border-b border-rule px-4 py-3">
              {drawer.length > 1 && (
                <button
                  type="button"
                  onClick={backTerm}
                  className="rounded-md p-1.5 text-ink-2 hover:bg-surface-2"
                  aria-label="Back to previous term"
                >
                  <Icon name="back" />
                </button>
              )}
              <nav aria-label="Terms you opened" className="min-w-0 flex-1 truncate font-mono text-xs text-ink-3">
                {drawer.map((id, i) => (
                  <span key={id}>
                    {i > 0 && <span className="px-1">→</span>}
                    {i < drawer.length - 1 ? (
                      <button type="button" className="hover:text-ink" onClick={() => openTerm(id)}>
                        {getTerm(id)?.label ?? id}
                      </button>
                    ) : (
                      <span className="text-ink-2">{getTerm(id)?.label ?? id}</span>
                    )}
                  </span>
                ))}
              </nav>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-md p-1.5 text-ink-2 hover:bg-surface-2"
                aria-label="Close"
              >
                <Icon name="close" />
              </button>
            </header>
            <TermBody id={top} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function TermBody({ id }: { id: string }) {
  const term = getTerm(id)
  const rows = useProgressMap()
  const closeDrawer = useUi((s) => s.closeDrawer)
  if (!term) return <p className="p-5 text-ink-2">This term isn't in the glossary yet.</p>
  const concept = term.conceptId ? conceptById.get(term.conceptId) : undefined
  const phase = concept ? phases[concept.phase] : undefined
  const row = concept ? rows?.get(concept.id) : undefined

  return (
    <div className="overflow-y-auto px-5 pt-5 pb-8">
      <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">
        {term.kind === 'concept' && phase ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-5 rounded-full" style={{ background: lineColor(phase.id) }} />
            Concept · {phase.short}
          </span>
        ) : (
          'Term'
        )}
      </p>
      <h2 className="mt-2 text-2xl leading-tight font-extrabold">{term.label}</h2>
      <p className="mt-3 text-[1.05rem] leading-snug font-semibold text-ink">{term.oneLiner}</p>
      {term.body && (
        <p className="mt-4 font-serif text-[1.05rem] leading-relaxed text-ink">
          <RichText text={term.body} link exclude={id} />
        </p>
      )}

      {concept && term.kind === 'glossary' && (
        <p className="mt-5 text-sm text-ink-2">
          Taught in full in{' '}
          <TermJump id={concept.id} label={concept.title} />.
        </p>
      )}

      {concept && term.kind === 'concept' && (
        <div className="mt-6 space-y-3 border-t border-rule pt-5">
          {concept.ready ? (
            <Link
              to={`/c/${concept.id}`}
              onClick={closeDrawer}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-bg hover:opacity-90"
            >
              Open the full lesson <Icon name="arrow" size={16} />
            </Link>
          ) : (
            <p className="text-sm text-ink-2">
              The full lesson arrives with milestone {phase?.milestone}. This primer is enough to continue for now.
            </p>
          )}
          {prereqCovered(row) ? (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-good">
              <Icon name="check" size={16} /> {row?.practicedAt ? 'You practiced this concept' : 'Primer read'}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => markPrimerSeen(concept.id)}
              className="block rounded-lg border border-rule px-4 py-2 text-sm font-semibold hover:bg-surface-2"
            >
              I've read this primer
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function TermJump({ id, label }: { id: string; label: string }) {
  const openTerm = useUi((s) => s.openTerm)
  return (
    <button type="button" onClick={() => openTerm(id)} className="font-semibold text-focus underline underline-offset-2">
      {label}
    </button>
  )
}
