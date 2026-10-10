import { useMemo, useState } from 'react'
import { OP_TEXT, canStep, createRace, isBlocked, isDone, isFinished, program, runRandom, step, type RaceState, type ThreadId } from './raceModel'
import { mulberry32 } from '../random'
import { Icon } from '../../components/Icon'

/** Two threads add 1 to one counter. You decide who moves next. */
export function RaceDemo() {
  const [useLock, setUseLock] = useState(false)
  const [s, setS] = useState<RaceState>(() => createRace(false))
  const [runs, setRuns] = useState<number[] | null>(null)
  const ops = program(useLock)

  const reset = (lock = useLock) => {
    setUseLock(lock)
    setS(createRace(lock))
    setRuns(null)
  }
  const done = isDone(s)
  const lostUpdate = done && s.counter !== 2

  const stress = useMemo(
    () => () => {
      const rand = mulberry32(Date.now() % 100_000)
      const results = Array.from({ length: 1000 }, () => runRandom(useLock, rand).counter)
      setRuns(results)
    },
    [useLock],
  )
  const wrong = runs ? runs.filter((c) => c !== 2).length : 0

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="Race condition demo">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-extrabold">Two threads, one counter</p>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={useLock} onChange={(e) => reset(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
          Protect the counter with a lock
        </label>
      </div>
      <p className="mt-2 text-sm text-ink-2">
        Each thread runs <code className="rounded bg-surface-2 px-1 font-mono">counter = counter + 1</code>, which the processor does in separate steps. Move the threads one step at a time and try to
        make the counter end at 1.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
        <Thread who="A" s={s} ops={ops} onStep={() => setS(step(s, 'A'))} />
        <div className="rounded-xl border border-rule px-6 py-4 text-center">
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">Shared counter</p>
          <p className="text-5xl font-extrabold tabular-nums" aria-live="polite">
            {s.counter}
          </p>
          {useLock && (
            <p className="mt-1 font-mono text-xs text-ink-2">{s.lockedBy ? `locked by ${s.lockedBy}` : 'unlocked'}</p>
          )}
        </div>
        <Thread who="B" s={s} ops={ops} onStep={() => setS(step(s, 'B'))} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => reset()} className="inline-flex items-center gap-1.5 rounded-lg border border-rule px-3 py-1.5 text-sm font-semibold hover:bg-surface-2">
          <Icon name="reset" size={14} /> Start over
        </button>
        <button type="button" onClick={stress} className="rounded-lg bg-ink px-4 py-1.5 text-sm font-bold text-bg">
          Run 1,000 random interleavings
        </button>
      </div>

      {done && (
        <p className={`mt-4 rounded-lg border px-4 py-3 text-sm font-semibold ${lostUpdate ? 'border-bad bg-bad-bg' : 'border-good bg-good-bg'}`} role="status">
          {lostUpdate
            ? `Final value ${s.counter}, expected 2. One update was lost: both threads read the old value before either wrote.`
            : 'Final value 2, as expected.'}
        </p>
      )}
      {runs && (
        <p className="mt-3 rounded-lg bg-surface-2 px-4 py-3 text-sm" role="status">
          {useLock ? 'With the lock' : 'Without a lock'}, <strong>{wrong}</strong> of 1,000 random runs ended with the wrong answer.
          {!useLock && wrong === 0 && ' Try again: the bad interleaving is rare but real.'}
          {useLock && ' The lock forces the two threads to take turns.'}
        </p>
      )}
    </figure>
  )
}

function Thread({ who, s, ops, onStep }: { who: ThreadId; s: RaceState; ops: ReturnType<typeof program>; onStep: () => void }) {
  const t = s.threads[who]
  const blocked = isBlocked(s, who)
  return (
    <section aria-label={`Thread ${who}`} className="rounded-xl border border-rule p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold">Thread {who}</h3>
        <span className="font-mono text-xs text-ink-2">r = {t.reg}</span>
      </div>
      <ol className="mt-2 space-y-1">
        {ops.map((op, i) => (
          <li
            key={i}
            className={`rounded-md px-2 py-1 font-mono text-xs ${
              i === t.pc ? (blocked ? 'bg-miss/25 font-bold' : 'bg-ink font-bold text-bg') : i < t.pc ? 'text-ink-3 line-through' : 'text-ink-2'
            }`}
          >
            {OP_TEXT[op]}
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onStep}
        disabled={!canStep(s, who)}
        className="mt-3 w-full rounded-lg border border-ink px-3 py-1.5 text-sm font-bold disabled:border-rule disabled:text-ink-3"
      >
        {isFinished(s, who) ? 'Finished' : blocked ? 'Waiting for the lock' : `Run step ${t.pc + 1}`}
      </button>
    </section>
  )
}
