import type { PhaseId } from '../content/types'

/** CSS color for a phase's line. */
export const lineColor = (phase: PhaseId) => `var(--line-${phase})`
