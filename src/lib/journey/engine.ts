// Pure logic for the learning-journey state machine. No DB, no React — fully
// unit-testable. The API route layers persistence + auth on top of this.

import { rootWeakPrerequisite } from '@/lib/curriculum/topic-graph'
import type { JourneyPage, JourneyPhase, MasteryRow, TopicLite } from './types'

export const DEFAULT_TARGET_MASTERY = 0.7

/** The phases that own an audit step. */
const WORKING_PHASES: readonly JourneyPhase[] = ['diagnose', 'learn', 'practice', 'assess', 'analyse']

export function isWorkingPhase(phase: JourneyPhase): boolean {
  return WORKING_PHASES.includes(phase)
}

/**
 * The phase that follows `current` in one cycle. `analyse` loops back to
 * `diagnose` (the caller decides whether to loop or complete based on whether
 * any weak topics remain).
 */
export function nextPhase(current: JourneyPhase): JourneyPhase {
  switch (current) {
    case 'welcome':  return 'diagnose'
    case 'diagnose': return 'learn'
    case 'learn':    return 'practice'
    case 'practice': return 'assess'
    case 'assess':   return 'analyse'
    case 'analyse':  return 'diagnose'
    case 'complete': return 'complete'
  }
}

/**
 * Choose the next topic to work on — the "fix this first" diagnosis.
 *
 * Take the weakest topic still below the target, then walk its prerequisite
 * chain to the deepest weak prerequisite: there's no point grinding integration
 * if differentiation (its prerequisite) is the real blocker.
 *
 * Returns null when every topic is at/above target — the journey is complete.
 */
export function pickFocusTopic(
  progress: MasteryRow[],
  topics: TopicLite[],
  target: number = DEFAULT_TARGET_MASTERY,
): string | null {
  const pBySlug = new Map(progress.map(p => [p.topic_id, p.p_known]))
  const mastery = (slug: string): number => pBySlug.get(slug) ?? 0

  const weak = topics
    .map(t => t.slug)
    .filter(slug => mastery(slug) < target)
    .sort((a, b) => mastery(a) - mastery(b))

  const weakest = weak[0]
  if (weakest === undefined) return null

  const root = rootWeakPrerequisite(weakest, pBySlug, target)
  return root ?? weakest
}

/** The journey phase that a page SPOK opens corresponds to. */
export function pageToPhase(page: JourneyPage): JourneyPhase {
  switch (page) {
    case 'notes':    return 'learn'
    case 'practice': return 'practice'
    case 'paper':    return 'assess'
  }
}

/** The page a given phase hands the student off to, carrying the journey id. */
export function phaseRoute(phase: JourneyPhase, slug: string, journeyId: string): string | null {
  const q = `journey=${encodeURIComponent(journeyId)}`
  switch (phase) {
    case 'learn':    return `/topics/${slug}?${q}`
    case 'practice': return `/practice?topic=${slug}&${q}`
    case 'assess':   return `/papers?focus=${slug}&${q}`
    default:         return null
  }
}

export interface StepEvaluation {
  delta: number
  passed: boolean
  pKnownAfter: number
}

/** How much the student improved on a topic, and whether they hit the target. */
export function evaluateStep(
  before: number,
  after: number,
  target: number = DEFAULT_TARGET_MASTERY,
): StepEvaluation {
  return { delta: after - before, passed: after >= target, pKnownAfter: after }
}
