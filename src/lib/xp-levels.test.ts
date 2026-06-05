import { describe, it, expect } from 'vitest'
import { getXPLevel, xpForAnswer } from './xp-levels'

describe('getXPLevel', () => {
  it('returns level 1 at zero XP', () => {
    expect(getXPLevel(0).level).toBe(1)
  })

  it('caps at level 10 (J.A.R.V.I.S)', () => {
    const max = getXPLevel(999999)
    expect(max.level).toBe(10)
    expect(max.progress).toBe(1)
  })

  it('reports progress within [0, 1]', () => {
    for (const xp of [0, 50, 150, 600, 3000, 16000]) {
      const lvl = getXPLevel(xp)
      expect(lvl.progress).toBeGreaterThanOrEqual(0)
      expect(lvl.progress).toBeLessThanOrEqual(1)
    }
  })
})

describe('xpForAnswer', () => {
  it('gives little XP for a wrong answer', () => {
    expect(xpForAnswer(false, 5, 0.1)).toBe(3)
  })

  it('rewards harder questions more', () => {
    expect(xpForAnswer(true, 5, 0.7)).toBeGreaterThan(xpForAnswer(true, 1, 0.7))
  })

  it('rewards closing a weak topic', () => {
    expect(xpForAnswer(true, 3, 0.2)).toBeGreaterThan(xpForAnswer(true, 3, 0.8))
  })

  it('never returns less than 2', () => {
    expect(xpForAnswer(true, 1, 0.9)).toBeGreaterThanOrEqual(2)
  })
})
