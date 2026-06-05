import { describe, it, expect } from 'vitest'
import { computeGradeSummary, computeGradeTrend, gradeColor } from './grade'

describe('computeGradeSummary', () => {
  it('divides mastery by ALL topics, not just studied ones', () => {
    const s = computeGradeSummary([{ p_known: 0.9 }, { p_known: 0.9 }], 10)
    // 1.8 / 10 = 0.18 overall, but 0.9 within studied
    expect(s.overallPKnown).toBeCloseTo(0.18, 5)
    expect(s.studiedPKnown).toBeCloseTo(0.9, 5)
    expect(s.studiedCount).toBe(2)
    expect(s.coverage).toBeCloseTo(0.2, 5)
  })

  it('is not confident with too little coverage', () => {
    expect(computeGradeSummary([{ p_known: 0.9 }], 50).confident).toBe(false)
  })

  it('is confident with enough studied topics and coverage', () => {
    const rows = Array.from({ length: 5 }, () => ({ p_known: 0.7 }))
    expect(computeGradeSummary(rows, 10).confident).toBe(true)
  })

  it('handles zero topics safely', () => {
    const s = computeGradeSummary([], 0)
    expect(s.overallPKnown).toBe(0)
    expect(s.studiedPKnown).toBe(0)
    expect(s.coverage).toBe(0)
  })
})

describe('computeGradeTrend', () => {
  it('returns null with fewer than two snapshots', () => {
    expect(computeGradeTrend([])).toBeNull()
    expect(computeGradeTrend([{ avg_p_known: 0.5, created_at: '2026-01-01' }])).toBeNull()
  })

  it('detects an upward trend regardless of input order', () => {
    const t = computeGradeTrend([
      { avg_p_known: 0.6, created_at: '2026-01-10' },
      { avg_p_known: 0.5, created_at: '2026-01-01' },
    ])
    expect(t?.direction).toBe('up')
    expect(t?.deltaPoints).toBe(10)
  })

  it('detects a downward trend', () => {
    const t = computeGradeTrend([
      { avg_p_known: 0.5, created_at: '2026-01-01' },
      { avg_p_known: 0.4, created_at: '2026-01-10' },
    ])
    expect(t?.direction).toBe('down')
  })

  it('treats small changes as flat', () => {
    const t = computeGradeTrend([
      { avg_p_known: 0.50, created_at: '2026-01-01' },
      { avg_p_known: 0.51, created_at: '2026-01-10' },
    ])
    expect(t?.direction).toBe('flat')
  })
})

describe('gradeColor', () => {
  it('returns a hex colour for every grade and a fallback', () => {
    for (const g of ['A*', 'A', 'B', 'C', 'D', 'E', '—']) {
      expect(gradeColor(g)).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
