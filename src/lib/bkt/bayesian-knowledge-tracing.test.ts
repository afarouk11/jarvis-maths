import { describe, it, expect } from 'vitest'
import {
  updateBKT,
  masteryLabel,
  masteryColor,
  predictedGrade,
} from './bayesian-knowledge-tracing'
import type { BKTState } from '@/types'

const baseState: BKTState = {
  pKnown: 0.3,
  pTransit: 0.1,
  pSlip: 0.1,
  pGuess: 0.2,
}

describe('updateBKT', () => {
  it('increases pKnown after a correct answer', () => {
    const next = updateBKT(baseState, true)
    expect(next.pKnown).toBeGreaterThan(baseState.pKnown)
  })

  it('decreases the posterior after an incorrect answer relative to correct', () => {
    const correct = updateBKT(baseState, true)
    const wrong = updateBKT(baseState, false)
    expect(wrong.pKnown).toBeLessThan(correct.pKnown)
  })

  it('preserves the other BKT parameters', () => {
    const next = updateBKT(baseState, true)
    expect(next.pTransit).toBe(baseState.pTransit)
    expect(next.pSlip).toBe(baseState.pSlip)
    expect(next.pGuess).toBe(baseState.pGuess)
  })

  it('caps pKnown at 0.99', () => {
    const nearlyMastered: BKTState = { ...baseState, pKnown: 0.99, pTransit: 0.5 }
    const next = updateBKT(nearlyMastered, true)
    expect(next.pKnown).toBeLessThanOrEqual(0.99)
  })

  it('matches the closed-form Bayesian update for a correct answer', () => {
    // pCorrect = 0.3*0.9 + 0.7*0.2 = 0.41
    // posterior = (0.3*0.9)/0.41 = 0.658536...
    // newPKnown = posterior + (1-posterior)*0.1 = 0.692682...
    const next = updateBKT(baseState, true)
    expect(next.pKnown).toBeCloseTo(0.6926829, 6)
  })

  it('matches the closed-form Bayesian update for an incorrect answer', () => {
    // pWrong = 1 - 0.41 = 0.59
    // posterior = (0.3*0.1)/0.59 = 0.0508474...
    // newPKnown = posterior + (1-posterior)*0.1 = 0.1457627...
    const next = updateBKT(baseState, false)
    expect(next.pKnown).toBeCloseTo(0.1457627, 6)
  })

  it('still applies the transit term so pKnown can only rise toward mastery on a wrong answer when transit dominates', () => {
    // Sanity: a wrong answer should generally lower pKnown from a high prior
    const high: BKTState = { ...baseState, pKnown: 0.8 }
    const next = updateBKT(high, false)
    expect(next.pKnown).toBeLessThan(0.8)
  })
})

describe('masteryLabel', () => {
  it.each([
    [0.85, 'Mastered'],
    [0.9, 'Mastered'],
    [0.84, 'Proficient'],
    [0.65, 'Proficient'],
    [0.64, 'Developing'],
    [0.45, 'Developing'],
    [0.44, 'Beginner'],
    [0.25, 'Beginner'],
    [0.24, 'Not started'],
    [0, 'Not started'],
  ])('maps %f to %s', (p, label) => {
    expect(masteryLabel(p)).toBe(label)
  })
})

describe('masteryColor', () => {
  it.each([
    [0.85, '#22c55e'],
    [0.65, '#3b82f6'],
    [0.45, '#f59e0b'],
    [0.25, '#ef4444'],
    [0.1, '#374151'],
  ])('maps %f to %s', (p, color) => {
    expect(masteryColor(p)).toBe(color)
  })
})

describe('predictedGrade', () => {
  it.each([
    [0.88, 'A*'],
    [0.87, 'A'],
    [0.75, 'A'],
    [0.74, 'B'],
    [0.62, 'B'],
    [0.61, 'C'],
    [0.5, 'C'],
    [0.49, 'D'],
    [0.38, 'D'],
    [0.37, 'E'],
    [0, 'E'],
  ])('maps avgPKnown %f to %s', (p, grade) => {
    expect(predictedGrade(p)).toBe(grade)
  })
})
