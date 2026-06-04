import { describe, it, expect } from 'vitest'
import { getPrerequisites, isTopicLocked, TOPIC_EDGES } from './topic-graph'

describe('getPrerequisites', () => {
  it('returns an empty array for a topic with no prerequisites', () => {
    expect(getPrerequisites('algebra-functions')).toEqual([])
  })

  it('returns an empty array for an unknown slug', () => {
    expect(getPrerequisites('not-a-real-topic')).toEqual([])
  })

  it('returns the single prerequisite for a simple dependent', () => {
    expect(getPrerequisites('coordinate-geometry')).toEqual(['algebra-functions'])
  })

  it('returns all prerequisites for a topic with multiple incoming edges', () => {
    // integration depends on differentiation, trigonometry, exponentials-logarithms
    expect(getPrerequisites('integration').sort()).toEqual(
      ['differentiation', 'exponentials-logarithms', 'trigonometry'].sort(),
    )
  })

  it('only ever returns prerequisites that exist as edge sources', () => {
    const allSources = new Set(TOPIC_EDGES.map(([pre]) => pre))
    for (const pre of getPrerequisites('further-calculus')) {
      expect(allSources.has(pre)).toBe(true)
    }
  })
})

describe('isTopicLocked', () => {
  it('is never locked when the topic has no prerequisites', () => {
    expect(isTopicLocked('algebra-functions', new Map())).toBe(false)
  })

  it('is locked when a prerequisite is missing from progress (treated as 0)', () => {
    expect(isTopicLocked('coordinate-geometry', new Map())).toBe(true)
  })

  it('is locked when a prerequisite is below the 0.25 threshold', () => {
    const progress = new Map([['algebra-functions', 0.2]])
    expect(isTopicLocked('coordinate-geometry', progress)).toBe(true)
  })

  it('is unlocked when the prerequisite is exactly at the threshold', () => {
    const progress = new Map([['algebra-functions', 0.25]])
    expect(isTopicLocked('coordinate-geometry', progress)).toBe(false)
  })

  it('is unlocked when the prerequisite is above the threshold', () => {
    const progress = new Map([['algebra-functions', 0.8]])
    expect(isTopicLocked('coordinate-geometry', progress)).toBe(false)
  })

  it('stays locked if ANY one of several prerequisites is weak', () => {
    // integration needs differentiation, trigonometry, exponentials-logarithms
    const progress = new Map([
      ['differentiation', 0.9],
      ['trigonometry', 0.9],
      ['exponentials-logarithms', 0.1], // weak
    ])
    expect(isTopicLocked('integration', progress)).toBe(true)
  })

  it('unlocks only when ALL prerequisites meet the threshold', () => {
    const progress = new Map([
      ['differentiation', 0.5],
      ['trigonometry', 0.3],
      ['exponentials-logarithms', 0.25],
    ])
    expect(isTopicLocked('integration', progress)).toBe(false)
  })
})

describe('TOPIC_EDGES integrity', () => {
  it('contains no self-referential edges', () => {
    for (const [pre, dep] of TOPIC_EDGES) {
      expect(pre).not.toBe(dep)
    }
  })

  it('has no duplicate edges', () => {
    const seen = new Set<string>()
    for (const [pre, dep] of TOPIC_EDGES) {
      const key = `${pre}->${dep}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })
})
