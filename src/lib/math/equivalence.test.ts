import { describe, it, expect } from 'vitest'
import { checkAnswerEquivalence } from './equivalence'

describe('checkAnswerEquivalence', () => {
  it('treats different representations of the same number as equivalent', () => {
    expect(checkAnswerEquivalence('0.5', '1/2')).toBe('equivalent')
    expect(checkAnswerEquivalence('\\frac{1}{2}', '0.5')).toBe('equivalent')
  })

  it('ignores an "x =" prefix on the final answer', () => {
    expect(checkAnswerEquivalence('x = 3', '3')).toBe('equivalent')
  })

  it('recognises equivalent algebraic expressions by sampling', () => {
    expect(checkAnswerEquivalence('2x + 2', '2(x+1)')).toBe('equivalent')
  })

  it('flags genuinely different numeric answers', () => {
    expect(checkAnswerEquivalence('3', '4')).toBe('different')
  })

  it('flags genuinely different expressions', () => {
    expect(checkAnswerEquivalence('x^2', '2*x')).toBe('different')
  })

  it('returns uncertain for unparseable input (defers to the LLM)', () => {
    expect(checkAnswerEquivalence('the answer is blue', '5')).toBe('uncertain')
  })
})
