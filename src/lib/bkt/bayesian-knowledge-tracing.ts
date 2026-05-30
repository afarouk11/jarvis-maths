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
 * A plain-English, motivating sentence explaining what a mastery score means
 * and what to do next — turns the hidden BKT number into something a student
 * understands and trusts. `topicName` is optional for a more personal caption.
 */
export function masteryCaption(pKnown: number, topicName?: string): string {
  const pct = Math.round(pKnown * 100)
  const it = topicName ?? 'this topic'
  if (pKnown >= 0.85) return `You've nailed ${it} (${pct}%). Keep it fresh with the odd review.`
  if (pKnown >= 0.65) return `You're solid on ${it} (${pct}%). A few more correct answers locks in mastery.`
  if (pKnown >= 0.45) return `You're getting there with ${it} (${pct}%). Keep practising to push past the tricky bits.`
  if (pKnown >= 0.25) return `Early days on ${it} (${pct}%). A short lesson plus practice will move this fast.`
  if (pct > 0)        return `Just starting ${it} (${pct}%). Let's build the basics first.`
  return `Haven't started ${it} yet. A quick lesson is the best first step.`
}

/**
 * Explains why a mastery score just changed after answering a question —
 * shown right after marking so the model feels transparent, not magic.
 */
export function masteryDelta(before: number, after: number): string {
  const diff = Math.round((after - before) * 100)
  if (diff >= 1) return `Mastery +${diff}% — that correct answer moved you up.`
  if (diff <= -1) return `Mastery ${diff}% — no worries, a review will bring it back.`
  return 'Mastery steady — answer a few more to move the needle.'
}

export function predictedGrade(avgPKnown: number): string {
  if (avgPKnown >= 0.88) return 'A*'
  if (avgPKnown >= 0.75) return 'A'
  if (avgPKnown >= 0.62) return 'B'
  if (avgPKnown >= 0.50) return 'C'
  if (avgPKnown >= 0.38) return 'D'
  return 'E'
}
