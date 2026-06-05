import { describe, it, expect } from 'vitest'
import { decayedPKnown, applyDecay } from './forgetting'

const DAY = 86400000
const now = Date.UTC(2026, 0, 31)

describe('decayedPKnown', () => {
  it('does not decay before the review is due', () => {
    const recent = new Date(now - 2 * DAY).toISOString()
    const p = decayedPKnown({ p_known: 0.8, last_attempted_at: recent, ease_factor: 2.5, interval_days: 10 }, now)
    expect(p).toBe(0.8)
  })

  it('decays once the topic is overdue', () => {
    const old = new Date(now - 40 * DAY).toISOString()
    const p = decayedPKnown({ p_known: 0.8, last_attempted_at: old, ease_factor: 2.0, interval_days: 5 }, now)
    expect(p).toBeLessThan(0.8)
  })

  it('never decays below 40% of the original value', () => {
    const ancient = new Date(now - 4000 * DAY).toISOString()
    const p = decayedPKnown({ p_known: 0.9, last_attempted_at: ancient, ease_factor: 1.3, interval_days: 1 }, now)
    expect(p).toBeGreaterThanOrEqual(0.9 * 0.4 - 1e-9)
  })

  it('decays slower for higher ease factors', () => {
    // Modest overdue so neither hits the 40% floor — isolates the ease effect.
    const old = new Date(now - 50 * DAY).toISOString()
    const lowEase = decayedPKnown({ p_known: 0.8, last_attempted_at: old, ease_factor: 1.3, interval_days: 30 }, now)
    const highEase = decayedPKnown({ p_known: 0.8, last_attempted_at: old, ease_factor: 3.0, interval_days: 30 }, now)
    expect(highEase).toBeGreaterThan(lowEase)
  })

  it('returns p_known unchanged when never attempted', () => {
    expect(decayedPKnown({ p_known: 0.5, last_attempted_at: null }, now)).toBe(0.5)
  })
})

describe('applyDecay', () => {
  it('preserves other fields and only changes p_known', () => {
    const old = new Date(now - 50 * DAY).toISOString()
    const rows = [{ p_known: 0.8, last_attempted_at: old, ease_factor: 2, interval_days: 5, topic_id: 't1' }]
    const out = applyDecay(rows, now)
    expect(out[0].topic_id).toBe('t1')
    expect(out[0].p_known).toBeLessThan(0.8)
  })
})
