import { describe, it, expect } from 'vitest'
import {
  getPrerequisites,
  getDependents,
  weakPrerequisites,
  rootWeakPrerequisite,
  topologicalOrder,
  isTopicLocked,
} from './topic-graph'

describe('getPrerequisites / getDependents are inverse', () => {
  it('integration depends on differentiation', () => {
    expect(getPrerequisites('integration')).toContain('differentiation')
    expect(getDependents('differentiation')).toContain('integration')
  })
})

describe('weakPrerequisites', () => {
  it('returns only prerequisites below the threshold, weakest first', () => {
    const map = new Map([['differentiation', 0.2], ['trigonometry', 0.9], ['exponentials-logarithms', 0.3]])
    const weak = weakPrerequisites('integration', map)
    expect(weak).toContain('differentiation')
    expect(weak).not.toContain('trigonometry')
    // weakest first
    expect(weak[0]).toBe('differentiation')
  })
})

describe('rootWeakPrerequisite', () => {
  it('walks to the deepest weak prerequisite', () => {
    // integration ← differentiation ← trigonometry (all weak); other prereqs strong.
    const map = new Map([
      ['integration', 0.2],
      ['differentiation', 0.2],
      ['trigonometry', 0.35],
      ['exponentials-logarithms', 0.9],
    ])
    expect(rootWeakPrerequisite('integration', map)).toBe('trigonometry')
  })

  it('returns null when prerequisites are strong', () => {
    const map = new Map([['differentiation', 0.9], ['trigonometry', 0.9], ['exponentials-logarithms', 0.9]])
    expect(rootWeakPrerequisite('integration', map)).toBeNull()
  })

  it('does not infinite-loop on the graph', () => {
    const map = new Map<string, number>()
    expect(() => rootWeakPrerequisite('integration', map)).not.toThrow()
  })
})

describe('topologicalOrder', () => {
  it('places prerequisites before dependents', () => {
    const order = topologicalOrder(['integration', 'differentiation', 'trigonometry'])
    expect(order.indexOf('differentiation')).toBeLessThan(order.indexOf('integration'))
    expect(order.indexOf('trigonometry')).toBeLessThan(order.indexOf('differentiation'))
  })

  it('returns every input slug exactly once', () => {
    const input = ['integration', 'differentiation', 'vectors']
    const order = topologicalOrder(input)
    expect(order.sort()).toEqual(input.sort())
  })
})

describe('isTopicLocked', () => {
  it('locks a topic when a prerequisite is far too weak', () => {
    expect(isTopicLocked('integration', new Map([['differentiation', 0.1]]))).toBe(true)
  })

  it('unlocks a topic with no prerequisites', () => {
    expect(isTopicLocked('algebra-functions', new Map())).toBe(false)
  })
})
