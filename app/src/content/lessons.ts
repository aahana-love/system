import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

type LessonProps = { components?: Record<string, unknown> }
type LessonModule = { default: ComponentType<LessonProps> }

const loaders = import.meta.glob<LessonModule>('./concepts/*/*.mdx')
const cache = new Map<string, LazyExoticComponent<ComponentType<LessonProps>>>()

/** Lazily loaded lesson component for a concept's learn or theory part. */
export function lessonComponent(conceptId: string, part: 'learn' | 'theory') {
  const key = `./concepts/${conceptId}/${part}.mdx`
  const load = loaders[key]
  if (!load) return null
  let c = cache.get(key)
  if (!c) {
    c = lazy(load)
    cache.set(key, c)
  }
  return c
}
