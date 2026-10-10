import Dexie, { type EntityTable } from 'dexie'

// Everything you do is stored in this browser's IndexedDB. Dates are stored as
// epoch milliseconds so backups are plain JSON.

export interface ProgressRow {
  conceptId: string
  /** You went past the prerequisite gate (possibly skipping some). */
  prereqsAcknowledgedAt?: number
  skippedPrereqs?: string[]
  /** You read this concept's 2-minute primer (counts as a prerequisite). */
  primerSeenAt?: number
  checksPassedAt?: number
  theoryReadAt?: number
  /** Best practice score, 0–1. */
  practiceBest?: number
  /** First time practice reached the pass mark. */
  practicedAt?: number
  updatedAt: number
}

export type AttemptMode = 'check' | 'practice' | 'mistakes'

export interface AttemptRow {
  id?: number
  questionId: string
  conceptId: string
  correct: boolean
  mode: AttemptMode
  at: number
}

export interface ReviewCardRow {
  cardId: string
  conceptId: string
  due: number
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  learning_steps: number
  reps: number
  lapses: number
  state: number
  last_review: number | null
  addedAt: number
}

export interface ReviewLogRow {
  id?: number
  cardId: string
  rating: number
  at: number
}

export interface ReportRow {
  id?: number
  target: string
  note: string
  at: number
}

export interface MetaRow {
  key: string
  value: unknown
}

export class StudyDB extends Dexie {
  progress!: EntityTable<ProgressRow, 'conceptId'>
  attempts!: EntityTable<AttemptRow, 'id'>
  reviewCards!: EntityTable<ReviewCardRow, 'cardId'>
  reviewLogs!: EntityTable<ReviewLogRow, 'id'>
  reports!: EntityTable<ReportRow, 'id'>
  meta!: EntityTable<MetaRow, 'key'>

  constructor(name = 'system-design-study') {
    super(name)
    this.version(1).stores({
      progress: 'conceptId',
      attempts: '++id, questionId, conceptId, at',
      reviewCards: 'cardId, conceptId, due',
      reviewLogs: '++id, cardId, at',
      reports: '++id, at',
      meta: 'key',
    })
  }
}

export const db = new StudyDB()

export const TABLES = ['progress', 'attempts', 'reviewCards', 'reviewLogs', 'reports', 'meta'] as const
export type TableName = (typeof TABLES)[number]
