import type { StudentProgress } from '@/types'
import { predictedGrade } from '@/lib/bkt/bayesian-knowledge-tracing'

export interface ExamReadiness {
  score: number           // 0–100
  label: string           // "Developing" | "Building" | "Confident" | etc.
  color: string           // hex
  gradeTrajectory: string // "B" | "A" | "A*" etc.
  topPrioritySlug: string | null
  topPriorityName: string | null
  topPriorityMastery: number | null
  daysToExam: number | null
  urgency: 'low' | 'medium' | 'high' | 'critical'
  improvementNeeded: string | null // human-readable nudge
}

const GRADE_THRESHOLDS: Record<string, number> = {
  'A*': 88,
  'A':  75,
  'B':  62,
  'C':  50,
  'D':  38,
}

export function computeExamReadiness({
  progress,
  totalTopics,
  examDate,
  targetGrade,
  slugById,
  topicNames,
}: {
  progress: StudentProgress[]
  totalTopics: number
  examDate: string | null
  targetGrade: string
  slugById: Map<string, string>
  topicNames: Map<string, string>
}): ExamReadiness {
  if (totalTopics === 0) {
    return {
      score: 0, label: 'Not started', color: '#374151',
      gradeTrajectory: 'E', topPrioritySlug: null, topPriorityName: null,
      topPriorityMastery: null, daysToExam: null, urgency: 'low',
      improvementNeeded: 'Complete your onboarding to get started.',
    }
  }

  // Average p_known across ALL topics (unstarted = 0)
  const totalMastery = progress.reduce((s, p) => s + p.p_known, 0)
  const avgAllTopics  = totalMastery / totalTopics

  // Coverage ratio (started / total)
  const coverage = Math.min(1, progress.length / totalTopics)

  // Days to exam
  let daysToExam: number | null = null
  let timePenalty = 1.0
  let urgency: ExamReadiness['urgency'] = 'low'

  if (examDate) {
    const diff = new Date(examDate).getTime() - Date.now()
    daysToExam = Math.max(0, Math.ceil(diff / 86400000))

    if (daysToExam === 0) {
      timePenalty = 0.80; urgency = 'critical'
    } else if (daysToExam <= 7) {
      timePenalty = 0.85; urgency = 'critical'
    } else if (daysToExam <= 14) {
      timePenalty = 0.90; urgency = 'high'
    } else if (daysToExam <= 30) {
      timePenalty = 0.95; urgency = 'medium'
    } else if (daysToExam <= 60) {
      timePenalty = 0.98; urgency = 'medium'
    }
  }

  // Raw score: mastery counts 65%, coverage 35%, scaled by time
  const rawScore = (avgAllTopics * 0.65 + coverage * 0.35) * timePenalty
  const score    = Math.round(Math.min(100, rawScore * 100))

  // Grade trajectory from overall mastery
  const gradeTrajectory = predictedGrade(avgAllTopics)

  // Label + color
  const { label, color } = readinessLabel(score)

  // Top priority: lowest p_known among studied topics, or first unstudied
  const sorted = [...progress].sort((a, b) => a.p_known - b.p_known)
  const topPriority = sorted[0] ?? null
  const topPrioritySlug = topPriority ? (slugById.get(topPriority.topic_id) ?? null) : null
  const topPriorityName = topPrioritySlug ? (topicNames.get(topPrioritySlug) ?? null) : null
  const topPriorityMastery = topPriority?.p_known ?? null

  // Improvement nudge
  const targetThreshold = GRADE_THRESHOLDS[targetGrade] ?? 75
  const improvementNeeded = buildNudge({
    score, gradeTrajectory, targetGrade, targetThreshold,
    topPriorityName, topPriorityMastery, daysToExam, coverage, totalTopics,
    studiedTopics: progress.length,
  })

  return {
    score, label, color, gradeTrajectory,
    topPrioritySlug, topPriorityName, topPriorityMastery,
    daysToExam, urgency, improvementNeeded,
  }
}

function readinessLabel(score: number): { label: string; color: string } {
  if (score >= 95) return { label: 'SPOK Certified',  color: '#f59e0b' }
  if (score >= 90) return { label: 'A* Trajectory',   color: '#fbbf24' }
  if (score >= 83) return { label: 'Exam Ready',       color: '#22c55e' }
  if (score >= 75) return { label: 'Near Ready',       color: '#4ade80' }
  if (score >= 65) return { label: 'Strong',           color: '#3b82f6' }
  if (score >= 50) return { label: 'Confident',        color: '#60a5fa' }
  if (score >= 35) return { label: 'Developing',       color: '#f59e0b' }
  if (score >= 20) return { label: 'Building',         color: '#f97316' }
  return                   { label: 'Getting Started', color: '#ef4444' }
}

function buildNudge({
  score, gradeTrajectory, targetGrade, targetThreshold,
  topPriorityName, topPriorityMastery, daysToExam, coverage,
  totalTopics, studiedTopics,
}: {
  score: number
  gradeTrajectory: string
  targetGrade: string
  targetThreshold: number
  topPriorityName: string | null
  topPriorityMastery: number | null
  daysToExam: number | null
  coverage: number
  totalTopics: number
  studiedTopics: number
}): string | null {
  const gap = targetThreshold - score

  if (gradeTrajectory === targetGrade || score >= targetThreshold) {
    if (daysToExam !== null && daysToExam <= 14) {
      return `You're on track for ${targetGrade}. Keep the revision going — ${daysToExam} days left.`
    }
    return `You're on track for ${targetGrade}. Stay consistent.`
  }

  if (coverage < 0.5 && totalTopics > 0) {
    const unstarted = totalTopics - studiedTopics
    return `${unstarted} topics not yet started. Covering more ground is your fastest path to ${targetGrade}.`
  }

  if (topPriorityName && topPriorityMastery !== null) {
    const pct = Math.round(topPriorityMastery * 100)
    if (daysToExam !== null && daysToExam <= 30) {
      return `${daysToExam}d left. ${topPriorityName} is your weakest area at ${pct}% — fix it today.`
    }
    return `${topPriorityName} is your biggest gap at ${pct}% — closing it moves your score ${gap > 10 ? 'significantly' : 'closer to ' + targetGrade}.`
  }

  return `${gap} points to ${targetGrade} trajectory. Keep studying daily.`
}
