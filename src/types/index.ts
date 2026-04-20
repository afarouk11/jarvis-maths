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
  year_group: 'AS' | 'A2' | null
  order_index: number
  icon: string | null
  children?: Topic[]
}

export interface LessonBlock {
  type: 'text' | 'math' | 'math-block' | 'step' | 'example' | 'note'
  content: string
  label?: string
}

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
