'use client'

import { useState, useEffect } from 'react'

export interface AccessibilityPrefs {
  dyslexia: boolean
  adhd: boolean
}

const STORAGE_KEY = 'jarvis-accessibility'

export function useAccessibility() {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>({ dyslexia: false, adhd: false })
  const [loaded, setLoaded] = useState(false)

  // Load from profile first, fall back to localStorage
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((p: { dyslexia_mode?: boolean; adhd_mode?: boolean }) => {
        if (p.dyslexia_mode !== undefined || p.adhd_mode !== undefined) {
          setPrefs({ dyslexia: p.dyslexia_mode ?? false, adhd: p.adhd_mode ?? false })
        } else {
          // Fall back to localStorage
          try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) setPrefs(JSON.parse(stored))
          } catch {}
        }
      })
      .catch(() => {
        // Not logged in — use localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) setPrefs(JSON.parse(stored))
        } catch {}
      })
      .finally(() => setLoaded(true))
  }, [])

  // Apply dyslexia class to <html> whenever prefs change
  useEffect(() => {
    if (!loaded) return
    const html = document.documentElement
    if (prefs.dyslexia) {
      html.classList.add('dyslexia-mode')
    } else {
      html.classList.remove('dyslexia-mode')
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {}
  }, [prefs, loaded])

  function toggle(key: keyof AccessibilityPrefs) {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    // Persist to profile
    fetch('/api/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dyslexiaMode: next.dyslexia,
        adhdMode: next.adhd,
      }),
    }).catch(() => {})
  }

  return { prefs, toggle }
}
