/**
 * FSRS (Free Spaced Repetition Scheduler) — a modern, accuracy-focused
 * replacement for SM-2. It models each topic's memory as a stability S (the
 * number of days until recall probability falls to the requested retention) and
 * a difficulty D in [1, 10]. Review intervals are derived from S, so scheduling
 * adapts to how durably the student actually remembers each topic.
 *
 * Uses the published FSRS-4.5 default weights. Grades: 1 = again, 2 = hard,
 * 3 = good, 4 = easy.
 */
const W = [
  0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616,
  0.1544, 1.0824, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466,
]
const DAY = 86400000
const REQUEST_RETENTION = 0.9

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

export interface FSRSState {
  stability: number
  difficulty: number
  intervalDays: number
  nextReviewAt: Date
}

export interface FSRSInput {
  stability?: number | null
  difficulty?: number | null
  lastReviewAt?: string | null
}

function initialDifficulty(grade: number): number {
  return clamp(W[4] - (grade - 3) * W[5], 1, 10)
}
function initialStability(grade: number): number {
  return Math.max(0.1, W[grade - 1])
}
// Interval (days) for the requested retention given stability S.
function nextInterval(stability: number): number {
  return Math.max(1, Math.round(9 * stability * (1 / REQUEST_RETENTION - 1)))
}
function retrievability(elapsedDays: number, stability: number): number {
  return Math.pow(1 + elapsedDays / (9 * stability), -1)
}
function nextDifficulty(difficulty: number, grade: number): number {
  const delta = difficulty - W[6] * (grade - 3)
  // Mean-reversion toward the difficulty of an "easy" first answer.
  return clamp(W[7] * initialDifficulty(4) + (1 - W[7]) * delta, 1, 10)
}
function recallStability(difficulty: number, stability: number, r: number, grade: number): number {
  const hard = grade === 2 ? W[15] : 1
  const easy = grade === 4 ? W[16] : 1
  return stability * (1 + Math.exp(W[8]) * (11 - difficulty) * Math.pow(stability, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy)
}
function lapseStability(difficulty: number, stability: number, r: number): number {
  return W[11] * Math.pow(difficulty, -W[12]) * (Math.pow(stability + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r))
}

export function updateFSRS(input: FSRSInput, grade: number, now: number = Date.now()): FSRSState {
  const g = clamp(Math.round(grade), 1, 4)
  const hasPrior = typeof input.stability === 'number' && input.stability > 0 && typeof input.difficulty === 'number'

  let stability: number
  let difficulty: number

  if (!hasPrior) {
    stability = initialStability(g)
    difficulty = initialDifficulty(g)
  } else {
    const elapsedDays = input.lastReviewAt
      ? Math.max(0, (now - new Date(input.lastReviewAt).getTime()) / DAY)
      : 0
    const r = retrievability(elapsedDays, input.stability as number)
    difficulty = nextDifficulty(input.difficulty as number, g)
    stability = g === 1
      ? lapseStability(difficulty, input.stability as number, r)
      : recallStability(difficulty, input.stability as number, r, g)
  }

  stability = Math.max(0.1, stability)
  const intervalDays = nextInterval(stability)
  return { stability, difficulty, intervalDays, nextReviewAt: new Date(now + intervalDays * DAY) }
}

/**
 * Compresses a review interval as the exam approaches (the cramming curve).
 * Never schedules the next review past the exam, and progressively shortens
 * intervals inside the final 30 / 14 / 7 days so revision intensifies.
 */
export function compressIntervalForExam(intervalDays: number, daysToExam: number | null): number {
  if (daysToExam === null) return intervalDays
  if (daysToExam <= 0) return 1
  const factor = daysToExam <= 7 ? 0.4 : daysToExam <= 14 ? 0.6 : daysToExam <= 30 ? 0.8 : 1
  const compressed = Math.max(1, Math.round(Math.min(intervalDays, daysToExam) * factor))
  return Math.min(compressed, daysToExam)
}

// Map our continuous answer score (0-1) onto an FSRS grade.
export function gradeFromScore(score: number): number {
  if (score < 0.5) return 1
  if (score < 0.7) return 2
  if (score < 0.9) return 3
  return 4
}
