export interface Profile {
  id: string
  full_name: string | null
  exam_board: 'AQA' | 'Edexcel' | 'OCR'
  target_grade: string
  exam_date: string | null
  xp: number
  streak_days: number
  last_active_at: string | null
  created_at: string
}

export interface Topic {
  id: string
  name: string
  slug: string
  parent_id: string | null
  exam_board: string | null
  year_group: 'AS' | 'A2' | 'Y10' | 'Y11' | null
  order_index: number
  icon: string | null
  children?: Topic[]
}

// ── Interactive lesson block types ──────────────────────────────────────────

export interface HookBlock {
  type: 'hook'
  question: string       // engaging opening question
  options: string[]      // 4 options; last is always "I'm not sure yet"
}

export interface ConceptBlock {
  type: 'concept'
  label: string
  content: string        // prose + LaTeX
}

export interface WorkedExampleBlock {
  type: 'worked-example'
  label?: string
  intro: string          // problem statement
  steps: Array<{ label: string; content: string }>
}

export interface CheckpointBlock {
  type: 'checkpoint'
  question: string       // with LaTeX
  options: string[]      // 4 MCQ options with LaTeX
  correct: number        // 0-indexed
  explanation: string    // shown after answering
}

export interface TryItBlock {
  type: 'try-it'
  problem: string        // problem statement with LaTeX
  hint?: string
  answer: string         // model answer for Spok to mark against
}

export interface SummaryBlock {
  type: 'summary'
  content: string
}

export interface GraphBlock {
  type: 'graph'
  title?: string
  xDomain?: [number, number]
  yDomain?: [number, number]
  data: Array<{
    fn?: string
    color?: string
    label?: string
    closed?: boolean
    graphType?: 'polyline' | 'scatter' | 'interval'
    range?: [number, number]
  }>
  annotations?: Array<{ x?: number; y?: number; text?: string }>
}

// Legacy plain blocks (kept for backward compat with old lessons)
export interface LegacyBlock {
  type: 'text' | 'math' | 'math-block' | 'step' | 'example' | 'note'
  content: string
  label?: string
}

export type LessonBlock =
  | HookBlock
  | ConceptBlock
  | WorkedExampleBlock
  | CheckpointBlock
  | TryItBlock
  | SummaryBlock
  | GraphBlock
  | LegacyBlock

export interface Lesson {
  id: string
  topic_id: string
  title: string
  content: LessonBlock[]
  difficulty: number
  estimated_minutes: number | null
  created_at: string
}

export interface WorkedStep {
  label: string
  content: string
  math?: string
}

export interface Question {
  id: string
  topic_id: string
  stem: string
  answer: string
  worked_solution: WorkedStep[] | null
  difficulty: number
  marks: number
  source: string | null
}

export interface BKTState {
  pKnown: number
  pTransit: number
  pSlip: number
  pGuess: number
}

export interface StudentProgress {
  id: string
  student_id: string
  topic_id: string
  p_known: number
  p_transit: number
  p_slip: number
  p_guess: number
  next_review_at: string
  interval_days: number
  ease_factor: number
  repetitions: number
  questions_attempted: number
  questions_correct: number
  last_attempted_at: string | null
}

export type JarvisState = 'idle' | 'thinking' | 'speaking' | 'listening'
