const dayKey = (t: number) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/**
 * Consecutive days with any study activity, counting back from today. If you
 * haven't studied yet today, the streak from yesterday still counts.
 */
export function computeStreak(timestamps: number[], now = Date.now()): { days: number; activeToday: boolean } {
  const days = new Set(timestamps.map(dayKey))
  const activeToday = days.has(dayKey(now))
  const cursor = new Date(now)
  if (!activeToday) cursor.setDate(cursor.getDate() - 1)
  let count = 0
  while (days.has(dayKey(cursor.getTime()))) {
    count++
    cursor.setDate(cursor.getDate() - 1)
  }
  return { days: count, activeToday }
}
