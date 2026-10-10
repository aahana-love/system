// Shapes of everything the app teaches. Content files are plain TS data so
// they can be validated in tests and read by the build (term linking).

export type PhaseId = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Phase {
  id: PhaseId
  name: string
  short: string
  /** Milestone that ships this phase's full lessons. */
  milestone: string
}

export interface Concept {
  id: string
  title: string
  phase: PhaseId
  prerequisites: string[]
  /** Other names that should link to this concept inside lessons. */
  aliases: string[]
  /** One line, shown on hover. */
  oneLiner: string
  /** 2-minute primer, shown in the drawer and at the prerequisite gate. */
  primer: string
  estMinutes: number
  /** True once learn.mdx, theory.mdx, questions and cards exist. */
  ready: boolean
}

export interface PlannedStop {
  title: string
  phase: PhaseId
  tier?: 'Easy' | 'Medium' | 'Hard' | 'Uber' | 'Amazon' | 'Basics' | 'Patterns' | 'Problems'
}

export interface GlossaryTerm {
  id: string
  label: string
  aliases: string[]
  oneLiner: string
  body?: string
  /** Concept that teaches this term in full. */
  conceptId?: string
}

export interface Option {
  text: string
  /** Why this option is right or wrong. */
  why?: string
}

interface QuestionBase {
  id: string
  concept: string
  prompt: string
  explanation: string
  difficulty: 1 | 2 | 3
  /** Quick check at the end of Learn. */
  check?: boolean
}

export interface SingleQuestion extends QuestionBase {
  type: 'single'
  options: Option[]
  answer: number
}

export interface MultiQuestion extends QuestionBase {
  type: 'multi'
  options: Option[]
  answers: number[]
}

export interface OrderQuestion extends QuestionBase {
  type: 'order'
  /** Items in the correct order. Shown shuffled. */
  items: string[]
}

export interface NumericQuestion extends QuestionBase {
  type: 'numeric'
  answer: number
  /** Accepted range. */
  min: number
  max: number
  unit?: string
}

export interface MatchQuestion extends QuestionBase {
  type: 'match'
  pairs: { left: string; right: string }[]
}

export interface DiagramNode {
  id: string
  label: string
  x: number
  y: number
  sub?: string
}

export interface Diagram {
  width: number
  height: number
  nodes: DiagramNode[]
  edges: { from: string; to: string; label?: string }[]
}

export interface SpotQuestion extends QuestionBase {
  type: 'spot'
  diagram: Diagram
  answer: string
}

export type Question =
  | SingleQuestion
  | MultiQuestion
  | OrderQuestion
  | NumericQuestion
  | MatchQuestion
  | SpotQuestion

export type QuestionType = Question['type']

export interface Card {
  id: string
  concept: string
  front: string
  back: string
}

export interface Source {
  label: string
  url?: string
}
