import { describe, it, expect } from 'vitest'
import { updateFSRS, gradeFromScore, compressIntervalForExam } from './fsrs'

const DAY = 86400000
const now = Date.UTC(2026, 0, 1)

describe('updateFSRS — new card', () => {
  it('initialises stability and difficulty within valid ranges', () => {
    const s = updateFSRS({}, 3, now)
    expect(s.stability).toBeGreaterThan(0)
    expect(s.difficulty).toBeGreaterThanOrEqual(1)
    expect(s.difficulty).toBeLessThanOrEqual(10)
    expect(s.intervalDays).toBeGreaterThanOrEqual(1)
    expect(s.nextReviewAt.getTime()).toBeGreaterThan(now)
  })

  it('gives an easier first answer a longer initial interval than a hard one', () => {
    const easy = updateFSRS({}, 4, now)
    const hard = updateFSRS({}, 2, now)
    expect(easy.intervalDays).toBeGreaterThanOrEqual(hard.intervalDays)
  })
})

describe('updateFSRS — reviews', () => {
  const prior = { stability: 5, difficulty: 5, lastReviewAt: new Date(now - 5 * DAY).toISOString() }

  it('grows stability on a good recall', () => {
    const s = updateFSRS(prior, 3, now)
    expect(s.stability).toBeGreaterThan(prior.stability)
  })

  it('shrinks stability on a lapse', () => {
    const s = updateFSRS({ stability: 40, difficulty: 5, lastReviewAt: new Date(now - 40 * DAY).toISOString() }, 1, now)
    expect(s.stability).toBeLessThan(40)
    expect(s.intervalDays).toBeLessThan(40)
  })

  it('keeps difficulty within [1, 10] across many reviews', () => {
    let state = updateFSRS({}, 3, now)
    let t = now
    for (let i = 0; i < 30; i++) {
      t += state.intervalDays * DAY
      state = updateFSRS({ stability: state.stability, difficulty: state.difficulty, lastReviewAt: new Date(t).toISOString() }, i % 5 === 0 ? 1 : 3, t)
      expect(state.difficulty).toBeGreaterThanOrEqual(1)
      expect(state.difficulty).toBeLessThanOrEqual(10)
      expect(state.stability).toBeGreaterThan(0)
    }
  })

  it('an easy review grows stability more than a hard one', () => {
    const easy = updateFSRS(prior, 4, now)
    const hard = updateFSRS(prior, 2, now)
    expect(easy.stability).toBeGreaterThan(hard.stability)
  })
})

describe('compressIntervalForExam', () => {
  it('is unchanged with no exam date', () => {
    expect(compressIntervalForExam(20, null)).toBe(20)
  })

  it('never schedules past the exam', () => {
    expect(compressIntervalForExam(30, 5)).toBeLessThanOrEqual(5)
  })

  it('compresses harder the closer the exam is', () => {
    const far = compressIntervalForExam(20, 60)
    const near = compressIntervalForExam(20, 10)
    const veryNear = compressIntervalForExam(20, 5)
    expect(far).toBeGreaterThanOrEqual(near)
    expect(near).toBeGreaterThanOrEqual(veryNear)
  })

  it('always returns at least 1 day', () => {
    expect(compressIntervalForExam(1, 3)).toBeGreaterThanOrEqual(1)
    expect(compressIntervalForExam(50, 0)).toBe(1)
  })
})

describe('gradeFromScore', () => {
  it('maps scores to FSRS grades', () => {
    expect(gradeFromScore(0.2)).toBe(1)
    expect(gradeFromScore(0.6)).toBe(2)
    expect(gradeFromScore(0.8)).toBe(3)
    expect(gradeFromScore(1)).toBe(4)
  })
})
