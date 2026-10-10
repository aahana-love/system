import { useMemo } from 'react'
import { Reorder } from 'motion/react'
import type { Question } from '../../content/types'
import { emptyAnswer, parseNumber, scrambledOrder, shuffle, type Answer } from '../../engine/grading'
import { RichText } from '../../components/RichText'
import { ArchDiagram } from '../../components/ArchDiagram'
import { Icon } from '../../components/Icon'
import { ReportButton } from '../../components/ReportButton'

export const TYPE_LABEL: Record<Question['type'], string> = {
  single: 'Pick one',
  multi: 'Pick all that apply',
  order: 'Put in order',
  numeric: 'Estimate',
  match: 'Match the pairs',
  spot: 'Spot the fault',
}

/** Fresh answer state; order questions start scrambled. */
export function initialAnswer(q: Question): Answer {
  if (q.type === 'order') return { type: 'order', order: scrambledOrder(q.items.length) }
  return emptyAnswer(q)
}

/** Display order of options, reshuffled whenever `seed` changes. */
export function useOptionOrder(q: Question, seed: number): number[] {
  return useMemo(() => {
    if (q.type === 'single' || q.type === 'multi') return shuffle(q.options.map((_, i) => i))
    if (q.type === 'match') return shuffle(q.pairs.map((_, i) => i))
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id, seed])
}

interface Props {
  question: Question
  answer: Answer
  onAnswer: (a: Answer) => void
  submitted: boolean
  correct?: boolean
  order: number[]
  showKeys?: boolean
}

export function QuestionView({ question: q, answer, onAnswer, submitted, correct, order, showKeys }: Props) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">{TYPE_LABEL[q.type]}</p>
      <h3 className="mt-2 text-xl leading-snug font-bold text-balance">
        <RichText text={q.prompt} />
      </h3>
      <div className="mt-5">
        {q.type === 'single' && answer.type === 'single' && (
          <ChoiceList
            options={q.options}
            order={order}
            chosen={answer.choice === null ? [] : [answer.choice]}
            correctSet={[q.answer]}
            submitted={submitted}
            showKeys={showKeys}
            onToggle={(i) => onAnswer({ type: 'single', choice: i })}
          />
        )}
        {q.type === 'multi' && answer.type === 'multi' && (
          <ChoiceList
            multi
            options={q.options}
            order={order}
            chosen={answer.choices}
            correctSet={q.answers}
            submitted={submitted}
            showKeys={showKeys}
            onToggle={(i) =>
              onAnswer({
                type: 'multi',
                choices: answer.choices.includes(i) ? answer.choices.filter((c) => c !== i) : [...answer.choices, i],
              })
            }
          />
        )}
        {q.type === 'order' && answer.type === 'order' && (
          <OrderList items={q.items} order={answer.order} submitted={submitted} onChange={(o) => onAnswer({ type: 'order', order: o })} />
        )}
        {q.type === 'numeric' && answer.type === 'numeric' && (
          <NumericInput q={q} raw={answer.raw} submitted={submitted} correct={correct} onChange={(raw) => onAnswer({ type: 'numeric', raw })} />
        )}
        {q.type === 'match' && answer.type === 'match' && (
          <MatchTable
            pairs={q.pairs}
            rightOrder={order}
            mapping={answer.mapping}
            submitted={submitted}
            onChange={(mapping) => onAnswer({ type: 'match', mapping })}
          />
        )}
        {q.type === 'spot' && answer.type === 'spot' && (
          <div className="rounded-xl border border-rule bg-surface p-3">
            <ArchDiagram
              diagram={q.diagram}
              selectable={!submitted}
              selected={answer.node}
              correct={submitted ? q.answer : undefined}
              wrong={submitted && answer.node !== q.answer ? answer.node : null}
              onSelect={(node) => onAnswer({ type: 'spot', node })}
              label="Click the component you think is the problem"
            />
            {!submitted && <p className="mt-2 text-center text-sm text-ink-3">Click a box to choose it.</p>}
          </div>
        )}
      </div>
      {submitted && <Feedback q={q} correct={Boolean(correct)} />}
    </div>
  )
}

function ChoiceList({
  options,
  order,
  chosen,
  correctSet,
  submitted,
  multi = false,
  showKeys,
  onToggle,
}: {
  options: { text: string; why?: string }[]
  order: number[]
  chosen: number[]
  correctSet: number[]
  submitted: boolean
  multi?: boolean
  showKeys?: boolean
  onToggle: (i: number) => void
}) {
  return (
    <ul className="space-y-2" role={multi ? 'group' : 'radiogroup'}>
      {order.map((i, pos) => {
        const isChosen = chosen.includes(i)
        const isRight = correctSet.includes(i)
        let tone = 'border-rule bg-surface hover:border-ink-3'
        if (!submitted && isChosen) tone = 'border-focus bg-surface ring-1 ring-focus'
        if (submitted && isRight) tone = 'border-good bg-good-bg'
        if (submitted && isChosen && !isRight) tone = 'border-bad bg-bad-bg'
        if (submitted && !isChosen && !isRight) tone = 'border-rule bg-surface opacity-70'
        const showWhy = submitted && options[i].why && (isChosen || isRight)
        return (
          <li key={i}>
            <button
              type="button"
              role={multi ? 'checkbox' : 'radio'}
              aria-checked={isChosen}
              disabled={submitted}
              onClick={() => onToggle(i)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-default ${tone}`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 ${multi ? 'rounded-md' : 'rounded-full'} ${
                  isChosen ? 'border-ink bg-ink text-bg' : 'border-ink-3'
                }`}
              >
                {isChosen && <Icon name="check" size={13} />}
              </span>
              <span className="flex-1">
                <span className="block leading-snug">
                  <RichText text={options[i].text} />
                </span>
                {showWhy && (
                  <span className="mt-1.5 block font-serif text-[0.95rem] leading-snug text-ink-2">
                    <RichText text={options[i].why!} />
                  </span>
                )}
              </span>
              {showKeys && !submitted && <kbd className="mt-0.5 font-mono text-[11px] text-ink-3">{pos + 1}</kbd>}
              {submitted && isRight && <span className="mt-0.5 font-mono text-[11px] font-semibold text-good">correct</span>}
              {submitted && isChosen && !isRight && <span className="mt-0.5 font-mono text-[11px] font-semibold text-bad">your pick</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function OrderList({
  items,
  order,
  submitted,
  onChange,
}: {
  items: string[]
  order: number[]
  submitted: boolean
  onChange: (o: number[]) => void
}) {
  const move = (pos: number, delta: number) => {
    const next = order.slice()
    const target = pos + delta
    if (target < 0 || target >= next.length) return
    ;[next[pos], next[target]] = [next[target], next[pos]]
    onChange(next)
  }
  if (submitted) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-2">Your order</p>
          <ol className="space-y-1.5">
            {order.map((idx, pos) => (
              <li
                key={idx}
                className={`flex gap-3 rounded-lg border px-3 py-2 text-sm ${idx === pos ? 'border-good bg-good-bg' : 'border-bad bg-bad-bg'}`}
              >
                <span className="font-mono text-ink-3">{pos + 1}</span>
                {items[idx]}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-2">Correct order</p>
          <ol className="space-y-1.5">
            {items.map((text, pos) => (
              <li key={pos} className="flex gap-3 rounded-lg border border-rule bg-surface px-3 py-2 text-sm">
                <span className="font-mono text-ink-3">{pos + 1}</span>
                {text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    )
  }
  return (
    <>
      <Reorder.Group axis="y" values={order} onReorder={onChange} className="space-y-2">
        {order.map((idx, pos) => (
          <Reorder.Item
            key={idx}
            value={idx}
            className="flex items-center gap-2 rounded-xl border border-rule bg-surface py-2 pr-2 pl-3 shadow-sm active:cursor-grabbing"
            data-order-item={items[idx]}
          >
            <span className="cursor-grab text-ink-3" aria-hidden="true">
              <Icon name="grip" size={16} />
            </span>
            <span className="w-5 font-mono text-sm text-ink-3">{pos + 1}</span>
            <span className="flex-1 leading-snug">{items[idx]}</span>
            <button
              type="button"
              onClick={() => move(pos, -1)}
              disabled={pos === 0}
              className="rounded-md p-1.5 text-ink-2 hover:bg-surface-2 disabled:opacity-25"
              aria-label={`Move up: ${items[idx]}`}
            >
              <Icon name="up" size={16} />
            </button>
            <button
              type="button"
              onClick={() => move(pos, 1)}
              disabled={pos === order.length - 1}
              className="rounded-md p-1.5 text-ink-2 hover:bg-surface-2 disabled:opacity-25"
              aria-label={`Move down: ${items[idx]}`}
            >
              <Icon name="down" size={16} />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <p className="mt-2 text-sm text-ink-3">Drag the rows, or use the arrows.</p>
    </>
  )
}

function NumericInput({
  q,
  raw,
  submitted,
  correct,
  onChange,
}: {
  q: Extract<Question, { type: 'numeric' }>
  raw: string
  submitted: boolean
  correct?: boolean
  onChange: (raw: string) => void
}) {
  const parsed = parseNumber(raw)
  const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 3 })
  return (
    <div>
      <label className="flex max-w-sm items-center gap-2 rounded-xl border border-rule bg-surface px-4 py-3 focus-within:border-focus">
        <span className="sr-only">Your answer</span>
        <input
          value={raw}
          onChange={(e) => onChange(e.target.value)}
          disabled={submitted}
          inputMode="decimal"
          autoComplete="off"
          placeholder="Your answer"
          className="min-w-0 flex-1 bg-transparent font-mono text-lg outline-none"
          data-numeric-input
        />
        {q.unit && <span className="font-mono text-ink-2">{q.unit}</span>}
      </label>
      {!submitted && (
        <p className="mt-2 text-sm text-ink-3">
          {raw && parsed === null
            ? "That doesn't read as a number. Try 12000, 1.2k, 3e6 or 5 lakh."
            : raw && parsed !== null
              ? `Reads as ${fmt(parsed)}`
              : 'You can type 12000, 1.2k, 3e6 or 5 lakh.'}
        </p>
      )}
      {submitted && (
        <p className={`mt-2 text-sm font-semibold ${correct ? 'text-good' : 'text-bad'}`}>
          Accepted range: {fmt(q.min)} to {fmt(q.max)}
          {q.unit ? ` ${q.unit}` : ''}. Expected about {fmt(q.answer)}.
        </p>
      )}
    </div>
  )
}

function MatchTable({
  pairs,
  rightOrder,
  mapping,
  submitted,
  onChange,
}: {
  pairs: { left: string; right: string }[]
  rightOrder: number[]
  mapping: (number | null)[]
  submitted: boolean
  onChange: (m: (number | null)[]) => void
}) {
  return (
    <ul className="space-y-2.5">
      {pairs.map((p, i) => {
        const chosen = mapping[i]
        const ok = chosen === i
        return (
          <li
            key={i}
            className={`grid gap-2 rounded-xl border px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:items-center ${
              submitted ? (ok ? 'border-good bg-good-bg' : 'border-bad bg-bad-bg') : 'border-rule bg-surface'
            }`}
          >
            <span className="font-semibold">{p.left}</span>
            <span>
              <select
                value={chosen ?? ''}
                disabled={submitted}
                onChange={(e) => {
                  const next = mapping.slice()
                  next[i] = e.target.value === '' ? null : Number(e.target.value)
                  onChange(next)
                }}
                aria-label={`Match for ${p.left}`}
                className="w-full rounded-lg border border-rule bg-surface px-2 py-2 text-sm"
              >
                <option value="">Choose…</option>
                {rightOrder.map((j) => (
                  <option key={j} value={j}>
                    {pairs[j].right}
                  </option>
                ))}
              </select>
              {submitted && !ok && <span className="mt-1 block text-sm text-ink-2">Correct: {p.right}</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function Feedback({ q, correct }: { q: Question; correct: boolean }) {
  return (
    <div className={`mt-6 rounded-xl border px-5 py-4 ${correct ? 'border-good bg-good-bg' : 'border-bad bg-bad-bg'}`} role="status">
      <p className={`flex items-center gap-2 font-bold ${correct ? 'text-good' : 'text-bad'}`}>
        {correct ? <Icon name="check" /> : <Icon name="close" />}
        {correct ? 'Correct' : 'Not quite'}
      </p>
      <p className="mt-2 font-serif text-[1.02rem] leading-relaxed text-ink">
        <RichText text={q.explanation} link />
      </p>
      <div className="mt-3">
        <ReportButton target={q.id} />
      </div>
    </div>
  )
}
