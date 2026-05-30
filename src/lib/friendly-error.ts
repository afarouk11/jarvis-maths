/**
 * Turn raw/technical errors (HTTP status text, network failures, thrown errors)
 * into short, warm, student-friendly messages — never show "Server error 429".
 */

export function friendlyError(error: unknown): string {
  // Network / fetch failures
  if (error instanceof TypeError) {
    return "Looks like you're offline — check your connection and try again."
  }

  const raw = extractMessage(error)
  const status = extractStatus(raw)

  if (status === 429) return 'SPOK is a bit busy right now. Give it a few seconds and try again.'
  if (status === 401 || status === 403) return 'Your session timed out. Please sign in again.'
  if (status === 404) return "We couldn't find that. Try refreshing the page."
  if (status !== undefined && status >= 500) return 'Something went wrong on our side. Please try again in a moment.'

  // Avoid leaking stack traces / opaque codes to students
  if (!raw || /error|exception|undefined|null|\bcode\b|\d{3}/i.test(raw)) {
    return 'Something went wrong. Please try again.'
  }

  return raw
}

function extractMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'error' in error) {
    const inner = (error as { error: unknown }).error
    if (typeof inner === 'string') return inner
  }
  return ''
}

function extractStatus(raw: string): number | undefined {
  const match = raw.match(/\b(4\d{2}|5\d{2})\b/)
  return match ? Number(match[1]) : undefined
}
