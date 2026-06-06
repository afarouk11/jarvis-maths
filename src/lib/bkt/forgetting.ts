/**
 * Forgetting / knowledge decay.
 *
 * BKT only ever moves p_known when a question is answered, so a topic studied
 * months ago still shows as "Mastered". Real memory fades. This models the
 * Ebbinghaus forgetting curve: once a topic is past its SM-2 review date,
 * mastery decays gradually. Well-learned items (high ease factor, long
 * interval) decay slower, mirroring spaced-repetition stability.
 */
export interface DecayInput {
  p_known: number
  last_attempted_at?: string | null
  ease_factor?: number | null
  interval_days?: number | null
}

export function decayedPKnown(row: DecayInput, now: number = Date.now()): number {
  const pKnown = row.p_known
  if (!row.last_attempted_at) return pKnown

  const elapsedDays = (now - new Date(row.last_attempted_at).getTime()) / 86400000
  if (!(elapsedDays > 0)) return pKnown

  const interval = Math.max(1, row.interval_days ?? 1)
  const overdue = elapsedDays - interval
  // No decay while the item is still within its retention window.
  if (overdue <= 0) return pKnown

  const ease = Math.max(1.3, row.ease_factor ?? 2.5)
  // Stability (in days) over which memory holds — scales with ease and interval.
  const stability = Math.max(14, interval) * ease * 1.2
  const retention = Math.exp(-overdue / stability)
  // Never lose more than 60% to decay — you don't forget a topic to nothing.
  return pKnown * Math.max(0.4, retention)
}

/** Returns copies of the rows with p_known replaced by its decayed value. */
export function applyDecay<T extends DecayInput>(rows: readonly T[], now: number = Date.now()): T[] {
  return rows.map(r => ({ ...r, p_known: decayedPKnown(r, now) }))
}
