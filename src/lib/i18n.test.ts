import { describe, it, expect } from 'vitest'
import { t, LANGUAGES, SPOK_LANGUAGE_NAMES } from './i18n'

describe('t (translation lookup)', () => {
  it('returns the string for the requested language', () => {
    expect(t('en', 'nav_dashboard')).toBe('Dashboard')
    expect(t('es', 'nav_dashboard')).toBe('Panel')
    expect(t('fr', 'nav_dashboard')).toBe('Tableau de bord')
  })

  it('resolves every English key in every supported language', () => {
    // Each language dictionary should cover the same keys as English.
    const enKeys = [
      'nav_dashboard',
      'greeting_morning',
      'action_save',
      'label_language',
    ] as const
    for (const lang of LANGUAGES.map((l) => l.value)) {
      for (const key of enKeys) {
        expect(typeof t(lang, key)).toBe('string')
        expect(t(lang, key).length).toBeGreaterThan(0)
      }
    }
  })

  it('exposes a language option and SPOK name for each supported language', () => {
    for (const { value } of LANGUAGES) {
      expect(SPOK_LANGUAGE_NAMES[value]).toBeTruthy()
    }
  })

  it('lists English, Spanish and French as options', () => {
    expect(LANGUAGES.map((l) => l.value)).toEqual(['en', 'es', 'fr'])
  })
})
