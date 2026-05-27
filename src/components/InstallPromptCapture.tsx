'use client'

import { useEffect } from 'react'
import { captureInstallPrompt } from '@/lib/pwa'

export function InstallPromptCapture() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    window.addEventListener('beforeinstallprompt', captureInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
  }, [])
  return null
}
