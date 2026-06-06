import { describe, it, expect } from 'vitest'
import { difficultyForMastery } from './adaptive'

describe('difficultyForMastery', () => {
  it('returns an integer in [1, 5]', () => {
    for (let p = 0; p <= 1.0001; p += 0.1) {
      const d = difficultyForMastery(p, 0, 0)
      expect(Number.isInteger(d)).toBe(true)
      expect(d).toBeGreaterThanOrEqual(1)
      expect(d).toBeLessThanOrEqual(5)
    }
  })

  it('increases with mastery', () => {
    expect(difficultyForMastery(0.1, 0, 0)).toBeLessThanOrEqual(difficultyForMastery(0.9, 0, 0))
  })

  it('pushes harder when recent accuracy is high', () => {
    const cruising = difficultyForMastery(0.5, 10, 9)  // 90% accuracy
    const neutral = difficultyForMastery(0.5, 0, 0)
    expect(cruising).toBeGreaterThanOrEqual(neutral)
  })

  it('eases off when recent accuracy is low', () => {
    const struggling = difficultyForMastery(0.5, 10, 2) // 20% accuracy
    const neutral = difficultyForMastery(0.5, 0, 0)
    expect(struggling).toBeLessThanOrEqual(neutral)
  })

  it('handles NaN mastery without throwing', () => {
    expect(() => difficultyForMastery(NaN, 0, 0)).not.toThrow()
  })
})
