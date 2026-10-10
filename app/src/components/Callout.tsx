import type { ReactNode } from 'react'

const LABELS = {
  analogy: 'Everyday picture',
  interview: 'Remember this',
  note: 'Note',
  warning: 'Watch out',
} as const

/** A boxed aside inside a lesson. */
export function Callout({
  kind = 'note',
  title,
  children,
}: {
  kind?: keyof typeof LABELS
  title?: string
  children: ReactNode
}) {
  const accent = kind === 'warning' ? 'var(--bad)' : kind === 'interview' ? 'var(--ink)' : 'var(--rule)'
  return (
    <aside
      className="rounded-xl border border-rule bg-surface px-5 py-4 [&>*+*]:mt-2"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">{LABELS[kind]}</p>
      {title && <p className="font-display text-lg font-bold">{title}</p>}
      <div className="[&>p+p]:mt-3">{children}</div>
    </aside>
  )
}
