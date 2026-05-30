/**
 * Plain-language explanations of the jargon students meet across StudiQ.
 * Used by <HelpTip term="..." /> to demystify terms inline.
 * Keep every definition to one or two friendly sentences — no jargon inside jargon.
 */

export interface GlossaryEntry {
  /** Short label shown as the tooltip heading. */
  readonly title: string
  /** One- or two-sentence plain-English explanation. */
  readonly body: string
}

export const GLOSSARY = {
  'target-grade': {
    title: 'Target grade',
    body: "The grade you're aiming for. Pick a stretch — SPOK builds every session around getting you there, and you can change it any time.",
  },
  'exam-board': {
    title: 'Exam board',
    body: 'The organisation that sets and marks your exam (AQA, Edexcel or OCR). Not sure? Ask your teacher — you can change it later.',
  },
  mastery: {
    title: 'Mastery',
    body: "How well SPOK thinks you've learned a topic, from 0 to 100%. It goes up when you answer correctly and slowly drifts down if you don't revise.",
  },
  'spaced-review': {
    title: 'Spaced review',
    body: 'SPOK reminds you to revisit a topic just before you would forget it. Reviewing little and often is the fastest way to remember things long-term.',
  },
  'predicted-grade': {
    title: 'Predicted grade',
    body: 'An estimate of the grade you would get if you sat the exam today, based on your mastery across all topics. It rises as you practise.',
  },
  streak: {
    title: 'Study streak',
    body: 'The number of days in a row you’ve studied. Keep it alive — short daily sessions beat one long cram.',
  },
  xp: {
    title: 'XP & levels',
    body: 'Experience points you earn for practising. They add up to levels so you can see your effort building over time.',
  },
} as const

export type GlossaryTerm = keyof typeof GLOSSARY

export function getGlossaryEntry(term: GlossaryTerm): GlossaryEntry {
  return GLOSSARY[term]
}
