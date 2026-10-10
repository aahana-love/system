export type StationState = 'todo' | 'here' | 'done' | 'mastered' | 'locked' | 'planned'

/**
 * A stop on a transit line. The roadmap, the "next stop" panel and each
 * concept's five steps are all drawn with these.
 */
export function Station({ state, color, size = 22 }: { state: StationState; color: string; size?: number }) {
  const c = 12
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 overflow-visible">
      {state === 'here' && <circle cx={c} cy={c} r={7} fill="none" stroke={color} strokeWidth={2} className="here-pulse" />}
      {state === 'mastered' && <circle cx={c} cy={c} r={10.5} fill="none" stroke={color} strokeWidth={1.6} />}
      {state === 'todo' && <circle cx={c} cy={c} r={6.5} fill="var(--surface)" stroke={color} strokeWidth={3} />}
      {state === 'locked' && (
        <circle cx={c} cy={c} r={6.5} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={2} strokeDasharray="3 2.4" />
      )}
      {state === 'planned' && (
        <circle cx={c} cy={c} r={4} fill="var(--surface)" stroke={color} strokeWidth={2} opacity={0.6} />
      )}
      {state === 'here' && (
        <>
          <circle cx={c} cy={c} r={7.5} fill={color} />
          <circle cx={c} cy={c} r={3} fill="var(--surface)" />
        </>
      )}
      {(state === 'done' || state === 'mastered') && (
        <>
          <circle cx={c} cy={c} r={7.5} fill={color} />
          <path d="M8.6 12.2l2.3 2.3 4.6-4.8" fill="none" stroke="var(--surface)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}
