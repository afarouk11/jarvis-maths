import { describe, it, expect } from 'vitest'
import { updateSM2, qualityFromCorrect } from './spaced-repetition'

const fresh = { intervalDays: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: new Date() }

describe('updateSM2', () => {
  it('resets the interval on a failed recall (quality < 3)', () => {
    const s = updateSM2({ ...fresh, repetitions: 5, intervalDays: 30 }, 2)
    expect(s.intervalDays).toBe(1)
    expect(s.repetitions).toBe(0)
  })

  it('grows the interval over successive good recalls', () => {
    let s = updateSM2(fresh, 5)
    expect(s.intervalDays).toBe(1)
    s = updateSM2(s, 5)
    expect(s.intervalDays).toBe(6)
    const third = updateSM2(s, 5)
    expect(third.intervalDays).toBeGreaterThan(6)
  })

  it('never lets the ease factor drop below 1.3', () => {
    let s = fresh
    for (let i = 0; i < 20; i++) s = updateSM2(s, 0)
    expect(s.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('schedules the next review in the future for a good recall', () => {
    const s = updateSM2(fresh, 5)
    expect(s.nextReviewAt.getTime()).toBeGreaterThan(Date.now())
  })
})

describe('qualityFromCorrect', () => {
  it('returns a low quality for a wrong answer', () => {
    expect(qualityFromCorrect(false, 10)).toBeLessThan(3)
  })

  it('rewards fast correct answers more than slow ones', () => {
    expect(qualityFromCorrect(true, 10)).toBeGreaterThan(qualityFromCorrect(true, 200))
  })
})
