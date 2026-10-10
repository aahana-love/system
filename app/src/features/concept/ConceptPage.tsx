import { Navigate, useParams } from 'react-router'
import { conceptById, phases } from '../../content/roadmap'
import { cardsFor } from '../../content/index'
import { useProgressMap, useReviewCards } from '../../engine/hooks'
import { STEPS, conceptState, lockReason, prereqCovered, resumeStep, stepUnlocked, type StepId } from '../../engine/progress'
import { StepStrip } from '../../components/StepStrip'
import { lineColor } from '../../components/phase'
import { RichText } from '../../components/RichText'
import { NotFound } from '../../app/NotFound'
import { GateStep } from './GateStep'
import { LearnStep } from './LearnStep'
import { TheoryStep } from './TheoryStep'
import { PracticeStep } from './PracticeStep'
import { ConceptReviewStep } from './ConceptReviewStep'
import { Link } from 'react-router'

export function ConceptPage() {
  const { id = '', step } = useParams()
  const concept = conceptById.get(id)
  const rows = useProgressMap()
  const allCards = useReviewCards()

  if (!concept) return <NotFound />
  if (!rows || !allCards) return <div className="h-40" aria-busy="true" />

  const row = rows.get(id)
  const phase = phases[concept.phase]
  const color = lineColor(concept.phase)

  const header = (
    <header>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-wider text-ink-2 uppercase">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-7 rounded-full" style={{ background: color }} />
          Phase {phase.id} · {phase.short}
        </span>
        <span className="text-ink-3">about {concept.estMinutes} min</span>
      </p>
      <h1 className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl">{concept.title}</h1>
      <p className="mt-3 max-w-2xl text-lg leading-snug text-ink-2">{concept.oneLiner}</p>
    </header>
  )

  if (!concept.ready) {
    return (
      <div className="mx-auto max-w-3xl">
        {header}
        <section className="mt-8 rounded-xl border border-rule bg-surface p-6">
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">2-minute primer</p>
          <p className="mt-2 font-serif text-lg leading-relaxed">
            <RichText text={concept.primer} link exclude={concept.id} />
          </p>
          <p className="mt-5 text-sm text-ink-2">
            The full lesson (learn, theory, practice and review) arrives with milestone {phase.milestone}.
          </p>
        </section>
        <p className="mt-6">
          <Link to="/roadmap" className="font-semibold text-focus underline underline-offset-4">
            Back to the roadmap
          </Link>
        </p>
      </div>
    )
  }

  if (!step || !STEPS.some((s) => s.id === step)) {
    return <Navigate to={`/c/${id}/${resumeStep(concept, row, rows)}`} replace />
  }
  const current = step as StepId
  const cards = allCards.filter((c) => c.conceptId === id)
  const state = conceptState(concept, row, cards)
  const gateDone = Boolean(row?.prereqsAcknowledgedAt) || concept.prerequisites.every((p) => prereqCovered(rows.get(p)))

  return (
    <div className="mx-auto max-w-3xl">
      {header}
      <StepStrip conceptId={id} current={current} row={row} gateDone={gateDone} mastered={state === 'mastered'} color={color} />
      <div className="mt-10">
        {!stepUnlocked(current, row) ? (
          <div className="rounded-xl border border-rule bg-surface p-6">
            <p className="text-lg font-bold">This step is locked</p>
            <p className="mt-1 text-ink-2">{lockReason(current)}</p>
            <Link
              to={`/c/${id}/${resumeStep(concept, row, rows)}`}
              className="mt-4 inline-block font-semibold text-focus underline underline-offset-4"
            >
              Go to where you left off
            </Link>
          </div>
        ) : current === 'gate' ? (
          <GateStep concept={concept} rows={rows} />
        ) : current === 'learn' ? (
          <LearnStep concept={concept} row={row} />
        ) : current === 'theory' ? (
          <TheoryStep concept={concept} row={row} />
        ) : current === 'practice' ? (
          <PracticeStep concept={concept} row={row} cardIds={cardsFor(id).map((c) => c.id)} />
        ) : (
          <ConceptReviewStep concept={concept} cards={cards} />
        )}
      </div>
    </div>
  )
}
