import { Suspense } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, useScroll, useSpring } from 'motion/react'
import type { Concept } from '../../content/types'
import { lessonComponent } from '../../content/lessons'
import type { ProgressRow } from '../../engine/db'
import { patchProgress } from '../../engine/progress'
import { mdxComponents } from './mdxComponents'
import { lineColor } from '../../components/phase'
import { Icon } from '../../components/Icon'
import { ReportButton } from '../../components/ReportButton'

export function TheoryStep({ concept, row }: { concept: Concept; row?: ProgressRow }) {
  const Lesson = lessonComponent(concept.id, 'theory')
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  const finish = async () => {
    if (!row?.theoryReadAt) await patchProgress(concept.id, { theoryReadAt: Date.now() })
    navigate(`/c/${concept.id}/practice`)
  }

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-40 h-1 origin-left"
        style={{ scaleX, background: lineColor(concept.phase) }}
      />
      <article className="lesson">
        <Suspense fallback={<p className="text-ink-3">Loading theory…</p>}>{Lesson && <Lesson components={mdxComponents} />}</Suspense>
      </article>
      <div className="mt-6">
        <ReportButton target={`${concept.id}:theory`} />
      </div>
      <section className="mt-14 border-t-2 border-ink pt-8">
        {row?.theoryReadAt ? (
          <Link to={`/c/${concept.id}/practice`} className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 font-bold text-bg">
            Go to Practice <Icon name="arrow" size={16} />
          </Link>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold">Done reading?</h2>
            <p className="mt-1 text-ink-2">Practice unlocks when you finish the theory.</p>
            <button type="button" onClick={finish} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 font-bold text-bg">
              I've finished reading. Start Practice <Icon name="arrow" size={16} />
            </button>
          </>
        )}
      </section>
    </>
  )
}
