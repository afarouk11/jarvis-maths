import { describe, it, expect } from 'vitest'
import { validateName } from './validate-name'

describe('validateName', () => {
  it('accepts a simple valid name', () => {
    expect(validateName('Adam')).toBeNull()
  })

  it('accepts names with spaces, hyphens, and apostrophes', () => {
    expect(validateName('Mary-Jane')).toBeNull()
    expect(validateName("O'Brien")).toBeNull()
    expect(validateName('Anna Maria')).toBeNull()
  })

  it('accepts accented and non-Latin letters', () => {
    expect(validateName('José')).toBeNull()
    expect(validateName('Zoë')).toBeNull()
    expect(validateName('李雷')).toBeNull()
  })

  it('trims surrounding whitespace before validating', () => {
    expect(validateName('  Adam  ')).toBeNull()
  })

  describe('length bounds', () => {
    it('rejects names shorter than 2 characters', () => {
      expect(validateName('A')).toBe('Name must be at least 2 characters.')
    })

    it('rejects whitespace-only names as too short', () => {
      expect(validateName('   ')).toBe('Name must be at least 2 characters.')
    })

    it('accepts exactly 2 characters', () => {
      expect(validateName('Al')).toBeNull()
    })

    it('rejects names longer than 50 characters', () => {
      expect(validateName('A'.repeat(51))).toBe('Name must be 50 characters or fewer.')
    })

    it('accepts exactly 50 characters', () => {
      expect(validateName('A'.repeat(50))).toBeNull()
    })
  })

  describe('character restrictions', () => {
    it('rejects digits', () => {
      expect(validateName('Adam2')).toBe(
        'Name can only contain letters, spaces, hyphens, and apostrophes.',
      )
    })

    it('rejects symbols', () => {
      expect(validateName('Adam!')).toBe(
        'Name can only contain letters, spaces, hyphens, and apostrophes.',
      )
      expect(validateName('a@b')).toBe(
        'Name can only contain letters, spaces, hyphens, and apostrophes.',
      )
    })

    it('rejects a string of only punctuation that passes the char regex', () => {
      // "--" passes the allowed-character regex but has no actual letter
      expect(validateName('--')).toBe('Please enter a real name.')
    })
  })

  describe('blocklist', () => {
    it('rejects profanity', () => {
      expect(validateName('shit')).toBe('Please enter an appropriate name.')
    })

    it('rejects reserved/impersonation words', () => {
      expect(validateName('admin')).toBe('Please enter an appropriate name.')
      expect(validateName('SPOK')).toBe('Please enter an appropriate name.')
    })

    it('is case-insensitive', () => {
      expect(validateName('ShIt')).toBe('Please enter an appropriate name.')
    })

    it('matches blocked words embedded as substrings', () => {
      expect(validateName('Administrator')).toBe('Please enter an appropriate name.')
    })
  })
})
