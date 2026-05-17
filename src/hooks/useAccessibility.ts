'use client'

import { useState, useEffect } from 'react'

export interface AccessibilityPrefs {
  dyslexia: boolean
  adhd: boolean
  visual: boolean
  slowPace: boolean
  encouragement: boolean
}

const STORAGE_KEY = 'jarvis-accessibility'

export function useAccessibility() {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>({ dyslexia: false, adhd: false, visual: false, slowPace: false, encouragement: false })
  const [loaded, setLoaded] = useState(false)

  // Load from profile first, fall back to localStorage
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then((p: { dyslexia_mode?: boolean; adhd_mode?: boolean }) => {
        // Load localStorage first (has visual/slowPace/encouragement), then overlay DB fields
        let base: AccessibilityPrefs = { dyslexia: false, adhd: false, visual: false, slowPace: false, encouragement: false }
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) base = { ...base, ...JSON.parse(stored) }
        } catch {}
        if (p.dyslexia_mode !== undefined || p.adhd_mode !== undefined) {
          setPrefs({ ...base, dyslexia: p.dyslexia_mode ?? false, adhd: p.adhd_mode ?? false })
        } else {
          setPrefs(base)
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
    // Persist dyslexia/adhd to profile DB; new prefs are localStorage-only
    if (key === 'dyslexia' || key === 'adhd') {
      fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dyslexiaMode: next.dyslexia, adhdMode: next.adhd }),
      }).catch(() => {})
    }
  }

  return { prefs, toggle, loaded }
}
