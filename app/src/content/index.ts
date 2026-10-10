import type { Card, Question } from './types'

const questionModules = import.meta.glob<{ questions: Question[] }>('./concepts/*/questions.ts', { eager: true })
const cardModules = import.meta.glob<{ cards: Card[] }>('./concepts/*/cards.ts', { eager: true })

export const questions: Question[] = Object.values(questionModules).flatMap((m) => m.questions)
export const cards: Card[] = Object.values(cardModules).flatMap((m) => m.cards)

export const questionById = new Map(questions.map((q) => [q.id, q]))
export const cardById = new Map(cards.map((c) => [c.id, c]))

export const questionsFor = (conceptId: string) => questions.filter((q) => q.concept === conceptId)
export const checksFor = (conceptId: string) => questionsFor(conceptId).filter((q) => q.check)
export const practiceFor = (conceptId: string) => questionsFor(conceptId).filter((q) => !q.check)
export const cardsFor = (conceptId: string) => cards.filter((c) => c.concept === conceptId)

/** Lesson files that exist, keyed like "./concepts/dns/learn.mdx". */
export const lessonFiles = new Set(Object.keys(import.meta.glob('./concepts/*/*.mdx')))
