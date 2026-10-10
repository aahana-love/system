import { motion } from 'motion/react'

type Node = 'app' | 'cache' | 'db'
const P: Record<Node, { x: number; y: number; label: string; sub: string }> = {
  app: { x: 170, y: 44, label: 'App server', sub: '' },
  cache: { x: 72, y: 206, label: 'Cache', sub: 'memory' },
  db: { x: 268, y: 206, label: 'Database', sub: 'source of truth' },
}

interface Arrow {
  from: Node
  to: Node
  label: string
  dashed?: boolean
}
interface Scene {
  title: string
  arrows: Arrow[]
  ack: string
  badge: string
  risk?: boolean
}

const SCENES: Record<string, Scene> = {
  through: {
    title: 'Write-through',
    arrows: [
      { from: 'app', to: 'cache', label: '1 SET' },
      { from: 'cache', to: 'db', label: '2 write' },
    ],
    ack: 'Acknowledged after both writes',
    badge: 'Reads are always fresh. Every write pays for two writes.',
  },
  back: {
    title: 'Write-back',
    arrows: [
      { from: 'app', to: 'cache', label: '1 SET' },
      { from: 'cache', to: 'db', label: '2 flush later', dashed: true },
    ],
    ack: 'Acknowledged right after step 1',
    badge: 'If the cache dies before the flush, those writes are lost.',
    risk: true,
  },
  around: {
    title: 'Write-around',
    arrows: [
      { from: 'app', to: 'db', label: '1 write' },
      { from: 'app', to: 'cache', label: '2 DELETE key', dashed: true },
    ],
    ack: 'Acknowledged after the database write',
    badge: 'The cache only holds data someone read. The first read after a write misses.',
  },
}

const BW = 116
const BH = 48

function edge(a: Node, b: Node) {
  const A = P[a]
  const B = P[b]
  const dx = B.x - A.x
  const dy = B.y - A.y
  const s = Math.max(Math.abs(dx) / (BW / 2 + 6), Math.abs(dy) / (BH / 2 + 6))
  return { x1: A.x + dx / s, y1: A.y + dy / s, x2: B.x - dx / s, y2: B.y - dy / s }
}

export function CacheWritesDiagram({ active }: { active: string | null }) {
  const scene = SCENES[active ?? 'through'] ?? SCENES.through
  return (
    <div>
      <p className="px-1 font-mono text-[11px] tracking-wider text-ink-3 uppercase">{scene.title}</p>
      <svg viewBox="0 0 340 250" className="h-auto w-full max-h-[34vh] lg:max-h-none" role="img" aria-label={`${scene.title}: ${scene.ack}. ${scene.badge}`}>
        <defs>
          <marker id="wd-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="var(--ink)" />
          </marker>
        </defs>
        {(['app', 'cache', 'db'] as Node[]).map((n) => (
          <g key={n}>
            <rect x={P[n].x - BW / 2} y={P[n].y - BH / 2} width={BW} height={BH} rx="10" fill="var(--surface)" stroke="var(--ink-3)" strokeWidth="1.4" />
            <text x={P[n].x} y={P[n].sub ? P[n].y - 3 : P[n].y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink)">
              {P[n].label}
            </text>
            {P[n].sub && (
              <text x={P[n].x} y={P[n].y + 13} textAnchor="middle" fontSize="10" fill="var(--ink-2)" className="font-mono">
                {P[n].sub}
              </text>
            )}
          </g>
        ))}
        {scene.arrows.map((a, i) => {
          const e = edge(a.from, a.to)
          const mx = (e.x1 + e.x2) / 2
          const my = (e.y1 + e.y2) / 2
          return (
            <g key={`${active}-${i}`}>
              <motion.line
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="var(--ink)"
                strokeWidth="2.2"
                strokeDasharray={a.dashed ? '6 5' : undefined}
                markerEnd="url(#wd-head)"
                // pathLength animation would overwrite the dash pattern, so dashed arrows just fade in.
                initial={a.dashed ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
                animate={a.dashed ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
                transition={{ delay: i * 0.45, duration: 0.45 }}
              />
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.45 + 0.3 }}>
                <rect x={mx - 46} y={my - 11} width="92" height="20" rx="10" fill="var(--surface-2)" />
                <text x={mx} y={my + 3.5} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ink)" className="font-mono">
                  {a.label}
                </text>
              </motion.g>
            </g>
          )
        })}
      </svg>
      <p className="px-1 text-sm font-semibold">{scene.ack}</p>
      <p className={`mt-1 px-1 text-sm ${scene.risk ? 'text-bad' : 'text-ink-2'}`}>{scene.badge}</p>
    </div>
  )
}
