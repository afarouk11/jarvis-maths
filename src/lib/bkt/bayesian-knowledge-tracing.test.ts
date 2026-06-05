import { describe, it, expect } from 'vitest'
import {
  updateBKT,
  updateBKTPartial,
  masteryLabel,
  predictedGrade,
  pGuessForFormat,
} from './bayesian-knowledge-tracing'
import type { BKTState } from '@/types'

const base: BKTState = { pKnown: 0.3, pTransit: 0.09, pSlip: 0.1, pGuess: 0.2 }

describe('updateBKT', () => {
  it('raises p_known on a correct answer', () => {
    const next = updateBKT(base, true)
    expect(next.pKnown).toBeGreaterThan(base.pKnown)
  })

  it('lowers p_known on a wrong answer', () => {
    const next = updateBKT(base, false)
    expect(next.pKnown).toBeLessThan(base.pKnown)
  })

  it('never exceeds the 0.99 ceiling', () => {
    let s: BKTState = { ...base, pKnown: 0.98 }
    for (let i = 0; i < 50; i++) s = updateBKT(s, true)
    expect(s.pKnown).toBeLessThanOrEqual(0.99)
  })

  it('keeps p_known within [0, 1]', () => {
    const hi = updateBKT(base, true)
    const lo = updateBKT(base, false)
    for (const v of [hi.pKnown, lo.pKnown]) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
})

describe('updateBKTPartial', () => {
  it('matches the full correct update at score 1', () => {
    expect(updateBKTPartial(base, 1).pKnown).toBeCloseTo(updateBKT(base, true).pKnown, 10)
  })

  it('matches the full wrong update at score 0', () => {
    expect(updateBKTPartial(base, 0).pKnown).toBeCloseTo(updateBKT(base, false).pKnown, 10)
  })

  it('lands between the wrong and correct updates for a partial score', () => {
    const lo = updateBKT(base, false).pKnown
    const hi = updateBKT(base, true).pKnown
    const mid = updateBKTPartial(base, 0.5).pKnown
    expect(mid).toBeGreaterThan(lo)
    expect(mid).toBeLessThan(hi)
    expect(mid).toBeCloseTo((lo + hi) / 2, 10)
  })

  it('clamps out-of-range scores', () => {
    expect(updateBKTPartial(base, 5).pKnown).toBeCloseTo(updateBKT(base, true).pKnown, 10)
    expect(updateBKTPartial(base, -5).pKnown).toBeCloseTo(updateBKT(base, false).pKnown, 10)
  })
})

describe('predictedGrade', () => {
  it('maps mastery to the expected grade bands', () => {
    expect(predictedGrade(0.95)).toBe('A*')
    expect(predictedGrade(0.8)).toBe('A')
    expect(predictedGrade(0.65)).toBe('B')
    expect(predictedGrade(0.55)).toBe('C')
    expect(predictedGrade(0.1)).toBe('E')
  })

  it('is monotonic non-decreasing in mastery', () => {
    const order = ['E', 'D', 'C', 'B', 'A', 'A*']
    let prev = -1
    for (let p = 0; p <= 1.0001; p += 0.05) {
      const idx = order.indexOf(predictedGrade(p))
      expect(idx).toBeGreaterThanOrEqual(prev)
      prev = idx
    }
  })
})

describe('masteryLabel', () => {
  it('labels the mastery bands', () => {
    expect(masteryLabel(0.9)).toBe('Mastered')
    expect(masteryLabel(0.7)).toBe('Proficient')
    expect(masteryLabel(0.5)).toBe('Developing')
    expect(masteryLabel(0.1)).toBe('Not started')
  })
})

describe('pGuessForFormat', () => {
  it('gives MCQ a higher guess rate than written', () => {
    expect(pGuessForFormat('mcq')).toBeGreaterThan(pGuessForFormat('written'))
  })

  it('defaults conservatively for unknown formats', () => {
    expect(pGuessForFormat(undefined)).toBe(0.1)
    expect(pGuessForFormat('something-else')).toBe(0.1)
  })
})
