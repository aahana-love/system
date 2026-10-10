import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import MiniSearch from 'minisearch'
import { allTerms } from '../content/terms'
import { conceptById, phases } from '../content/roadmap'
import { useUi } from '../state/ui'
import { Icon } from './Icon'
import { lineColor } from './phase'

interface Doc {
  id: string
  label: string
  oneLiner: string
  body: string
  kind: 'concept' | 'glossary'
}

const docs: Doc[] = allTerms.map((t) => ({
  id: t.id,
  label: t.label,
  oneLiner: t.oneLiner,
  body: t.body ?? '',
  kind: t.kind,
}))

/** Ctrl+K search across concepts and glossary terms. */
export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, openTerm } = useUi()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const index = useMemo(() => {
    const ms = new MiniSearch<Doc>({
      fields: ['label', 'oneLiner', 'body'],
      storeFields: ['id'],
      searchOptions: { boost: { label: 4, oneLiner: 2 }, prefix: true, fuzzy: 0.2 },
    })
    ms.addAll(docs)
    return ms
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return docs.filter((d) => d.kind === 'concept' && conceptById.get(d.id)?.ready)
    return index
      .search(query)
      .slice(0, 12)
      .map((r) => docs.find((d) => d.id === r.id)!)
  }, [query, index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(!useUi.getState().paletteOpen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPaletteOpen])

  useEffect(() => {
    if (paletteOpen) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [paletteOpen])

  if (!paletteOpen) return null

  const choose = (d: Doc) => {
    setPaletteOpen(false)
    const c = conceptById.get(d.id)
    if (c?.ready) navigate(`/c/${c.id}`)
    else openTerm(d.id)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 px-4 pt-[12vh]" onClick={() => setPaletteOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="w-full max-w-xl overflow-hidden rounded-xl border border-rule bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-rule px-4">
          <Icon name="search" className="text-ink-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => Math.min(a + 1, results.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              } else if (e.key === 'Enter' && results[active]) {
                choose(results[active])
              } else if (e.key === 'Escape') {
                setPaletteOpen(false)
              }
            }}
            placeholder="Search concepts and terms: TTL, sharding, LRU…"
            aria-label="Search concepts and terms"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-ink-3"
          />
          <kbd className="rounded border border-rule px-1.5 py-0.5 font-mono text-[11px] text-ink-3">Esc</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-2" role="listbox" aria-label="Results">
          {results.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-2">No matches. Try a shorter word.</li>}
          {!query.trim() && results.length > 0 && (
            <li className="px-4 pt-1 pb-2 font-mono text-[11px] tracking-wider text-ink-3 uppercase">Lessons you can open now</li>
          )}
          {results.map((d, i) => {
            const c = conceptById.get(d.id)
            return (
              <li key={d.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(d)}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-left ${i === active ? 'bg-surface-2' : ''}`}
                >
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: c ? lineColor(c.phase) : 'var(--ink-3)' }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{d.label}</span>
                    <span className="block truncate text-sm text-ink-2">{d.oneLiner}</span>
                  </span>
                  <span className="mt-1 shrink-0 font-mono text-[11px] text-ink-3">
                    {c ? (c.ready ? 'Lesson' : phases[c.phase].short) : 'Term'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
