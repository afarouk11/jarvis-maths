import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { computeExamReadiness } from './exam-readiness'
import type { StudentProgress } from '@/types'

function makeProgress(p_known: number, topic_id: string): StudentProgress {
  return {
    id: `prog-${topic_id}`,
    student_id: 'student-1',
    topic_id,
    p_known,
    p_transit: 0.1,
    p_slip: 0.1,
    p_guess: 0.2,
    next_review_at: '2026-01-01',
    interval_days: 1,
    ease_factor: 2.5,
    repetitions: 0,
    questions_attempted: 0,
    questions_correct: 0,
    last_attempted_at: null,
  }
}

const NOW = new Date('2026-06-04T00:00:00.000Z')
const DAY = 86_400_000

function daysFromNow(n: number): string {
  return new Date(NOW.getTime() + n * DAY).toISOString()
}

describe('computeExamReadiness', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('empty state', () => {
    it('returns a "Not started" result when there are no topics', () => {
      const r = computeExamReadiness({
        progress: [],
        totalTopics: 0,
        examDate: null,
        targetGrade: 'A',
        slugById: new Map(),
        topicNames: new Map(),
      })
      expect(r.score).toBe(0)
      expect(r.label).toBe('Not started')
      expect(r.gradeTrajectory).toBe('E')
      expect(r.urgency).toBe('low')
      expect(r.improvementNeeded).toBe('Complete your onboarding to get started.')
      expect(r.topPrioritySlug).toBeNull()
    })
  })

  describe('score formula', () => {
    it('combines mastery (65%) and coverage (35%) with no time penalty', () => {
      // avg = (0.8 + 0.6) / 4 = 0.35 ; coverage = 2/4 = 0.5
      // raw = 0.35*0.65 + 0.5*0.35 = 0.4025 -> score 40
      const r = computeExamReadiness({
        progress: [makeProgress(0.8, 't1'), makeProgress(0.6, 't2')],
        totalTopics: 4,
        examDate: null,
        targetGrade: 'A',
        slugById: new Map([['t2', 'algebra']]),
        topicNames: new Map([['algebra', 'Algebra']]),
      })
      expect(r.score).toBe(40)
      expect(r.gradeTrajectory).toBe('E') // predictedGrade(0.35)
      expect(r.label).toBe('Developing') // 35..49
    })

    it('clamps coverage to 1 when more topics are started than the total', () => {
      const r = computeExamReadiness({
        progress: [
          makeProgress(0.5, 't1'),
          makeProgress(0.5, 't2'),
          makeProgress(0.5, 't3'),
        ],
        totalTopics: 2,
        examDate: null,
        targetGrade: 'A',
        slugById: new Map(),
        topicNames: new Map(),
      })
      // avg = 1.5/2 = 0.75 ; coverage clamped to 1
      // raw = 0.75*0.65 + 1*0.35 = 0.8375 -> 84
      expect(r.score).toBe(84)
    })

    it('caps the score at 100', () => {
      const r = computeExamReadiness({
        progress: [makeProgress(0.99, 't1')],
        totalTopics: 1,
        examDate: null,
        targetGrade: 'A*',
        slugById: new Map(),
        topicNames: new Map(),
      })
      expect(r.score).toBeLessThanOrEqual(100)
    })
  })

  describe('time penalty and urgency bands', () => {
    const baseArgs = {
      progress: [makeProgress(0.5, 't1')],
      totalTopics: 1,
      targetGrade: 'A',
      slugById: new Map<string, string>(),
      topicNames: new Map<string, string>(),
    }

    it.each([
      [0, 'critical'],
      [5, 'critical'],
      [10, 'high'],
      [20, 'medium'],
      [45, 'medium'],
      [90, 'low'],
    ])('sets urgency "%s" output for an exam %d days away', (offset, urgency) => {
      const r = computeExamReadiness({ ...baseArgs, examDate: daysFromNow(offset) })
      expect(r.urgency).toBe(urgency)
      expect(r.daysToExam).toBe(offset)
    })

    it('treats a past exam date as 0 days remaining and critical', () => {
      const r = computeExamReadiness({ ...baseArgs, examDate: daysFromNow(-5) })
      expect(r.daysToExam).toBe(0)
      expect(r.urgency).toBe('critical')
    })

    it('leaves daysToExam null and urgency low when no exam date is set', () => {
      const r = computeExamReadiness({ ...baseArgs, examDate: null })
      expect(r.daysToExam).toBeNull()
      expect(r.urgency).toBe('low')
    })

    it('lowers the score via the time penalty as the exam approaches', () => {
      const far = computeExamReadiness({ ...baseArgs, examDate: daysFromNow(90) })
      const near = computeExamReadiness({ ...baseArgs, examDate: daysFromNow(0) })
      expect(near.score).toBeLessThan(far.score)
    })
  })

  describe('readiness label thresholds', () => {
    function scoreToLabel(targetScore: number): string {
      // Drive the score by setting a single-topic mastery so raw*100 ~= target.
      // raw = mastery*0.65 + 1*0.35 ; mastery = (target/100 - 0.35) / 0.65
      const mastery = Math.min(0.99, Math.max(0, (targetScore / 100 - 0.35) / 0.65))
      const r = computeExamReadiness({
        progress: [makeProgress(mastery, 't1')],
        totalTopics: 1,
        examDate: null,
        targetGrade: 'A*',
        slugById: new Map(),
        topicNames: new Map(),
      })
      return r.label
    }

    it('labels a maxed-out score as SPOK Certified', () => {
      expect(scoreToLabel(100)).toBe('SPOK Certified')
    })

    it('labels a mid score as Confident', () => {
      // mastery 0 -> raw 0.35 -> score 35 -> Developing; bump a bit
      expect(scoreToLabel(55)).toBe('Confident')
    })

    it('labels a very low score (low mastery and coverage) as Getting Started', () => {
      // 1 of 100 topics started at 0 mastery -> raw ~= 0.0035 -> score 0
      const r = computeExamReadiness({
        progress: [makeProgress(0, 't1')],
        totalTopics: 100,
        examDate: null,
        targetGrade: 'A*',
        slugById: new Map(),
        topicNames: new Map(),
      })
      expect(r.label).toBe('Getting Started')
    })
  })

  describe('top priority selection', () => {
    it('picks the studied topic with the lowest mastery', () => {
      const r = computeExamReadiness({
        progress: [makeProgress(0.9, 't1'), makeProgress(0.2, 't2'), makeProgress(0.5, 't3')],
        totalTopics: 3,
        examDate: null,
        targetGrade: 'A',
        slugById: new Map([['t2', 'fractions']]),
        topicNames: new Map([['fractions', 'Fractions']]),
      })
      expect(r.topPrioritySlug).toBe('fractions')
      expect(r.topPriorityName).toBe('Fractions')
      expect(r.topPriorityMastery).toBe(0.2)
    })

    it('returns null priority fields when no slug mapping exists', () => {
      const r = computeExamReadiness({
        progress: [makeProgress(0.4, 't1')],
        totalTopics: 1,
        examDate: null,
        targetGrade: 'A',
        slugById: new Map(),
        topicNames: new Map(),
      })
      expect(r.topPrioritySlug).toBeNull()
      expect(r.topPriorityName).toBeNull()
    })
  })

  describe('improvement nudge (buildNudge)', () => {
    it('reassures when on track with no near exam', () => {
      const r = computeExamReadiness({
        progress: [makeProgress(0.95, 't1')],
        totalTopics: 1,
        examDate: null,
        targetGrade: 'A*',
        slugById: new Map(),
        topicNames: new Map(),
      })
      expect(r.improvementNeeded).toBe("You're on track for A*. Stay consistent.")
    })

    it('adds a countdown when on track with the exam within 14 days', () => {
      const r = computeExamReadiness({
        progress: [makeProgress(0.95, 't1')],
        totalTopics: 1,
        examDate: daysFromNow(10),
        targetGrade: 'A*',
        slugById: new Map(),
        topicNames: new Map(),
      })
      expect(r.improvementNeeded).toBe(
        "You're on track for A*. Keep the revision going — 10 days left.",
      )
    })

    it('nudges to cover more ground when coverage is below 50%', () => {
      const r = computeExamReadiness({
        progress: [makeProgress(0.2, 't1')],
        totalTopics: 5,
        examDate: null,
        targetGrade: 'A',
        slugById: new Map(),
        topicNames: new Map(),
      })
      expect(r.improvementNeeded).toBe(
        '4 topics not yet started. Covering more ground is your fastest path to A.',
      )
    })

    it('flags the weakest topic with a deadline when the exam is within 30 days', () => {
      const r = computeExamReadiness({
        progress: [makeProgress(0.5, 't1'), makeProgress(0.55, 't2')],
        totalTopics: 2,
        examDate: daysFromNow(20),
        targetGrade: 'A',
        slugById: new Map([['t1', 'algebra']]),
        topicNames: new Map([['algebra', 'Algebra']]),
      })
      expect(r.improvementNeeded).toBe(
        '20d left. Algebra is your weakest area at 50% — fix it today.',
      )
    })

    it('falls back to a points-gap message when no named priority is available', () => {
      const r = computeExamReadiness({
        progress: [makeProgress(0.3, 't1'), makeProgress(0.4, 't2')],
        totalTopics: 2, // coverage = 1, so not the "cover more ground" branch
        examDate: null,
        targetGrade: 'A',
        slugById: new Map(), // no slug -> topPriorityName null
        topicNames: new Map(),
      })
      // avg = 0.35, coverage 1 -> raw 0.5775 -> score 58 ; gap = 75 - 58 = 17
      expect(r.improvementNeeded).toBe('17 points to A trajectory. Keep studying daily.')
    })

    it('defaults the target threshold to 75 for an unknown target grade', () => {
      const known = computeExamReadiness({
        progress: [makeProgress(0.3, 't1'), makeProgress(0.4, 't2')],
        totalTopics: 2,
        examDate: null,
        targetGrade: 'A', // threshold 75
        slugById: new Map(),
        topicNames: new Map(),
      })
      const unknown = computeExamReadiness({
        progress: [makeProgress(0.3, 't1'), makeProgress(0.4, 't2')],
        totalTopics: 2,
        examDate: null,
        targetGrade: 'Z', // unknown -> defaults to 75
        slugById: new Map(),
        topicNames: new Map(),
      })
      expect(unknown.improvementNeeded).toBe(known.improvementNeeded?.replace('A', 'Z') ?? null)
    })
  })
})
