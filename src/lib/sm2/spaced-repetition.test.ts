import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { updateSM2, qualityFromCorrect } from './spaced-repetition'

interface SM2State {
  intervalDays: number
  easeFactor: number
  repetitions: number
  nextReviewAt: Date
}

const base: SM2State = {
  intervalDays: 10,
  easeFactor: 2.5,
  repetitions: 5,
  nextReviewAt: new Date('2020-01-01'),
}

describe('updateSM2', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-04T00:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('failed reviews (quality < 3)', () => {
    it('resets interval to 1 and repetitions to 0', () => {
      const next = updateSM2(base, 2)
      expect(next.intervalDays).toBe(1)
      expect(next.repetitions).toBe(0)
    })

    it('still adjusts the ease factor downward', () => {
      const next = updateSM2(base, 0)
      expect(next.easeFactor).toBeLessThan(base.easeFactor)
    })

    it('never lets the ease factor drop below the 1.3 floor', () => {
      const low: SM2State = { ...base, easeFactor: 1.3 }
      const next = updateSM2(low, 0)
      expect(next.easeFactor).toBe(1.3)
    })
  })

  describe('successful reviews (quality >= 3)', () => {
    it('uses interval 1 for the first repetition', () => {
      const fresh: SM2State = { ...base, repetitions: 0 }
      const next = updateSM2(fresh, 5)
      expect(next.repetitions).toBe(1)
      expect(next.intervalDays).toBe(1)
    })

    it('uses interval 6 for the second repetition', () => {
      const fresh: SM2State = { ...base, repetitions: 1 }
      const next = updateSM2(fresh, 5)
      expect(next.repetitions).toBe(2)
      expect(next.intervalDays).toBe(6)
    })

    it('scales interval by ease factor for the third+ repetition', () => {
      const state: SM2State = { ...base, repetitions: 2, intervalDays: 6, easeFactor: 2.5 }
      const next = updateSM2(state, 5)
      // ef = max(1.3, 2.5 + 0.1 - 0) = 2.6 ; interval = round(6 * 2.6) = 16
      expect(next.easeFactor).toBeCloseTo(2.6, 10)
      expect(next.intervalDays).toBe(16)
    })

    it('increases ease factor on a perfect (5) answer', () => {
      const next = updateSM2(base, 5)
      expect(next.easeFactor).toBeGreaterThan(base.easeFactor)
    })
  })

  describe('nextReviewAt scheduling', () => {
    it('schedules the next review interval days from now', () => {
      const fresh: SM2State = { ...base, repetitions: 1 }
      const next = updateSM2(fresh, 5) // interval = 6
      const expected = new Date('2026-06-04T00:00:00Z')
      expected.setDate(expected.getDate() + 6)
      expect(next.nextReviewAt.getTime()).toBe(expected.getTime())
    })

    it('schedules one day out on a failed review', () => {
      const next = updateSM2(base, 1) // interval = 1
      const expected = new Date('2026-06-04T00:00:00Z')
      expected.setDate(expected.getDate() + 1)
      expect(next.nextReviewAt.getTime()).toBe(expected.getTime())
    })
  })
})

describe('qualityFromCorrect', () => {
  it('returns 1 for any incorrect answer regardless of time', () => {
    expect(qualityFromCorrect(false, 5)).toBe(1)
    expect(qualityFromCorrect(false, 500)).toBe(1)
  })

  it.each([
    [29, 5],
    [0, 5],
    [30, 4],
    [59, 4],
    [60, 3],
    [119, 3],
    [120, 2],
    [600, 2],
  ])('correct answer in %d seconds yields quality %d', (time, quality) => {
    expect(qualityFromCorrect(true, time)).toBe(quality)
  })
})
