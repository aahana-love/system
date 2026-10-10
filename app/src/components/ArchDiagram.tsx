import type { Diagram } from '../content/types'

const W = 132
const H = 50

/**
 * Boxes-and-arrows architecture diagram. Used in lessons and in
 * "spot the fault" questions, where boxes become clickable.
 */
export function ArchDiagram({
  diagram,
  selectable = false,
  selected,
  correct,
  wrong,
  onSelect,
  label,
  highlight,
}: {
  diagram: Diagram
  selectable?: boolean
  selected?: string | null
  correct?: string
  wrong?: string | null
  onSelect?: (id: string) => void
  label?: string
  /** Nodes drawn emphasised; the rest fade. Edges between two lit nodes are emphasised too. */
  highlight?: string[]
}) {
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]))
  return (
    <div className="overflow-x-auto">
    <svg
      viewBox={`0 0 ${diagram.width} ${diagram.height}`}
      className="h-auto w-full min-w-[560px] font-display"
      role={selectable ? 'group' : 'img'}
      aria-label={label ?? 'Architecture diagram'}
    >
      <defs>
        <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--ink-3)" />
        </marker>
      </defs>
      {diagram.edges.map((e, i) => {
        const a = byId.get(e.from)!
        const b = byId.get(e.to)!
        const [x1, y1] = edgePoint(a.x, a.y, b.x, b.y)
        const [x2, y2] = edgePoint(b.x, b.y, a.x, a.y)
        const lit = !highlight || (highlight.includes(e.from) && highlight.includes(e.to))
        return (
          <g key={i} opacity={lit ? 1 : 0.35}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={highlight && lit ? 'var(--ink)' : 'var(--ink-3)'} strokeWidth={highlight && lit ? 2.4 : 1.6} markerEnd="url(#arrowhead)" />
            {e.label && (
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle" fontSize={11} fill="var(--ink-2)" className="font-mono">
                {e.label}
              </text>
            )}
          </g>
        )
      })}
      {diagram.nodes.map((n) => {
        const isSel = selected === n.id
        const isCorrect = correct === n.id
        const isWrong = wrong === n.id
        const isLit = highlight?.includes(n.id) ?? false
        const stroke = isCorrect ? 'var(--good)' : isWrong ? 'var(--bad)' : isSel ? 'var(--focus)' : isLit ? 'var(--ink)' : 'var(--ink-3)'
        const fill = isCorrect ? 'var(--good-bg)' : isWrong ? 'var(--bad-bg)' : 'var(--surface)'
        const box = (
          <>
            <rect
              x={n.x - W / 2}
              y={n.y - H / 2}
              width={W}
              height={H}
              rx={9}
              fill={fill}
              stroke={stroke}
              strokeWidth={isSel || isCorrect || isWrong || isLit ? 2.6 : 1.4}
            />
            <text x={n.x} y={n.sub ? n.y - 3 : n.y + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--ink)">
              {n.label}
            </text>
            {n.sub && (
              <text x={n.x} y={n.y + 13} textAnchor="middle" fontSize={10.5} fill="var(--ink-2)" className="font-mono">
                {n.sub}
              </text>
            )}
          </>
        )
        const dim = highlight && !isLit ? 0.5 : 1
        if (!selectable) return <g key={n.id} opacity={dim}>{box}</g>
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSel}
            aria-label={n.sub ? `${n.label}, ${n.sub}` : n.label}
            className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[var(--focus)] [&:focus-visible>rect]:stroke-[3]"
            onClick={() => onSelect?.(n.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect?.(n.id)
              }
            }}
          >
            {box}
          </g>
        )
      })}
    </svg>
    </div>
  )
}

/** Where the line from (x,y) toward (tx,ty) leaves the box centered at (x,y). */
function edgePoint(x: number, y: number, tx: number, ty: number): [number, number] {
  const dx = tx - x
  const dy = ty - y
  if (dx === 0 && dy === 0) return [x, y]
  const sx = Math.abs(dx) / (W / 2 + 4)
  const sy = Math.abs(dy) / (H / 2 + 4)
  const s = Math.max(sx, sy)
  return [x + dx / s, y + dy / s]
}
