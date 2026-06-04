import { BKTState } from '@/types'

export function updateBKT(state: BKTState, correct: boolean): BKTState {
  const { pKnown, pTransit, pSlip, pGuess } = state

  const pCorrect = pKnown * (1 - pSlip) + (1 - pKnown) * pGuess
  const pWrong = 1 - pCorrect

  const pKnownAfterObs = correct
    ? (pKnown * (1 - pSlip)) / pCorrect
    : (pKnown * pSlip) / pWrong

  const newPKnown = Math.min(0.99, pKnownAfterObs + (1 - pKnownAfterObs) * pTransit)

  return { ...state, pKnown: newPKnown }
}

/**
 * Proportional BKT update. Real answers aren't binary — a 3/5 should move
 * mastery part-way. We interpolate p_known between the fully-wrong and
 * fully-correct Bayesian updates by `score` (marks earned, or self-assessed
 * quality), in [0, 1].
 */
export function updateBKTPartial(state: BKTState, score: number): BKTState {
  const s = Math.max(0, Math.min(1, score))
  if (s >= 0.999) return updateBKT(state, true)
  if (s <= 0.001) return updateBKT(state, false)
  const hi = updateBKT(state, true).pKnown
  const lo = updateBKT(state, false).pKnown
  return { ...state, pKnown: lo + s * (hi - lo) }
}

export function masteryLabel(pKnown: number): string {
  if (pKnown >= 0.85) return 'Mastered'
  if (pKnown >= 0.65) return 'Proficient'
  if (pKnown >= 0.45) return 'Developing'
  if (pKnown >= 0.25) return 'Beginner'
  return 'Not started'
}

export function masteryColor(pKnown: number): string {
  if (pKnown >= 0.85) return '#22c55e'
  if (pKnown >= 0.65) return '#3b82f6'
  if (pKnown >= 0.45) return '#f59e0b'
  if (pKnown >= 0.25) return '#ef4444'
  return '#374151'
}

export function predictedGrade(avgPKnown: number): string {
  if (avgPKnown >= 0.88) return 'A*'
  if (avgPKnown >= 0.75) return 'A'
  if (avgPKnown >= 0.62) return 'B'
  if (avgPKnown >= 0.50) return 'C'
  if (avgPKnown >= 0.38) return 'D'
  return 'E'
}
