import { createContext, useContext, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { CacheWritesDiagram } from '../simulators/cache/CacheWritesDiagram'

// Scrollytelling: a diagram stays pinned while you read; each step you scroll
// to changes what the diagram shows.

const DIAGRAMS: Record<string, ComponentType<{ active: string | null }>> = {
  cacheWrites: CacheWritesDiagram,
}

const ActiveCtx = createContext<{ active: string | null; setActive: (id: string) => void }>({
  active: null,
  setActive: () => {},
})

export function Scrolly({ diagram, children }: { diagram: string; children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null)
  const Diagram = DIAGRAMS[diagram]
  return (
    <ActiveCtx.Provider value={{ active, setActive }}>
      <div className="my-10 grid gap-6 lg:-mx-16 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="order-2 lg:order-1">{children}</div>
        <div className="order-1 lg:order-2">
          <div className="sticky top-14 z-10 rounded-2xl border border-rule bg-surface p-3 shadow-sm md:top-4 lg:top-24">
            {Diagram ? <Diagram active={active} /> : null}
          </div>
        </div>
      </div>
    </ActiveCtx.Provider>
  )
}

export function Step({ id, children }: { id: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { active, setActive } = useContext(ActiveCtx)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(id)),
      { rootMargin: '-35% 0px -55% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [id, setActive])

  // The first step is active until you scroll.
  useEffect(() => {
    if (active === null) setActive(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={ref}
      data-step={id}
      className={`border-l-4 py-2 pl-5 transition-opacity duration-300 [&>*+*]:mt-3 ${
        active === id ? 'border-ink opacity-100' : 'border-rule opacity-50'
      } mb-[18vh] last:mb-0`}
    >
      {children}
    </div>
  )
}
