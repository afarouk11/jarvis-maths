export type SkillModeId = 'explain' | 'quiz' | 'check' | 'gaps' | 'paper'

export interface ChatSkillMode {
  id: SkillModeId
  label: string
  shortLabel: string
  description: string
  systemAppend: string
  color: string
  glowColor: string
  emoji: string
}

export const CHAT_SKILL_MODES: ChatSkillMode[] = [
  {
    id: 'explain',
    label: 'Explain it',
    shortLabel: 'Explain',
    description: 'SPOK teaches the concept clearly, step by step with worked examples.',
    systemAppend: 'MODE: EXPLAIN. The student wants a thorough explanation. Teach this concept with clear structure, worked examples, and check their understanding at the end.',
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.2)',
    emoji: '📖',
  },
  {
    id: 'quiz',
    label: 'Quiz me',
    shortLabel: 'Quiz',
    description: 'SPOK fires one practice question at a time, guides you through the solution.',
    systemAppend: 'MODE: QUIZ. Give the student one practice question. Wait for their attempt, then give detailed feedback. Keep going until they ask to stop.',
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.2)',
    emoji: '⚡',
  },
  {
    id: 'check',
    label: 'Check my working',
    shortLabel: 'Mark it',
    description: 'Paste your working — SPOK marks it like an examiner, explains every error.',
    systemAppend: 'MODE: MARK SCHEME. The student will show working. Mark it like an A-level examiner — award marks, identify errors precisely, explain the correct method clearly.',
    color: '#10b981',
    glowColor: 'rgba(16,185,129,0.2)',
    emoji: '✅',
  },
  {
    id: 'gaps',
    label: 'Find my gaps',
    shortLabel: 'Gaps',
    description: 'SPOK runs a short diagnostic and builds a targeted improvement plan.',
    systemAppend: 'MODE: DIAGNOSTIC. Run a targeted diagnostic. Ask 3–4 probing questions to pinpoint knowledge gaps. Then give a precise, prioritised improvement plan.',
    color: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.2)',
    emoji: '🎯',
  },
  {
    id: 'paper',
    label: 'Past paper',
    shortLabel: 'Exam',
    description: 'Real exam conditions — past-paper style question, strict mark scheme.',
    systemAppend: 'MODE: EXAM. Simulate exam conditions exactly. Give a past-paper style question with marks shown. Wait for the full answer. Then mark it against the mark scheme criteria — be honest about every mark dropped.',
    color: '#60a5fa',
    glowColor: 'rgba(96,165,250,0.2)',
    emoji: '📄',
  },
]
