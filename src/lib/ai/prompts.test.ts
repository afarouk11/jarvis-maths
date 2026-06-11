import { describe, it, expect } from 'vitest'
import { formatBoardName, isGcseLevel, buildQuestionPrompt, buildLessonPrompt } from './prompts'

// Regression tests: profiles store exam_board as 'AQA' | 'Edexcel' | 'OCR' and
// level as 'GCSE' | 'A-Level' (capitalized), but these helpers used to match
// lowercase only — silently defaulting every student to AQA A-level content.

describe('formatBoardName', () => {
  it('recognises boards exactly as stored in profiles', () => {
    expect(formatBoardName('Edexcel')).toBe('Edexcel')
    expect(formatBoardName('AQA')).toBe('AQA')
    expect(formatBoardName('OCR')).toBe('OCR')
  })

  it('recognises lowercase board codes', () => {
    expect(formatBoardName('edexcel')).toBe('Edexcel')
    expect(formatBoardName('ocr_a')).toBe('OCR A')
    expect(formatBoardName('ocr_mei')).toBe('OCR MEI')
    expect(formatBoardName('wjec')).toBe('WJEC/Eduqas')
  })

  it('falls back to AQA only for genuinely unknown boards', () => {
    expect(formatBoardName('')).toBe('AQA')
    expect(formatBoardName('unknown')).toBe('AQA')
  })
})

describe('isGcseLevel', () => {
  it('matches every casing of GCSE', () => {
    expect(isGcseLevel('GCSE')).toBe(true)
    expect(isGcseLevel('gcse')).toBe(true)
  })

  it('treats anything else as A-level', () => {
    expect(isGcseLevel('A-Level')).toBe(false)
    expect(isGcseLevel('alevel')).toBe(false)
    expect(isGcseLevel(undefined)).toBe(false)
    expect(isGcseLevel(null)).toBe(false)
  })
})

describe('buildQuestionPrompt', () => {
  it("uses the student's exam board as stored in their profile", () => {
    const prompt = buildQuestionPrompt('Trigonometry', 3, 'A-Level', '', 'Edexcel')
    expect(prompt).toContain('Edexcel A-level')
    expect(prompt).not.toContain('AQA')
  })

  it('generates GCSE questions for GCSE students', () => {
    const prompt = buildQuestionPrompt('Fractions', 2, 'GCSE', '', 'AQA')
    expect(prompt).toContain('GCSE')
    expect(prompt).toContain('AQA GCSE (Higher tier)')
  })
})

describe('buildLessonPrompt', () => {
  it('labels GCSE lessons as GCSE regardless of level casing', () => {
    expect(buildLessonPrompt('Fractions', 2, 'GCSE')).toContain('GCSE maths lesson')
    expect(buildLessonPrompt('Fractions', 2, 'gcse')).toContain('GCSE maths lesson')
    expect(buildLessonPrompt('Vectors', 3, 'A-Level')).toContain('A-level maths lesson')
  })
})
