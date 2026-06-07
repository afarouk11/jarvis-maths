// Types for SPOK's guided learning journey — the looping diagnose → learn →
// practice → assess → analyse cycle visualised by the brain.

export type JourneyPhase =
  | 'welcome'
  | 'diagnose'
  | 'learn'
  | 'practice'
  | 'assess'
  | 'analyse'
  | 'complete'

export type JourneyStatus = 'active' | 'completed' | 'abandoned'

/** The phases that produce an audit step (everything except welcome/complete). */
export type JourneyStepPhase = 'diagnose' | 'learn' | 'practice' | 'assess' | 'analyse'
export type JourneyStepStatus = 'in_progress' | 'done' | 'skipped'

export interface LearningJourney {
  id: string
  student_id: string
  status: JourneyStatus
  current_phase: JourneyPhase
  focus_topic_id: string | null
  target_mastery: number
  cycles_done: number
  started_at: string
  updated_at: string
  completed_at: string | null
}

export interface JourneyStep {
  id: string
  journey_id: string
  topic_id: string | null
  phase: JourneyStepPhase
  status: JourneyStepStatus
  p_known_before: number | null
  p_known_after: number | null
  payload: Record<string, unknown>
  created_at: string
  completed_at: string | null
}

/** Minimal mastery row (slug-keyed) the engine needs to reason about topics. */
export interface MasteryRow {
  topic_id: string // topic slug (callers normalise the DB UUID to a slug first)
  p_known: number
}

/** Minimal topic shape the engine needs. */
export interface TopicLite {
  slug: string
  name: string
}

/** The action a [JOURNEY] block from SPOK can request. */
export type JourneyAction = 'start' | 'advance' | 'end' | 'open'

/** A page SPOK can open as part of the journey. */
export type JourneyPage = 'notes' | 'practice' | 'paper'

/** Outcome recorded against a step when advancing the cycle. */
export interface StepOutcome {
  pKnownAfter?: number
  payload?: Record<string, unknown>
}
