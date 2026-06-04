import { describe, it, expect } from 'vitest'
import { getXPLevel } from './xp-levels'

describe('getXPLevel', () => {
  it('returns Novice at 0 XP', () => {
    const r = getXPLevel(0)
    expect(r.level).toBe(1)
    expect(r.title).toBe('Novice')
    expect(r.xpIntoLevel).toBe(0)
    expect(r.progress).toBe(0)
  })

  it.each([
    [0, 1],
    [99, 1],
    [100, 2],
    [249, 2],
    [250, 3],
    [500, 4],
    [1000, 5],
    [2000, 6],
    [4000, 7],
    [8000, 8],
    [15000, 9],
    [29999, 9],
    [30000, 10],
  ])('classifies %d XP as level %d', (xp, level) => {
    expect(getXPLevel(xp).level).toBe(level)
  })

  it('computes xpIntoLevel relative to the level floor', () => {
    const r = getXPLevel(150)
    expect(r.level).toBe(2)
    expect(r.xpIntoLevel).toBe(50) // 150 - 100
  })

  it('computes xpToNext as the span of the current level', () => {
    const r = getXPLevel(150) // level 2: 100..249
    expect(r.xpToNext).toBe(150) // 249 - 100 + 1
  })

  it('reports fractional progress within a level', () => {
    const r = getXPLevel(175) // 75 into a 150-wide level
    expect(r.progress).toBeCloseTo(75 / 150, 10)
  })

  it('reports near-zero progress at the bottom of a level', () => {
    const r = getXPLevel(100)
    expect(r.progress).toBe(0)
  })

  it('caps at level 10 with full progress and zero xpToNext', () => {
    const r = getXPLevel(50000)
    expect(r.level).toBe(10)
    expect(r.title).toBe('J.A.R.V.I.S')
    expect(r.progress).toBe(1)
    expect(r.xpToNext).toBe(0)
    expect(r.xpIntoLevel).toBe(20000) // 50000 - 30000
  })

  it('handles arbitrarily large XP without exceeding level 10', () => {
    const r = getXPLevel(10_000_000)
    expect(r.level).toBe(10)
    expect(r.progress).toBe(1)
  })

  it('falls back to level 1 for negative XP', () => {
    const r = getXPLevel(-50)
    expect(r.level).toBe(1)
  })
})
