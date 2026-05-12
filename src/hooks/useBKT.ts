'use client'

import { useCallback } from 'react'

export function useBKT() {
  const recordAttempt = useCallback(async (params: {
    topicId: string
    questionId: string
    correct: boolean
    quality: number
    timeTakenSeconds: number
  }) => {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  }, [])

  return { recordAttempt }
}
