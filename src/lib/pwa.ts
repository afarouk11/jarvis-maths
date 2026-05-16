interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let _prompt: BeforeInstallPromptEvent | null = null

export function captureInstallPrompt(e: Event) {
  e.preventDefault()
  _prompt = e as BeforeInstallPromptEvent
}

export async function triggerInstallPrompt(): Promise<'accepted' | 'dismissed'> {
  if (!_prompt) return 'dismissed'
  await _prompt.prompt()
  const { outcome } = await _prompt.userChoice
  _prompt = null
  return outcome
}

export function hasInstallPrompt() {
  return _prompt !== null
}

export function isIOS() {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function isInstalled() {
  if (typeof window === 'undefined') return false
  return (
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}
