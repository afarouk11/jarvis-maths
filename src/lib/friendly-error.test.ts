import { describe, it, expect } from 'vitest'
import { friendlyError } from './friendly-error'

describe('friendlyError', () => {
  it('treats a TypeError as an offline/network failure', () => {
    expect(friendlyError(new TypeError('Failed to fetch'))).toBe(
      "Looks like you're offline — check your connection and try again.",
    )
  })

  describe('HTTP status mapping', () => {
    it('maps 429 to a rate-limit message', () => {
      expect(friendlyError('Request failed with status 429')).toBe(
        'SPOK is a bit busy right now. Give it a few seconds and try again.',
      )
    })

    it('maps 401 and 403 to a session-timeout message', () => {
      const msg = 'Your session timed out. Please sign in again.'
      expect(friendlyError('401 Unauthorized')).toBe(msg)
      expect(friendlyError('403 Forbidden')).toBe(msg)
    })

    it('maps 404 to a not-found message', () => {
      expect(friendlyError('404 Not Found')).toBe(
        "We couldn't find that. Try refreshing the page.",
      )
    })

    it('maps any 5xx to a generic server-error message', () => {
      const msg = 'Something went wrong on our side. Please try again in a moment.'
      expect(friendlyError('500 Internal Server Error')).toBe(msg)
      expect(friendlyError('503 Service Unavailable')).toBe(msg)
    })
  })

  describe('extracting messages from different error shapes', () => {
    it('reads the message from an Error instance', () => {
      expect(friendlyError(new Error('429 Too Many Requests'))).toBe(
        'SPOK is a bit busy right now. Give it a few seconds and try again.',
      )
    })

    it('reads a nested { error: string } shape', () => {
      expect(friendlyError({ error: '404 missing' })).toBe(
        "We couldn't find that. Try refreshing the page.",
      )
    })
  })

  describe('redacting opaque/technical messages', () => {
    it('hides messages that look like stack traces or codes', () => {
      const generic = 'Something went wrong. Please try again.'
      expect(friendlyError('TypeError: undefined is not a function')).toBe(generic)
      expect(friendlyError('NullPointerException')).toBe(generic)
      expect(friendlyError('error code 123')).toBe(generic)
    })

    it('hides empty/unknown errors behind the generic message', () => {
      expect(friendlyError(null)).toBe('Something went wrong. Please try again.')
      expect(friendlyError(undefined)).toBe('Something went wrong. Please try again.')
      expect(friendlyError({})).toBe('Something went wrong. Please try again.')
    })

    it('passes through a clean, human-readable message unchanged', () => {
      expect(friendlyError('Please pick an answer before continuing')).toBe(
        'Please pick an answer before continuing',
      )
    })
  })
})
