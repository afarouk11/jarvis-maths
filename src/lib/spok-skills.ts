export type SkillModeId = 'explain' | 'quiz' | 'check' | 'gaps' | 'paper'

export interface SpokLevelDef {
  level: number
  title: string
  subtitle: string
  masteryThreshold: number
  color: string
  borderColor: string
  glowColor: string
  unlockedModes: SkillModeId[]
  perks: string[]
  xpLabel: string
}

export const SPOK_LEVELS: SpokLevelDef[] = [
  {
    level: 1,
    title: 'Apprentice',
    subtitle: 'Beginning the journey',
    masteryThreshold: 0,
    color: '#94a3b8',
    borderColor: 'rgba(148,163,184,0.3)',
    glowColor: 'rgba(148,163,184,0.12)',
    unlockedModes: ['explain'],
    perks: ['Ask SPOK anything', 'Concept explanations', '10 messages/day'],
    xpLabel: 'Just starting',
  },
  {
    level: 2,
    title: 'Explorer',
    subtitle: 'Building foundations',
    masteryThreshold: 0.2,
    color: '#3b82f6',
    borderColor: 'rgba(59,130,246,0.35)',
    glowColor: 'rgba(59,130,246,0.12)',
    unlockedModes: ['explain', 'quiz'],
    perks: ['Practice question mode', 'Step-by-step solutions', '20 messages/day'],
    xpLabel: '20% avg mastery',
  },
  {
    level: 3,
    title: 'Scholar',
    subtitle: 'Sharpening technique',
    masteryThreshold: 0.4,
    color: '#8b5cf6',
    borderColor: 'rgba(139,92,246,0.35)',
    glowColor: 'rgba(139,92,246,0.12)',
    unlockedModes: ['explain', 'quiz', 'check', 'gaps'],
    perks: ['Mark my working mode', 'Gap diagnosis mode', 'Exam technique coaching'],
    xpLabel: '40% avg mastery',
  },
  {
    level: 4,
    title: 'Expert',
    subtitle: 'Exam-ready',
    masteryThreshold: 0.65,
    color: '#f59e0b',
    borderColor: 'rgba(245,158,11,0.4)',
    glowColor: 'rgba(245,158,11,0.12)',
    unlockedModes: ['explain', 'quiz', 'check', 'gaps', 'paper'],
    perks: ['Past paper AI mode', 'Extended thinking', 'Personalised mock exams'],
    xpLabel: '65% avg mastery',
  },
  {
    level: 5,
    title: 'SPOK Certified',
    subtitle: 'A* trajectory locked in',
    masteryThreshold: 0.85,
    color: '#10b981',
    borderColor: 'rgba(16,185,129,0.4)',
    glowColor: 'rgba(16,185,129,0.12)',
    unlockedModes: ['explain', 'quiz', 'check', 'gaps', 'paper'],
    perks: ['Priority SPOK access', 'Predictive gap AI', 'Full mock exam generation'],
    xpLabel: '85% avg mastery',
  },
]

export interface ChatSkillMode {
  id: SkillModeId
  label: string
  shortLabel: string
  description: string
  systemAppend: string
  color: string
  glowColor: string
  minLevel: number
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
    minLevel: 1,
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
    minLevel: 2,
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
    minLevel: 3,
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
    minLevel: 3,
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
    minLevel: 4,
    emoji: '📄',
  },
]

export function getCurrentSpokLevel(avgMastery: number): SpokLevelDef {
  for (let i = SPOK_LEVELS.length - 1; i >= 0; i--) {
    if (avgMastery >= SPOK_LEVELS[i].masteryThreshold) return SPOK_LEVELS[i]
  }
  return SPOK_LEVELS[0]
}

export function getNextSpokLevel(current: SpokLevelDef): SpokLevelDef | null {
  return SPOK_LEVELS.find(l => l.level === current.level + 1) ?? null
}

export function progressToNextLevel(avgMastery: number, current: SpokLevelDef): number {
  const next = getNextSpokLevel(current)
  if (!next) return 100
  const range = next.masteryThreshold - current.masteryThreshold
  const progress = avgMastery - current.masteryThreshold
  return Math.min(100, Math.round((progress / range) * 100))
}
