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

/**
 * Guess probability by question format. A correct 4-option MCQ could easily be
 * luck (~25%), but a correct free-response "show that" almost never is (~5%),
 * so written answers are much stronger evidence of knowing.
 */
export function pGuessForFormat(format?: string | null): number {
  switch (format) {
    case 'mcq':
    case 'multiple-choice': return 0.25
    case 'true-false':      return 0.5
    case 'numeric':         return 0.15
    case 'written':
    case 'free-response':   return 0.07
    default:                return 0.1
  }
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

/**
 * Maps overall mastery to a predicted grade on the student's actual scale:
 * GCSE (Higher tier) → 9-4 with the 3 safety net, A-level → A*-E, and U on
 * both. Boundaries deliberately mirror masteryBarForGrade() in lib/grade.ts so
 * a student who clears the per-topic bar for their target grade is predicted
 * that grade — the two scales previously disagreed.
 */
export function predictedGrade(avgPKnown: number, level?: string | null): string {
  const isGcse = (level ?? '').trim().toLowerCase() === 'gcse'
  if (avgPKnown >= 0.88) return isGcse ? '9' : 'A*'
  if (avgPKnown >= 0.80) return isGcse ? '8' : 'A'
  if (avgPKnown >= 0.72) return isGcse ? '7' : 'B'
  if (avgPKnown >= 0.62) return isGcse ? '6' : 'C'
  if (avgPKnown >= 0.55) return isGcse ? '5' : 'D'
  if (avgPKnown >= 0.48) return isGcse ? '4' : 'E'
  if (isGcse && avgPKnown >= 0.40) return '3'
  return 'U'
}
