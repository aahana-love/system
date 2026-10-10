// Two threads each add 1 to a shared counter. "counter += 1" is really three
// steps (load, add, store), so their steps can interleave and lose an update.

export type ThreadId = 'A' | 'B'
export type Op = 'LOCK' | 'LOAD' | 'ADD' | 'STORE' | 'UNLOCK'

export const PROGRAM_UNLOCKED: Op[] = ['LOAD', 'ADD', 'STORE']
export const PROGRAM_LOCKED: Op[] = ['LOCK', 'LOAD', 'ADD', 'STORE', 'UNLOCK']

export const OP_TEXT: Record<Op, string> = {
  LOCK: 'lock the counter',
  LOAD: 'r = counter',
  ADD: 'r = r + 1',
  STORE: 'counter = r',
  UNLOCK: 'unlock the counter',
}

export interface RaceState {
  useLock: boolean
  counter: number
  lockedBy: ThreadId | null
  threads: Record<ThreadId, { pc: number; reg: number }>
  /** Everything that ran so far, in order. */
  trace: { who: ThreadId; op: Op; counterAfter: number }[]
}

export const program = (useLock: boolean) => (useLock ? PROGRAM_LOCKED : PROGRAM_UNLOCKED)

export function createRace(useLock: boolean): RaceState {
  return { useLock, counter: 0, lockedBy: null, threads: { A: { pc: 0, reg: 0 }, B: { pc: 0, reg: 0 } }, trace: [] }
}

export function isFinished(s: RaceState, who: ThreadId): boolean {
  return s.threads[who].pc >= program(s.useLock).length
}

export function isDone(s: RaceState): boolean {
  return isFinished(s, 'A') && isFinished(s, 'B')
}

/** A thread waiting at LOCK while the other holds it can't move. */
export function isBlocked(s: RaceState, who: ThreadId): boolean {
  if (isFinished(s, who)) return false
  return program(s.useLock)[s.threads[who].pc] === 'LOCK' && s.lockedBy !== null && s.lockedBy !== who
}

export function canStep(s: RaceState, who: ThreadId): boolean {
  return !isFinished(s, who) && !isBlocked(s, who)
}

export function step(s: RaceState, who: ThreadId): RaceState {
  if (!canStep(s, who)) return s
  const op = program(s.useLock)[s.threads[who].pc]
  const t = { ...s.threads[who], pc: s.threads[who].pc + 1 }
  let counter = s.counter
  let lockedBy = s.lockedBy
  if (op === 'LOAD') t.reg = s.counter
  if (op === 'ADD') t.reg = t.reg + 1
  if (op === 'STORE') counter = t.reg
  if (op === 'LOCK') lockedBy = who
  if (op === 'UNLOCK') lockedBy = null
  return {
    ...s,
    counter,
    lockedBy,
    threads: { ...s.threads, [who]: t },
    trace: [...s.trace, { who, op, counterAfter: counter }],
  }
}

/** Runs to the end, picking which thread moves next at random. */
export function runRandom(useLock: boolean, rand: () => number): RaceState {
  let s = createRace(useLock)
  while (!isDone(s)) {
    const options = (['A', 'B'] as ThreadId[]).filter((w) => canStep(s, w))
    s = step(s, options[Math.floor(rand() * options.length)])
  }
  return s
}
