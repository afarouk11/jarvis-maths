interface SM2State {
  intervalDays: number
  easeFactor: number
  repetitions: number
  nextReviewAt: Date
}

// quality: 0-5 (0=blackout, 5=perfect)
export function updateSM2(state: SM2State, quality: number): SM2State {
  const ef = Math.max(1.3,
    state.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  )

  let interval: number
  let reps: number

  if (quality < 3) {
    // Failed — reset
    interval = 1
    reps = 0
  } else {
    reps = state.repetitions + 1
    if (reps === 1) interval = 1
    else if (reps === 2) interval = 6
    else interval = Math.round(state.intervalDays * ef)
  }

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + interval)

  return { intervalDays: interval, easeFactor: ef, repetitions: reps, nextReviewAt }
}

export function qualityFromCorrect(correct: boolean, timeSeconds: number): number {
  if (!correct) return 1
  if (timeSeconds < 30) return 5
  if (timeSeconds < 60) return 4
  if (timeSeconds < 120) return 3
  return 2
}
