import { predictedGrade } from '@/lib/bkt/bayesian-knowledge-tracing'

/**
 * Single source of truth for the predicted-grade calculation.
 *
 * Historically the grade was computed two different ways across the app:
 *   - dashboard / snapshots: sum(p_known) / ALL topics   (unstudied count as 0)
 *   - brain map / useProgress: sum(p_known) / STUDIED topics
 * These disagreed, so the same student saw different grades on different pages.
 *
 * We standardise on the *all-topics* mastery as the honest exam predictor — the
 * exam covers the whole specification, so topics never studied legitimately drag
 * the prediction down. The studied-only average is kept as a separate, clearly
 * labelled secondary metric.
 */
export interface GradeSummary {
  /** Mean p_known across every topic in the spec (unstudied = 0). Drives the grade. */
  overallPKnown: number
  /** Mean p_known across only the topics the student has attempted. */
  studiedPKnown: number
  /** Number of topics attempted at least once. */
  studiedCount: number
  /** Total topics in the student's specification. */
  totalTopics: number
  /** studiedCount / totalTopics, clamped to [0, 1]. */
  coverage: number
  /** Predicted grade derived from overallPKnown. */
  grade: string
  /** Whether there is enough data to show the grade with confidence. */
  confident: boolean
}

// Below these thresholds a predicted grade is statistically meaningless and
// only demoralises a new student, so callers should show a neutral placeholder.
const MIN_TOPICS_FOR_GRADE = 3
const MIN_COVERAGE_FOR_GRADE = 0.15

export function computeGradeSummary(
  progress: ReadonlyArray<{ p_known: number }>,
  totalTopics: number,
): GradeSummary {
  const studiedCount = progress.length
  const sum = progress.reduce((s, p) => s + p.p_known, 0)
  const overallPKnown = totalTopics > 0 ? sum / totalTopics : 0
  const studiedPKnown = studiedCount > 0 ? sum / studiedCount : 0
  const coverage = totalTopics > 0 ? Math.min(1, studiedCount / totalTopics) : 0
  const confident = studiedCount >= MIN_TOPICS_FOR_GRADE && coverage >= MIN_COVERAGE_FOR_GRADE

  return {
    overallPKnown,
    studiedPKnown,
    studiedCount,
    totalTopics,
    coverage,
    grade: predictedGrade(overallPKnown),
    confident,
  }
}

export interface GradeTrend {
  direction: 'up' | 'down' | 'flat'
  /** Change in overall mastery, in percentage points, over the window. */
  deltaPoints: number
}

/**
 * Derives a trend ("B, trending up") from the grade snapshots written on each
 * practice session. Compares the most recent snapshot's mastery to the earliest
 * in the supplied window.
 */
export function computeGradeTrend(
  snapshots: ReadonlyArray<{ avg_p_known: number; created_at: string }>,
): GradeTrend | null {
  if (snapshots.length < 2) return null
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
  const earliest = sorted[0].avg_p_known
  const latest = sorted[sorted.length - 1].avg_p_known
  const deltaPoints = Math.round((latest - earliest) * 100)
  const direction = deltaPoints >= 2 ? 'up' : deltaPoints <= -2 ? 'down' : 'flat'
  return { direction, deltaPoints }
}

/**
 * The per-topic mastery bar a student should clear to be on track for a given
 * target grade. Higher targets demand higher mastery on each topic, so study is
 * steered toward what actually moves *that* grade (a C student needs every topic
 * solid; an A* student needs them excellent).
 */
export function masteryBarForGrade(grade: string): number {
  switch (grade) {
    case 'A*': case '9': return 0.88
    case 'A':  case '8': return 0.80
    case 'B':  case '7': return 0.72
    case 'C':  case '6': return 0.62
    case 'D':  case '5': return 0.55
    case 'E':  case '4': return 0.48
    default: return 0.70
  }
}

/** Shared grade → colour mapping so every surface uses the same palette. */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A*': return '#fbbf24'
    case 'A':  return '#4ade80'
    case 'B':  return '#60a5fa'
    case 'C':  return '#f97316'
    case 'D':  return '#f87171'
    case 'E':  return '#ef4444'
    default:   return '#94a3b8'
  }
}
