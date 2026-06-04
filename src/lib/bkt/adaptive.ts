/**
 * Adaptive difficulty selection.
 *
 * Picks a 1–5 difficulty for the next question from the student's current
 * mastery of the topic plus their recent accuracy on it. This is the engine
 * that makes practice adaptive: every answer updates p_known (and the
 * attempted/correct counts), which feeds straight back into the next call.
 */
export function difficultyForMastery(
  pKnown: number,
  questionsAttempted: number,
  questionsCorrect: number,
): number {
  // Base difficulty scales with mastery: ~1.5 at zero mastery, ~5 at full mastery.
  let d = 1.5 + clamp01(pKnown) * 3.5

  // Once we have a few attempts, nudge by how the student is actually doing so
  // adaptation feels responsive rather than waiting for p_known to drift.
  if (questionsAttempted >= 3) {
    const accuracy = questionsCorrect / questionsAttempted
    if (accuracy >= 0.8) d += 0.6        // cruising — push them
    else if (accuracy <= 0.4) d -= 0.6   // struggling — ease off
  }

  return Math.max(1, Math.min(5, Math.round(d)))
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0
  return Math.max(0, Math.min(1, x))
}
