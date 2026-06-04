import { describe, it, expect } from 'vitest'
import { getGlossaryEntry, GLOSSARY } from './glossary'

describe('getGlossaryEntry', () => {
  it('returns the title and body for a known term', () => {
    const entry = getGlossaryEntry('mastery')
    expect(entry.title).toBe('Mastery')
    expect(entry.body).toContain('learned a topic')
  })

  it('returns a non-empty title and body for every defined term', () => {
    for (const term of Object.keys(GLOSSARY) as (keyof typeof GLOSSARY)[]) {
      const entry = getGlossaryEntry(term)
      expect(entry.title.length).toBeGreaterThan(0)
      expect(entry.body.length).toBeGreaterThan(0)
    }
  })
})
